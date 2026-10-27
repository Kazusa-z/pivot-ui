import { useId, useLayoutEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import type { CurvePreset, CurvePresetService } from '../../contracts/curve'
import type { CurveEditSource, CurveCommitReason, CurveCancelReason } from '../../interaction/curve/types'
import { useValueEdit } from '../../interaction/value/useValueEdit'
import type { CurveValue, CurveViewport } from '../../values/curve'
import { normalizeNumericValue, type NumericConstraints } from '../../values/numeric'
import {
  areNumericDistributionsEqual,
  assertNumericDistributionValue,
  numericDistributionModes,
  copyNumericDistributionCache,
  copyNumericDistributionValue,
  rememberNumericDistribution,
  switchNumericDistributionMode,
  type NumericDistributionCache,
  type NumericDistributionMode,
  type NumericDistributionValue,
} from '../../values/numeric-distribution'
import { Select } from '../../controls/choices/Select'
import { Button } from '../../controls/buttons/Button'
import { NumberInput } from '../../controls/inputs/NumberInput'
import { CurvePicker } from '../curve/CurvePicker'

export type NumericDistributionEditSource = CurveEditSource
export type NumericDistributionCommitReason = CurveCommitReason
export interface NumericDistributionEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>, NumericConstraints {
  /** 当前值（受控）：`constant` 固定值、`two-constant` 两值之间随机、`curve` 曲线、`two-curve` 两条曲线之间随机。 */
  value: NumericDistributionValue
  /** 编辑中的预览值。 */
  onValueChange?: (value: NumericDistributionValue) => void
  /** 开始编辑时调用；返回 `false` 拒绝这次编辑。 */
  onEditStart?: (source: NumericDistributionEditSource) => boolean | void
  /** 提交最终值；返回 Promise 时失败会恢复并显示错误。 */
  onValueCommit?: (value: NumericDistributionValue, reason: NumericDistributionCommitReason) => void | Promise<void>
  /** 编辑被取消，应用恢复编辑前的值。 */
  onEditCancel?: (reason: CurveCancelReason) => void
  /** 各模式上次的值（受控），切回某个模式时恢复它；需要随文档保存时使用。 */
  cache?: NumericDistributionCache
  /** 非受控时各模式的初始缓存。 */
  defaultCache?: NumericDistributionCache
  /** 模式缓存变化时调用。 */
  onCacheChange?: (cache: NumericDistributionCache) => void
  /** 切换编辑对象时改变：取消正在进行的编辑并清空模式缓存。 */
  resetKey?: unknown
  /** 整组的无障碍名称，默认 `Numeric distribution`。 */
  label?: string
  /** 数值单位，显示在输入框末尾。 */
  unit?: string
  /** 禁用。 */
  disabled?: boolean
  /** 只读：可以查看各模式的值和曲线，不能修改。 */
  readOnly?: boolean
  /** 曲线模式下点可以移动的范围；固定数值的范围用 `min` / `max`。 */
  curveBounds?: Partial<CurveViewport>
  /** 曲线编辑器的可见范围（受控）。 */
  curveViewport?: CurveViewport
  /** 平移或缩放曲线视图时调用；`index` 是第几条曲线。 */
  onCurveViewportChange?: (viewport: CurveViewport, index: 0 | 1) => void
  /** 曲线点横向的吸附步长。 */
  curveXStep?: number
  /** 曲线点纵向的吸附步长。 */
  curveYStep?: number
  /** 曲线点坐标保留的小数位数。 */
  curvePrecision?: number
  /** 曲线预设列表。 */
  curvePresets?: readonly CurvePreset[]
  /** 保存个人曲线预设的服务。 */
  curvePresetService?: CurvePresetService
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}
const modeLabels: Record<NumericDistributionMode, string> = {
  constant: 'Constant',
  curve: 'Curve',
  'two-constant': 'Two constants',
  'two-curve': 'Two curves',
}
const options = numericDistributionModes.map((mode) => ({ key: mode, value: mode, label: modeLabels[mode] }))

/** 编辑固定数值、随机范围或曲线，适合随时间或随机条件变化的参数。编辑回调返回当前模式的值，模式缓存可由应用单独保存。 */
export function NumericDistributionEditor({
  value,
  onValueChange,
  onEditStart,
  onValueCommit,
  onEditCancel,
  cache: controlledCache,
  defaultCache,
  onCacheChange,
  resetKey,
  label = 'Numeric distribution',
  unit,
  disabled = false,
  readOnly = false,
  min,
  max,
  softMin,
  softMax,
  step,
  dragStep,
  precision,
  curveBounds,
  curveViewport,
  onCurveViewportChange,
  curveXStep,
  curveYStep,
  curvePrecision,
  curvePresets,
  curvePresetService,
  css: cssProp,
  className,
  ...props
}: NumericDistributionEditorProps) {
  assertNumericDistributionValue(value)
  const [localCache, setLocalCache] = useState(() => copyNumericDistributionCache(defaultCache))
  const cache = controlledCache ?? localCache
  const previousResetKey = useRef(resetKey)
  const modeId = useId(),
    errorId = useId()
  const constraints = { min, max, softMin, softMax, step, dragStep, precision }
  const editor = useValueEdit<NumericDistributionValue, NumericDistributionEditSource, NumericDistributionCommitReason>(
    {
      value,
      equals: areNumericDistributionsEqual,
      resetKey,
      disabled,
      readOnly,
      onEditStart,
      onValueChange: (next) => onValueChange?.(copyNumericDistributionValue(next)),
      onValueCommit: (next, reason) => onValueCommit?.(copyNumericDistributionValue(next), reason),
      onEditCancel,
    }
  )
  const childResetKey = useMemo(
    () => ({ resetKey, mode: value.mode, invalidation: editor.resetToken }),
    [resetKey, value.mode, editor.resetToken]
  )
  function updateCache(next: NumericDistributionCache) {
    if (controlledCache === undefined) setLocalCache(next)
    onCacheChange?.(next)
  }
  useLayoutEffect(() => {
    if (!Object.is(previousResetKey.current, resetKey)) {
      previousResetKey.current = resetKey
      updateCache(Object.freeze({}))
    }
  }, [resetKey])
  function numberAt(index: 0 | 1, next: number): NumericDistributionValue {
    if (value.mode === 'constant') return { mode: value.mode, value: next }
    if (value.mode === 'two-constant')
      return { mode: value.mode, values: index === 0 ? [next, value.values[1]] : [value.values[0], next] }
    return value
  }
  function curveAt(index: 0 | 1, next: CurveValue): NumericDistributionValue {
    if (value.mode === 'curve') return { mode: value.mode, curve: next }
    if (value.mode === 'two-curve')
      return { mode: value.mode, curves: index === 0 ? [next, value.curves[1]] : [value.curves[0], next] }
    return value
  }
  function numberControl(number: number, index: 0 | 1) {
    const owner = `number-${index}`
    return (
      <NumberInput
        aria-errormessage={props['aria-errormessage']}
        {...constraints}
        value={number}
        disabled={disabled}
        readOnly={readOnly || (editor.owner !== null && editor.owner !== owner)}
        resetKey={childResetKey}
        aria-label={`${label} ${index === 0 ? 'first' : 'second'} value`}
        endSlot={unit ? <span title={unit}>{unit}</span> : undefined}
        onEditStart={(source) => editor.begin(source, owner)}
        onValueChange={(next) => {
          editor.request(numberAt(index, next), owner)
        }}
        onValueCommit={(next, reason) => editor.commit(numberAt(index, next), reason, owner)}
        onEditCancel={editor.cancel}
      />
    )
  }
  function curveControl(curve: CurveValue, index: 0 | 1) {
    const owner = `curve-${index}`
    return (
      <CurvePicker
        aria-errormessage={props['aria-errormessage']}
        value={curve}
        disabled={disabled}
        readOnly={readOnly || (editor.owner !== null && editor.owner !== owner)}
        resetKey={childResetKey}
        label={`${label} ${index === 0 ? 'first' : 'second'} curve`}
        bounds={curveBounds}
        viewport={curveViewport}
        onViewportChange={(next) => onCurveViewportChange?.(next, index)}
        xStep={curveXStep}
        yStep={curveYStep}
        precision={curvePrecision}
        presets={curvePresets}
        presetService={curvePresetService}
        onEditStart={(source) => editor.begin(source, owner)}
        onValueChange={(next) => {
          editor.request(curveAt(index, next), owner)
        }}
        onValueCommit={(next, reason) => editor.commit(curveAt(index, next), reason, owner)}
        onEditCancel={editor.cancel}
      />
    )
  }
  return (
    <div
      {...props}
      onKeyDown={(event) => {
        props.onKeyDown?.(event)
        if (!event.defaultPrevented && event.key === 'Escape' && editor.owner === 'mode') {
          event.preventDefault()
          event.stopPropagation()
          editor.cancel('escape')
        }
      }}
      role="group"
      aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : label)}
      aria-disabled={disabled || undefined}
      className={cx(css({ display: 'grid', gap: 'var(--space-2)', minWidth: 0, width: '100%' }, cssProp), className)}>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          alignItems: 'center',
          gap: 'var(--space-2)',
          minWidth: 0,
        })}>
        <label htmlFor={modeId} className={css({ fontSize: 'var(--fontSizes-control)' })}>
          Mode
        </label>
        <Select
          id={modeId}
          size="sm"
          options={options}
          value={value.mode}
          aria-invalid={(editor.owner === 'mode' && !!editor.error) || undefined}
          aria-errormessage={
            editor.owner === 'mode' && editor.error ? (props['aria-errormessage'] ?? errorId) : undefined
          }
          disabled={disabled || editor.phase === 'pending'}
          readOnly={readOnly || (editor.owner !== null && editor.owner !== 'mode')}
          onValueChange={(mode) => {
            if (!mode || mode === value.mode) return
            const saved = rememberNumericDistribution(cache, value)
            let next = switchNumericDistributionMode(value, mode, saved)
            // Only a mode-derived constant is normalized here. NumberInput already normalizes its own requests.
            if (next.mode === 'constant') next = { ...next, value: normalizeNumericValue(next.value, constraints) }
            if (next.mode === 'two-constant')
              next = {
                ...next,
                values: [
                  normalizeNumericValue(next.values[0], constraints),
                  normalizeNumericValue(next.values[1], constraints),
                ],
              }
            if (!editor.begin('mode', 'mode')) return
            updateCache(saved)
            editor.request(next, 'mode')
            void editor.commit(next, 'mode', 'mode').catch(() => {})
          }}
        />
      </div>
      {value.mode === 'constant' && numberControl(value.value, 0)}
      {value.mode === 'curve' && curveControl(value.curve, 0)}
      {(value.mode === 'two-constant' || value.mode === 'two-curve') &&
        ([0, 1] as const).map((index) => (
          <fieldset
            key={index}
            className={css({
              display: 'grid',
              gap: 'var(--space-1_5)',
              minWidth: 0,
              padding: 'var(--space-2)',
              margin: 0,
              border: '1px solid var(--colors-border)',
              borderRadius: 'var(--radii-controlMd)',
            })}>
            <legend className={css({ fontSize: 'var(--fontSizes-control)', paddingInline: 'var(--space-1)' })}>
              {index === 0 ? 'First' : 'Second'}
            </legend>
            {value.mode === 'two-constant'
              ? numberControl(value.values[index], index)
              : curveControl(value.curves[index], index)}
          </fieldset>
        ))}
      {editor.error && editor.owner === 'mode' && !props['aria-errormessage'] && (
        <div className={css({ display: 'grid', gap: 'var(--space-1_5)', minWidth: 0 })}>
          <span
            id={errorId}
            role="alert"
            className={css({
              color: 'var(--colors-dangerText)',
              fontSize: 'var(--fontSizes-control)',
              overflowWrap: 'anywhere',
            })}>
            {editor.error}
          </span>
          <Button size="xs" onClick={() => editor.cancel('escape')}>
            Cancel mode edit
          </Button>
        </div>
      )}
    </div>
  )
}
