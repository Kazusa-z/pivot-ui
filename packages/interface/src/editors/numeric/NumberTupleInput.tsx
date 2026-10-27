import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react'
import type { NumericConstraints } from '../../values'
import { assertNumericTuple } from '../../values/geometry'
import { applyProportionalChange, getProportionalAxisRange } from '../../values/proportion'
import type { NumericCancelReason, NumericCommitReason, NumericEditSource } from '../../interaction/numeric/types'
import { NumberInput } from '../../controls/inputs/NumberInput'
import { IconButton } from '../../controls/buttons/IconButton'
import { ConstrainIcon } from '../../foundation/icons/common/ConstrainIcon'
import { cx } from '../../../styled-system/css'
import { numericTemplateClasses as styles } from './numeric-template.styles'

export interface NumericAxisConfig extends NumericConstraints {
  /** 稳定 key，在 `axes` 中唯一。 */
  readonly key: string
  /** 输入框前显示的轴名，例如 `X`、`W`。 */
  readonly label: string
  /** 单位，显示在输入框末尾。 */
  readonly unit?: string
  /** 只禁用这一轴。 */
  readonly disabled?: boolean
  /** 只让这一轴只读。 */
  readonly readOnly?: boolean
}
/** Props shared by NumberTupleInput and the Vector/Rect inputs built on it. */
export interface NumberTupleSharedProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'>, NumericConstraints {
  /** 比例联动是否开启（受控）。 */
  linked?: boolean
  /** 提供后显示联动按钮；开启时编辑一项，其余项按编辑开始时的比例一起变化。 */
  onLinkedChange?: (linked: boolean) => void
  /** 联动按钮的无障碍名称，默认 `Proportional scaling`。 */
  linkLabel?: string
  /** 整组的无障碍名称。 */
  label?: string
  /** 禁用所有轴。 */
  disabled?: boolean
  /** 所有轴只读。 */
  readOnly?: boolean
  /** 切换编辑对象时改变，取消正在进行的编辑。 */
  resetKey?: unknown
  /** 输入框高度：`xs` 20、`sm` 24（默认）、`md` 32。 */
  size?: 'xs' | 'sm' | 'md'
}
export interface NumberTupleInputProps extends NumberTupleSharedProps {
  /** 每一项的轴名、单位和范围；轴上的范围覆盖整组的范围。 */
  axes: readonly NumericAxisConfig[]
  /** 当前值（受控），长度与 `axes` 相同。 */
  value?: readonly number[]
  /** 非受控时的初始值。 */
  defaultValue?: readonly number[]
  /** 编辑中的预览值；`axis` 是正在编辑的项。 */
  onValueChange?: (value: readonly number[], axis: number) => void
  /** 开始编辑时调用；返回 `false` 拒绝这次编辑。 */
  onEditStart?: (source: NumericEditSource, axis: number) => boolean | void
  /** 提交完整数组；返回 Promise 时失败会恢复并显示错误。 */
  onValueCommit?: (value: readonly number[], reason: NumericCommitReason, axis: number) => void | Promise<void>
  /** 编辑被取消，应用恢复编辑前的值。 */
  onEditCancel?: (reason: NumericCancelReason, axis: number) => void
}
interface TupleEdit {
  axis: number
  start: readonly number[]
  preview: readonly number[]
  pending: boolean
}
const sameTuple = (first: readonly number[], second: readonly number[]) =>
  first.length === second.length && first.every((value, index) => Object.is(value, second[index]))

/** 编辑多个命名的数值，适合尺寸、坐标或自定义参数组。回调返回完整数组，启用比例联动时按编辑开始时的比例调整各项。 */
export const NumberTupleInput = forwardRef<HTMLDivElement, NumberTupleInputProps>(function NumberTupleInput(
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
              <NumberInput
                {...constraints}
                min={proportional?.min ?? axis.min}
                max={proportional?.max ?? axis.max}
                id={axisId}
                aria-errormessage={activeAxis === index ? props['aria-errormessage'] : undefined}
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
        <IconButton
          type="button"
          size={size === 'md' ? 'md' : 'sm'}
          aria-label={linkLabel}
          aria-pressed={linked}
          title={linkLabel}
          disabled={disabled || readOnly || activeAxis !== null}
          variant="subtle"
          onClick={() => onLinkedChange(!linked)}>
          <ConstrainIcon active={linked} />
        </IconButton>
      )}
    </div>
  )
})
