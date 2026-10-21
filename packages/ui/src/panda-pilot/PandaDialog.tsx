import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { IconX } from '@tabler/icons-react'
import type { CSSProperties, ReactNode } from 'react'
import { animations } from '../design-system'
import { css } from '../../styled-system/css'

const overlayClass = css({
  position: 'fixed',
  inset: 0,
  animation: `${animations.overlayFadeIn} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
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
  animation: `${animations.contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  '&:focus': { outline: 'none' },
  '&[data-state=open]': {
    animation: `${animations.contentFadeIn} 250ms ease`,
  },
  '&[data-state=closed]': {
    animation: `${animations.contentFadeOut} 250ms ease`,
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

function Content({ children, zIndex, ...props }: { children?: ReactNode; zIndex?: number; [key: string]: unknown }) {
  const style = { zIndex } as CSSProperties

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClass} style={style} />
      <DialogPrimitive.Content className={contentClass} {...props} style={style}>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export interface PandaDialogProps {
  open?: boolean
  disabled?: boolean
  title?: ReactNode
  trigger?: ReactNode
  children?: ReactNode
  closable?: boolean
  onOpenChange?: (open: boolean) => void
  zIndex?: number
  modal?: boolean
}

export function PandaDialog(props: PandaDialogProps) {
  const { title, trigger, children, closable, onOpenChange, disabled, zIndex, modal = true, ...rest } = props

  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} modal={modal} {...rest}>
      {trigger && (
        <DialogPrimitive.Trigger asChild disabled={disabled}>
          {trigger}
        </DialogPrimitive.Trigger>
      )}
      <Content zIndex={zIndex}>
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
    </DialogPrimitive.Root>
  )
}
