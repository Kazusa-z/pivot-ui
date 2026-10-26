import {
  forwardRef,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { useValueEdit } from '../../interaction/value/useValueEdit'
import type {
  CurveCancelReason,
  CurveCommitReason,
  CurveEditCallbacks,
  CurveEditSource,
} from '../../interaction/curve/types'
import {
  addCurvePoint,
  areCurvesEqual,
  assertCurveValue,
  assertCurveViewport,
  createCurvePath,
  fitCurveViewport,
  getCurvePointBounds,
  getCurveTicks,
  removeCurvePoints,
  sampleCurve,
  setCurveInterpolation,
  updateCurvePoint,
  type CurveCoordinate,
  type CurvePoint,
  type CurvePointId,
  type CurveValue,
  type CurveViewport,
} from '../../values/curve'
import { roundNumeric } from '../../values/numeric'
import { Button } from '../buttons/Button'
import { Select } from '../choices/Select'
import { InputNumber } from '../inputs/InputNumber'

export interface CurveWidgetProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'>, CurveEditCallbacks {
  value: CurveValue
  onValueChange?: (value: CurveValue) => void
  selectedPointIds?: readonly CurvePointId[]
  defaultSelectedPointIds?: readonly CurvePointId[]
  onSelectedPointIdsChange?: (ids: readonly CurvePointId[]) => void
  viewport?: CurveViewport
  defaultViewport?: CurveViewport
  onViewportChange?: (viewport: CurveViewport) => void
  /** 限制用户编辑点时可达到的范围。已有点与视口保持原样；若某点无法在当前 x 范围内移动，请调整边界或相邻点。 */
  bounds?: Partial<CurveViewport>
  xStep?: number
  yStep?: number
  precision?: number
  label?: string
  xLabel?: string
  yLabel?: string
  formatXTick?: (value: number) => string
  formatYTick?: (value: number) => string
  height?: number
  showAnimation?: boolean
  showInterpolationSelector?: boolean
  resetKey?: unknown
  disabled?: boolean
  readOnly?: boolean
  css?: SystemStyleObject
}
type Handle = 'inHandle' | 'outHandle'
type Gesture = {
  pointerId: number
  element: SVGSVGElement
  kind: 'point' | 'handle' | 'pan'
  pointId?: string
  handle?: Handle
  origin: CurveCoordinate
  viewport: CurveViewport
  initial: CurveValue
  started: boolean
  owner: string
}
const emptySelection: readonly string[] = []
const defaultView: CurveViewport = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
const fieldClass = css({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
  fontSize: 'var(--fontSizes-control)',
})
const toolRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--space-1_5)',
})

