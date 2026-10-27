import { forwardRef, useId, useMemo, type HTMLAttributes } from 'react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { useColorEdit } from '../../interaction/color/useColorEdit'
import { areColorsEqual, assertColorValue } from '../../values/color'
import type { ColorControlProps } from './types'
import { HexColorField } from './HexColorField'
import { NumberInput } from '../../controls/inputs/NumberInput'
import { ColorPicker } from './ColorPicker'

export interface ColorFieldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'>, ColorControlProps {
  label?: string
  css?: SystemStyleObject
}

/** 紧凑颜色字段，包含取色浮层、HEX 和透明度输入。编辑回调返回完整颜色值，透明度使用 0–1。 */
export const ColorField = forwardRef<HTMLDivElement, ColorFieldProps>(function ColorField(
  {
    value,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    disabled,
    readOnly,
    label = 'Color',
    hdr,
    capabilities,
    displaySpace,
    defaultDisplaySpace,
    onDisplaySpaceChange,
    css: cssProp,
    className,
    ...props
  },
  ref
) {
  assertColorValue(value, { hdr })
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
  const id = useId()
  const externalError = props['aria-errormessage']
  const errorMessage = externalError ?? (edit.error ? id : undefined)
  const locked = (owner: string) => readOnly || (edit.owner !== null && edit.owner !== owner)
  const common = {
    value,
    hdr,
    resetKey: childResetKey,
    disabled,
    capabilities,
    displaySpace,
    defaultDisplaySpace,
    onDisplaySpaceChange,
  }
  return (
    <div
      {...props}
      ref={ref}
      role={props.role ?? 'group'}
      aria-label={props['aria-label'] ?? label}
      data-color-phase={edit.phase}
      className={cx(
        css(
          {
            minWidth: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          },
          cssProp
        ),
        className
      )}>
      <div
        className={css({
          minWidth: 0,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'start',
          gap: 'var(--space-1_5)',
        })}>
        <ColorPicker
          {...common}
          label={label}
          readOnly={locked('picker')}
          aria-errormessage={errorMessage}
          onEditStart={(source) => edit.begin(source, 'picker')}
          onValueChange={(next) => edit.request(next, 'picker')}
          onValueCommit={(next, reason) => edit.commit(next, reason, 'picker')}
          onEditCancel={edit.cancel}
        />
        <div className={css({ flex: '2 1 110px', minWidth: 0 })}>
          <HexColorField
            {...common}
            label={`${label} HEX (sRGB)`}
            readOnly={locked('hex')}
            errorMessage={errorMessage}
            onEditStart={() => edit.begin('hex', 'hex')}
            onValueChange={(next) => edit.request(next, 'hex')}
            onValueCommit={(next, reason) => edit.commit(next, reason, 'hex')}
            onEditCancel={edit.cancel}
          />
        </div>
        <div className={css({ flex: '1 1 74px', minWidth: 0 })}>
          <NumberInput
            aria-label={`${label} Alpha`}
            startSlot="A"
            value={value.a}
            min={0}
            max={1}
            step={0.01}
            dragStep={0.005}
            precision={4}
            displayPrecision={3}
            resetKey={childResetKey}
            disabled={disabled}
            readOnly={locked('alpha')}
            aria-errormessage={errorMessage}
            onEditStart={(source) => edit.begin(source, 'alpha')}
            onValueChange={(a) => edit.request({ ...edit.getRequested(), a }, 'alpha')}
            onValueCommit={(a, reason) => edit.commit({ ...edit.getRequested(), a }, reason, 'alpha')}
            onEditCancel={edit.cancel}
          />
        </div>
      </div>
      {edit.error && !externalError && (
        <div
          id={id}
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
