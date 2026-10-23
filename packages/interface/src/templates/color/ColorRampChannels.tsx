import { forwardRef, useId, useLayoutEffect, useMemo, useRef, type HTMLAttributes } from 'react'
import { css, cx } from '../../../styled-system/css'
import type { ColorCapabilities } from '../../contracts/color'
import type { ColorEditCallbacks } from '../../interaction/color/types'
import {
  areColorRampChannelsEqual,
  assertColorRampChannelsValue,
  cloneColorRampChannelsValue,
  sampleAlphaStops,
  type ColorRampChannelsValue,
} from '../../values/color-ramp'
import { InputNumber } from '../../widgets/inputs/InputNumber'
import { ColorRampControls, defaultRamp, nextStopId, RampTrack, rampStyles } from './RampControls'
import { getColorRampChannelsCss } from './color-ramp-preview'
import { useRampSelection, useRampState } from './useRampState'

export interface ColorRampChannelsProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'>,
    ColorEditCallbacks<ColorRampChannelsValue> {
  value?: ColorRampChannelsValue
  defaultValue?: ColorRampChannelsValue
  onValueChange?: (value: ColorRampChannelsValue) => void
  activeStopId?: string | null
  defaultActiveStopId?: string | null
  onActiveStopIdChange?: (id: string | null) => void
  activeAlphaStopId?: string | null
  defaultActiveAlphaStopId?: string | null
  onActiveAlphaStopIdChange?: (id: string | null) => void
  disabled?: boolean
  readOnly?: boolean
  hdr?: boolean
  resetKey?: unknown
  capabilities?: ColorCapabilities
}
const defaultChannels: ColorRampChannelsValue = {
  color: defaultRamp,
  alpha: [
    { id: 'alpha-start', position: 0, alpha: 1 },
    { id: 'alpha-end', position: 1, alpha: 1 },
  ],
}
export const ColorRampChannels = forwardRef<HTMLDivElement, ColorRampChannelsProps>(function ColorRampChannels(
  {
    value,
    defaultValue = defaultChannels,
    onValueChange,
    activeStopId,
    defaultActiveStopId,
    onActiveStopIdChange,
    activeAlphaStopId,
    defaultActiveAlphaStopId,
    onActiveAlphaStopIdChange,
    disabled,
    readOnly,
    hdr = false,
    resetKey,
    capabilities,
    onEditStart,
    onValueCommit,
    onEditCancel,
    className,
    ...props
  },
  ref
) {
  assertColorRampChannelsValue(value ?? defaultValue, { hdr })
  const { value: current, editor } = useRampState({
    value,
    defaultValue,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    disabled,
    readOnly,
    resetKey,
    equals: areColorRampChannelsEqual,
    clone: cloneColorRampChannelsValue,
  })
  const colorSelection = useRampSelection(current.color.stops, activeStopId, defaultActiveStopId, onActiveStopIdChange)
  const alphaSelection = useRampSelection(
    current.alpha,
    activeAlphaStopId,
    defaultActiveAlphaStopId,
    onActiveAlphaStopIdChange
  )
  const selected = useRef([colorSelection.id, alphaSelection.id])
  useLayoutEffect(() => {
    if (
      (selected.current[0] !== colorSelection.id && editor.owner?.endsWith(`:${selected.current[0]}`)) ||
      (selected.current[1] !== alphaSelection.id && editor.owner?.endsWith(`:${selected.current[1]}`))
    )
      editor.cancel('target-change')
    selected.current = [colorSelection.id, alphaSelection.id]
  }, [colorSelection.id, alphaSelection.id, editor.owner, editor.cancel])
  const active = current.alpha.find((stop) => stop.id === alphaSelection.id)
  const addedAlpha = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (addedAlpha.current && current.alpha.some((stop) => stop.id === addedAlpha.current)) {
      alphaSelection.select(addedAlpha.current)
      addedAlpha.current = null
    } else if (editor.phase === 'idle' || editor.error) addedAlpha.current = null
  }, [current.alpha, editor.phase, editor.error, alphaSelection.select])
  const owner = useRef('')
  const locked = disabled || readOnly || editor.phase === 'pending'
  const update = (id: string, change: Partial<{ position: number; alpha: number }>) => {
    const requested = editor.getRequested()
    return { ...requested, alpha: requested.alpha.map((stop) => (stop.id === id ? { ...stop, ...change } : stop)) }
  }
  const structure = (alpha: ColorRampChannelsValue['alpha']) => {
    if (!editor.begin('step', 'alpha-structure')) {
      addedAlpha.current = null
      return
    }
    editor.request({ ...editor.getRequested(), alpha }, 'alpha-structure')
    void editor.commit(editor.getRequested(), 'step', 'alpha-structure').catch(() => {})
  }
  const remove = (id: string) => {
    if (!locked) structure(current.alpha.filter((stop) => stop.id !== id))
  }
  const inputReset = useMemo(
    () => ({ resetKey, activeId: active?.id, resetToken: editor.resetToken }),
    [resetKey, active?.id, editor.resetToken]
  )
  const errorId = useId(),
    externalError = props['aria-errormessage'],
    error = externalError || (editor.error ? errorId : undefined)
  return (
    <div
      {...props}
      ref={ref}
      role={props.role ?? 'group'}
      aria-label={props['aria-label'] ?? 'Color and alpha ramp'}
      aria-busy={editor.phase === 'pending' || undefined}
      data-color-phase={editor.phase}
      className={cx(rampStyles.root, className)}
      onKeyDown={(event) => {
        props.onKeyDown?.(event)
        if (!event.defaultPrevented && event.key === 'Escape' && editor.phase !== 'idle') {
          event.preventDefault()
          event.stopPropagation()
          editor.cancel('escape')
        }
      }}>
      <div aria-label="Combined ramp preview" className={rampStyles.checker} style={{ height: 24, borderRadius: 4 }}>
        <div style={{ height: '100%', backgroundImage: getColorRampChannelsCss(current) }} />
      </div>
      <ColorRampControls
        value={current.color}
        editor={editor}
        getRamp={(next) => next.color}
        replaceRamp={(next, color) => ({ ...next, color })}
        activeId={colorSelection.id}
        onSelect={colorSelection.select}
        disabled={disabled}
        readOnly={readOnly}
        hdr={hdr}
        capabilities={capabilities}
        resetKey={resetKey}
        errorId={error}
      />
      <hr className={css({ width: '100%', border: 0, borderTop: '1px solid var(--colors-border)', margin: '4px 0' })} />
      <RampTrack
        label="Alpha stop"
        stops={current.alpha.map((stop) => ({ ...stop, swatch: `rgba(0,0,0,${stop.alpha})` }))}
        background={getColorRampChannelsCss({
          color: {
            interpolation: current.color.interpolation,
            stops: [{ id: 'preview', position: 0, color: { space: 'srgb', r: 0, g: 0, b: 0, a: 1 } }],
          },
          alpha: current.alpha,
        })}
        activeId={alphaSelection.id}
        onSelect={alphaSelection.select}
        disabled={disabled}
        readOnly={readOnly}
        pending={editor.phase === 'pending'}
        resetKey={resetKey}
        editing={editor.phase === 'editing'}
        onBegin={(id) => {
          owner.current = `alpha-position:${id}`
          return editor.begin('slider', owner.current)
        }}
        onMove={(id, position) => editor.request(update(id, { position }), owner.current)}
        onCommit={(reason) => {
          void editor.commit(editor.getRequested(), reason, owner.current).catch(() => {})
        }}
        onCancel={editor.cancel}
        onRemove={remove}
      />
      <div className={rampStyles.row}>
        <select
          aria-label="Selected alpha stop"
          className={rampStyles.control}
          value={active?.id ?? ''}
          disabled={disabled || editor.phase === 'pending' || !current.alpha.length}
          onChange={(event) => alphaSelection.select(event.target.value || null)}>
          {!active && <option value="">No stop selected</option>}
          {current.alpha.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.id} ({Math.round(stop.position * 100)}%)
            </option>
          ))}
        </select>
        <button
          type="button"
          className={rampStyles.control}
          disabled={locked}
          onClick={() => {
            const position = active?.position ?? 0.5
            const id = nextStopId(
              'alpha',
              current.alpha.map((stop) => stop.id)
            )
            addedAlpha.current = id
            structure([
              ...current.alpha,
              { id, position, alpha: sampleAlphaStops(current.alpha, position, current.color.interpolation) },
            ])
          }}>
          Add alpha stop
        </button>
        <button
          type="button"
          className={rampStyles.control}
          disabled={locked || !active}
          onClick={() => active && remove(active.id)}>
          Delete alpha stop
        </button>
      </div>
      {active && (
        <div className={rampStyles.row}>
          {(['position', 'alpha'] as const).map((field) => (
            <label key={field} className={css({ flex: '1 1 120px', minWidth: 0 })}>
              <span>{field === 'position' ? 'Alpha position' : 'Opacity'}</span>
              <InputNumber
                aria-label={field === 'position' ? 'Alpha stop position' : 'Alpha stop opacity'}
                value={active[field]}
                min={0}
                max={1}
                step={0.01}
                dragStep={0.005}
                precision={6}
                disabled={disabled}
                readOnly={readOnly || (editor.owner !== null && editor.owner !== `alpha-${field}:${active.id}`)}
                resetKey={inputReset}
                aria-errormessage={error}
                onEditStart={(source) => editor.begin(source, `alpha-${field}:${active.id}`)}
                onValueChange={(next) =>
                  editor.request(update(active.id, { [field]: next }), `alpha-${field}:${active.id}`)
                }
                onValueCommit={(next, reason) =>
                  editor.commit(update(active.id, { [field]: next }), reason, `alpha-${field}:${active.id}`)
                }
                onEditCancel={editor.cancel}
              />
            </label>
          ))}
        </div>
      )}
      {editor.error && !externalError && (
        <p id={errorId} role="alert">
          {editor.error}
        </p>
      )}
    </div>
  )
})
