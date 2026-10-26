import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
  type KeyboardEvent,
} from 'react'
import * as Primitive from '@radix-ui/react-slider'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import type { NumericEditCallbacks } from '../../interaction/numeric/types'
import { snapNumericValue } from '../../values/numeric'
import { equalSliderValues, useSliderEdit } from './useSliderEdit'

export interface SliderProps
  extends
    Omit<Primitive.SliderProps, 'value' | 'defaultValue' | 'onValueChange' | 'onValueCommit' | 'children' | 'asChild'>,
    NumericEditCallbacks<number[]> {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  readOnly?: boolean
  resetKey?: unknown
  precision?: number
  /** 设置滑块距范围端点的最少步数，用于在端点保留可操作空间；轨道仍显示完整范围。 */
  minStepsToEdges?: number
  compact?: boolean
  size?: 'xs' | 'sm' | 'md'
  tooltip?: boolean
  showRuler?: boolean
  rulerInterval?: number
  startSlot?: ReactNode
  endSlot?: ReactNode
  /** Labels for individual thumbs; a group aria-label is used as their fallback prefix. */
  thumbLabels?: readonly string[]
  formatValue?: (value: number, index: number) => string
  /** Decorative track content, e.g. fixed-total distribution segments. */
  trackContent?: ReactNode
  css?: SystemStyleObject
}

const rootRecipe = cva({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    userSelect: 'none',
    touchAction: 'none',
    backgroundColor: 'var(--colors-softBg)',
    borderRadius: 'var(--radii-control)',
    color: 'var(--colors-text)',
    '&[data-orientation=horizontal]': { width: '100%', height: 'var(--sizes-controlSm)', cursor: 'ew-resize' },
    '&[data-orientation=vertical]': {
      flexDirection: 'column',
      width: 'var(--sizes-controlSm)',
      height: '160px',
      cursor: 'ns-resize',
    },
    '&[data-disabled], &[data-readonly], &[data-edit-phase=pending]': { cursor: 'default' },
    '&[data-disabled]': { opacity: 0.5 },
  },
  variants: {
    size: {
      xs: { '&[data-orientation=horizontal]': { height: 'var(--sizes-controlXs)' } },
      sm: {},
      md: { '&[data-orientation=horizontal]': { height: 'var(--sizes-controlMd)' } },
    },
    compact: {
      true: {
        backgroundColor: 'transparent',
        '& [data-part=track][data-orientation=horizontal]': { height: '4px' },
        '& [data-part=track][data-orientation=vertical]': { width: '4px' },
      },
    },
  },
})
const trackClass = css({
  position: 'relative',
  flexGrow: 1,
  borderRadius: 'var(--radii-control)',
  overflow: 'hidden',
  backgroundColor: 'var(--colors-softBg)',
  '&[data-orientation=horizontal]': { width: '100%', height: '100%' },
  '&[data-orientation=vertical]': { width: '100%', height: '100%' },
})
const rangeClass = css({
  position: 'absolute',
  backgroundColor: 'var(--colors-selectionBg)',
  '&[data-orientation=horizontal]': { height: '100%' },
  '&[data-orientation=vertical]': { width: '100%' },
})
const thumbRecipe = cva({
  base: {
    display: 'block',
    position: 'relative',
    boxSizing: 'border-box',
    width: '4px',
    height: 'var(--sizes-controlSm)',
    backgroundColor: 'var(--colors-textStrong)',
    borderRadius: 'var(--radii-control)',
    outline: 'none',
    '&[data-orientation=vertical]': { width: 'var(--sizes-controlSm)', height: '4px' },
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
    '&[data-disabled]': { backgroundColor: 'var(--colors-textMuted)' },
    '&::after': { content: '""', position: 'absolute', inset: '-5px' },
  },
  variants: {
    size: {
      xs: { height: 'var(--sizes-controlXs)' },
      sm: {},
      md: { height: 'var(--sizes-controlMd)' },
    },
    compact: {
      true: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        '&[data-orientation=vertical]': { width: '12px', height: '12px' },
      },
    },
  },
})
const slotClass = css({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  fontSize: 'var(--fontSizes-micro)',
  color: 'var(--colors-textMuted)',
  zIndex: 1,
})

