import { forwardRef, type ReactElement, type ReactNode } from 'react'
import * as Primitive from '@radix-ui/react-dialog'
import type { SystemStyleObject } from '../../styled-system/types'
import { IconButton } from '../controls/buttons'
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
/** 显示模态对话框，适合表单和详细操作。关闭后内容卸载；需要跨次打开保留的数据可放在父组件状态中。 */
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
  /** 对话框标题（必填），也是对话框的无障碍名称。 */
  title: ReactNode
  /** 视觉上隐藏标题，只保留给读屏。 */
  titleHidden?: boolean
  /** 标题下的说明；没有说明时对话框不会关联 `aria-describedby`。 */
  description?: ReactNode
  /** 对话框主体，例如表单。 */
  children?: ReactNode
  /** 打开对话框的元素，例如 `Button`；受控使用时可以省略。 */
  trigger?: ReactElement
  /** 显示右上角关闭按钮，默认显示。 */
  closable?: boolean
  /** 关闭按钮的无障碍名称，默认 "Close dialog"。 */
  closeLabel?: string
  /** 关闭按钮尺寸：`sm` 24（默认）、`md` 32。 */
  closeSize?: 'sm' | 'md'
  /** 传给 Root：`open` / `defaultOpen` / `onOpenChange` 控制开关。 */
  rootProps?: Omit<DialogRootProps, 'children'>
  /** 合并到触发元素上的额外属性。 */
  triggerProps?: Omit<DialogTriggerProps, 'children' | 'asChild'>
  /** 传给 Portal 的属性，例如 `container`。 */
  portalProps?: Omit<DialogPortalProps, 'children'>
  /** 传给遮罩层的属性。 */
  overlayProps?: DialogOverlayProps
  /** 传给对话框内容的属性，例如 `onEscapeKeyDown`、`css`。 */
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
  closeSize = 'sm',
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
              <IconButton size={closeSize} className={dialogClasses.close} aria-label={closeLabel} variant="subtle">
                ×
              </IconButton>
            </DialogClose>
          )}
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  )
}
