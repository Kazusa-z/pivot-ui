import { forwardRef, useLayoutEffect, useRef, type ButtonHTMLAttributes } from 'react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { ColorWidget, type ColorControlProps } from '../../widgets/color/ColorWidget'
import { getColorCss } from '../../widgets/color/color-preview'
import { assertColorValue } from '../../values/color'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  type PopoverContentProps,
} from '../../widgets/overlays/Popover'

export interface ColorPickerProps extends ColorControlProps {
  label?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  triggerProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled' | 'type'>
  contentProps?: Omit<PopoverContentProps, 'children' | 'asChild'>
  'aria-errormessage'?: string
  css?: SystemStyleObject
}

/** 以色块按钮打开颜色编辑浮层，适合紧凑字段。通过编辑回调接收颜色值，使用 value 更新显示。 */
export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(function ColorPicker(
  {
    label = 'Color',
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    triggerProps,
    contentProps,
    css: cssProp,
    ...control
  },
  ref
) {
  assertColorValue(control.value, { hdr: control.hdr })
  const [open, setOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  })
  const oldReset = useRef(control.resetKey)
  useLayoutEffect(() => {
    if (control.disabled || !Object.is(oldReset.current, control.resetKey)) setOpen(false)
    oldReset.current = control.resetKey
  }, [control.disabled, control.resetKey, setOpen])
  return (
    <PopoverRoot open={open && !control.disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          {...triggerProps}
          ref={ref}
          type="button"
          disabled={control.disabled}
          aria-label={triggerProps?.['aria-label'] ?? `${label} picker`}
          className={cx(
            css(
              {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minWidth: 0,
                maxWidth: '100%',
                height: '28px',
                padding: '3px 6px',
                border: '1px solid var(--colors-border)',
                borderRadius: '4px',
                color: 'var(--colors-text)',
                background: 'var(--colors-surfaceSubtle)',
                cursor: 'pointer',
                '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
                '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
              },
              cssProp
            ),
            triggerProps?.className
          )}>
          <span
            aria-hidden="true"
            className={css({
              width: '24px',
              alignSelf: 'stretch',
              flexShrink: 0,
              borderRadius: '2px',
              background: 'repeating-conic-gradient(#bbb 0% 25%, #fff 0% 50%) 0 / 8px 8px',
              overflow: 'hidden',
            })}>
            <span style={{ display: 'block', height: '100%', backgroundColor: getColorCss(control.value) }} />
          </span>
          <span
            className={css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' })}>
            {label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          {...contentProps}
          collisionPadding={contentProps?.collisionPadding ?? 12}
          css={css.raw(
            {
              width: '300px',
              minWidth: 0,
              maxWidth: 'min(var(--radix-popover-content-available-width), calc(100vw - 24px))',
              maxHeight: 'min(var(--radix-popover-content-available-height), calc(100dvh - 24px))',
              boxSizing: 'border-box',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              padding: '12px',
            },
            contentProps?.css
          )}>
          <PopoverTitle className={css({ margin: '0 0 4px', fontSize: '14px' })}>{label}</PopoverTitle>
          <PopoverDescription
            className={css({ margin: '0 0 12px', fontSize: '11px', color: 'var(--colors-textMuted)' })}>
            Adjust color and opacity · {control.value.space} color{control.hdr ? ' · HDR' : ''}
          </PopoverDescription>
          <ColorWidget {...control} label={label} />
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
})
