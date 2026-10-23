import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ColorCancelReason, ColorCommitReason, ColorEditCallbacks, ColorEditSource } from './types'

export interface ColorEditOptions<T, Source = ColorEditSource, Reason = ColorCommitReason> extends Omit<
  ColorEditCallbacks<T>,
  'onEditStart' | 'onValueCommit'
> {
  onEditStart?: (source: Source) => boolean | void
  onValueCommit?: (value: T, reason: Reason) => void | Promise<void>
  value: T
  onValueChange?: (value: T) => void
  equals: (first: T, second: T) => boolean
  resetKey?: unknown
  disabled?: boolean
  readOnly?: boolean
}
interface Session<T> {
  token: symbol
  owner: string
  requested: T
  observed: T
  initial: T
  resetKey: unknown
  terminal?: Promise<void>
  rejected?: boolean
  cancel?: (reason: ColorCancelReason) => void
}
type State = { phase: 'idle' | 'editing' | 'pending'; owner: string | null; error: string | null }

/** Shared ownership for composed color controls. Values remain controlled; only draft/lifecycle state lives here. */
export function useColorEdit<T, Source = ColorEditSource, Reason = ColorCommitReason>(
  options: ColorEditOptions<T, Source, Reason>
) {
  const latest = useRef(options)
  latest.current = options
  const active = useRef<Session<T> | null>(null)
  const resetToken = useRef<object>({})
  const mounted = useRef(true)
  const [state, setState] = useState<State>({ phase: 'idle', owner: null, error: null })
  const stateRef = useRef(state)
  const publish = useCallback((next: State) => {
    stateRef.current = next
    if (mounted.current) setState(next)
  }, [])
  const cancel = useCallback(
    (reason: ColorCancelReason = 'escape') => {
      const session = active.current
      const notify = stateRef.current.phase !== 'pending'
      if (session) resetToken.current = {}
      active.current = null
      publish({ phase: 'idle', owner: null, error: null })
      if (notify) session?.cancel?.(reason)
    },
    [publish]
  )
  const available = useCallback(() => {
    const current = latest.current,
      session = active.current
    if (!mounted.current || current.disabled || current.readOnly) {
      if (session) cancel(current.disabled ? 'disabled' : current.readOnly ? 'read-only' : 'unmount')
      return false
    }
    if (session && !Object.is(session.resetKey, current.resetKey)) {
      cancel('external-update')
      return false
    }
    if (session && !current.equals(session.observed, current.value)) {
      // A rejected host can render its initial-value rollback after the Promise settles.
      // Its identity, rather than a particular React render phase, keeps that rollback valid.
      const rollback =
        (stateRef.current.phase === 'pending' || session.rejected) && current.equals(session.initial, current.value)
      if (!rollback && !current.equals(session.requested, current.value)) {
        cancel('external-update')
        return false
      }
      session.observed = current.value
    }
    return true
  }, [cancel])
  const begin = useCallback(
    (source: Source, owner: string) => {
      if (!available() || stateRef.current.phase === 'pending') return false
      if (active.current) return active.current.owner === owner
      const current = latest.current
      const session: Session<T> = {
        token: Symbol('color-edit'),
        owner,
        requested: current.value,
        observed: current.value,
        initial: current.value,
        resetKey: current.resetKey,
        cancel: current.onEditCancel,
      }
      active.current = session
      publish({ phase: 'editing', owner, error: null })
      try {
        if (current.onEditStart?.(source) === false) {
          if (active.current === session) {
            active.current = null
            publish({ phase: 'idle', owner: null, error: null })
          }
          return false
        }
      } catch (error) {
        if (active.current === session) {
          active.current = null
          publish({ phase: 'idle', owner: null, error: error instanceof Error ? error.message : String(error) })
        }
        return false
      }
      return active.current === session && available()
    },
    [available, publish]
  )
  const request = useCallback(
    (value: T, owner: string): boolean => {
      const session = active.current
      if (!session || session.owner !== owner || stateRef.current.phase === 'pending' || !available()) return false
      const changed =
        !latest.current.equals(session.requested, value) ||
        (!!session.rejected && !latest.current.equals(latest.current.value, value))
      session.requested = value
      session.terminal = undefined
      session.rejected = false
      publish({ phase: 'editing', owner, error: null })
      if (changed) latest.current.onValueChange?.(value)
      return active.current === session && available()
    },
    [available, publish]
  )
  const commit = useCallback(
    (value: T, reason: Reason, owner: string): Promise<void> => {
      const session = active.current
      if (!session || session.owner !== owner || !available()) return Promise.resolve()
      if (session.terminal && (!session.rejected || reason === 'blur')) return session.terminal
      if (
        (!latest.current.equals(session.requested, value) ||
          (session.rejected && !latest.current.equals(latest.current.value, value))) &&
        !request(value, owner)
      )
        return Promise.resolve()
      if (active.current !== session || !available()) return Promise.resolve()
      session.requested = value
      session.rejected = false
      let resolve!: () => void, reject!: (error: unknown) => void
      const terminal = new Promise<void>((done, fail) => {
        resolve = done
        reject = fail
      })
      // A rejection is forwarded to the composing text/numeric editor, with a handler installed for void consumers.
      void terminal.catch(() => {})
      session.terminal = terminal
      publish({ phase: 'pending', owner, error: null })
      const finish = (error?: unknown) => {
        if (mounted.current && active.current === session && available()) {
          if (error !== undefined) {
            session.rejected = true
            publish({ phase: 'editing', owner, error: error instanceof Error ? error.message : String(error) })
          } else {
            active.current = null
            publish({ phase: 'idle', owner: null, error: null })
          }
        }
        if (error === undefined) resolve()
        else reject(error)
      }
      try {
        Promise.resolve(latest.current.onValueCommit?.(value, reason)).then(
          () => finish(),
          (error: unknown) => finish(error ?? Error('Color edit rejected'))
        )
      } catch (error) {
        finish(error ?? Error('Color edit rejected'))
      }
      return terminal
    },
    [available, publish, request]
  )
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      const session = active.current
      active.current = null
      if (session && stateRef.current.phase !== 'pending') session.cancel?.('unmount')
    }
  }, [])
  useLayoutEffect(() => {
    available()
  }, [options.value, options.resetKey, options.disabled, options.readOnly, state.phase, state.error, available])
  return {
    ...state,
    begin,
    request,
    commit,
    cancel,
    resetToken: resetToken.current,
    getSessionToken: () => active.current?.token,
    isCurrent: (token: symbol | undefined) => !!token && active.current?.token === token && available(),
    getRequested: () => active.current?.requested ?? latest.current.value,
  }
}
