import { forwardRef, useId, useMemo } from 'react'
import { css, cx } from '../../../styled-system/css'
import { useColorEdit } from '../../interaction/color/useColorEdit'
import { areColorsEqual, assertColorValue, type ColorValue } from '../../values/color'
import { NumberInput } from '../../controls/inputs/NumberInput'
import { ColorField, type ColorFieldProps } from './ColorField'

export interface HDRColorFieldProps extends Omit<ColorFieldProps, 'hdr'> {
  /** 强度输入的下限，默认 0；强度是 RGB 的峰值倍率，使用曝光档位时由应用换算。 */
  intensityMin?: number
  /** 强度输入的上限，默认不限。 */
  intensityMax?: number
  /** 强度的步长，默认 0.1。 */
  intensityStep?: number
}

/** 将颜色选择与 HDR 强度输入组合成一个字段。强度根据 RGB 计算，编辑回调返回完整 ColorValue。 */
export const HDRColorField = forwardRef<HTMLDivElement, HDRColorFieldProps>(function HDRColorField(
  {
    value,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    disabled,
    readOnly,
    capabilities,
    displaySpace,
    defaultDisplaySpace,
    onDisplaySpaceChange,
    intensityMin = 0,
    intensityMax,
    intensityStep = 0.1,
    label = 'HDR color',
    css: cssProp,
    className,
    ...props
  },
  ref
) {
  assertColorValue(value, { hdr: true })
  const edit = useColorEdit({
    value,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    disabled,
    readOnly,
    equals: areColorsEqual,
  })
  const childResetKey = useMemo(() => ({ resetKey, token: edit.resetToken }), [resetKey, edit.resetToken])
  const errorId = useId()
  const externalError = props['aria-errormessage']
  const errorMessage = externalError ?? (edit.error ? errorId : undefined)
  const locked = (owner: string) => readOnly || (edit.owner !== null && edit.owner !== owner)
  const intensity = Math.max(value.r, value.g, value.b)
  function scale(peak: number): ColorValue {
    const current = edit.getRequested(),
      previous = Math.max(current.r, current.g, current.b)
    return {
      ...current,
      r: previous === 0 ? peak : (current.r / previous) * peak,
      g: previous === 0 ? peak : (current.g / previous) * peak,
      b: previous === 0 ? peak : (current.b / previous) * peak,
    }
  }
  return (
    <div
      {...props}
      ref={ref}
      role={props.role ?? 'group'}
      aria-label={props['aria-label'] ?? label}
      className={cx(
        css({ minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }, cssProp),
        className
      )}>
      <ColorField
        value={value}
        label={label}
        hdr
        capabilities={capabilities}
        displaySpace={displaySpace}
        defaultDisplaySpace={defaultDisplaySpace}
        onDisplaySpaceChange={onDisplaySpaceChange}
        resetKey={childResetKey}
        disabled={disabled}
        readOnly={locked('color')}
        aria-errormessage={errorMessage}
        onEditStart={(source) => edit.begin(source, 'color')}
        onValueChange={(next) => edit.request(next, 'color')}
        onValueCommit={(next, reason) => edit.commit(next, reason, 'color')}
        onEditCancel={edit.cancel}
      />
      <NumberInput
        aria-label={`${label} peak RGB`}
        startSlot="Peak RGB"
        value={intensity}
        min={Math.max(0, intensityMin)}
        max={intensityMax}
        softMax={intensityMax ?? Math.max(8, intensityMin)}
        step={intensityStep}
        dragStep={intensityStep / 10}
        precision={5}
        displayPrecision={3}
        resetKey={childResetKey}
        disabled={disabled}
        readOnly={locked('intensity')}
        aria-errormessage={errorMessage}
        onEditStart={(source) => edit.begin(source, 'intensity')}
        onValueChange={(next) => edit.request(scale(next), 'intensity')}
        onValueCommit={(next, reason) => edit.commit(scale(next), reason, 'intensity')}
        onEditCancel={edit.cancel}
      />
      {edit.error && !externalError && (
        <div
          id={errorId}
          role="alert"
          className={css({
            color: 'var(--colors-dangerText)',
            fontSize: 'var(--fontSizes-control)',
            overflowWrap: 'anywhere',
          })}>
          {edit.error}
        </div>
      )}
    </div>
  )
})