/** Controlled curve value, independently controlled selection and viewport. */
export const CurveWidget = forwardRef<HTMLDivElement, CurveWidgetProps>(function CurveWidget(
  {
    value,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    selectedPointIds: controlledSelection,
    defaultSelectedPointIds = emptySelection,
    onSelectedPointIdsChange,
    viewport: controlledViewport,
    defaultViewport = defaultView,
    onViewportChange,
    bounds = {},
    xStep = 0.01,
    yStep = 0.01,
    precision = 6,
    label = 'Curve',
    xLabel = 'X',
    yLabel = 'Y',
    formatXTick,
    formatYTick,
    height = 260,
    showAnimation = false,
    showInterpolationSelector = true,
    resetKey,
    disabled = false,
    readOnly = false,
    css: cssProp,
    className,
    ...props
  },
  ref
) {
  assertCurveValue(value)
  assertCurveViewport(defaultViewport)
  if (!Number.isFinite(height) || height < 100) throw new RangeError('Curve height must be at least 100 pixels.')
  if (![xStep, yStep].every((step) => Number.isFinite(step) && step > 0))
    throw new RangeError('Curve edit steps must be positive and finite.')
  const [localSelection, setLocalSelection] = useState(defaultSelectedPointIds)
  const [localViewport, setLocalViewport] = useState(defaultViewport)
  const viewport = controlledViewport ?? localViewport
  assertCurveViewport(viewport)
  const selected = (controlledSelection ?? localSelection).filter(
    (id, index, ids) => ids.indexOf(id) === index && value.points.some((point) => point.id === id)
  )
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const selectedPoint = selected.length === 1 ? value.points.find((point) => point.id === selected[0]) : undefined
  const edit = useValueEdit<CurveValue, CurveEditSource, CurveCommitReason>({
    value,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    disabled,
    readOnly,
    equals: areCurvesEqual,
  })
  const childResetKey = useMemo(() => ({ resetKey, token: edit.resetToken }), [resetKey, edit.resetToken])
  const [localError, setLocalError] = useState<string | null>(null)
  const [width, setWidth] = useState(600)
  const [animationX, setAnimationX] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const svg = useRef<SVGSVGElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const pointerFocus = useRef(false)
  const keyboardOwner = useRef<string | null>(null)
  const lastCommitReason = useRef<CurveCommitReason>('enter')
  const idCounter = useRef(0)
  const instanceId = useId()
  const clipId = instanceId + '-plot'
  const errorId = instanceId + '-error'
  const helpId = instanceId + '-help'
  const plot = { left: 48, top: 16, width: Math.max(40, width - 64), height: height - 48 }
  const latest = useRef({ edit, viewport, value, bounds, disabled, readOnly, plot, selected })
  latest.current = { edit, viewport, value, bounds, disabled, readOnly, plot, selected }
  const error = edit.error ?? localError
  const errorMessage = props['aria-errormessage'] ?? (error ? errorId : undefined)
  const canMutate = !disabled && !readOnly && edit.phase !== 'pending'
  const locked = (owner: string) => !canMutate || (edit.owner !== null && edit.owner !== owner)
  const project = (point: CurveCoordinate) => ({
    x: ((point.x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * plot.width,
    y: (1 - (point.y - viewport.yMin) / (viewport.yMax - viewport.yMin)) * plot.height,
  })
  const screenPosition = (event: { clientX: number; clientY: number }) => {
    const rect = svg.current!.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / (rect.width || width)) * width - plot.left,
      y: ((event.clientY - rect.top) / (rect.height || height)) * height - plot.top,
    }
  }
  function setView(next: CurveViewport) {
    try {
      assertCurveViewport(next)
    } catch {
      return
    }
    if (disabled) return
    if (controlledViewport === undefined) setLocalViewport(next)
    onViewportChange?.(next)
  }
  const setViewRef = useRef(setView)
  setViewRef.current = setView
  function applySelection(ids: readonly string[]) {
    if (ids.length === selectedRef.current.length && ids.every((id, index) => id === selectedRef.current[index])) return
    selectedRef.current = [...ids]
    setLocalError(null)
    if (controlledSelection === undefined) setLocalSelection(ids)
    onSelectedPointIdsChange?.(ids)
  }
  function select(ids: readonly string[]) {
    if (disabled || edit.phase === 'pending') return
    if (ids.length === selectedRef.current.length && ids.every((id, index) => id === selectedRef.current[index])) return
    if (edit.owner !== null) edit.cancel('target-change')
    applySelection(ids)
  }
  function release() {
    const current = gesture.current
    gesture.current = null
    if (current?.element.hasPointerCapture?.(current.pointerId))
      current.element.releasePointerCapture(current.pointerId)
  }
  function cancelGesture(reason: CurveCancelReason) {
    const current = gesture.current
    release()
    if (current?.kind === 'pan') setViewRef.current(current.viewport)
    else if (current?.started) latest.current.edit.cancel(reason)
    if (keyboardOwner.current) {
      keyboardOwner.current = null
      latest.current.edit.cancel(reason)
    }
  }
  useLayoutEffect(() => {
    const element = svg.current
    if (!element) return
    const measure = () => {
      const next = element.getBoundingClientRect().width
      if (next > 0) setWidth(next)
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useLayoutEffect(() => {
    release()
    keyboardOwner.current = null
    setLocalError(null)
    setPlaying(false)
  }, [childResetKey, disabled, readOnly])
  const oldBounds = useRef(bounds)
  useLayoutEffect(() => {
    const old = oldBounds.current
    oldBounds.current = bounds
    if (old.xMin !== bounds.xMin || old.xMax !== bounds.xMax || old.yMin !== bounds.yMin || old.yMax !== bounds.yMax) {
      cancelGesture('external-update')
      edit.cancel('external-update')
    }
  }, [bounds.xMin, bounds.xMax, bounds.yMin, bounds.yMax])
  useLayoutEffect(() => {
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && (gesture.current || keyboardOwner.current)) {
        event.preventDefault()
        event.stopPropagation()
        cancelGesture('escape')
      }
    }
    const blur = () => cancelGesture('window-blur')
    window.addEventListener('keydown', escape, true)
    window.addEventListener('blur', blur)
    return () => {
      release()
      window.removeEventListener('keydown', escape, true)
      window.removeEventListener('blur', blur)
    }
  }, [])
  useLayoutEffect(() => {
    if (!playing) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setPlaying(false)
      setAnimationX(viewport.xMax)
      return
    }
    let frame = 0,
      start: number | undefined
    const range = latest.current.viewport
    const animate = (time: number) => {
      start ??= time
      const progress = Math.min(1, (time - start) / 1800)
      setAnimationX(range.xMin + (range.xMax - range.xMin) * progress)
      if (progress < 1) frame = requestAnimationFrame(animate)
      else setPlaying(false)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [playing])
  useLayoutEffect(() => {
    const element = svg.current
    if (!element) return
    const wheel = (event: WheelEvent) => {
      if (latest.current.disabled || gesture.current || latest.current.edit.phase !== 'idle') return
      event.preventDefault()
      const current = latest.current,
        rect = element.getBoundingClientRect()
      const ax = Math.max(0, Math.min(1, (event.clientX - rect.left - current.plot.left) / current.plot.width)),
        ay = 1 - Math.max(0, Math.min(1, (event.clientY - rect.top - current.plot.top) / current.plot.height))
      const factor = event.deltaY > 0 ? 1.2 : 1 / 1.2,
        view = current.viewport
      const x = view.xMin + (view.xMax - view.xMin) * ax,
        y = view.yMin + (view.yMax - view.yMin) * ay
      setViewRef.current({
        xMin: x + (view.xMin - x) * factor,
        xMax: x + (view.xMax - x) * factor,
        yMin: y + (view.yMin - y) * factor,
        yMax: y + (view.yMax - y) * factor,
      })
    }
    element.addEventListener('wheel', wheel, { passive: false })
    return () => element.removeEventListener('wheel', wheel)
  }, [])
  function startPointer(event: PointerEvent<SVGElement>, pointId?: string, handle?: Handle) {
    if (
      disabled ||
      event.isPrimary === false ||
      gesture.current ||
      (event.button !== 0 && event.button !== 1) ||
      edit.phase === 'pending'
    )
      return
    const pan = !pointId || event.button === 1 || event.altKey
    if (!pan && readOnly) {
      select(pointId ? [pointId] : [])
      return
    }
    if (!pan && pointId) {
      const next = event.shiftKey
        ? selected.includes(pointId)
          ? selected.filter((id) => id !== pointId)
          : [...selected, pointId]
        : selected.includes(pointId)
          ? selected
          : [pointId]
      select(next)
      pointerFocus.current = true
      try {
        event.currentTarget.focus()
      } finally {
        pointerFocus.current = false
      }
    }
    event.preventDefault()
    event.stopPropagation()
    const element = svg.current!
    gesture.current = {
      element,
      pointerId: event.pointerId,
      kind: pan ? 'pan' : handle ? 'handle' : 'point',
      pointId,
      handle,
      origin: screenPosition(event),
      viewport,
      initial: value,
      started: false,
      owner: handle ? `handle:${pointId}:${handle}` : `point:${pointId}`,
    }
    element.setPointerCapture(event.pointerId)
  }
  function movePointer(event: PointerEvent<SVGSVGElement>) {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return
    const position = screenPosition(event),
      dx = position.x - current.origin.x,
      dy = position.y - current.origin.y
    const delta = {
      x: (dx / plot.width) * (current.viewport.xMax - current.viewport.xMin),
      y: (-dy / plot.height) * (current.viewport.yMax - current.viewport.yMin),
    }
    if (current.kind === 'pan') {
      if (!current.started && Math.hypot(dx, dy) < 3) return
      current.started = true
      setView({
        xMin: current.viewport.xMin - delta.x,
        xMax: current.viewport.xMax - delta.x,
        yMin: current.viewport.yMin - delta.y,
        yMax: current.viewport.yMax - delta.y,
      })
      return
    }
    if (!current.started) {
      if (Math.hypot(dx, dy) < 3 || !edit.begin(current.kind, current.owner)) return
      current.started = true
      current.initial = edit.getRequested()
      setLocalError(null)
    }
    const point = current.initial.points.find((item) => item.id === current.pointId)
    if (!point) return
    const base = current.handle ? (point[current.handle] ?? point) : point
    const next = { x: roundNumeric(base.x + delta.x, precision), y: roundNumeric(base.y + delta.y, precision) }
    try {
      edit.request(
        updateCurvePoint(current.initial, point.id, current.handle ? { [current.handle]: next } : next, bounds),
        current.owner
      )
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : String(error))
    }
  }
  function endPointer(event: PointerEvent<SVGSVGElement>) {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return
    movePointer(event)
    release()
    if (current.kind !== 'pan' && current.started)
      void commit(edit.getRequested(), 'pointer-up', current.owner).catch(() => {})
  }
  function commit(next: CurveValue, reason: CurveCommitReason, owner: string) {
    lastCommitReason.current = reason
    return edit.commit(next, reason, owner)
  }
  function transact(next: CurveValue, source: CurveEditSource, reason: CurveCommitReason, owner: string) {
    if (!edit.begin(source, owner)) return false
    setLocalError(null)
    if (!edit.request(next, owner)) return false
    void commit(next, reason, owner).catch(() => {})
    return true
  }
  function add(coordinate?: CurveCoordinate) {
    if (!canMutate || edit.owner !== null) return
    const start = Math.max(viewport.xMin, bounds.xMin ?? -Infinity),
      end = Math.min(viewport.xMax, bounds.xMax ?? Infinity)
    let x = coordinate?.x ?? (start + end) / 2
    if (!Number.isFinite(x) || start > end) return
    if (!coordinate && value.points.some((point) => point.x === x)) {
      const positions = [
        start,
        ...value.points.map((point) => point.x).filter((number) => number > start && number < end),
        end,
      ]
      let largest = -1
      for (let index = 1; index < positions.length; index++)
        if (positions[index] - positions[index - 1] > largest) {
          largest = positions[index] - positions[index - 1]
          x = (positions[index] + positions[index - 1]) / 2
        }
    }
    x = Math.max(start, Math.min(end, x))
    const y = Math.max(
      bounds.yMin ?? -Infinity,
      Math.min(bounds.yMax ?? Infinity, coordinate?.y ?? sampleCurve(value, x) ?? (viewport.yMin + viewport.yMax) / 2)
    )
    let id: string
    do {
      id = `${instanceId}-point-${++idCounter.current}`
    } while (value.points.some((point) => point.id === id))
    try {
      const next = addCurvePoint(value, { id, x, y })
      if (transact(next, 'point', 'point', 'add')) applySelection([id])
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : String(error))
    }
  }
  function remove() {
    if (!canMutate || edit.owner !== null || !selected.length) return
    transact(removeCurvePoints(value, selected), 'point', 'point', 'delete')
  }
  function pointKey(event: KeyboardEvent<SVGCircleElement>, point: CurvePoint, handle?: Handle) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      select([point.id])
      return
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      remove()
      return
    }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || !canMutate) return
    event.preventDefault()
    const owner = handle ? `handle:${point.id}:${handle}` : `point:${point.id}`
    if (!edit.begin(handle ? 'handle' : 'point', owner)) return
    keyboardOwner.current = owner
    const active = edit.getRequested().points.find((item) => item.id === point.id)
    if (!active) return
    const base = handle ? (active[handle] ?? active) : active,
      factor = event.ctrlKey || event.metaKey ? 0.1 : event.shiftKey ? 10 : 1
    const horizontal = event.key === 'ArrowRight' || event.key === 'ArrowLeft'
    const patch = horizontal
      ? { x: roundNumeric(base.x + (event.key === 'ArrowRight' ? xStep : -xStep) * factor, precision) }
      : { y: roundNumeric(base.y + (event.key === 'ArrowUp' ? yStep : -yStep) * factor, precision) }
    edit.request(
      updateCurvePoint(
        edit.getRequested(),
        point.id,
        handle ? { [handle]: { ...base, ...patch } } : patch,
        handle && horizontal ? { ...bounds, yMin: undefined, yMax: undefined } : bounds
      ),
      owner
    )
  }
  function finishKeyboard() {
    const owner = keyboardOwner.current
    if (owner) {
      keyboardOwner.current = null
      void commit(edit.getRequested(), 'step', owner).catch(() => {})
    }
  }
  function zoom(factor: number) {
    const centerX = (viewport.xMin + viewport.xMax) / 2,
      centerY = (viewport.yMin + viewport.yMax) / 2
    setView({
      xMin: centerX + (viewport.xMin - centerX) * factor,
      xMax: centerX + (viewport.xMax - centerX) * factor,
      yMin: centerY + (viewport.yMin - centerY) * factor,
      yMax: centerY + (viewport.yMax - centerY) * factor,
    })
  }
  const ticksX = getCurveTicks(viewport.xMin, viewport.xMax, Math.max(2, Math.floor(plot.width / 65)))
  const ticksY = getCurveTicks(viewport.yMin, viewport.yMax, 5)
  const selectedBounds = selectedPoint ? getCurvePointBounds(value, selectedPoint.id, bounds) : bounds
  const animationY = animationX === null ? null : sampleCurve(value, animationX)
  function renderHandle(point: CurvePoint, handle: Handle) {
    const coordinate = point[handle]
    if (!coordinate) return null
    const projected = project(coordinate),
      anchor = project(point)
    return (
      <g key={`${point.id}:${handle}`}>
        <line
          x1={anchor.x}
          y1={anchor.y}
          x2={projected.x}
          y2={projected.y}
          stroke="var(--colors-textMuted)"
          strokeDasharray="3 3"
        />
        <circle
          data-curve-handle={handle}
          data-point-id={point.id}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`${label} ${point.id} ${handle === 'inHandle' ? 'incoming' : 'outgoing'} handle`}
          aria-disabled={disabled || readOnly || undefined}
          cx={projected.x}
          cy={projected.y}
          r={5}
          fill="var(--colors-surfaceOverlay)"
          stroke="var(--colors-text)"
          strokeWidth={2}
          className={css({
            cursor: 'move',
            outline: 'none',
            '&:focus': { stroke: 'var(--colors-focusRing)', strokeWidth: 3 },
          })}
          onPointerDown={(event) => startPointer(event, point.id, handle)}
          onKeyDown={(event) => pointKey(event, point, handle)}
          onKeyUp={(event) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) finishKeyboard()
          }}
          onBlur={finishKeyboard}
        />
      </g>
    )
  }
  return (
    <div
      {...props}
      ref={ref}
      role={props.role ?? 'group'}
      aria-label={props['aria-label'] ?? label}
      data-curve-phase={edit.phase}
      aria-busy={edit.phase === 'pending' || undefined}
      className={cx(
        css(
          {
            minWidth: 0,
            width: '100%',
            color: 'var(--colors-text)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          },
          cssProp
        ),
        className
      )}>
      <div className={toolRow}>
        {showInterpolationSelector && (
          <Select
            aria-label={`${label} interpolation`}
            size="sm"
            value={value.interpolation}
            options={[
              { key: 'linear', value: 'linear', label: 'Linear' },
              { key: 'bezier', value: 'bezier', label: 'Bezier' },
            ]}
            disabled={disabled || edit.phase !== 'idle'}
            readOnly={readOnly}
            css={{ flex: '0 1 120px' }}
            onValueChange={(next) => {
              if (!next) return
              transact(setCurveInterpolation(value, next as CurveValue['interpolation']), 'mode', 'mode', 'mode')
            }}
          />
        )}
        <Button size="sm" disabled={!canMutate || edit.owner !== null} onClick={() => add()}>
          Add point
        </Button>
        <Button size="sm" disabled={!canMutate || edit.owner !== null || !selected.length} onClick={remove}>
          Delete selected
        </Button>
        <Button size="sm" disabled={disabled || edit.phase !== 'idle'} onClick={() => setView(fitCurveViewport(value))}>
          Fit view
        </Button>
        <Button size="sm" disabled={disabled || edit.phase !== 'idle'} onClick={() => zoom(1 / 1.2)}>
          Zoom in
        </Button>
        <Button size="sm" disabled={disabled || edit.phase !== 'idle'} onClick={() => zoom(1.2)}>
          Zoom out
        </Button>
        <Button size="sm" disabled={disabled || edit.phase !== 'idle'} onClick={() => setView(defaultViewport)}>
          Reset view
        </Button>
        {showAnimation && (
          <Button
            size="sm"
            disabled={disabled || !value.points.length}
            onClick={() => {
              setAnimationX(viewport.xMin)
              setPlaying((old) => !old)
            }}>
            {playing ? 'Stop preview' : 'Play preview'}
          </Button>
        )}
      </div>
      <svg
        ref={svg}
        role="group"
        aria-label={`${label} graph`}
        aria-describedby={helpId}
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={css({
          display: 'block',
          width: '100%',
          minWidth: 0,
          background: 'var(--colors-surfaceSubtle)',
          border: '1px solid var(--colors-border)',
          borderRadius: 'var(--radii-control)',
          touchAction: 'none',
          userSelect: 'none',
        })}
        onPointerMove={movePointer}
        onPointerUp={endPointer}
        onPointerCancel={() => cancelGesture('pointer-cancel')}
        onLostPointerCapture={() => cancelGesture('pointer-cancel')}>
        <defs>
          <clipPath id={clipId}>
            <rect x={-8} y={-8} width={plot.width + 16} height={plot.height + 16} />
          </clipPath>
        </defs>
        <g transform={`translate(${plot.left} ${plot.top})`}>
          <rect
            data-curve-background=""
            x={0}
            y={0}
            width={plot.width}
            height={plot.height}
            fill="transparent"
            stroke="var(--colors-borderStrong)"
            onPointerDown={(event) => startPointer(event)}
            onDoubleClick={(event) => {
              const point = screenPosition(event)
              add({
                x: viewport.xMin + (point.x / plot.width) * (viewport.xMax - viewport.xMin),
                y: viewport.yMax - (point.y / plot.height) * (viewport.yMax - viewport.yMin),
              })
            }}
          />
          {ticksX.map((tick) => (
            <g key={`x:${tick.value}`} pointerEvents="none">
              <line
                x1={project({ x: tick.value, y: 0 }).x}
                x2={project({ x: tick.value, y: 0 }).x}
                y1={0}
                y2={plot.height}
                stroke="var(--colors-border)"
              />
              <text
                data-curve-tick="x"
                x={project({ x: tick.value, y: 0 }).x}
                y={plot.height + 16}
                textAnchor="middle"
                fontSize={10}
                fill="var(--colors-textMuted)">
                {formatXTick?.(tick.value) ?? tick.label}
              </text>
            </g>
          ))}
          {ticksY.map((tick) => (
            <g key={`y:${tick.value}`} pointerEvents="none">
              <line
                x1={0}
                x2={plot.width}
                y1={project({ x: 0, y: tick.value }).y}
                y2={project({ x: 0, y: tick.value }).y}
                stroke="var(--colors-border)"
              />
              <text
                data-curve-tick="y"
                x={-7}
                y={project({ x: 0, y: tick.value }).y + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--colors-textMuted)">
                {formatYTick?.(tick.value) ?? tick.label}
              </text>
            </g>
          ))}
          <g clipPath={`url(#${clipId})`}>
            <path
              data-curve-path=""
              d={createCurvePath(value, viewport, plot.width, plot.height)}
              fill="none"
              stroke="var(--colors-focusRing)"
              strokeWidth={2}
              pointerEvents="none"
            />
            {value.interpolation === 'bezier' &&
              value.points
                .filter((point) => selected.includes(point.id))
                .flatMap((point) => [renderHandle(point, 'inHandle'), renderHandle(point, 'outHandle')])}
            {value.points.map((point) => {
              const position = project(point)
              return (
                <circle
                  key={point.id}
                  data-curve-point={point.id}
                  role="button"
                  aria-label={`${label} point ${point.id}: ${point.x}, ${point.y}`}
                  aria-pressed={selected.includes(point.id)}
                  aria-disabled={disabled || readOnly || undefined}
                  tabIndex={disabled ? -1 : 0}
                  cx={position.x}
                  cy={position.y}
                  r={selected.includes(point.id) ? 6 : 5}
                  fill={selected.includes(point.id) ? 'var(--colors-focusRing)' : 'var(--colors-surfaceOverlay)'}
                  stroke="var(--colors-text)"
                  strokeWidth={1.5}
                  className={css({
                    cursor: 'move',
                    outline: 'none',
                    '&:focus': { stroke: 'var(--colors-focusRing)', strokeWidth: 3 },
                  })}
                  onPointerDown={(event) => startPointer(event, point.id)}
                  onFocus={() => {
                    if (!pointerFocus.current && !selectedRef.current.includes(point.id)) select([point.id])
                  }}
                  onKeyDown={(event) => pointKey(event, point)}
                  onKeyUp={(event) => {
                    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) finishKeyboard()
                  }}
                  onBlur={finishKeyboard}
                />
              )
            })}
            {animationX !== null && animationY !== null && (
              <circle
                data-curve-animation=""
                cx={project({ x: animationX, y: animationY }).x}
                cy={project({ x: animationX, y: animationY }).y}
                r={4}
                fill="var(--colors-text)"
                pointerEvents="none"
              />
            )}
          </g>
          <text x={plot.width} y={plot.height + 30} textAnchor="end" fontSize={11} fill="var(--colors-textMuted)">
            {xLabel}
          </text>
          <text x={-plot.left + 4} y={-4} fontSize={11} fill="var(--colors-textMuted)">
            {yLabel}
          </text>
        </g>
      </svg>
      <p
        id={helpId}
        className={css({
          margin: 0,
          fontSize: 'var(--fontSizes-micro)',
          lineHeight: 1.5,
          color: 'var(--colors-textMuted)',
        })}>
        Select a point; drag it or use arrow keys. Shift adds to selection. Double-click the graph to add. Drag empty
        space to pan; wheel zooms. Escape cancels an edit. Use pan and zoom to inspect different parts of the curve.
      </p>
      {selectedPoint && (
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 'var(--space-2)',
          })}>
          {(['x', 'y'] as const).map((axis) => {
            const owner = `coordinate:${selectedPoint.id}:${axis}`,
              min = axis === 'x' ? selectedBounds.xMin : bounds.yMin,
              max = axis === 'x' ? selectedBounds.xMax : bounds.yMax,
              unreachable = (min ?? -Infinity) > (max ?? Infinity)
            return (
              <label className={fieldClass} key={axis}>
                <span>{axis === 'x' ? xLabel : yLabel}</span>
                <InputNumber
                  aria-label={`${label} point ${selectedPoint.id} ${axis.toUpperCase()}`}
                  value={selectedPoint[axis]}
                  min={unreachable ? undefined : min}
                  max={unreachable ? undefined : max}
                  step={axis === 'x' ? xStep : yStep}
                  dragStep={(axis === 'x' ? xStep : yStep) / 10}
                  precision={precision}
                  resetKey={childResetKey}
                  disabled={disabled}
                  readOnly={readOnly || unreachable || (edit.owner !== null && edit.owner !== owner)}
                  aria-errormessage={errorMessage}
                  onEditStart={(source) => {
                    setLocalError(null)
                    return edit.begin(source, owner)
                  }}
                  onValueChange={(next) =>
                    edit.request(
                      updateCurvePoint(edit.getRequested(), selectedPoint.id, { [axis]: next }, bounds),
                      owner
                    )
                  }
                  onValueCommit={(next, reason) =>
                    commit(
                      updateCurvePoint(edit.getRequested(), selectedPoint.id, { [axis]: next }, bounds),
                      reason,
                      owner
                    )
                  }
                  onEditCancel={edit.cancel}
                />
                {unreachable && <span>Adjust the X limits or neighboring points to move this point horizontally.</span>}
              </label>
            )
          })}
        </div>
      )}
      {value.points.length === 0 && (
        <p className={css({ margin: 0, fontSize: 'var(--fontSizes-control)' })}>
          No points. Add a point to define a constant curve.
        </p>
      )}
      {error && !props['aria-errormessage'] && (
        <div
          id={errorId}
          role="alert"
          className={css({
            fontSize: 'var(--fontSizes-control)',
            color: 'var(--colors-dangerText)',
            overflowWrap: 'anywhere',
          })}>
          {error}
        </div>
      )}
      {edit.error && edit.owner && !edit.owner.startsWith('coordinate:') && (
        <Button
          size="sm"
          disabled={!canMutate}
          onClick={() => {
            if (edit.owner) void commit(edit.getRequested(), lastCommitReason.current, edit.owner).catch(() => {})
          }}>
          Retry curve edit
        </Button>
      )}
      {edit.error && (
        <Button size="xs" onClick={() => edit.cancel('escape')}>
          Cancel curve edit
        </Button>
      )}
    </div>
  )
})
