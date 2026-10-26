import { useLayoutEffect, useMemo, useRef, type HTMLAttributes } from 'react'
import { css } from '../../../styled-system/css'
import { useRampPointer } from '../../interaction/color-ramp/useRampPointer'
import type { useColorEdit } from '../../interaction/color/useColorEdit'
import type { ColorValue } from '../../values/color'
import { sampleColorRamp, sortRampStops, type ColorRampValue } from '../../values/color-ramp'
import { getColorCss } from '../../widgets/color/color-preview'
import { Button } from '../../widgets/buttons/Button'
import { Select } from '../../widgets/choices/Select'
import { InputNumber } from '../../widgets/inputs/InputNumber'
import { ColorPicker } from './ColorPicker'
import type { ColorCapabilities } from '../../contracts/color'
import { getColorRampCss } from './color-ramp-preview'

export type RampEditor<T> = ReturnType<typeof useColorEdit<T>>
export const rampStyles = {
  root: css({
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    color: 'var(--colors-text)',
    fontSize: 'var(--fontSizes-control)',
  }),
  row: css({
    display: 'flex',
    gap: 'var(--space-2)',
    flexWrap: 'wrap',
    alignItems: 'center',
    minWidth: 0,
  }),
  checker: css({
    backgroundColor: '#fff',
    backgroundImage: 'conic-gradient(#ccc 25%, transparent 0 50%, #ccc 0 75%, transparent 0)',
    backgroundSize: '12px 12px',
  }),
}
export const defaultRamp: ColorRampValue = {
  interpolation: 'linear',
  stops: [
    { id: 'start', position: 0, color: { space: 'srgb', r: 0, g: 0, b: 0, a: 1 } },
    { id: 'end', position: 1, color: { space: 'srgb', r: 1, g: 1, b: 1, a: 1 } },
  ],
}
export function nextStopId(prefix: string, ids: readonly string[]) {
  let index = 1
  while (ids.includes(`${prefix}-${index}`)) index++
  return `${prefix}-${index}`
}
export function afterRemoval(stops: readonly { id: string; position: number }[], id: string): string | null {
  const sorted = sortRampStops(stops),
    index = sorted.findIndex((stop) => stop.id === id)
  return sorted[index + 1]?.id ?? sorted[index - 1]?.id ?? null
}
export interface RampTrackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSelect'> {
  label: string
  stops: readonly { id: string; position: number; swatch: string }[]
  background: string
  activeId: string | null
  onSelect: (id: string | null) => void
  disabled?: boolean
  readOnly?: boolean
  pending: boolean
  resetKey?: unknown
  editing: boolean
  onBegin: (id: string) => boolean
  onMove: (id: string, position: number) => boolean
  onCommit: (reason: 'pointer-up' | 'step') => void
  onCancel: RampEditor<unknown>['cancel']
  onRemove: (id: string) => void
}
export function RampTrack({
  label,
  stops,
  background,
  activeId,
  onSelect,
  disabled,
  readOnly,
  pending,
  resetKey,
  editing,
  onBegin,
  onMove,
  onCommit,
  onCancel,
  onRemove,
  ...props
}: RampTrackProps) {
  const track = useRef<HTMLDivElement>(null)
  const handles = useRef(new Map<string, HTMLButtonElement>())
  const focusId = useRef<string | null>(null)
  const previous = useRef(stops)
  const keyboard = useRef<{ id: string; position: number } | null>(null)
  const endKeyboard = (cancel = false) => {
    if (!keyboard.current) return
    keyboard.current = null
    if (cancel) onCancel('escape')
    else onCommit('step')
  }
  useLayoutEffect(() => {
    if (!editing) keyboard.current = null
  }, [editing])
  useLayoutEffect(() => {
    const blur = () => {
      if (keyboard.current) {
        keyboard.current = null
        onCancel('window-blur')
      }
    }
    window.addEventListener('blur', blur)
    return () => window.removeEventListener('blur', blur)
  }, [onCancel])
  const pointer = useRampPointer({
    disabled: !!(disabled || readOnly || pending),
    disabledReason: readOnly ? 'read-only' : 'disabled',
    resetKey,
    active: editing,
    begin: onBegin,
    change: onMove,
    commit: () => onCommit('pointer-up'),
    cancel: onCancel,
  })
  useLayoutEffect(() => {
    if (focusId.current && !stops.some((stop) => stop.id === focusId.current)) {
      const id = afterRemoval(previous.current, focusId.current)
      focusId.current = id
      const target = id && handles.current.get(id)
      if (target) target.focus()
      else track.current?.focus()
    }
    previous.current = stops
  }, [stops])
  return (
    <div {...props}>
      <div
        ref={track}
        role="group"
        aria-label={label}
        tabIndex={-1}
        className={css({
          position: 'relative',
          marginInline: 'var(--space-2)',
          height: '64px',
          minWidth: 0,
          outlineOffset: '2px',
        })}>
        <div
          className={rampStyles.checker}
          style={{
            position: 'absolute',
            inset: '0 0 auto',
            height: 24,
            borderRadius: 'var(--radii-control)',
            border: '1px solid var(--colors-borderStrong)',
          }}>
          <div style={{ height: '100%', borderRadius: 'inherit', backgroundImage: background }} />
        </div>
        {stops.map((stop, index) => (
          <button
            key={stop.id}
            ref={(element) => {
              if (element) handles.current.set(stop.id, element)
              else handles.current.delete(stop.id)
            }}
            type="button"
            role="slider"
            data-stop-id={stop.id}
            aria-label={`${label} ${stop.id}`}
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={stop.position}
            aria-valuetext={`${Math.round(stop.position * 10000) / 100}%`}
            aria-readonly={readOnly || undefined}
            aria-disabled={disabled || pending || undefined}
            disabled={disabled}
            data-active={activeId === stop.id ? '' : undefined}
            className={css({
              position: 'absolute',
              width: '16px',
              height: 'var(--sizes-controlXs)',
              padding: 'var(--space-0_5)',
              transform: 'translateX(-50%)',
              border: '1px solid var(--colors-borderStrong)',
              borderRadius: 'var(--radii-control)',
              backgroundColor: 'var(--colors-surface)',
              cursor: 'ew-resize',
              touchAction: 'none',
              '&[data-active]': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px', zIndex: 2 },
              '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px', zIndex: 2 },
              '&:disabled': { opacity: 0.5 },
            })}
            style={{ left: `${stop.position * 100}%`, top: 25 + (index % 3) * 7 }}
            onFocus={() => {
              focusId.current = stop.id
            }}
            onBlur={() => endKeyboard()}
            onClick={() => {
              if (!disabled && !pending) onSelect(stop.id)
            }}
            onPointerDown={(event) => {
              if (!disabled && !pending) onSelect(stop.id)
              pointer.onPointerDown(event, stop.id, stop.position, track.current?.getBoundingClientRect().width ?? 0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                keyboard.current = null
                onCancel('escape')
                return
              }
              if (disabled || readOnly || pending) return
              if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault()
                onRemove(stop.id)
                return
              }
              const step = event.ctrlKey || event.metaKey ? 0.001 : event.shiftKey ? 0.1 : 0.01
              const current = keyboard.current?.id === stop.id ? keyboard.current.position : stop.position
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? 1
                    : ['ArrowRight', 'ArrowUp'].includes(event.key)
                      ? current + step
                      : ['ArrowLeft', 'ArrowDown'].includes(event.key)
                        ? current - step
                        : undefined
              if (next === undefined) return
              event.preventDefault()
              onSelect(stop.id)
              if (!keyboard.current && !onBegin(stop.id)) return
              const position = Math.max(0, Math.min(1, Math.round(next * 1e6) / 1e6))
              keyboard.current = { id: stop.id, position }
              if (!onMove(stop.id, position)) keyboard.current = null
            }}
            onKeyUp={(event) => {
              if (['Home', 'End', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) endKeyboard()
            }}>
            <span style={{ display: 'block', width: '100%', height: '100%', background: stop.swatch }} />
          </button>
        ))}
      </div>
    </div>
  )
}

