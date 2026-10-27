import { useEffect, useId, useLayoutEffect, useRef, useState, type HTMLAttributes } from 'react'
import { css, cx } from '../../../styled-system/css'
import type { CurvePreset, CurvePresetService, CurvePresetSummary } from '../../contracts/curve'
import { areCurvesEqual, assertCurveValue, copyCurveValue, type CurveValue } from '../../values/curve'
import { Button } from '../../controls/buttons/Button'
import { Select } from '../../controls/choices/Select'
import { Input } from '../../controls/inputs/Input'

/** 可直接使用的曲线预设。通过 presets 属性传入自己的预设列表；需要保存个人预设时再提供 presetService。 */
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
const presetRows = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-1_5)',
  minWidth: 0,
})
export interface CurvePresetsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** 当前曲线，保存个人预设时使用。 */
  value: CurveValue
  /** 内置预设列表，默认 `defaultCurvePresets`。 */
  presets?: readonly CurvePreset[]
  /** 提供后列出个人预设；保存、删除按服务是否实现对应方法启用。 */
  presetService?: CurvePresetService
  /** 应用预设时调用，应用用它替换曲线。 */
  onApplyPreset?: (value: CurveValue) => void | Promise<void>
  /** 禁用。 */
  disabled?: boolean
  /** 只读：不能应用、保存或删除。 */
  readOnly?: boolean
  /** 切换编辑对象时改变，丢弃进行中的操作。 */
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
  const [error, setError] = useState<{ message: string; application: boolean } | null>(null)
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
  function finish(
    token: NonNullable<ReturnType<typeof start>>,
    message?: string,
    cause?: unknown,
    application = false
  ) {
    if (!current(token)) return
    active.current = null
    loadValue.current = null
    setPhase(null)
    if (cause !== undefined) setError({ message: cause instanceof Error ? cause.message : String(cause), application })
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
    let application = false
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
      application = true
      await latest.current.onApplyPreset?.(copyCurveValue(loaded))
      finish(token, 'Preset requested.')
    } catch (cause) {
      finish(token, undefined, cause, application)
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
      className={cx(
        css({
          display: 'grid',
          gap: 'var(--space-2)',
          minWidth: 0,
          fontSize: 'var(--fontSizes-control)',
        }),
        className
      )}
      aria-busy={phase !== null || undefined}>
      <label htmlFor={listId}>Presets</label>
      <div className={presetRows}>
        <Select
          id={listId}
          aria-label="Curve preset"
          size="sm"
          value={selected ? selection : null}
          placeholder="No preset selected"
          options={[
            ...presets.map((preset) => ({
              key: `local:${preset.id}`,
              value: `local:${preset.id}`,
              label: preset.label,
            })),
            ...remote.map((preset) => ({
              key: `remote:${preset.id}`,
              value: `remote:${preset.id}`,
              label: preset.label,
            })),
          ]}
          disabled={disabled || phase !== null || (!presets.length && !remote.length)}
          css={{ flex: '1 1 150px' }}
          onValueChange={(next) => {
            if (!next) return
            setSelection(next)
            setError(null)
            setStatus(null)
          }}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={locked || !selected || !onApplyPreset}
          onClick={() => {
            void apply()
          }}>
          Apply preset
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || phase !== null || !presetService}
          onClick={() => {
            void refresh()
          }}>
          Refresh presets
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={locked || !selectedRemote || !presetService?.remove}
          onClick={() => {
            void remove()
          }}>
          Delete preset
        </Button>
      </div>
      <label htmlFor={nameId}>Preset name</label>
      <div className={presetRows}>
        <Input
          id={nameId}
          aria-label="Preset name"
          size="sm"
          value={name}
          disabled={disabled || phase !== null || !presetService?.save}
          readOnly={readOnly}
          css={{ flex: '1 1 150px' }}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={locked || !name.trim() || !presetService?.save}
          onClick={() => {
            void save()
          }}>
          Save current curve
        </Button>
      </div>
      {!presetService && (
        <p className={css({ margin: 0, color: 'var(--colors-textMuted)' })}>
          Choose a preset and select Apply to use it. Saving personal presets requires storage supplied by the
          application.
        </p>
      )}
      {presetService && (!presetService.save || !presetService.remove) && (
        <p className={css({ margin: 0, color: 'var(--colors-textMuted)' })}>
          Choose a preset and select Apply to use it. The application needs to enable {!presetService.save && 'saving'}
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
      {error && !(error.application && props['aria-errormessage']) && (
        <span role="alert" className={css({ color: 'var(--colors-dangerText)', overflowWrap: 'anywhere' })}>
          {error.message}
        </span>
      )}
    </div>
  )
}
