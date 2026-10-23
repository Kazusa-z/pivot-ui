import { useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { normalizeNumericConstraints, type NumericConstraints } from '../../values/numeric'
import type { NumericCancelReason } from './types'

export function numericModifierScale(event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) {
  return event.ctrlKey || event.metaKey ? 0.1 : event.shiftKey ? 10 : 1
}

interface DragOptions extends NumericConstraints {
  value: number
  disabled: boolean
  resetKey?: unknown
  cancelToken: unknown
  begin: () => boolean
  change: (value: number, origin: number) => number | null
  commit: () => void
  cancel: (reason: NumericCancelReason) => void
}

/** Pointer transport only; value normalization and the edit session belong to useNumericInput. */
export function useNumericDrag(options: DragOptions) {
  const latest = useRef(options)
  latest.current = options
  const active = useRef<{
    target: HTMLInputElement
    id: number
    startX: number
    startY: number
    lastX: number
    value: number
    origin: number
    dragging: boolean
  } | null>(null)
  const clean = useRef<() => void>(() => {})
  const stop = (reason?: NumericCancelReason, commit = false) => {
    const gesture = active.current
    if (!gesture) return
    active.current = null
    clean.current()
    if (gesture.target.hasPointerCapture?.(gesture.id)) gesture.target.releasePointerCapture(gesture.id)
    if (gesture.dragging) {
      if (reason) latest.current.cancel(reason)
      else if (commit) latest.current.commit()
    } else if (commit && !latest.current.disabled) {
      gesture.target.focus()
      gesture.target.select()
    }
  }
  const stopRef = useRef(stop)
  stopRef.current = stop
  useLayoutEffect(
    () => () => {
      stopRef.current('unmount')
    },
    []
  )
  useLayoutEffect(() => {
    if (active.current) stopRef.current('external-update')
  }, [options.resetKey])
  useLayoutEffect(() => {
    if (options.cancelToken === 'idle' && active.current?.dragging) stopRef.current('external-update')
  }, [options.cancelToken])
  useLayoutEffect(() => {
    if (options.disabled) stopRef.current('disabled')
  }, [options.disabled])

  const onPointerDown = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.isPrimary === false ||
      latest.current.disabled ||
      event.currentTarget === document.activeElement
    )
      return
    event.preventDefault()
    const target = event.currentTarget
    const value = latest.current.value
    active.current = {
      target,
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      value,
      origin: value,
      dragging: false,
    }
    const move = (next: PointerEvent) => {
      const gesture = active.current
      if (!gesture || next.pointerId !== gesture.id) return
      next.preventDefault()
      if (!gesture.dragging) {
        if (Math.hypot(next.clientX - gesture.startX, next.clientY - gesture.startY) <= 3) return
        if (!latest.current.begin()) {
          stopRef.current()
          return
        }
        gesture.dragging = true
      }
      const delta =
        (next.clientX - gesture.lastX) *
        normalizeNumericConstraints(latest.current).dragStep *
        numericModifierScale(next)
      gesture.lastX = next.clientX
      const sum = gesture.value + delta
      gesture.value = Number.isFinite(sum) ? sum : Math.sign(sum) * Number.MAX_VALUE
      const requested = latest.current.change(gesture.value, gesture.origin)
      if (requested === null) stopRef.current()
      else gesture.value = requested
    }
    const up = (next: PointerEvent) => {
      if (next.pointerId === active.current?.id) stopRef.current(undefined, true)
    }
    const cancel = (next: PointerEvent) => {
      if (next.pointerId === active.current?.id) stopRef.current('pointer-cancel')
    }
    const lost = (next: PointerEvent) => {
      if (next.pointerId === active.current?.id) stopRef.current('pointer-cancel')
    }
    const blur = () => stopRef.current('window-blur')
    const key = (next: KeyboardEvent) => {
      if (next.key === 'Escape') {
        next.preventDefault()
        next.stopPropagation()
        stopRef.current('escape')
      }
    }
    clean.current = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('blur', blur)
      window.removeEventListener('keydown', key, true)
      target.removeEventListener('lostpointercapture', lost)
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', blur)
    window.addEventListener('keydown', key, true)
    target.addEventListener('lostpointercapture', lost)
    target.setPointerCapture?.(event.pointerId)
  }

  // Release transport without ending the edit again (e.g. a native form reset).
  return { onPointerDown, release: () => stopRef.current() }
}
