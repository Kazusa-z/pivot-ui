import { useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { ColorCancelReason } from '../color/types'

interface RampPointerOptions {
  disabled: boolean
  disabledReason?: ColorCancelReason
  resetKey?: unknown
  active: boolean
  begin: (id: string) => boolean
  change: (id: string, position: number) => boolean
  commit: () => void
  cancel: (reason: ColorCancelReason) => void
}

/** Pointer transport shared by color and alpha tracks; IDs survive crossings and coincident stops. */
export function useRampPointer(options: RampPointerOptions) {
  const latest = useRef(options)
  latest.current = options
  const gesture = useRef<{
    target: HTMLButtonElement
    pointerId: number
    id: string
    x: number
    y: number
    origin: number
    width: number
    dragging: boolean
  } | null>(null)
  const cleanup = useRef(() => {})
  function finish(reason?: ColorCancelReason, commit = false) {
    const current = gesture.current
    if (!current) return
    gesture.current = null
    cleanup.current()
    if (current.target.hasPointerCapture?.(current.pointerId)) current.target.releasePointerCapture(current.pointerId)
    if (!current.dragging) return
    if (reason) latest.current.cancel(reason)
    else if (commit) latest.current.commit()
  }
  const finishRef = useRef(finish)
  finishRef.current = finish
  useLayoutEffect(() => () => finishRef.current('unmount'), [])
  useLayoutEffect(() => {
    finishRef.current('external-update')
  }, [options.resetKey])
  useLayoutEffect(() => {
    if (options.disabled) finishRef.current(options.disabledReason ?? 'disabled')
  }, [options.disabled, options.disabledReason])
  useLayoutEffect(() => {
    if (!options.active && gesture.current?.dragging) finishRef.current()
  }, [options.active])

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>, id: string, position: number, width: number) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.isPrimary === false ||
      latest.current.disabled ||
      width <= 0
    )
      return
    event.preventDefault()
    event.currentTarget.focus()
    finishRef.current('superseded')
    gesture.current = {
      target: event.currentTarget,
      pointerId: event.pointerId,
      id,
      x: event.clientX,
      y: event.clientY,
      origin: position,
      width,
      dragging: false,
    }
    const target = event.currentTarget
    const move = (next: PointerEvent) => {
      const current = gesture.current
      if (!current || next.pointerId !== current.pointerId) return
      next.preventDefault()
      if (!current.dragging) {
        if (Math.hypot(next.clientX - current.x, next.clientY - current.y) <= 3) return
        if (!latest.current.begin(current.id)) {
          finishRef.current()
          return
        }
        // onEditStart may synchronously unmount or reset the editor.
        if (gesture.current !== current) return
        current.dragging = true
      }
      const scale = next.ctrlKey || next.metaKey ? 0.1 : next.shiftKey ? 10 : 1
      const position = Math.max(0, Math.min(1, current.origin + ((next.clientX - current.x) / current.width) * scale))
      if (!latest.current.change(current.id, Math.round(position * 1e6) / 1e6)) finishRef.current()
    }
    const up = (next: PointerEvent) => {
      if (next.pointerId === gesture.current?.pointerId) finishRef.current(undefined, true)
    }
    const cancel = (next: PointerEvent) => {
      if (next.pointerId === gesture.current?.pointerId) finishRef.current('pointer-cancel')
    }
    const blur = () => finishRef.current('window-blur')
    const key = (next: KeyboardEvent) => {
      if (next.key !== 'Escape') return
      next.preventDefault()
      next.stopPropagation()
      finishRef.current('escape')
    }
    cleanup.current = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('blur', blur)
      window.removeEventListener('keydown', key, true)
      target.removeEventListener('lostpointercapture', cancel)
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', blur)
    window.addEventListener('keydown', key, true)
    target.addEventListener('lostpointercapture', cancel)
    target.setPointerCapture?.(event.pointerId)
  }
  return { onPointerDown, release: () => finishRef.current() }
}
