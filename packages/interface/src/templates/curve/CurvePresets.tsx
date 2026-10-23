import { useEffect, useId, useLayoutEffect, useRef, useState, type HTMLAttributes } from 'react'
import { css, cx } from '../../../styled-system/css'
import type { CurvePreset, CurvePresetService, CurvePresetSummary } from '../../contracts/curve'
import { areCurvesEqual, assertCurveValue, copyCurveValue, type CurveValue } from '../../values/curve'

/** Explicit input replaces this built-in collection; none of these entries require storage. */
export const defaultCurvePresets: readonly CurvePreset[] = Object.freeze(
  (
    [
      {
        id: 'linear',
        label: 'Linear',
        value: {
          interpolation: 'linear',
          points: [
            { id: 'start', x: 0, y: 0 },
            { id: 'end', x: 1, y: 1 },
          ],
        },
      },
      {
        id: 'ease',
        label: 'Ease',
        value: {
          interpolation: 'bezier',
          points: [
            { id: 'start', x: 0, y: 0, outHandle: { x: 0.2, y: 0.8 } },
            { id: 'end', x: 1, y: 1, inHandle: { x: 0.8, y: 0.2 } },
          ],
        },
      },
      {
        id: 'arch',
        label: 'Arch',
        value: {
          interpolation: 'bezier',
          points: [
            { id: 'start', x: 0, y: 0, outHandle: { x: 0.25, y: 0.75 } },
            { id: 'end', x: 1, y: 0, inHandle: { x: 0.75, y: 0.75 } },
          ],
        },
      },
      {
        id: 'ease-in',
        label: 'Ease in',
        value: {
          interpolation: 'bezier',
          points: [
            { id: 'start', x: 0, y: 0, outHandle: { x: 0.7, y: 0 } },
            { id: 'end', x: 1, y: 1, inHandle: { x: 1, y: 0.5 } },
          ],
        },
      },
      {
        id: 'smooth',
        label: 'Smooth step',
        value: {
          interpolation: 'bezier',
          points: [
            { id: 'start', x: 0, y: 0, outHandle: { x: 0.42, y: 0 } },
            { id: 'end', x: 1, y: 1, inHandle: { x: 0.58, y: 1 } },
          ],
        },
      },
    ] satisfies CurvePreset[]
  ).map((preset) => Object.freeze({ ...preset, value: copyCurveValue(preset.value) }))
)