export interface ColorRampControlsProps<T> {
  value: ColorRampValue
  editor: RampEditor<T>
  getRamp: (value: T) => ColorRampValue
  replaceRamp: (value: T, ramp: ColorRampValue) => T
  activeId: string | null
  onSelect: (id: string | null) => void
  disabled?: boolean
  readOnly?: boolean
  hdr?: boolean
  capabilities?: ColorCapabilities
  resetKey?: unknown
  errorId?: string
}
export function ColorRampControls<T>({
  value,
  editor,
  getRamp,
  replaceRamp,
  activeId,
  onSelect,
  disabled,
  readOnly,
  hdr,
  capabilities,
  resetKey,
  errorId,
}: ColorRampControlsProps<T>) {
  const active = value.stops.find((stop) => stop.id === activeId)
  const added = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (added.current && value.stops.some((stop) => stop.id === added.current)) {
      onSelect(added.current)
      added.current = null
    } else if (editor.phase === 'idle' || editor.error) added.current = null
  }, [value.stops, editor.phase, editor.error, onSelect])
  const locked = disabled || readOnly || editor.phase === 'pending'
  const owner = useRef('')
  const replaceStop = (
    id: string,
    update: (stop: ColorRampValue['stops'][number]) => ColorRampValue['stops'][number]
  ) => {
    const current = editor.getRequested(),
      ramp = getRamp(current)
    return replaceRamp(current, { ...ramp, stops: ramp.stops.map((stop) => (stop.id === id ? update(stop) : stop)) })
  }
  const begin = (id: string) => {
    owner.current = `color-position:${id}`
    return editor.begin('slider', owner.current)
  }
  const move = (id: string, position: number) =>
    editor.request(
      replaceStop(id, (stop) => ({ ...stop, position })),
      owner.current
    )
  const commit = (reason: 'pointer-up' | 'step') => {
    void editor.commit(editor.getRequested(), reason, owner.current).catch(() => {})
  }
  const discrete = (next: ColorRampValue) => {
    if (!editor.begin('step', 'color-structure')) return false
    if (!editor.request(replaceRamp(editor.getRequested(), next), 'color-structure')) return false
    void editor.commit(editor.getRequested(), 'step', 'color-structure').catch(() => {})
    return true
  }
  const remove = (id: string) => {
    if (locked || !value.stops.some((stop) => stop.id === id)) return
    discrete({ ...value, stops: value.stops.filter((stop) => stop.id !== id) })
  }
  const colorOwner = `color:${activeId}`
  const positionOwner = `color-input:${activeId}`
  const lockedFor = (nextOwner: string) => readOnly || (editor.owner !== null && editor.owner !== nextOwner)
  const inputReset = useMemo(
    () => ({ resetKey, activeId, resetToken: editor.resetToken }),
    [resetKey, activeId, editor.resetToken]
  )
  const updateColor = (color: ColorValue) => replaceStop(activeId!, (stop) => ({ ...stop, color }))
  return (
    <div className={rampStyles.root}>
      <RampTrack
        label="Color stop"
        stops={value.stops.map((stop) => ({ ...stop, swatch: getColorCss(stop.color) }))}
        background={getColorRampCss(value)}
        activeId={activeId}
        onSelect={onSelect}
        disabled={disabled}
        readOnly={readOnly}
        pending={editor.phase === 'pending'}
        resetKey={resetKey}
        editing={editor.phase === 'editing'}
        onBegin={begin}
        onMove={move}
        onCommit={commit}
        onCancel={editor.cancel}
        onRemove={remove}
      />
      <div className={rampStyles.row}>
        <Select
          aria-label="Selected color stop"
          size="sm"
          value={active?.id ?? null}
          placeholder="No stop selected"
          options={value.stops.map((stop) => ({
            key: stop.id,
            value: stop.id,
            label: `${stop.id} (${Math.round(stop.position * 100)}%)`,
          }))}
          disabled={disabled || editor.phase === 'pending' || !value.stops.length}
          css={{ flex: '1 1 150px' }}
          onValueChange={(id) => onSelect(id)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={locked}
          onClick={() => {
            const position = active?.position ?? 0.5,
              color = sampleColorRamp(value, position) ?? defaultRamp.stops[0].color
            const id = nextStopId(
              'color',
              value.stops.map((stop) => stop.id)
            )
            added.current = id
            if (!discrete({ ...value, stops: [...value.stops, { id, position, color }] })) added.current = null
          }}>
          Add color stop
        </Button>
        <Button size="sm" variant="outline" disabled={locked || !active} onClick={() => active && remove(active.id)}>
          Delete color stop
        </Button>
        <Select
          aria-label="Interpolation"
          size="sm"
          value={value.interpolation}
          options={[
            { key: 'linear', value: 'linear', label: 'Linear' },
            { key: 'constant', value: 'constant', label: 'Constant' },
          ]}
          disabled={locked}
          css={{ flex: '1 1 120px' }}
          onValueChange={(next) => {
            if (next) discrete({ ...value, interpolation: next as ColorRampValue['interpolation'] })
          }}
        />
      </div>
      {active && (
        <>
          <label className={rampStyles.row}>
            <span>Position</span>
            <div className={css({ flex: '1 1 120px', minWidth: 0 })}>
              <InputNumber
                aria-label="Color stop position"
                value={active.position}
                min={0}
                max={1}
                step={0.01}
                dragStep={0.005}
                precision={6}
                disabled={disabled}
                readOnly={lockedFor(positionOwner)}
                resetKey={inputReset}
                aria-errormessage={errorId}
                onEditStart={(source) => editor.begin(source, positionOwner)}
                onValueChange={(position) =>
                  editor.request(
                    replaceStop(active.id, (stop) => ({ ...stop, position })),
                    positionOwner
                  )
                }
                onValueCommit={(position, reason) =>
                  editor.commit(
                    replaceStop(active.id, (stop) => ({ ...stop, position })),
                    reason,
                    positionOwner
                  )
                }
                onEditCancel={editor.cancel}
              />
            </div>
          </label>
          <ColorPicker
            value={active.color}
            hdr={hdr}
            capabilities={capabilities}
            disabled={disabled}
            readOnly={lockedFor(colorOwner)}
            resetKey={inputReset}
            aria-errormessage={errorId}
            onEditStart={(source) => editor.begin(source, colorOwner)}
            onValueChange={(color) => editor.request(updateColor(color), colorOwner)}
            onValueCommit={(color, reason) => editor.commit(updateColor(color), reason, colorOwner)}
            onEditCancel={editor.cancel}
          />
        </>
      )}
    </div>
  )
}