/** 用一个或多个滑块调整数值数组。回调返回请求值；受控使用时由父组件将接受的结果写回 value。 */
export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    readOnly = false,
    disabled = false,
    resetKey,
    min = 0,
    max = 100,
    step = 1,
    precision,
    minStepsBetweenThumbs = 0,
    minStepsToEdges = 0,
    preserveThumbOrder = false,
    orientation = 'horizontal',
    dir,
    inverted = false,
    compact = false,
    size = 'sm',
    tooltip = true,
    showRuler = false,
    rulerInterval,
    startSlot,
    endSlot,
    thumbLabels,
    formatValue,
    trackContent,
    css: cssProp,
    className,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture,
    onKeyDown,
    onFocus,
    onBlur,
    ...props
  },
  forwardedRef
) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max || !Number.isFinite(max - min))
    throw new RangeError('Slider requires a finite min <= max range.')
  if (!Number.isFinite(step) || step <= 0) throw new RangeError('Slider step must be finite and positive.')
  if (!Number.isFinite(minStepsBetweenThumbs) || minStepsBetweenThumbs < 0)
    throw new RangeError('Slider minimum thumb spacing must be finite and nonnegative.')
  if (!Number.isFinite(minStepsToEdges) || minStepsToEdges < 0)
    throw new RangeError('Slider endpoint spacing must be finite and nonnegative.')
  if (precision !== undefined && (!Number.isInteger(precision) || precision < 0 || precision > 15))
    throw new RangeError('Slider precision must be an integer from 0 to 15.')
  const normalize = (values: number[]) =>
    values
      .map((item) => {
        if (!Number.isFinite(item)) throw new RangeError('Slider values must be finite.')
        return Math.min(max, Math.max(min, item))
      })
      .sort((a, b) => a - b)
  const root = useRef<HTMLSpanElement>(null)
  const track = useRef<HTMLSpanElement>(null)
  const drag = useRef<{ pointerId: number; index: number; fine: boolean } | null>(null)
  const [focused, setFocused] = useState<number | null>(null)
  const errorId = useId()
  const configurationKey = JSON.stringify([
    min,
    max,
    step,
    precision,
    minStepsBetweenThumbs,
    minStepsToEdges,
    preserveThumbOrder,
    orientation,
    dir,
    inverted,
  ])
  const editor = useSliderEdit({
    value: value === undefined ? undefined : normalize(value),
    defaultValue: normalize(defaultValue ?? [min]),
    normalize,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    readOnly,
    disabled: disabled || min === max,
    resetKey,
    configurationKey,
  })
  const latest = useRef(editor)
  latest.current = editor
  const shown = normalize(editor.value)
  const gap = step * minStepsBetweenThumbs
  const edgeGap = step * minStepsToEdges
  if (
    !Number.isFinite(gap) ||
    !Number.isFinite(edgeGap) ||
    (shown.length ? gap * Math.max(0, shown.length - 1) + 2 * edgeGap : 0) - (max - min) >
      Math.max(1, max - min) * 1e-10
  )
    throw new RangeError('Slider range cannot fit the requested minimum thumb spacing.')
  const locked = disabled || readOnly || editor.phase === 'pending' || min === max
  const localError = editor.error && !props['aria-errormessage'] ? editor.error : null
  function release() {
    const active = drag.current
    drag.current = null
    if (active && root.current?.hasPointerCapture(active.pointerId))
      root.current.releasePointerCapture(active.pointerId)
    return active
  }
  function cancel(reason: 'escape' | 'pointer-cancel' | 'window-blur') {
    release()
    latest.current.cancel(reason)
  }
  useEffect(() => {
    const view = root.current?.ownerDocument.defaultView
    const blur = () => cancel('window-blur')
    view?.addEventListener('blur', blur)
    return () => {
      view?.removeEventListener('blur', blur)
      release()
    }
  }, [])
  useLayoutEffect(() => {
    if (editor.phase === 'idle') release()
  }, [editor.phase])
  useEffect(() => {
    const form = props.form ? root.current?.ownerDocument.getElementById(props.form) : root.current?.closest('form')
    if (!(form instanceof HTMLFormElement)) return
    let active = true
    const reset = (event: Event) => {
      // React's delegated onReset runs after this native listener and can cancel the reset.
      queueMicrotask(() => {
        if (active && !event.defaultPrevented && root.current?.isConnected) latest.current.reset()
      })
    }
    form.addEventListener('reset', reset)
    return () => {
      active = false
      form.removeEventListener('reset', reset)
    }
  }, [props.form, resetKey, configurationKey, value])
  function request(position: number, index: number, increment = step) {
    const previous = latest.current.requested()
    if (index < 0 || index >= previous.length) return index
    const lower = preserveThumbOrder && index > 0 ? previous[index - 1] + gap : min + edgeGap
    const upper = preserveThumbOrder && index < previous.length - 1 ? previous[index + 1] - gap : max - edgeGap
    // Authoritative values may temporarily violate spacing during an external update.
    // Do not manufacture an out-of-range request when that thumb has no valid interval.
    if (lower > upper) return index
    const nextValue = Math.min(
      upper,
      Math.max(lower, snapNumericValue(position, { min, max, step: increment, precision }))
    )
    const next = [...previous]
    next[index] = nextValue
    next.sort((a, b) => a - b)
    if (next.some((item, at) => at > 0 && item - next[at - 1] + 1e-10 < gap)) return index
    if (!equalSliderValues(previous, next)) latest.current.change(next)
    return preserveThumbOrder ? index : next.indexOf(nextValue)
  }
  function pointerValue(event: PointerEvent<HTMLSpanElement>) {
    const rect = track.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0 || rect.height <= 0) return null
    const horizontal = orientation === 'horizontal'
    const rtl = (dir ?? root.current?.ownerDocument.defaultView?.getComputedStyle(root.current).direction) === 'rtl'
    let ratio = horizontal ? (event.clientX - rect.left) / rect.width : 1 - (event.clientY - rect.top) / rect.height
    if ((horizontal && rtl) !== inverted) ratio = 1 - ratio
    return min + Math.min(1, Math.max(0, ratio)) * (max - min)
  }
  function pointerStart(event: PointerEvent<HTMLSpanElement>) {
    onPointerDown?.(event)
    if (event.defaultPrevented) return
    event.preventDefault()
    const target = (event.target as Element).closest<HTMLElement>('[data-thumb-index]')
    if (locked) {
      if (!disabled) target?.focus()
      return
    }
    if (event.button !== 0 || !event.isPrimary || drag.current || shown.length === 0) return
    const position = pointerValue(event)
    if (position === null || !latest.current.begin()) return
    let index = target
      ? Number(target.dataset.thumbIndex)
      : shown.reduce((best, item, at) => (Math.abs(item - position) < Math.abs(shown[best] - position) ? at : best), 0)
    drag.current = { pointerId: event.pointerId, index, fine: event.ctrlKey || event.metaKey }
    event.currentTarget.setPointerCapture(event.pointerId)
    if (!target) index = request(position, index, step * (drag.current.fine ? 0.1 : 1))
    if (drag.current) drag.current.index = index
    root.current?.querySelector<HTMLElement>(`[data-thumb-index="${index}"]`)?.focus()
  }
  function keyDown(event: KeyboardEvent<HTMLSpanElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (event.key === 'Escape' && (drag.current || latest.current.active())) {
      event.preventDefault()
      event.stopPropagation()
      cancel('escape')
      return
    }
    if (!['Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(event.key))
      return
    event.preventDefault()
    if (locked || drag.current || shown.length === 0) return
    const target = (event.target as Element).closest<HTMLElement>('[data-thumb-index]')
    const index = target ? Number(target.dataset.thumbIndex) : 0
    if (!latest.current.begin()) return
    const rtl = (dir ?? root.current?.ownerDocument.defaultView?.getComputedStyle(root.current).direction) === 'rtl'
    let direction = event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'PageDown' ? -1 : 1
    if (orientation === 'horizontal' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight') && rtl !== inverted)
      direction *= -1
    if (orientation === 'vertical' && (event.key === 'ArrowUp' || event.key === 'ArrowDown') && inverted)
      direction *= -1
    const increment = step * (event.ctrlKey || event.metaKey ? 0.1 : 1)
    const next =
      event.key === 'Home'
        ? min
        : event.key === 'End'
          ? max
          : shown[index] + direction * increment * (event.shiftKey || event.key.startsWith('Page') ? 10 : 1)
    const nextIndex = request(next, index, increment)
    if (nextIndex !== index) root.current?.querySelector<HTMLElement>(`[data-thumb-index="${nextIndex}"]`)?.focus()
    latest.current.commit('step')
  }
  const extent = max - min
  const tickInterval =
    rulerInterval !== undefined && Number.isFinite(rulerInterval) && rulerInterval > 0 ? rulerInterval : extent / 10
  const tickCount = extent > 0 && tickInterval > 0 ? Math.min(200, Math.floor(extent / tickInterval)) : 0
  const ticks =
    tickCount === 200
      ? Array.from({ length: 199 }, (_, index) => (index + 1) / 200)
      : Array.from({ length: tickCount }, (_, index) => ((index + 1) * tickInterval) / extent).filter(
          (ratio) => ratio < 1
        )
  return (
    <Primitive.Root
      {...props}
      ref={(node) => {
        root.current = node
        if (typeof forwardedRef === 'function') return forwardedRef(node)
        if (forwardedRef) forwardedRef.current = node
      }}
      min={min === max ? Math.min(0, min) : min}
      max={min === max ? Math.max(1, max) : max}
      step={step}
      value={shown}
      disabled={disabled}
      orientation={orientation}
      dir={dir}
      inverted={inverted}
      className={cx(css(rootRecipe.raw({ compact, size }), cssProp), className)}
      data-readonly={readOnly ? '' : undefined}
      data-edit-phase={editor.phase}
      aria-busy={editor.phase === 'pending' || undefined}
      aria-invalid={editor.error ? true : props['aria-invalid']}
      onValueChange={() => {
        /* Native form reset is handled by the owner, never a second editing path. */
      }}
      onPointerDown={pointerStart}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (event.defaultPrevented) return
        event.preventDefault()
        const active = drag.current
        if (!active || active.pointerId !== event.pointerId || !latest.current.active()) return
        const position = pointerValue(event)
        if (position !== null) {
          const nextIndex = request(position, active.index, step * (active.fine ? 0.1 : 1))
          if (nextIndex !== active.index)
            root.current?.querySelector<HTMLElement>(`[data-thumb-index="${nextIndex}"]`)?.focus()
          active.index = nextIndex
        }
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        event.preventDefault()
        if (drag.current?.pointerId !== event.pointerId) return
        release()
        latest.current.commit('pointer-up')
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        if (drag.current?.pointerId === event.pointerId) cancel('pointer-cancel')
      }}
      onLostPointerCapture={(event) => {
        onLostPointerCapture?.(event)
        if (drag.current?.pointerId === event.pointerId) cancel('pointer-cancel')
      }}
      onKeyDown={keyDown}
      onFocus={(event) => {
        onFocus?.(event)
        const item = (event.target as Element).closest<HTMLElement>('[data-thumb-index]')
        if (item) setFocused(Number(item.dataset.thumbIndex))
      }}
      onBlur={(event) => {
        onBlur?.(event)
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(null)
      }}>
      <Primitive.Track ref={track} data-part="track" className={trackClass}>
        {trackContent ?? (shown.length > 0 ? <Primitive.Range className={rangeClass} data-part="range" /> : null)}
        {showRuler && (
          <svg
            aria-hidden="true"
            className={css({ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' })}>
            {ticks.map((ratio) =>
              orientation === 'horizontal' ? (
                <line
                  key={ratio}
                  x1={`${ratio * 100}%`}
                  x2={`${ratio * 100}%`}
                  y1="75%"
                  y2="100%"
                  stroke="var(--colors-borderStrong)"
                />
              ) : (
                <line
                  key={ratio}
                  y1={`${ratio * 100}%`}
                  y2={`${ratio * 100}%`}
                  x1="75%"
                  x2="100%"
                  stroke="var(--colors-borderStrong)"
                />
              )
            )}
          </svg>
        )}
        {startSlot != null && (
          <span className={slotClass} style={{ insetInlineStart: 4 }}>
            {startSlot}
          </span>
        )}
        {endSlot != null && (
          <span className={slotClass} style={{ insetInlineEnd: 4 }}>
            {endSlot}
          </span>
        )}
      </Primitive.Track>
      {shown.map((item, index) => (
        <Primitive.Thumb
          key={index}
          data-part="thumb"
          data-thumb-index={index}
          className={css(thumbRecipe.raw({ compact, size }))}
          aria-label={
            thumbLabels?.[index] ?? `${props['aria-label'] ?? 'Value'}${shown.length > 1 ? ` ${index + 1}` : ''}`
          }
          aria-labelledby={thumbLabels?.[index] ? undefined : props['aria-labelledby']}
          aria-describedby={
            [props['aria-describedby'], localError ? errorId : null].filter(Boolean).join(' ') || undefined
          }
          aria-errormessage={props['aria-errormessage']}
          aria-invalid={editor.error ? true : props['aria-invalid']}
          aria-valuemin={preserveThumbOrder && index > 0 ? shown[index - 1] + gap : min + edgeGap}
          aria-valuemax={preserveThumbOrder && index < shown.length - 1 ? shown[index + 1] - gap : max - edgeGap}
          aria-valuenow={item}
          aria-readonly={readOnly || min === max || undefined}
          aria-valuetext={formatValue?.(item, index)}
          title={tooltip ? (formatValue?.(item, index) ?? String(item)) : undefined}>
          {tooltip && focused === index && (
            <span
              aria-hidden="true"
              className={css({
                position: 'absolute',
                bottom: 'calc(100% + 5px)',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 'var(--fontSizes-micro)',
                lineHeight: 1.4,
                padding: 'var(--space-0_5) var(--space-1)',
                borderRadius: 'var(--radii-control)',
                backgroundColor: 'var(--colors-surfaceOverlay)',
                color: 'var(--colors-text)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              })}>
              {formatValue?.(item, index) ?? item}
            </span>
          )}
        </Primitive.Thumb>
      ))}
      {localError && (
        <span
          id={errorId}
          role="alert"
          className={css({
            position: 'absolute',
            top: '100%',
            fontSize: 'var(--fontSizes-control)',
            color: 'var(--colors-dangerText)',
          })}>
          {localError}
        </span>
      )}
    </Primitive.Root>
  )
})