function summary(value: CurvePresetSummary): CurvePresetSummary {
  if (
    !value ||
    typeof value.id !== 'string' ||
    !value.id.trim() ||
    typeof value.label !== 'string' ||
    !value.label.trim()
  )
    throw new TypeError('Preset IDs and names must be nonempty strings.')
  return Object.freeze({ id: value.id, label: value.label })
}
function summaries(values: readonly CurvePresetSummary[]): readonly CurvePresetSummary[] {
  if (!Array.isArray(values)) throw new TypeError('The preset service must return a list.')
  const ids = new Set<string>()
  return values.map((value) => {
    const result = summary(value)
    if (ids.has(result.id)) throw new TypeError('Preset IDs must be unique within a collection.')
    ids.add(result.id)
    return result
  })
}
const controlClass = css({
  minWidth: 0,
  maxWidth: '100%',
  minHeight: '28px',
  padding: '4px 8px',
  border: '1px solid var(--colors-borderStrong)',
  borderRadius: '4px',
  background: 'var(--colors-surfaceSubtle)',
  color: 'var(--colors-text)',
  font: 'inherit',
  '&:disabled': { opacity: 0.5 },
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
})
export interface CurvePresetsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  value: CurveValue
  presets?: readonly CurvePreset[]
  presetService?: CurvePresetService
  onApplyPreset?: (value: CurveValue) => void | Promise<void>
  disabled?: boolean
  readOnly?: boolean
  resetKey?: unknown
}
type Operation = 'listing' | 'loading' | 'applying' | 'saving' | 'removing'
export function CurvePresets({
  value,
  presets = defaultCurvePresets,
  presetService,
  onApplyPreset,
  disabled = false,
  readOnly = false,
  resetKey,
  className,
  ...props
}: CurvePresetsProps) {
  assertCurveValue(value)
  summaries(presets)
  for (const preset of presets) assertCurveValue(preset.value)
  const [remote, setRemote] = useState<readonly CurvePresetSummary[]>([])
  const [selection, setSelection] = useState(presets[0] ? `local:${presets[0].id}` : '')
  const [name, setName] = useState('')
  const [phase, setPhase] = useState<Operation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const mounted = useRef(true),
    epoch = useRef(0),
    operation = useRef(0),
    active = useRef<Operation | null>(null)
  const loadValue = useRef<CurveValue | null>(null)
  const latest = useRef({ value, presets, presetService, disabled, readOnly, resetKey, onApplyPreset })
  latest.current = { value, presets, presetService, disabled, readOnly, resetKey, onApplyPreset }
  const listId = useId(),
    nameId = useId()
  const selectedLocal = selection.startsWith('local:')
    ? presets.find((preset) => `local:${preset.id}` === selection)
    : undefined
  const selectedRemote = selection.startsWith('remote:')
    ? remote.find((preset) => `remote:${preset.id}` === selection)
    : undefined
  const selected = selectedLocal ?? selectedRemote
  const locked = disabled || readOnly || phase !== null

  function start(next: Operation) {
    if (
      !mounted.current ||
      active.current ||
      latest.current.disabled ||
      (next !== 'listing' && latest.current.readOnly)
    )
      return null
    active.current = next
    setPhase(next)
    setError(null)
    setStatus(null)
    return { epoch: epoch.current, operation: ++operation.current, service: latest.current.presetService }
  }
  function current(token: NonNullable<ReturnType<typeof start>>) {
    return (
      mounted.current &&
      token.epoch === epoch.current &&
      token.operation === operation.current &&
      token.service === latest.current.presetService
    )
  }
  function finish(token: NonNullable<ReturnType<typeof start>>, message?: string, cause?: unknown) {
    if (!current(token)) return
    active.current = null
    loadValue.current = null
    setPhase(null)
    if (cause !== undefined) setError(cause instanceof Error ? cause.message : String(cause))
    else if (message) setStatus(message)
  }
  async function refresh() {
    const service = latest.current.presetService
    if (!service) return
    const token = start('listing')
    if (!token) return
    try {
      const items = summaries(await service.list())
      if (!current(token)) return
      setRemote(items)
      finish(token)
    } catch (cause) {
      finish(token, undefined, cause)
    }
  }
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      epoch.current++
      operation.current++
      active.current = null
    }
  }, [])
  useLayoutEffect(() => {
    epoch.current++
    operation.current++
    active.current = null
    setPhase(null)
    setError(null)
    setStatus(null)
  }, [presetService, resetKey, disabled])
  useLayoutEffect(() => {
    if (readOnly && active.current && active.current !== 'listing') {
      epoch.current++
      operation.current++
      active.current = null
      loadValue.current = null
      setPhase(null)
      setError(null)
      setStatus(null)
    }
  }, [readOnly])
  useLayoutEffect(() => {
    if (active.current === 'loading' && loadValue.current && !areCurvesEqual(loadValue.current, value)) {
      operation.current++
      active.current = null
      loadValue.current = null
      setPhase(null)
      setStatus('Preset loading was superseded by a curve change.')
    }
  }, [value])
  useEffect(() => {
    setRemote([])
    setSelection(presets[0] ? `local:${presets[0].id}` : '')
    setName('')
    if (!disabled) void refresh()
  }, [presetService, resetKey, disabled])
  useEffect(() => {
    if (selection && !selected)
      setSelection(presets[0] ? `local:${presets[0].id}` : remote[0] ? `remote:${remote[0].id}` : '')
  }, [selection, selected, presets, remote])

  async function apply() {
    if (!selected || !latest.current.onApplyPreset) return
    const token = start(selectedLocal ? 'applying' : 'loading')
    if (!token) return
    const initial = copyCurveValue(latest.current.value)
    loadValue.current = initial
    try {
      const loaded = selectedLocal ? copyCurveValue(selectedLocal.value) : await token.service!.load(selected.id)
      assertCurveValue(loaded)
      if (!current(token)) return
      if (!areCurvesEqual(initial, latest.current.value)) {
        finish(token, 'Preset loading was superseded by a curve change.')
        return
      }
      active.current = 'applying'
      setPhase('applying')
      await latest.current.onApplyPreset?.(copyCurveValue(loaded))
      finish(token, 'Preset requested.')
    } catch (cause) {
      finish(token, undefined, cause)
    }
  }
  async function save() {
    const service = latest.current.presetService
    if (!service?.save || !name.trim()) return
    const token = start('saving')
    if (!token) return
    const input = { label: name.trim(), value: copyCurveValue(latest.current.value) }
    try {
      const saved = summary(await service.save(input))
      if (!current(token)) return
      setRemote((items) => [...items.filter((item) => item.id !== saved.id), saved])
      setSelection(`remote:${saved.id}`)
      finish(token, 'Preset saved.')
    } catch (cause) {
      finish(token, undefined, cause)
    }
  }
  async function remove() {
    const service = latest.current.presetService
    if (!service?.remove || !selectedRemote) return
    const token = start('removing')
    if (!token) return
    try {
      await service.remove(selectedRemote.id)
      if (!current(token)) return
      setRemote((items) => items.filter((item) => item.id !== selectedRemote.id))
      finish(token, 'Preset removed.')
    } catch (cause) {
      finish(token, undefined, cause)
    }
  }
  return (
    <div
      {...props}
      className={cx(css({ display: 'grid', gap: '8px', minWidth: 0, fontSize: '12px' }), className)}
      aria-busy={phase !== null || undefined}>
      <label htmlFor={listId}>Presets</label>
      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '6px', minWidth: 0 })}>
        <select
          id={listId}
          aria-label="Curve preset"
          className={controlClass}
          style={{ flex: '1 1 150px' }}
          value={selected ? selection : ''}
          disabled={disabled || phase !== null || (!presets.length && !remote.length)}
          onChange={(event) => {
            setSelection(event.currentTarget.value)
            setError(null)
            setStatus(null)
          }}>
          {!selected && <option value="">No preset selected</option>}
          {!!presets.length && (
            <optgroup label="Provided presets">
              {presets.map((preset) => (
                <option key={preset.id} value={`local:${preset.id}`}>
                  {preset.label}
                </option>
              ))}
            </optgroup>
          )}
          {!!remote.length && (
            <optgroup label="Stored presets">
              {remote.map((preset) => (
                <option key={preset.id} value={`remote:${preset.id}`}>
                  {preset.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <button
          type="button"
          className={controlClass}
          disabled={locked || !selected || !onApplyPreset}
          onClick={() => {
            void apply()
          }}>
          Apply preset
        </button>
        <button
          type="button"
          className={controlClass}
          disabled={disabled || phase !== null || !presetService}
          onClick={() => {
            void refresh()
          }}>
          Refresh presets
        </button>
        <button
          type="button"
          className={controlClass}
          disabled={locked || !selectedRemote || !presetService?.remove}
          onClick={() => {
            void remove()
          }}>
          Delete preset
        </button>
      </div>
      <label htmlFor={nameId}>Preset name</label>
      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '6px', minWidth: 0 })}>
        <input
          id={nameId}
          aria-label="Preset name"
          className={controlClass}
          style={{ flex: '1 1 150px' }}
          value={name}
          disabled={disabled || phase !== null || !presetService?.save}
          readOnly={readOnly}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <button
          type="button"
          className={controlClass}
          disabled={locked || !name.trim() || !presetService?.save}
          onClick={() => {
            void save()
          }}>
          Save current curve
        </button>
      </div>
      {!presetService && (
        <p className={css({ margin: 0, color: 'var(--colors-textMuted)' })}>
          Preset storage unavailable. Provided presets remain available.
        </p>
      )}
      {presetService && (!presetService.save || !presetService.remove) && (
        <p className={css({ margin: 0, color: 'var(--colors-textMuted)' })}>
          This service does not support {!presetService.save && 'saving'}
          {!presetService.save && !presetService.remove && ' or '}
          {!presetService.remove && 'deleting'} presets.
        </p>
      )}
      {phase && (
        <span role="status">
          {phase === 'listing'
            ? 'Loading presets…'
            : phase === 'loading'
              ? 'Loading curve…'
              : phase === 'saving'
                ? 'Saving preset…'
                : phase === 'removing'
                  ? 'Removing preset…'
                  : 'Applying preset…'}
        </span>
      )}
      {status && <span role="status">{status}</span>}
      {error && (
        <span role="alert" className={css({ color: 'var(--colors-dangerText)', overflowWrap: 'anywhere' })}>
          {error}
        </span>
      )}
    </div>
  )
}
