import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import {
  normalizeNumericConstraints,
  normalizeNumericValue,
  parseNumericDraft,
  stepNumericValue,
  type NumericConstraints,
} from '../../values/numeric'
import type { NumericCancelReason, NumericCommitReason, NumericEditCallbacks, NumericEditSource } from './types'

export interface NumericInputOptions extends NumericConstraints, NumericEditCallbacks<number> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  resetKey?: unknown
  disabled?: boolean
  readOnly?: boolean
  mixed?: boolean
}

type State = {
  phase: 'idle' | 'editing' | 'pending'
  draft: string
  error: string | null
  source: NumericEditSource | null
}
type Session = {
  initial: number
  requested: number
  observed: number
  resetKey: unknown
  mixed: boolean | undefined
  source: NumericEditSource
  hasRequested: boolean
  settlingRejection?: boolean
  terminal?: Promise<void>
  cancelCallback: NumericInputOptions['onEditCancel']
}

/** One numeric request path shared by text, drag and step. The host owns controlled rollback. */
export function useNumericInput(options: NumericInputOptions) {
  const initialDefault = useRef(options.defaultValue ?? 0)
  const [internal, setInternal] = useState(() => normalizeNumericValue(options.defaultValue ?? 0, options))
  const accepted = normalizeNumericValue(options.value ?? internal, options)
  const current = useRef({ options, accepted })
  current.current = { options, accepted }
  const [state, setState] = useState<State>({ phase: 'idle', draft: String(accepted), error: null, source: null })
  const stateRef = useRef(state)
  const active = useRef<Session | null>(null)
  const mounted = useRef(true)
  const reconnectValue = useRef<number | null>(null)
  const publish = useCallback((next: State) => {
    stateRef.current = next
    if (mounted.current) setState(next)
  }, [])

  const cancel = useCallback(
    (reason: NumericCancelReason = 'escape') => {
      const session = active.current
      const canCancel = stateRef.current.phase !== 'pending'
      active.current = null
      const { options: latest, accepted: value } = current.current
      const restore = session && canCancel && latest.value === undefined ? session.initial : value
      if (session && canCancel && latest.value === undefined) setInternal(restore)
      publish({ phase: 'idle', draft: String(restore), error: null, source: null })
      if (canCancel) session?.cancelCallback?.(reason)
    },
    [publish]
  )

  const reset = useCallback(() => {
    if (!mounted.current) return
    const session = active.current
    const canCancel = stateRef.current.phase !== 'pending'
    active.current = null
    const { options: latest, accepted: value } = current.current
    const restore = latest.value === undefined ? normalizeNumericValue(initialDefault.current, latest) : value
    if (latest.value === undefined) {
      current.current.accepted = restore
      setInternal(restore)
    }
    publish({ phase: 'idle', draft: String(restore), error: null, source: null })
    if (canCancel) session?.cancelCallback?.('reset')
  }, [publish])

  const available = useCallback(() => {
    const { options: latest, accepted: value } = current.current
    const session = active.current
    if (latest.disabled || latest.readOnly) {
      if (session) cancel(latest.disabled ? 'disabled' : 'read-only')
      return false
    }
    const mixedChanged =
      session && session.mixed !== latest.mixed && !(session.mixed && !latest.mixed && session.hasRequested)
    if (session && (!Object.is(session.resetKey, latest.resetKey) || mixedChanged)) {
      cancel('external-update')
      return false
    }
    if (session) session.mixed = latest.mixed
    if (session && value !== session.observed) {
      // Same-version pending rollback may precede rejection (e.g. the host clears its preview).
      if (stateRef.current.phase !== 'pending' && !session.settlingRejection && value !== session.requested) {
        cancel('external-update')
        return false
      }
      session.observed = value
    }
    return true
  }, [cancel])

  const begin = useCallback(
    (source: NumericEditSource) => {
      if (!mounted.current || !available() || stateRef.current.phase === 'pending') return false
      if (active.current) return true
      const { options: latest, accepted: value } = current.current
      const session: Session = {
        initial: value,
        requested: value,
        observed: value,
        resetKey: latest.resetKey,
        mixed: latest.mixed,
        source,
        hasRequested: false,
        cancelCallback: latest.onEditCancel,
      }
      active.current = session
      publish({ phase: 'editing', draft: latest.mixed && source === 'text' ? '' : String(value), error: null, source })
      try {
        if (latest.onEditStart?.(source) === false) {
          if (active.current === session) {
            active.current = null
            publish({ phase: 'idle', draft: String(current.current.accepted), error: null, source: null })
          }
          return false
        }
      } catch (error) {
        if (active.current === session) {
          active.current = null
          publish({
            phase: 'idle',
            draft: String(value),
            error: error instanceof Error ? error.message : String(error),
            source: null,
          })
        }
        return false
      }
      return active.current === session && available()
    },
    [available, publish]
  )

  const request = useCallback(
    (value: number, source: NumericEditSource, draft?: string, origin?: number) => {
      if (!begin(source)) return null
      const session = active.current!
      const latest = current.current.options
      const next = normalizeNumericValue(
        value,
        latest,
        source === 'drag' || source === 'step' ? 'soft' : 'hard',
        origin ?? session.initial
      )
      const changed = next !== session.requested
      const firstMixed = !session.hasRequested && latest.mixed
      session.hasRequested = true
      session.requested = next
      session.terminal = undefined
      publish({ phase: 'editing', draft: draft ?? String(next), error: null, source: session.source })
      if (latest.value === undefined) {
        current.current.accepted = next
        setInternal(next)
        session.observed = next
      }
      // Notify a first request even when equal: a mixed selection may become a concrete value.
      if (changed || firstMixed) latest.onValueChange?.(next)
      return active.current === session && available() ? next : null
    },
    [available, begin, publish]
  )

  const changeText = useCallback(
    (draft: string) => {
      if (!begin('text')) return
      const parsed = parseNumericDraft(draft)
      if (parsed.status === 'valid') request(parsed.value, 'text', draft)
      else {
        if (active.current) active.current.terminal = undefined
        publish({ phase: 'editing', draft, error: null, source: 'text' })
      }
    },
    [begin, publish, request]
  )

  const commit = useCallback(
    (reason: NumericCommitReason): Promise<void> => {
      const session = active.current
      if (!session || !available()) return Promise.resolve()
      if (session.terminal) {
        if (stateRef.current.phase === 'editing' && stateRef.current.error && reason !== 'blur')
          session.terminal = undefined
        else return session.terminal
      }
      if (session.source === 'text' || stateRef.current.error) {
        const parsed = parseNumericDraft(stateRef.current.draft)
        if (parsed.status !== 'valid') {
          publish({ ...stateRef.current, phase: 'editing', error: 'Enter a finite number.' })
          return Promise.resolve()
        }
        if (request(parsed.value, 'text', stateRef.current.draft) === null) return Promise.resolve()
      }
      if (active.current !== session || !available()) return Promise.resolve()
      const value = session.requested
      const draft = stateRef.current.draft
      let resolve!: () => void
      const terminal = new Promise<void>((done) => {
        resolve = done
      })
      session.terminal = terminal
      publish({ ...stateRef.current, phase: 'pending', error: null })
      const finish = (error?: unknown) => {
        if (mounted.current && active.current === session && available()) {
          if (error !== undefined) {
            // React may batch the host's preview rollback with this rejected completion.
            session.settlingRejection = true
            publish({
              phase: 'editing',
              draft,
              error: error instanceof Error ? error.message : String(error),
              source: session.source,
            })
          } else {
            active.current = null
            publish({ phase: 'idle', draft: String(current.current.accepted), error: null, source: null })
          }
        }
        resolve()
      }
      try {
        Promise.resolve(current.current.options.onValueCommit?.(value, reason)).then(
          () => finish(),
          (error: unknown) => finish(error ?? new Error('Edit rejected'))
        )
      } catch (error) {
        finish(error ?? new Error('Edit rejected'))
      }
      return terminal
    },
    [available, publish, request]
  )

  const step = useCallback(
    (direction: 1 | -1, multiplier = 1) => {
      const value = active.current?.requested ?? current.current.accepted
      if (
        request(stepNumericValue(value, direction, current.current.options, multiplier), 'step', undefined, value) !==
        null
      )
        void commit('step')
    },
    [commit, request]
  )

  useLayoutEffect(() => {
    mounted.current = true
    if (reconnectValue.current !== null) {
      setInternal(reconnectValue.current)
      reconnectValue.current = null
    }
    return () => {
      mounted.current = false
      const session = active.current
      active.current = null
      if (session && stateRef.current.phase !== 'pending') {
        // Activity can disconnect effects while preserving component state for a later reopening.
        if (current.current.options.value === undefined) reconnectValue.current = session.initial
        session.cancelCallback?.('unmount')
      }
    }
  }, [])
  const rules = normalizeNumericConstraints(options)
  useLayoutEffect(() => {
    if (active.current) {
      available()
      if (active.current && state.phase === 'editing') active.current.settlingRejection = false
    } else publish({ phase: 'idle', draft: String(accepted), error: null, source: null })
  }, [
    accepted,
    options.resetKey,
    options.disabled,
    options.readOnly,
    options.mixed,
    state.phase,
    state.error,
    available,
    publish,
  ])
  const constraintsKey = `${rules.min}:${rules.max}:${rules.softMin}:${rules.softMax}:${rules.step}:${rules.dragStep}:${rules.precision}`
  const previousConstraints = useRef(constraintsKey)
  useLayoutEffect(() => {
    if (previousConstraints.current !== constraintsKey) {
      previousConstraints.current = constraintsKey
      if (active.current) cancel('external-update')
    }
  }, [constraintsKey, cancel])

  return { ...state, value: accepted, begin, request, changeText, commit, cancel, reset, step }
}
