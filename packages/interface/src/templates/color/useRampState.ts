import { useLayoutEffect, useRef, useState } from 'react'
import { useColorEdit } from '../../interaction/color/useColorEdit'
import type { ColorEditCallbacks } from '../../interaction/color/types'
import { afterRemoval } from './RampControls'

export interface RampStateOptions<T> extends ColorEditCallbacks<T> {
  value?: T
  defaultValue: T
  onValueChange?: (value: T) => void
  equals: (a: T, b: T) => boolean
  clone: (value: T) => T
  resetKey?: unknown
  disabled?: boolean
  readOnly?: boolean
}
export function useRampState<T>(options: RampStateOptions<T>) {
  const [internal, setInternal] = useState(() => options.clone(options.defaultValue))
  const current = options.value ?? internal
  const initial = useRef(current)
  const editor = useColorEdit({
    ...options,
    value: current,
    onValueChange: (next) => {
      if (options.value === undefined) setInternal(options.clone(next))
      options.onValueChange?.(next)
    },
    onEditStart: (source) => {
      initial.current = options.clone(current)
      return options.onEditStart?.(source)
    },
    onEditCancel: (reason) => {
      if (options.value === undefined && !['external-update', 'target-change', 'reset', 'unmount'].includes(reason))
        setInternal(initial.current)
      options.onEditCancel?.(reason)
    },
  })
  return { value: current, editor }
}
export function useRampSelection(
  stops: readonly { id: string; position: number }[],
  controlled: string | null | undefined,
  initial: string | null | undefined,
  onChange: ((id: string | null) => void) | undefined
) {
  const [internal, setInternal] = useState<string | null>(() =>
    initial === undefined ? (stops[0]?.id ?? null) : initial
  )
  const requested = controlled === undefined ? internal : controlled
  const previous = useRef(stops)
  const reported = useRef<{ requested: string | null; id: string | null } | null>(null)
  const id =
    requested === null
      ? null
      : stops.some((stop) => stop.id === requested)
        ? requested
        : (afterRemoval(previous.current, requested) ?? stops[0]?.id ?? null)
  useLayoutEffect(() => {
    if (
      controlled === undefined &&
      initial === undefined &&
      internal === null &&
      !previous.current.length &&
      stops.length
    )
      setInternal(stops[0].id)
    previous.current = stops
  }, [stops, controlled, initial, internal])
  function select(next: string | null) {
    if (next === id) return
    if (controlled === undefined) setInternal(next)
    onChange?.(next)
  }
  // Accept an initially empty track becoming nonempty without writing its value.
  useLayoutEffect(() => {
    if (requested !== id && (reported.current?.requested !== requested || reported.current?.id !== id)) {
      reported.current = { requested, id }
      if (controlled === undefined) setInternal(id)
      onChange?.(id)
    } else if (requested === id) reported.current = null
  }, [controlled, requested, id, onChange])
  return { id, select }
}
