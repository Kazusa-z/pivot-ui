import { isValidElement, type ReactNode } from 'react'
import {
  Dialog as NewDialog,
  DialogClose as DialogCloseTrigger,
  DialogTrigger as NewDialogTrigger,
} from '@pivot-ui/react'
import type { SystemStyleObject } from '../../styled-system/types'

export { DialogCloseTrigger }
export function DialogTrigger({ children }: { children?: ReactNode }) {
  return <NewDialogTrigger asChild>{children}</NewDialogTrigger>
}

/** @deprecated Prefer the explicit rootProps/contentProps/portalProps API in @pivot-ui/react. */
export interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  title?: ReactNode
  description?: ReactNode
  trigger?: ReactNode
  children?: ReactNode
  closable?: boolean
  onOpenChange?: (open: boolean) => void
  css?: SystemStyleObject
  zIndex?: number
  className?: string
  id?: string
  modal?: boolean
}

export function Dialog({
  title,
  description,
  trigger,
  children,
  closable = false,
  onOpenChange,
  disabled,
  css,
  zIndex,
  className,
  id,
  modal = true,
  open,
  defaultOpen,
}: DialogProps) {
  return (
    <NewDialog
      title={title ?? 'Dialog'}
      titleHidden
      description={description}
      trigger={isValidElement(trigger) ? trigger : undefined}
      triggerProps={{ disabled }}
      rootProps={{ open, defaultOpen, onOpenChange, modal }}
      contentProps={{ css, className, id, style: { zIndex } }}
      overlayProps={{ style: { zIndex } }}
      closable={closable}>
      {children}
    </NewDialog>
  )
}
