import { forwardRef, useId, useLayoutEffect, useMemo, useRef, useState, type ButtonHTMLAttributes } from 'react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { css, cx } from '../../../styled-system/css'
import type { CurvePreset, CurvePresetService } from '../../contracts/curve'
import { useValueEdit } from '../../interaction/value/useValueEdit'
import type { CurveCommitReason, CurveEditSource } from '../../interaction/curve/types'
import {
  areCurvesEqual,
  assertCurveValue,
  copyCurveValue,
  createCurvePath,
  fitCurveViewport,
  type CurveValue,
} from '../../values/curve'
import { CurveWidget, type CurveWidgetProps } from '../../widgets/curve/CurveWidget'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  type PopoverContentProps,
  type PopoverPortalProps,
} from '../../widgets/overlays/Popover'
import { CurvePresets } from './CurvePresets'

export interface CurvePickerProps extends CurveWidgetProps {
  presets?: readonly CurvePreset[]
  presetService?: CurvePresetService
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  triggerProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'disabled'>
  contentProps?: Omit<PopoverContentProps, 'children' | 'asChild'>
  portalProps?: Omit<PopoverPortalProps, 'children'>
}
function PickerWidget(props: CurveWidgetProps) {
  // Fit once per popup mount; subsequent view changes and edits retain the user's view.
  const [initialViewport] = useState(() => fitCurveViewport(props.value))
  return <CurveWidget {...props} defaultViewport={props.defaultViewport ?? initialViewport} />
}

/** 以曲线预览按钮打开编辑浮层，适合空间有限的属性面板。用户可编辑曲线或应用预设，应用通过编辑回调接收结果。 */
export const CurvePicker = forwardRef<HTMLButtonElement, CurvePickerProps>(function CurvePicker(
  {
    value,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    disabled = false,
    readOnly = false,
    label = 'Curve',
    presets,
    presetService,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    triggerProps,
    contentProps,
    portalProps,
    ...widgetProps
  },
  ref
) {
  assertCurveValue(value)
  const [open, setOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  })
  const edit = useValueEdit<CurveValue, CurveEditSource, CurveCommitReason>({
    value,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    disabled,
    readOnly,
    equals: areCurvesEqual,
  })
  const childReset = useMemo(() => ({ resetKey, resetToken: edit.resetToken }), [resetKey, edit.resetToken])
  const previousReset = useRef(resetKey)
  useLayoutEffect(() => {
    if (!open && edit.getSessionToken()) edit.cancel('unmount')
  }, [open, edit.cancel])
  useLayoutEffect(() => {
    if (disabled || !Object.is(previousReset.current, resetKey)) setOpen(false)
    previousReset.current = resetKey
  }, [disabled, resetKey, setOpen])
  const errorId = useId()
  const externalError = widgetProps['aria-errormessage']
  const previewPath = createCurvePath(value, fitCurveViewport(value), 120, 28)
  return (
    <PopoverRoot
      open={open && !disabled}
      onOpenChange={(next) => {
        if (!next) edit.cancel('pointer-cancel')
        setOpen(next)
      }}>
      <PopoverTrigger asChild>
        <button
          {...triggerProps}
          ref={ref}
          type="button"
          disabled={disabled}
          aria-label={triggerProps?.['aria-label'] ?? `${label} picker`}
          className={cx(
            css({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: 0,
              maxWidth: '100%',
              height: '32px',
              padding: '2px 6px',
              border: '1px solid var(--colors-borderStrong)',
              borderRadius: '4px',
              color: 'var(--colors-text)',
              background: 'var(--colors-surfaceSubtle)',
              '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
              '&:disabled': { opacity: 0.5 },
            }),
            triggerProps?.className
          )}>
          <svg
            aria-hidden="true"
            viewBox="0 0 120 28"
            width="120"
            height="28"
            className={css({ display: 'block', minWidth: 0, flex: '1 1 120px', overflow: 'hidden' })}>
            <path
              d={previewPath}
              fill="none"
              stroke="var(--colors-primary)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            className={css({ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
            {label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverPortal {...portalProps}>
        <PopoverContent
          {...contentProps}
          collisionPadding={contentProps?.collisionPadding ?? 12}
          css={css.raw(
            {
              width: '460px',
              minWidth: 0,
              maxWidth: 'min(var(--radix-popover-content-available-width), calc(100vw - 24px))',
              maxHeight: 'min(var(--radix-popover-content-available-height), calc(100dvh - 24px))',
              boxSizing: 'border-box',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              padding: '12px',
            },
            contentProps?.css
          )}
          onEscapeKeyDown={(event) => {
            contentProps?.onEscapeKeyDown?.(event)
            if (!event.defaultPrevented && edit.getSessionToken()) {
              event.preventDefault()
              edit.cancel('escape')
            }
          }}
          onKeyDown={(event) => {
            contentProps?.onKeyDown?.(event)
            if (!event.defaultPrevented && event.key === 'Escape' && edit.phase !== 'idle') {
              event.preventDefault()
              event.stopPropagation()
              edit.cancel('escape')
            }
          }}>
          <PopoverTitle className={css({ margin: '0 0 4px', fontSize: '14px' })}>{label}</PopoverTitle>
          <PopoverDescription
            className={css({ margin: '0 0 12px', fontSize: '11px', color: 'var(--colors-textMuted)' })}>
            Drag points and handles to shape the curve, or choose a preset and select Apply.
          </PopoverDescription>
          <div className={css({ display: 'grid', gap: '12px', minWidth: 0 })}>
            <PickerWidget
              {...widgetProps}
              label={label}
              value={value}
              disabled={disabled}
              readOnly={readOnly || (edit.owner !== null && edit.owner !== 'widget')}
              resetKey={childReset}
              aria-errormessage={externalError ?? (edit.error && edit.owner === 'widget' ? errorId : undefined)}
              onEditStart={(source) => edit.begin(source, 'widget')}
              onValueChange={(next) => {
                edit.request(next, 'widget')
              }}
              onValueCommit={(next, reason) => edit.commit(next, reason, 'widget')}
              onEditCancel={edit.cancel}
            />
            {edit.error && edit.owner === 'widget' && !externalError && (
              <span id={errorId} role="alert" className={css({ color: 'var(--colors-dangerText)', fontSize: '12px' })}>
                {edit.error}
              </span>
            )}
            <CurvePresets
              value={value}
              aria-errormessage={externalError}
              presets={presets}
              presetService={presetService}
              disabled={disabled}
              readOnly={readOnly || (edit.owner !== null && edit.owner !== 'preset')}
              resetKey={childReset}
              onApplyPreset={async (next) => {
                if (!edit.begin('preset', 'preset')) throw new Error('A curve edit is already active or unavailable.')
                const snapshot = copyCurveValue(next)
                if (!edit.request(snapshot, 'preset')) throw new Error('Preset application was superseded.')
                await edit.commit(snapshot, 'preset', 'preset')
              }}
            />
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
})
