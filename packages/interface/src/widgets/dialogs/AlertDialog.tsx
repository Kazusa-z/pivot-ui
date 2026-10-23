import { forwardRef, type ReactElement, type ReactNode } from 'react'
import * as Primitive from '@radix-ui/react-alert-dialog'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Button } from '../buttons'
import { OverlayLayerContext, useOverlayLayer, useOverlayTheme } from '../overlays/shared'
import {
  cx,
  dialogClasses,
  getDialogContentClass,
  getDialogOverlayClass,
  getDialogTitleClass,
  getDialogDescriptionClass,
  getAlertDialogLayoutStyles,
} from './dialog.styles'

export type AlertDialogRootProps = Primitive.AlertDialogProps
export type AlertDialogTriggerProps = Primitive.AlertDialogTriggerProps
export type AlertDialogPortalProps = Omit<Primitive.AlertDialogPortalProps, 'forceMount'>
export type AlertDialogCancelProps = Primitive.AlertDialogCancelProps
export type AlertDialogActionProps = Primitive.AlertDialogActionProps
export const AlertDialogRoot = Primitive.Root
export const AlertDialogTrigger = Primitive.Trigger
/** 显示需要明确确认的操作，例如删除项目。应用在确认回调中执行操作；关闭后内容卸载，需要保留的数据可放在父组件。 */
export function AlertDialogPortal(props: AlertDialogPortalProps) {
  const { forceMount: _forceMount, ...portalProps } = props as Primitive.AlertDialogPortalProps
  return <Primitive.Portal {...portalProps} />
}
export const AlertDialogCancel = Primitive.Cancel
export const AlertDialogAction = Primitive.Action

export interface AlertDialogOverlayProps extends Omit<Primitive.AlertDialogOverlayProps, 'forceMount'> {
  css?: SystemStyleObject
}
export const AlertDialogOverlay = forwardRef<HTMLDivElement, AlertDialogOverlayProps>(function AlertDialogOverlay(
  { css, className, ...props },
  ref
) {
  const theme = useOverlayTheme()
  const { style } = useOverlayLayer(css, props.style, props.asChild ? props.children : undefined)
  const { forceMount: _forceMount, ...overlayProps } = props as Primitive.AlertDialogOverlayProps
  return (
    <Primitive.Overlay
      {...overlayProps}
      {...theme}
      style={style}
      ref={ref}
      className={cx(theme.className, getDialogOverlayClass(css), className)}
    />
  )
})
/** Include a title and explicitly omit aria-describedby when there is no description. */
export interface AlertDialogContentProps extends Omit<Primitive.AlertDialogContentProps, 'forceMount'> {
  css?: SystemStyleObject
}
export const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(function AlertDialogContent(
  { css, className, ...props },
  ref
) {
  const theme = useOverlayTheme()
  const { layer, style } = useOverlayLayer(css, props.style, props.asChild ? props.children : undefined)
  const { forceMount: _forceMount, ...contentProps } = props as Primitive.AlertDialogContentProps
  return (
    <OverlayLayerContext.Provider value={layer}>
      <Primitive.Content
        {...contentProps}
        {...theme}
        style={style}
        ref={ref}
        className={cx(theme.className, getDialogContentClass(css), className)}
      />
    </OverlayLayerContext.Provider>
  )
})
export interface AlertDialogTitleProps extends Primitive.AlertDialogTitleProps {
  css?: SystemStyleObject
}
export const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(function AlertDialogTitle(
  { css, className, ...props },
  ref
) {
  return <Primitive.Title {...props} ref={ref} className={cx(getDialogTitleClass(css), className)} />
})
export interface AlertDialogDescriptionProps extends Primitive.AlertDialogDescriptionProps {
  css?: SystemStyleObject
}
export const AlertDialogDescription = forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  function AlertDialogDescription({ css, className, ...props }, ref) {
    return <Primitive.Description {...props} ref={ref} className={cx(getDialogDescriptionClass(css), className)} />
  }
)

export interface AlertDialogProps {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  trigger?: ReactElement
  confirmLabel?: string
  cancelLabel?: string
  critical?: boolean
  onConfirm?: () => void
  onCancel?: () => void
  /** Custom actions replace the standard Cancel/Confirm pair. */
  actions?: ReactNode
  rootProps?: Omit<AlertDialogRootProps, 'children'>
  triggerProps?: Omit<AlertDialogTriggerProps, 'children' | 'asChild'>
  portalProps?: Omit<AlertDialogPortalProps, 'children'>
  overlayProps?: AlertDialogOverlayProps
  contentProps?: Omit<AlertDialogContentProps, 'children'>
  titleProps?: Omit<AlertDialogTitleProps, 'children'>
  descriptionProps?: Omit<AlertDialogDescriptionProps, 'children'>
}

export function AlertDialog({
  title,
  description,
  children,
  trigger,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  critical = false,
  onConfirm,
  onCancel,
  actions,
  rootProps,
  triggerProps,
  portalProps,
  overlayProps,
  contentProps,
  titleProps,
  descriptionProps,
}: AlertDialogProps) {
  const hasDescription =
    description !== undefined && description !== null && description !== false && description !== ''
  return (
    <AlertDialogRoot {...rootProps}>
      {trigger && (
        <AlertDialogTrigger {...triggerProps} asChild>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogPortal {...portalProps}>
        <AlertDialogOverlay {...overlayProps} />
        <AlertDialogContent
          {...(!hasDescription ? { 'aria-describedby': undefined } : {})}
          {...contentProps}
          css={getAlertDialogLayoutStyles(contentProps?.css)}>
          <div className={dialogClasses.alertHeader}>
            <AlertDialogTitle {...titleProps}>{title}</AlertDialogTitle>
          </div>
          {(hasDescription || children != null) && (
            <div className={dialogClasses.alertBody}>
              {hasDescription && <AlertDialogDescription {...descriptionProps}>{description}</AlertDialogDescription>}
              {children != null && <div className={dialogClasses.body}>{children}</div>}
            </div>
          )}
          <div className={dialogClasses.footer}>
            {actions !== undefined ? (
              actions
            ) : (
              <>
                <AlertDialogCancel asChild>
                  <Button size="md" onClick={onCancel}>
                    {cancelLabel}
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button size="md" variant="solid" critical={critical} onClick={onConfirm}>
                    {confirmLabel}
                  </Button>
                </AlertDialogAction>
              </>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  )
}
