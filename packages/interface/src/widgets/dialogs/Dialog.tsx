import { forwardRef, type ReactElement, type ReactNode } from 'react'
import * as Primitive from '@radix-ui/react-dialog'
import type { SystemStyleObject } from '../../../styled-system/types'
import { ActionButton } from '../buttons'
import { OverlayLayerContext, useOverlayLayer, useOverlayTheme } from '../overlays/shared'
import {
  cx,
  dialogClasses,
  getDialogContentClass,
  getDialogOverlayClass,
  getDialogTitleClass,
  getDialogDescriptionClass,
} from './dialog.styles'

export type DialogRootProps = Primitive.DialogProps
export type DialogTriggerProps = Primitive.DialogTriggerProps
export type DialogPortalProps = Omit<Primitive.DialogPortalProps, 'forceMount'>
export type DialogCloseProps = Primitive.DialogCloseProps
export const DialogRoot = Primitive.Root
export const DialogTrigger = Primitive.Trigger
/** Closed dialogs unmount so hidden modal effects cannot lock the document. */
export function DialogPortal(props: DialogPortalProps) {
  const { forceMount: _forceMount, ...portalProps } = props as Primitive.DialogPortalProps
  return <Primitive.Portal {...portalProps} />
}
export const DialogClose = Primitive.Close

export interface DialogOverlayProps extends Omit<Primitive.DialogOverlayProps, 'forceMount'> {
  css?: SystemStyleObject
}
export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(function DialogOverlay(
  { css, className, ...props },
  ref
) {
  const theme = useOverlayTheme()
  const { style } = useOverlayLayer(css, props.style, props.asChild ? props.children : undefined)
  const { forceMount: _forceMount, ...overlayProps } = props as Primitive.DialogOverlayProps
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

/** Include a DialogTitle. When no description is rendered, pass aria-describedby={undefined}. */
export interface DialogContentProps extends Omit<Primitive.DialogContentProps, 'forceMount'> {
  css?: SystemStyleObject
}
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { css, className, ...props },
  ref
) {
  const theme = useOverlayTheme()
  const { layer, style } = useOverlayLayer(css, props.style, props.asChild ? props.children : undefined)
  const { forceMount: _forceMount, ...contentProps } = props as Primitive.DialogContentProps
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

export interface DialogTitleProps extends Primitive.DialogTitleProps {
  css?: SystemStyleObject
}
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { css, className, ...props },
  ref
) {
  return <Primitive.Title {...props} ref={ref} className={cx(getDialogTitleClass(css), className)} />
})
export interface DialogDescriptionProps extends Primitive.DialogDescriptionProps {
  css?: SystemStyleObject
}
export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(function DialogDescription(
  { css, className, ...props },
  ref
) {
  return <Primitive.Description {...props} ref={ref} className={cx(getDialogDescriptionClass(css), className)} />
})

export interface DialogProps {
  title: ReactNode
  titleHidden?: boolean
  description?: ReactNode
  children?: ReactNode
  trigger?: ReactElement
  closable?: boolean
  closeLabel?: string
  rootProps?: Omit<DialogRootProps, 'children'>
  triggerProps?: Omit<DialogTriggerProps, 'children' | 'asChild'>
  portalProps?: Omit<DialogPortalProps, 'children'>
  overlayProps?: DialogOverlayProps
  contentProps?: Omit<DialogContentProps, 'children'>
  titleProps?: Omit<DialogTitleProps, 'children'>
  descriptionProps?: Omit<DialogDescriptionProps, 'children'>
}

/** Convenience composition with separate state, portal and content configuration. */
export function Dialog({
  title,
  titleHidden = false,
  description,
  children,
  trigger,
  closable = true,
  closeLabel = 'Close dialog',
  rootProps,
  triggerProps,
  portalProps,
  overlayProps,
  contentProps,
  titleProps,
  descriptionProps,
}: DialogProps) {
  const hasDescription =
    description !== undefined && description !== null && description !== false && description !== ''
  return (
    <DialogRoot {...rootProps}>
      {trigger && (
        <DialogTrigger {...triggerProps} asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogPortal {...portalProps}>
        <DialogOverlay {...overlayProps} />
        <DialogContent {...(!hasDescription ? { 'aria-describedby': undefined } : {})} {...contentProps}>
          <DialogTitle {...titleProps} className={cx(titleHidden && dialogClasses.hidden, titleProps?.className)}>
            {title}
          </DialogTitle>
          {hasDescription && <DialogDescription {...descriptionProps}>{description}</DialogDescription>}
          {children != null && <div className={dialogClasses.body}>{children}</div>}
          {closable && (
            <DialogClose asChild>
              <ActionButton className={dialogClasses.close} aria-label={closeLabel} variant="subtle">
                ×
              </ActionButton>
            </DialogClose>
          )}
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  )
}
