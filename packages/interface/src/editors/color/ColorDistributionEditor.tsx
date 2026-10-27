import { useId, useLayoutEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import type { ColorCapabilities } from '../../contracts/color'
import type { ColorCancelReason, ColorCommitReason, ColorEditSource } from '../../interaction/color/types'
import { useColorEdit } from '../../interaction/color/useColorEdit'
import type { ColorValue } from '../../values/color'
import type { ColorAlphaRampValue } from '../../values/color-ramp'
import {
  areColorDistributionsEqual,
  assertColorDistributionValue,
  colorDistributionModes,
  copyColorDistributionCache,
  copyColorDistributionValue,
  rememberColorDistribution,
  switchColorDistributionMode,
  type ColorDistributionCache,
  type ColorDistributionMode,
  type ColorDistributionValue,
} from '../../values/color-distribution'
import { SegmentControl } from '../../controls/choices/SegmentControl'
import { Button } from '../../controls/buttons/Button'
import { ColorField } from './ColorField'
import { ColorAlphaRampEditor } from './ColorAlphaRampEditor'

export type ColorDistributionEditSource = ColorEditSource | 'mode'
export type ColorDistributionCommitReason = ColorCommitReason | 'mode'
export interface ColorDistributionEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** 当前值（受控），带 `mode` 的联合类型：固定颜色、两色之间随机、渐变，或两条渐变之间随机。 */
  value: ColorDistributionValue
  /** 编辑中的预览值。 */
  onValueChange?: (value: ColorDistributionValue) => void
  /** 开始编辑时调用；返回 `false` 拒绝这次编辑。 */
  onEditStart?: (source: ColorDistributionEditSource) => boolean | void
  /** 提交最终值；返回 Promise 时失败会恢复并显示错误。 */
  onValueCommit?: (value: ColorDistributionValue, reason: ColorDistributionCommitReason) => void | Promise<void>
  /** 编辑被取消，应用恢复编辑前的值。 */
  onEditCancel?: (reason: ColorCancelReason) => void
  /** 各模式上次的值（受控），切回某个模式时恢复它。 */
  cache?: ColorDistributionCache
  /** 非受控时各模式的初始缓存。 */
  defaultCache?: ColorDistributionCache
  /** 模式缓存变化时调用。 */
  onCacheChange?: (cache: ColorDistributionCache) => void
  /** 切换编辑对象时改变：取消正在进行的编辑并清空模式缓存。 */
  resetKey?: unknown
  /** 整组的无障碍名称，默认 `Color distribution`。 */
  label?: string
  /** 允许颜色超过 1（HDR），默认关闭。 */
  hdr?: boolean
  /** 禁用。 */
  disabled?: boolean
  /** 只读。 */
  readOnly?: boolean
  /** 应用提供的剪贴板和屏幕取色。 */
  capabilities?: ColorCapabilities
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}
const modeLabels: Record<ColorDistributionMode, string> = {
  constant: 'Constant',
  gradient: 'Gradient',
  'two-constant': 'Two colors',
  'two-gradient': 'Two gradients',
}
const options = colorDistributionModes.map((mode) => ({ key: mode, value: mode, label: modeLabels[mode] }))

