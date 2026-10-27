import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { css, cx } from '../../../styled-system/css'
import type { ColorEditCallbacks } from '../../interaction/color/types'
import {
  PopoverContent,
  PopoverDescription,
  PopoverPortal,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverPortalProps,
} from '../../overlays/Popover'
import type { ColorAlphaRampValue, ColorRampValue } from '../../values/color-ramp'
import { ColorRampEditor, type ColorRampEditorProps } from './ColorRampEditor'
import { ColorAlphaRampEditor, type ColorAlphaRampEditorProps } from './ColorAlphaRampEditor'
import { getColorAlphaRampCss, getColorRampCss } from './color-ramp-preview'
import { defaultRamp, rampStyles } from './RampControls'

interface PickerProps {
  /** 按钮的无障碍名称，默认 `Edit color ramp`。 */
  label?: string
  /** 浮层是否打开（受控）。 */
  open?: boolean
  /** 非受控时初始是否打开。 */
  defaultOpen?: boolean
  /** 打开或关闭浮层时调用。 */
  onOpenChange?: (open: boolean) => void
  /** 传给预览按钮的属性。 */
  triggerProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'>
  /** 传给浮层 Portal 的属性。 */
  portalProps?: Omit<PopoverPortalProps, 'children'>
  /** 传给浮层内容的属性。 */
  contentProps?: Omit<PopoverContentProps, 'children'>
}
export type ColorRampPickerProps = PickerProps &
  (({ variant?: 'ramp' } & ColorRampEditorProps) | ({ variant: 'channels' } & ColorAlphaRampEditorProps))
function PickerShell({
  label = 'Edit color ramp',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  triggerProps,
  portalProps,
  contentProps,
  disabled,
  resetKey,
  preview,
  children,
  triggerRef,
}: PickerProps & {
  disabled?: boolean
  resetKey?: unknown
  preview: string
  children: ReactNode
  triggerRef: Ref<HTMLButtonElement>
}) {
  const [open, setOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  })
  const previousReset = useRef(resetKey)
  useLayoutEffect(() => {
    if (disabled || !Object.is(previousReset.current, resetKey)) setOpen(false)
    previousReset.current = resetKey
  }, [disabled, resetKey, setOpen])
  return (
    <PopoverRoot open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          {...triggerProps}
          ref={triggerRef}
          type={triggerProps?.type ?? 'button'}
          disabled={disabled}
          aria-label={triggerProps?.['aria-label'] ?? label}
          className={cx(
            css({
              display: 'inline-flex',
              alignItems: 'center',
              minWidth: '72px',
              width: '100%',
              height: 'var(--sizes-controlSm)',
              padding: 'var(--space-0_5)',
              border: '1px solid var(--colors-borderStrong)',
              borderRadius: 'var(--radii-control)',
              backgroundColor: 'var(--colors-surface)',
              '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
              '&:disabled': { opacity: 0.5 },
            }),
            triggerProps?.className
          )}>
          <span
            className={rampStyles.checker}
            style={{ width: '100%', height: '100%', borderRadius: 'var(--radii-control)' }}>
            <span style={{ display: 'block', width: '100%', height: '100%', backgroundImage: preview }} />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverPortal {...portalProps}>
        <PopoverContent
          aria-label={label}
          collisionPadding={12}
          {...contentProps}
          style={{
            boxSizing: 'border-box',
            width: 360,
            minWidth: 0,
            maxWidth: 'min(var(--radix-popover-content-available-width), calc(100vw - 24px))',
            maxHeight: 'min(var(--radix-popover-content-available-height), calc(100dvh - 24px))',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            ...contentProps?.style,
          }}>
          <PopoverTitle className={css({ fontSize: 'var(--fontSizes-controlLarge)', margin: '0 0 var(--space-1)' })}>
            {label}
          </PopoverTitle>
          <PopoverDescription
            className={css({
              fontSize: 'var(--fontSizes-micro)',
              color: 'var(--colors-textMuted)',
              margin: '0 0 var(--space-3)',
            })}>
            Select a stop, then edit its position or color. Arrow keys move the focused stop.
          </PopoverDescription>
          {children}
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
}
function usePickerValue<T>(
  value: T | undefined,
  defaultValue: T,
  onValueChange: ((value: T) => void) | undefined,
  callbacks: ColorEditCallbacks<T>
) {
  const [internal, setInternal] = useState(defaultValue)
  const current = value ?? internal
  const initial = useRef(current)
  return {
    value: current,
    onValueChange: (next: T) => {
      if (value === undefined) setInternal(next)
      onValueChange?.(next)
    },
    onEditStart: (source: Parameters<NonNullable<ColorEditCallbacks<T>['onEditStart']>>[0]) => {
      initial.current = current
      return callbacks.onEditStart?.(source)
    },
    onValueCommit: callbacks.onValueCommit,
    onEditCancel: (reason: Parameters<NonNullable<ColorEditCallbacks<T>['onEditCancel']>>[0]) => {
      if (value === undefined && !['external-update', 'target-change', 'reset', 'unmount'].includes(reason))
        setInternal(initial.current)
      callbacks.onEditCancel?.(reason)
    },
  }
}
function RampPicker({
  triggerRef,
  label,
  open,
  defaultOpen,
  onOpenChange,
  triggerProps,
  portalProps,
  contentProps,
  variant: _variant,
  value,
  defaultValue = defaultRamp,
  onValueChange,
  onEditStart,
  onValueCommit,
  onEditCancel,
  ...props
}: PickerProps & ColorRampEditorProps & { variant?: 'ramp'; triggerRef: Ref<HTMLButtonElement> }) {
  const state = usePickerValue<ColorRampValue>(value, defaultValue, onValueChange, {
    onEditStart,
    onValueCommit,
    onEditCancel,
  })
  return (
    <PickerShell
      {...{ label, open, defaultOpen, onOpenChange, triggerProps, portalProps, contentProps, triggerRef }}
      disabled={props.disabled}
      resetKey={props.resetKey}
      preview={getColorRampCss(state.value)}>
      <ColorRampEditor {...props} {...state} />
    </PickerShell>
  )
}
function ChannelsPicker({
  triggerRef,
  label,
  open,
  defaultOpen,
  onOpenChange,
  triggerProps,
  portalProps,
  contentProps,
  variant: _variant,
  value,
  defaultValue = { color: defaultRamp, alpha: [] },
  onValueChange,
  onEditStart,
  onValueCommit,
  onEditCancel,
  ...props
}: PickerProps & ColorAlphaRampEditorProps & { variant: 'channels'; triggerRef: Ref<HTMLButtonElement> }) {
  const state = usePickerValue<ColorAlphaRampValue>(value, defaultValue, onValueChange, {
    onEditStart,
    onValueCommit,
    onEditCancel,
  })
  return (
    <PickerShell
      {...{ label, open, defaultOpen, onOpenChange, triggerProps, portalProps, contentProps, triggerRef }}
      disabled={props.disabled}
      resetKey={props.resetKey}
      preview={getColorAlphaRampCss(state.value)}>
      <ColorAlphaRampEditor {...props} {...state} />
    </PickerShell>
  )
}
export const ColorRampPicker = forwardRef<HTMLButtonElement, ColorRampPickerProps>(
  function ColorRampPicker(props, ref) {
    return props.variant === 'channels' ? (
      <ChannelsPicker {...props} triggerRef={ref} />
    ) : (
      <RampPicker {...props} triggerRef={ref} />
    )
  }
)
