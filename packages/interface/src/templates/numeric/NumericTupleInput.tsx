import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react'
import type { NumericConstraints } from '../../values'
import { assertNumericTuple } from '../../values/geometry'
import { applyProportionalChange, getProportionalAxisRange } from '../../values/proportion'
import type { NumericCancelReason, NumericCommitReason, NumericEditSource } from '../../interaction/numeric/types'
import { InputNumber } from '../../widgets/inputs/InputNumber'
import { ActionButton } from '../../widgets/buttons/ActionButton'
import { ConstrainIcon } from '../../foundation/icons/common/ConstrainIcon'
import { cx } from '../../../styled-system/css'
import { numericTemplateClasses as styles } from './numeric-template.styles'

export interface NumericAxisConfig extends NumericConstraints {
  readonly key: string
  readonly label: string
  readonly unit?: string
  readonly disabled?: boolean
  readonly readOnly?: boolean
}
export interface NumericTupleInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'>, NumericConstraints {
  axes: readonly NumericAxisConfig[]
  value?: readonly number[]
  defaultValue?: readonly number[]
  onValueChange?: (value: readonly number[], axis: number) => void
  onEditStart?: (source: NumericEditSource, axis: number) => boolean | void
  onValueCommit?: (value: readonly number[], reason: NumericCommitReason, axis: number) => void | Promise<void>
  onEditCancel?: (reason: NumericCancelReason, axis: number) => void
  /** Controlled by the caller. Omit onLinkedChange to hide the link action. */
  linked?: boolean
  onLinkedChange?: (linked: boolean) => void
  linkLabel?: string
  label?: string
  disabled?: boolean
  readOnly?: boolean
  resetKey?: unknown
  size?: 'xs' | 'sm' | 'md'
}
interface TupleEdit {
  axis: number
  start: readonly number[]
  preview: readonly number[]
  pending: boolean
}
const sameTuple = (first: readonly number[], second: readonly number[]) =>
  first.length === second.length && first.every((value, index) => Object.is(value, second[index]))