/** 编辑固定颜色、颜色范围或渐变，适合颜色随时间或随机条件变化的参数。编辑回调返回当前模式的值，应用可通过缓存恢复其他模式的内容。 */
export function ColorDistributionEditor({
  value,
  onValueChange,
  onEditStart,
  onValueCommit,
  onEditCancel,
  cache: controlledCache,
  defaultCache,
  onCacheChange,
  resetKey,
  label = 'Color distribution',
  hdr = false,
  disabled = false,
  readOnly = false,
  capabilities,
  css: cssProp,
  className,
  ...props
}: ColorDistributionEditorProps) {
  assertColorDistributionValue(value, { hdr })
  const [localCache, setLocalCache] = useState(() => copyColorDistributionCache(defaultCache))
  const cache = controlledCache ?? localCache
  const previousResetKey = useRef(resetKey)
  const modeId = useId()
  const errorId = useId()
  const editor = useColorEdit<ColorDistributionValue, ColorDistributionEditSource, ColorDistributionCommitReason>({
    value,
    equals: areColorDistributionsEqual,
    resetKey,
    disabled,
    readOnly,
    onEditStart,
    onValueChange: (next) => onValueChange?.(copyColorDistributionValue(next)),
    onValueCommit: (next, reason) => onValueCommit?.(copyColorDistributionValue(next), reason),
    onEditCancel,
  })
  const childResetKey = useMemo(
    () => ({ resetKey, mode: value.mode, invalidation: editor.resetToken }),
    [resetKey, value.mode, editor.resetToken]
  )
  function updateCache(next: ColorDistributionCache) {
    if (controlledCache === undefined) setLocalCache(next)
    onCacheChange?.(next)
  }
  useLayoutEffect(() => {
    if (!Object.is(previousResetKey.current, resetKey)) {
      previousResetKey.current = resetKey
      updateCache(Object.freeze({}))
    }
  }, [resetKey])
  function colorAt(index: number, color: ColorValue): ColorDistributionValue {
    if (value.mode === 'constant') return { mode: value.mode, color }
    if (value.mode === 'two-constant')
      return { mode: value.mode, colors: index === 0 ? [color, value.colors[1]] : [value.colors[0], color] }
    return value
  }
  function rampAt(index: number, ramp: ColorAlphaRampValue): ColorDistributionValue {
    if (value.mode === 'gradient') return { mode: value.mode, ramp }
    if (value.mode === 'two-gradient')
      return { mode: value.mode, ramps: index === 0 ? [ramp, value.ramps[1]] : [value.ramps[0], ramp] }
    return value
  }
  function colorControl(color: ColorValue, index: number) {
    const owner = `color-${index}`
    return (
      <ColorField
        aria-errormessage={props['aria-errormessage']}
        value={color}
        hdr={hdr}
        disabled={disabled}
        readOnly={readOnly || (editor.owner !== null && editor.owner !== owner)}
        resetKey={childResetKey}
        capabilities={capabilities}
        label={`${label} ${index === 0 ? 'first' : 'second'} color`}
        onEditStart={(source) => editor.begin(source, owner)}
        onValueChange={(next) => {
          editor.request(colorAt(index, next), owner)
        }}
        onValueCommit={(next, reason) => editor.commit(colorAt(index, next), reason, owner)}
        onEditCancel={editor.cancel}
      />
    )
  }
  function rampControl(ramp: ColorAlphaRampValue, index: number) {
    const owner = `ramp-${index}`
    return (
      <ColorAlphaRampEditor
        aria-errormessage={props['aria-errormessage']}
        value={ramp}
        hdr={hdr}
        disabled={disabled}
        readOnly={readOnly || (editor.owner !== null && editor.owner !== owner)}
        resetKey={childResetKey}
        capabilities={capabilities}
        aria-label={`${label} ${index === 0 ? 'first' : 'second'} gradient`}
        onEditStart={(source) => editor.begin(source, owner)}
        onValueChange={(next) => {
          editor.request(rampAt(index, next), owner)
        }}
        onValueCommit={(next, reason) => editor.commit(rampAt(index, next), reason, owner)}
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
        <SegmentControl
          id={modeId}
          options={options}
          size="sm"
          value={value.mode}
          aria-invalid={(editor.owner === 'mode' && !!editor.error) || undefined}
          aria-errormessage={
            editor.owner === 'mode' && editor.error ? (props['aria-errormessage'] ?? errorId) : undefined
          }
          disabled={disabled || editor.phase === 'pending'}
          readOnly={readOnly || (editor.owner !== null && editor.owner !== 'mode')}
          onValueChange={(mode) => {
            if (mode === value.mode) return
            const saved = rememberColorDistribution(cache, value)
            const next = switchColorDistributionMode(value, mode, saved)
            assertColorDistributionValue(next, { hdr })
            if (!editor.begin('mode', 'mode')) return
            updateCache(saved)
            editor.request(next, 'mode')
            void editor.commit(next, 'mode', 'mode').catch(() => {})
          }}
        />
      </div>
      {value.mode === 'constant' && colorControl(value.color, 0)}
      {value.mode === 'gradient' && rampControl(value.ramp, 0)}
      {(value.mode === 'two-constant' || value.mode === 'two-gradient') &&
        [0, 1].map((index) => (
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
              ? colorControl(value.colors[index], index)
              : rampControl(value.ramps[index], index)}
          </fieldset>
        ))}
      {editor.error && editor.owner === 'mode' && (
        <div className={css({ display: 'grid', gap: 'var(--space-1_5)', minWidth: 0 })}>
          {!props['aria-errormessage'] && (
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
          )}
          <Button
            size="xs"
            disabled={disabled || readOnly}
            onClick={() => {
              void editor.commit(editor.getRequested(), 'mode', 'mode').catch(() => {})
            }}>
            Retry mode edit
          </Button>
          <Button size="xs" onClick={() => editor.cancel('escape')}>
            Cancel mode edit
          </Button>
        </div>
      )}
    </div>
  )
}
