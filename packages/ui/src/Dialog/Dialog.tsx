import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { IconX } from '@tabler/icons-react'
import type { CSSProperties, ReactNode } from 'react'

import { styled } from '../../styled-system/jsx'
import { css, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

export const basicStyle = styled('button', {
  base: {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    border: '1px solid transparent',
    boxSizing: 'border-box',
    cursor: 'pointer',
    '&:focus-visible': {
      boxShadow: '0 0 0 2px var(--colors-blueA7)',
    },
    '&:disabled': {
      backgroundColor: 'var(--colors-grayA3)',
      color: 'var(--colors-grayA8)',
      cursor: 'not-allowed',
    },
  },
})

const overlayClass = css({
  position: 'fixed',
  inset: 0,
  animationName: 'overlayFadeIn',
  animationDuration: '150ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
})

const contentClass = css({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: '440px',
  maxHeight: '85vh',
  padding: '12px',
  borderRadius: '10px',
  overflow: 'hidden',
  backgroundColor: 'var(--colors-subbg)',
  boxShadow: 'var(--shadows-popContainer)',
  animationName: 'contentShow',
  animationDuration: '150ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  '&:focus': { outline: 'none' },
  '&[data-state=open]': {
    animationName: 'contentFadeIn',
    animationDuration: '250ms',
    animationTimingFunction: 'ease',
  },
  '&[data-state=closed]': {
    animationName: 'contentFadeOut',
    animationDuration: '250ms',
    animationTimingFunction: 'ease',
  },
})

const closeClass = css({
  all: 'unset',
  position: 'absolute',
  appearance: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '24px',
  width: '24px',
  top: '8px',
  right: '8px',
  border: 'none',
  borderRadius: '6px',
  color: 'var(--colors-gray10)',
  zIndex: 2,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  '& > svg': {
    height: '18px',
    width: '18px',
  },
  '&:hover': {
    color: 'var(--colors-gray12)',
    backgroundColor: 'var(--colors-gray4)',
  },
  '&:focus': {
    boxShadow: '0 0 0 3px var(--colors-grayA7)',
  },
})

function Content({
  children,
  zIndex,
  css: cssProp,
  className,
  id,
}: {
  children?: ReactNode
  zIndex?: number
  css?: SystemStyleObject
  className?: string
  id?: string
}) {
  const style = { zIndex } as CSSProperties

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={cx(overlayClass, 'DialogOverlay')} style={style} />
      <DialogPrimitive.Content
        id={id}
        className={cx(contentClass, 'DialogContent', cssProp && css(cssProp), className)}
        style={style}>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

const DialogRoot = DialogPrimitive.Root

export const DialogCloseTrigger = DialogPrimitive.Close

export function DialogTrigger(props: { children?: ReactNode }) {
  return <DialogPrimitive.Trigger asChild>{props.children}</DialogPrimitive.Trigger>
}

export interface DialogProps {
  open?: boolean
  disabled?: boolean
  title?: ReactNode
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

export function Dialog(props: DialogProps) {
  const {
    title,
    trigger,
    children,
    closable,
    onOpenChange,
    disabled,
    css: cssProp,
    zIndex,
    className,
    id,
    modal = true,
    ...rest
  } = props

  return (
    <DialogRoot onOpenChange={onOpenChange} modal={modal} {...rest}>
      {trigger && (
        <DialogPrimitive.Trigger asChild disabled={disabled}>
          {trigger}
        </DialogPrimitive.Trigger>
      )}
      <Content id={id} css={cssProp} zIndex={zIndex} className={className}>
        <VisuallyHidden.Root>
          <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description />
        </VisuallyHidden.Root>
        {children}
        {closable && (
          <DialogPrimitive.Close className={closeClass}>
            <IconX />
          </DialogPrimitive.Close>
        )}
      </Content>
    </DialogRoot>
  )
}
