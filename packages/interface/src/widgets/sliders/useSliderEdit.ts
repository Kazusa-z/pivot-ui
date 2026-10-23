import { useLayoutEffect, useRef, useState } from 'react'
import type { NumericEditCallbacks, NumericCancelReason, NumericCommitReason } from '../../interaction/numeric/types'

export const equalSliderValues = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((value, index) => Object.is(value, b[index]))

interface Options extends NumericEditCallbacks<number[]> {
  value?: number[]
  defaultValue: number[]
  normalize: (values: number[]) => number[]
  resetKey?: unknown
  configurationKey: string
  disabled?: boolean
  readOnly?: boolean
  onValueChange?: (value: number[]) => void
}
interface Session {
  initial: number[]
  requested: number[]
  echoes: number[][]
  resetKey: unknown
  configurationKey: string
  pending: boolean
  callbacks: NumericEditCallbacks<number[]>
}

export function useSliderEdit(options: Options) {
  const [internal, setInternal] = useState(options.defaultValue)
  const initialDefault = useRef([...options.defaultValue])
  const [phase, setPhase] = useState<'idle' | 'editing' | 'pending'>('idle')
  const [error, setError] = useState<string | null>(null)
  const session = useRef<Session | null>(null)
  const mounted = useRef(true)
  const latest = useRef(options)
  latest.current = options
  const current = options.normalize(options.value ?? internal)
  const currentRef = useRef(current)
  currentRef.current = current

  function cancel(reason: NumericCancelReason, restore = true) {
    const active = session.current
    if (!active) return
    session.current = null
    if (mounted.current) {
      setPhase('idle')
      setError(null)
    }
    if (active.pending) return
    if (restore && latest.current.value === undefined && mounted.current) {
      currentRef.current = active.initial
      setInternal(active.initial)
    }
    active.callbacks.onEditCancel?.(reason)
  }
  const cancelRef = useRef(cancel)
  cancelRef.current = cancel

  function begin() {
    if (latest.current.disabled || latest.current.readOnly || session.current?.pending) return false
    if (session.current) return true
    const active: Session = {
      initial: [...currentRef.current],
      requested: [...currentRef.current],
      echoes: [],
      resetKey: latest.current.resetKey,
      configurationKey: latest.current.configurationKey,
      pending: false,
      callbacks: latest.current,
    }
    session.current = active
    setError(null)
    try {
      if (active.callbacks.onEditStart?.('slider') === false) {
        session.current = null
        return false
      }
    } catch (cause) {
      session.current = null
      setError(cause instanceof Error ? cause.message : String(cause))
      return false
    }
    if (session.current !== active) return false
    setPhase('editing')
    return true
  }
  function change(next: number[]) {
    const active = session.current
    if (!active || active.pending) return
    active.requested = [...next]
    active.echoes.push([...next])
    if (latest.current.value === undefined) {
      currentRef.current = next
      setInternal(next)
    }
    latest.current.onValueChange?.([...next])
  }
  function commit(reason: NumericCommitReason) {
    const active = session.current
    if (!active || active.pending) return
    active.pending = true
    setPhase('pending')
    const finish = (cause?: unknown) => {
      if (!mounted.current || session.current !== active) return
      session.current = null
      setPhase('idle')
      if (cause !== undefined) setError(cause instanceof Error ? cause.message : String(cause))
    }
    try {
      Promise.resolve(active.callbacks.onValueCommit?.([...active.requested], reason)).then(
        () => finish(),
        (cause) => finish(cause ?? new Error('Edit rejected'))
      )
    } catch (cause) {
      finish(cause ?? new Error('Edit rejected'))
    }
  }
  function reset() {
    cancel('reset', false)
    setError(null)
    if (latest.current.value === undefined) {
      currentRef.current = latest.current.normalize(initialDefault.current)
      setInternal(currentRef.current)
    }
  }
  useLayoutEffect(() => {
    const active = session.current
    if (!active) return
    if (!Object.is(active.resetKey, options.resetKey)) cancelRef.current('external-update', false)
    else if (active.configurationKey !== options.configurationKey) cancelRef.current('reset', false)
    else if (!active.pending && (options.disabled || options.readOnly))
      cancelRef.current(options.disabled ? 'disabled' : 'read-only')
    else if (
      !active.pending &&
      !equalSliderValues(current, active.initial) &&
      !active.echoes.some((value) => equalSliderValues(value, current))
    )
      cancelRef.current('external-update', false)
  })
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      cancelRef.current('unmount', false)
    }
  }, [])
  return {
    value: current,
    phase,
    error,
    begin,
    change,
    commit,
    cancel,
    reset,
    requested: () => session.current?.requested ?? currentRef.current,
    active: () => session.current !== null && !session.current.pending,
  }
}
