import { isValidElement, type PropsWithChildren, type ReactNode } from 'react'
import { AlertDialog as NewAlertDialog, type AlertDialogRootProps } from '@pivot-ui/react'

export interface IAlertDialogProps {
  trigger?: ReactNode
  title: string
  description?: ReactNode
  cancelText?: string
  confirmText?: string
  onClose?: () => void
  onConfirm?: () => void
  zIndex?: number
  actionable?: boolean
}
export type AlertDialogProps = PropsWithChildren<IAlertDialogProps & AlertDialogRootProps>

/** @deprecated Prefer @pivot-ui/react AlertDialog with explicit root/content configuration. */
export function AlertDialog({
  trigger,
  title,
  description,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  onConfirm,
  onClose,
  zIndex,
  actionable = true,
  children,
  ...rootProps
}: AlertDialogProps) {
  return (
    <NewAlertDialog
      title={title}
      description={description}
      trigger={isValidElement(trigger) ? trigger : undefined}
      rootProps={rootProps}
      contentProps={{ style: { zIndex } }}
      overlayProps={{ style: { zIndex } }}
      confirmLabel={confirmText}
      cancelLabel={cancelText}
      critical
      onConfirm={onConfirm}
      onCancel={onClose}
      actions={actionable ? undefined : null}>
      {children}
    </NewAlertDialog>
  )
}