/** Geometry-free tuple editing; linked proportions use one immutable edit baseline. */
export const NumericTupleInput = forwardRef<HTMLDivElement, NumericTupleInputProps>(function NumericTupleInput(
  {
    axes,
    value: controlledValue,
    defaultValue,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    linked = false,
    onLinkedChange,
    linkLabel = 'Proportional scaling',
    label = 'Numeric values',
    disabled,
    readOnly,
    resetKey,
    size = 'sm',
    min,
    max,
    softMin,
    softMax,
    step,
    dragStep,
    precision,
    className,
    ...props
  },
  ref
) {
  const [internal, setInternal] = useState<readonly number[]>(() => [...(defaultValue ?? axes.map(() => 0))])
  const initialDefault = useRef(internal)
  const root = useRef<HTMLDivElement>(null)
  const value = controlledValue ?? internal
  assertNumericTuple(value, axes.length)
  if (new Set(axes.map((axis) => axis.key)).size !== axes.length || axes.some((axis) => !axis.key))
    throw new Error('Numeric axis keys must be nonempty and unique.')
  const configured = axes.map((axis) => ({ min, max, softMin, softMax, step, dragStep, precision, ...axis }))
  const configSignature = JSON.stringify(configured)
  const baseResetKey = useMemo(
    () => ({ resetKey, configSignature, linked, disabled, readOnly }),
    [resetKey, configSignature, linked, disabled, readOnly]
  )
  const previousReset = useRef(baseResetKey)
  const edit = useRef<TupleEdit | null>(null)
  const cancelRef = useRef(cancel)
  cancelRef.current = cancel
  const invalidationReason = useRef<NumericCancelReason | null>(null)
  const [activeAxis, setActiveAxis] = useState<number | null>(null)
  const [externalEpoch, setExternalEpoch] = useState(0)
  const childResetKey = useMemo(() => ({ baseResetKey, externalEpoch }), [baseResetKey, externalEpoch])
  const generatedId = useId()
  useEffect(() => {
    const element = root.current?.closest('form')
    if (!element || controlledValue !== undefined) return
    let connected = true
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (
          !connected ||
          event.defaultPrevented ||
          !root.current?.isConnected ||
          root.current.closest('form') !== element
        )
          return
        const current = edit.current
        if (current && !current.pending) cancelRef.current(current.axis, 'reset')
        edit.current = null
        invalidationReason.current = null
        setActiveAxis(null)
        setInternal(initialDefault.current)
        setExternalEpoch((epoch) => epoch + 1)
      })
    }
    element.addEventListener('reset', reset)
    return () => {
      connected = false
      element.removeEventListener('reset', reset)
    }
  }, [controlledValue, baseResetKey])
  // A change on another axis must invalidate the same tuple edit as an update on
  // the active input. Accepted previews and controlled rejection preserve it.
  useLayoutEffect(() => {
    const current = edit.current
    if (previousReset.current !== baseResetKey) {
      previousReset.current = baseResetKey
      if (current?.pending) {
        edit.current = null
        setActiveAxis(null)
      }
      return
    }
    if (current && !current.pending && !sameTuple(value, current.start) && !sameTuple(value, current.preview)) {
      invalidationReason.current = 'external-update'
      setExternalEpoch((epoch) => epoch + 1)
    }
  }, [value, baseResetKey])
  function begin(axis: number, source: NumericEditSource) {
    if (disabled || readOnly || edit.current) return false
    if (onEditStart?.(source, axis) === false) return false
    edit.current = { axis, start: [...value], preview: [...value], pending: false }
    setActiveAxis(axis)
    return true
  }
  function nextValue(axis: number, requested: number) {
    const initial = edit.current?.start ?? value
    return linked
      ? applyProportionalChange(initial, axis, requested, linkedConstraints(initial)).value
      : initial.map((component, index) => (index === axis ? requested : component))
  }
  function linkedConstraints(initial: readonly number[]) {
    return configured.map((axis, index) =>
      axis.disabled || axis.readOnly ? { ...axis, min: initial[index], max: initial[index] } : axis
    )
  }
  function change(axis: number, requested: number) {
    const current = edit.current
    if (!current || current.axis !== axis || current.pending) return
    const next = nextValue(axis, requested)
    current.preview = next
    if (controlledValue === undefined) setInternal(next)
    onValueChange?.(next, axis)
  }
  function cancel(axis: number, reason: NumericCancelReason) {
    const current = edit.current
    if (!current || current.axis !== axis || current.pending) return
    edit.current = null
    setActiveAxis(null)
    if (controlledValue === undefined && reason !== 'unmount') setInternal(current.start)
    const reportedReason = invalidationReason.current ?? reason
    invalidationReason.current = null
    onEditCancel?.(reportedReason, axis)
  }
  function commit(axis: number, requested: number, reason: NumericCommitReason): void | Promise<void> {
    const current = edit.current
    if (!current || current.axis !== axis || current.pending) return
    const next = nextValue(axis, requested)
    current.pending = true
    const finish = () => {
      if (edit.current === current) {
        edit.current = null
        setActiveAxis(null)
      }
    }
    try {
      const result = onValueCommit?.(next, reason, axis)
      if (result && typeof result.then === 'function')
        return result.then(finish, (error) => {
          if (edit.current === current) current.pending = false
          throw error
        })
      finish()
    } catch (error) {
      if (edit.current === current) current.pending = false
      throw error
    }
  }
  return (
    <div
      {...props}
      ref={(node) => {
        root.current = node
        if (typeof ref === 'function') return ref(node)
        if (ref) ref.current = node
      }}
      role="group"
      aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : label)}
      className={cx(styles.group, className)}
      onKeyDownCapture={(event) => {
        props.onKeyDownCapture?.(event)
        if (!event.defaultPrevented && event.key === 'Escape' && edit.current?.pending) {
          edit.current = null
          setActiveAxis(null)
        }
      }}>
      <div className={styles.axes}>
        {configured.map((axis, index) => {
          const axisId = `${generatedId}-${encodeURIComponent(axis.key)}`
          const proportional = linked
            ? getProportionalAxisRange(
                edit.current?.start ?? value,
                index,
                linkedConstraints(edit.current?.start ?? value)
              )
            : undefined
          const blocked = proportional === null
          const { key, label, unit, disabled: axisDisabled, readOnly: axisReadOnly, ...constraints } = axis
          return (
            <div key={key} className={styles.axis}>
              <label htmlFor={axisId} className={styles.label} title={label}>
                {label}
              </label>
              <InputNumber
                {...constraints}
                min={proportional?.min ?? axis.min}
                max={proportional?.max ?? axis.max}
                id={axisId}
                value={value[index]}
                size={size}
                endSlot={unit}
                disabled={disabled || axisDisabled}
                readOnly={readOnly || axisReadOnly || blocked || (activeAxis !== null && activeAxis !== index)}
                resetKey={childResetKey}
                title={blocked ? 'No proportional value satisfies all axis bounds' : undefined}
                onEditStart={(source) => begin(index, source)}
                onValueChange={(next) => change(index, next)}
                onValueCommit={(next, reason) => commit(index, next, reason)}
                onEditCancel={(reason) => cancel(index, reason)}
              />
            </div>
          )
        })}
      </div>
      {onLinkedChange && (
        <ActionButton
          type="button"
          aria-label={linkLabel}
          aria-pressed={linked}
          title={linkLabel}
          disabled={disabled || readOnly || activeAxis !== null}
          variant="subtle"
          onClick={() => onLinkedChange(!linked)}>
          <ConstrainIcon active={linked} />
        </ActionButton>
      )}
    </div>
  )
})
