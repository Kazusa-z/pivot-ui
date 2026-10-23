import { forwardRef, useId, useMemo } from 'react'
import { css, cx } from '../../../styled-system/css'
import { useColorEdit } from '../../interaction/color/useColorEdit'
import { areColorsEqual, assertColorValue, type ColorValue } from '../../values/color'
import { InputNumber } from '../../widgets/inputs/InputNumber'
import { ColorInput, type ColorInputProps } from './ColorInput'

export interface HDRColorInputProps extends Omit<ColorInputProps, 'hdr'> {
  /** Peak RGB multiplier in the value's declared encoding, not exposure stops. */
  intensityMin?: number
  intensityMax?: number
  intensityStep?: number
}

/** Intensity is derived from RGB; it is never a second authoritative color value. */
export const HDRColorInput = forwardRef<HTMLDivElement, HDRColorInputProps>(function HDRColorInput(
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
      <ColorInput
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
      <InputNumber
        aria-label={`${label} peak RGB`}
        startSlot="Peak RGB"
        value={intensity}
        min={Math.max(0, intensityMin)}
        max={intensityMax}
        softMax={intensityMax ?? Math.max(8, intensityMin)}
        step={intensityStep}
        dragStep={intensityStep / 10}
        precision={5}
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
          className={css({ color: 'var(--colors-dangerText)', fontSize: '12px', overflowWrap: 'anywhere' })}>
          {edit.error}
        </div>
      )}
    </div>
  )
})
