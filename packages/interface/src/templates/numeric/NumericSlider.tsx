import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { InputNumber, type InputNumberProps } from '../../widgets/inputs/InputNumber'
import { Slider } from '../../widgets/sliders/Slider'
import type { NumericCancelReason, NumericCommitReason, NumericEditSource } from '../../interaction/numeric/types'
import { normalizeNumericConstraints } from '../../values/numeric'
import { numericTemplateClasses as styles } from './numeric-template.styles'

export interface NumericSliderProps extends InputNumberProps {
  size?: 'xs' | 'sm' | 'md'
  /** Labels the composite and supplies the secondary slider's accessible name. */
  label?: string
  unit?: string
  tooltip?: boolean
}
type Owner = 'input' | 'slider'
interface ScalarEdit {
  owner: Owner
  start: number
  pending: boolean
  changed: boolean
}

/** 组合数值输入与滑块，适合同时需要精确输入和快速调整的参数。两种操作都通过相同的数值编辑回调返回结果。 */
export const NumericSlider = forwardRef<HTMLInputElement, NumericSliderProps>(function NumericSlider(
  {
    value: controlledValue,
    defaultValue,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    disabled,
    readOnly,
    min,
    max,
    softMin,
    softMax,
    step,
    dragStep,
    precision,
    label = 'Value',
    unit,
    tooltip = true,
    mixed,
    endSlot,
    ...inputProps
  },
  ref
) {
  const [internal, setInternal] = useState(defaultValue ?? min ?? 0)
  const initialDefault = useRef(defaultValue ?? min ?? 0)
  const input = useRef<HTMLInputElement>(null)
  const [localResetEpoch, setLocalResetEpoch] = useState(0)
  const childResetKey = useMemo(() => ({ resetKey, localResetEpoch }), [resetKey, localResetEpoch])
  const value = controlledValue ?? internal
  if (!Number.isFinite(value)) throw new RangeError('NumericSlider requires a finite value.')
  const edit = useRef<ScalarEdit | null>(null)
  const cancelRef = useRef(cancel)
  cancelRef.current = cancel
  const [owner, setOwner] = useState<Owner | null>(null)
  const sliderSuffixId = useId()
  const rules = normalizeNumericConstraints({ min, max, softMin, softMax, step, dragStep, precision })
  const configuration = JSON.stringify([rules, disabled, readOnly])
  const previousReset = useRef({ resetKey, configuration })
  // The track has finite visual limits. Text entry still uses the hard bounds.
  const trackMin = Number.isFinite(rules.softMin)
    ? rules.softMin
    : Number.isFinite(rules.softMax)
      ? Math.min(0, rules.softMax - 100)
      : 0
  const trackMax = Number.isFinite(rules.softMax) ? rules.softMax : Math.max(100, trackMin + 100)
  useLayoutEffect(() => {
    if (!Object.is(previousReset.current.resetKey, resetKey) || previousReset.current.configuration !== configuration) {
      previousReset.current = { resetKey, configuration }
      if (edit.current?.pending) {
        edit.current = null
        setOwner(null)
        setLocalResetEpoch((epoch) => epoch + 1)
      }
    }
  }, [resetKey, configuration])
  useEffect(() => {
    const blur = () => {
      if (edit.current?.pending && edit.current.owner === 'slider') {
        edit.current = null
        setOwner(null)
      }
    }
    window.addEventListener('blur', blur)
    return () => window.removeEventListener('blur', blur)
  }, [])
  useEffect(() => {
    const element = input.current?.form
    if (!element || controlledValue !== undefined) return
    let connected = true
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!connected || event.defaultPrevented || !input.current?.isConnected || input.current.form !== element)
          return
        const current = edit.current
        if (current && !current.pending) cancelRef.current(current.owner, 'reset')
        edit.current = null
        setOwner(null)
        setInternal(initialDefault.current)
        setLocalResetEpoch((epoch) => epoch + 1)
      })
    }
    element.addEventListener('reset', reset)
    return () => {
      connected = false
      element.removeEventListener('reset', reset)
    }
  }, [inputProps.form, controlledValue, resetKey])
  function begin(nextOwner: Owner, source: NumericEditSource) {
    if (disabled || readOnly || edit.current) return false
    if (onEditStart?.(source) === false) return false
    edit.current = { owner: nextOwner, start: value, pending: false, changed: false }
    setOwner(nextOwner)
    return true
  }
  function change(nextOwner: Owner, next: number) {
    if (edit.current?.owner !== nextOwner || edit.current.pending) return
    edit.current.changed = true
    if (controlledValue === undefined) setInternal(next)
    onValueChange?.(next)
  }
  function cancel(nextOwner: Owner, reason: NumericCancelReason) {
    const current = edit.current
    if (!current || current.owner !== nextOwner || current.pending) return
    edit.current = null
    setOwner(null)
    if (controlledValue === undefined && reason !== 'unmount') setInternal(current.start)
    onEditCancel?.(reason)
  }
  function commit(nextOwner: Owner, next: number, reason: NumericCommitReason): void | Promise<void> {
    const current = edit.current
    if (!current || current.owner !== nextOwner || current.pending) return
    current.pending = true
    const finish = () => {
      if (edit.current === current) {
        edit.current = null
        setOwner(null)
      }
    }
    const reject = (error: unknown) => {
      if (edit.current === current) {
        if (current.owner === 'slider') finish()
        else current.pending = false
      }
      throw error
    }
    try {
      const result = onValueCommit?.(current.owner === 'slider' && !current.changed ? current.start : next, reason)
      if (result && typeof result.then === 'function') return result.then(finish, reject)
      finish()
    } catch (error) {
      reject(error)
    }
  }
  return (
    <div
      role="group"
      aria-label={label}
      className={styles.slider}
      onKeyDownCapture={(event) => {
        if (event.key === 'Escape' && edit.current?.pending) {
          edit.current = null
          setOwner(null)
          setLocalResetEpoch((epoch) => epoch + 1)
        }
      }}>
      <InputNumber
        {...inputProps}
        ref={(node) => {
          input.current = node
          if (typeof ref === 'function') return ref(node)
          if (ref) ref.current = node
        }}
        aria-label={inputProps['aria-label'] ?? (inputProps.id || inputProps['aria-labelledby'] ? undefined : label)}
        value={value}
        min={min}
        max={max}
        softMin={softMin}
        softMax={softMax}
        step={step}
        dragStep={dragStep}
        precision={precision}
        disabled={disabled}
        readOnly={readOnly || owner === 'slider'}
        resetKey={childResetKey}
        mixed={mixed}
        endSlot={
          <>
            {endSlot}
            {unit}
          </>
        }
        onEditStart={(source) => begin('input', source)}
        onValueChange={(next) => change('input', next)}
        onValueCommit={(next, reason) => commit('input', next, reason)}
        onEditCancel={(reason) => cancel('input', reason)}
      />
      <span id={sliderSuffixId} className={styles.hidden}>
        slider
      </span>
      <Slider
        value={[value]}
        min={trackMin}
        max={trackMax}
        step={rules.step}
        precision={rules.precision}
        size={inputProps.size}
        disabled={disabled}
        readOnly={readOnly || owner === 'input'}
        resetKey={childResetKey}
        tooltip={tooltip}
        aria-label={inputProps['aria-labelledby'] ? undefined : `${inputProps['aria-label'] ?? label} slider`}
        aria-labelledby={
          inputProps['aria-labelledby'] ? `${inputProps['aria-labelledby']} ${sliderSuffixId}` : undefined
        }
        aria-describedby={inputProps['aria-describedby']}
        aria-errormessage={inputProps['aria-errormessage']}
        formatValue={(current) => `${current}${unit ? ` ${unit}` : ''}`}
        onEditStart={(source) => begin('slider', source)}
        onValueChange={(next) => change('slider', next[0])}
        onValueCommit={(next, reason) => commit('slider', next[0], reason)}
        onEditCancel={(reason) => cancel('slider', reason)}
      />
    </div>
  )
})
