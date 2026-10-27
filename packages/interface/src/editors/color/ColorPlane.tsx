import { useLayoutEffect, useRef, type PointerEvent } from 'react'
import { css } from '../../../styled-system/css'
import type { ColorCancelReason } from '../../interaction/color/types'

interface ColorPlaneProps {
  label: string
  hue: number
  saturation: number
  brightness: number
  disabled: boolean
  active: boolean
  onBegin: () => boolean
  onChange: (saturation: number, brightness: number) => void
  onCommit: () => Promise<void>
  onCancel: (reason: ColorCancelReason) => void
}

/** Pointer SV surface. The adjacent H/S/V numeric inputs provide the same keyboard operations. */
export function ColorPlane(props: ColorPlaneProps) {
  const latest = useRef(props)
  latest.current = props
  const gesture = useRef<{ element: HTMLDivElement; pointerId: number } | null>(null)
  function release() {
    const current = gesture.current
    gesture.current = null
    if (current?.element.hasPointerCapture(current.pointerId)) current.element.releasePointerCapture(current.pointerId)
  }
  function cancel(reason: ColorCancelReason) {
    if (!gesture.current) return
    release()
    latest.current.onCancel(reason)
  }
  function change(event: PointerEvent<HTMLDivElement>) {
    const rectangle = event.currentTarget.getBoundingClientRect()
    if (rectangle.width <= 0 || rectangle.height <= 0) return
    const clamp = (number: number) => Math.max(0, Math.min(1, number))
    latest.current.onChange(
      clamp((event.clientX - rectangle.left) / rectangle.width),
      clamp(1 - (event.clientY - rectangle.top) / rectangle.height)
    )
  }
  useLayoutEffect(() => {
    if (props.disabled || !props.active) release()
  }, [props.disabled, props.active])
  useLayoutEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && gesture.current) {
        event.preventDefault()
        event.stopPropagation()
        cancel('escape')
      }
    }
    const blur = () => cancel('window-blur')
    window.addEventListener('keydown', escape, true)
    window.addEventListener('blur', blur)
    return () => {
      release()
      window.removeEventListener('keydown', escape, true)
      window.removeEventListener('blur', blur)
    }
  }, [])
  return (
    <div
      role="group"
      aria-label={`${props.label} saturation and value plane; H, S and V inputs provide keyboard editing`}
      tabIndex={props.disabled ? undefined : 0}
      aria-disabled={props.disabled || undefined}
      className={css({
        position: 'relative',
        height: '130px',
        width: '100%',
        borderRadius: 'var(--radii-control)',
        border: '1px solid var(--colors-border)',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'crosshair',
        overflow: 'hidden',
        '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
      })}
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${props.hue} 100% 50%)`,
      }}
      onPointerDown={(event) => {
        if (
          event.button !== 0 ||
          !event.isPrimary ||
          latest.current.disabled ||
          gesture.current ||
          !latest.current.onBegin()
        )
          return
        event.preventDefault()
        event.currentTarget.focus()
        gesture.current = { element: event.currentTarget, pointerId: event.pointerId }
        event.currentTarget.setPointerCapture(event.pointerId)
        change(event)
      }}
      onPointerMove={(event) => {
        if (gesture.current?.pointerId === event.pointerId) change(event)
      }}
      onPointerUp={(event) => {
        if (gesture.current?.pointerId === event.pointerId) {
          change(event)
          release()
          void latest.current.onCommit().catch(() => {})
        }
      }}
      onPointerCancel={() => cancel('pointer-cancel')}
      onLostPointerCapture={() => cancel('pointer-cancel')}>
      <span
        aria-hidden="true"
        className={css({
          position: 'absolute',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 0 0 1px black',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        })}
        style={{
          left: `${Math.min(1, props.saturation) * 100}%`,
          top: `${(1 - Math.min(1, props.brightness)) * 100}%`,
        }}
      />
    </div>
  )
}
