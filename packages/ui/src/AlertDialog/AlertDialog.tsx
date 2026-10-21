import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { AlertDialogProps } from '@radix-ui/react-alert-dialog'
import React, { type PropsWithChildren } from 'react'

import { css } from '../../styled-system/css'
import { Button } from '../Button'
import { Flex } from '../Flex'

const { Root, Trigger, Portal, Overlay, Content, Title: AlertTitle, Description, Cancel, Action } = AlertDialogPrimitive

const overlayClass = css({
  position: 'fixed',
  backgroundColor: 'var(--colors-overlayScrim)',
  inset: 0,
  zIndex: 50,
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': {
      animationName: 'overlayFadeIn',
      animationDuration: '.15s',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      animationFillMode: 'forwards',
    },
    '&[data-state="closed"]': {
      animationName: 'overlayFadeOut',
      animationDuration: '.15s',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      animationFillMode: 'forwards',
    },
  },
})

const contentClass = css({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxHeight: '85vh',
  backgroundColor: 'var(--colors-surfaceOverlay)',
  borderRadius: '8px',
  border: '1px solid var(--colors-border)',
  boxSizing: 'border-box',
  boxShadow: 'var(--shadows-popContainer)',
  outline: 'none',
  padding: '16px',
  maxWidth: '26rem',
  width: 'min(26rem, calc(100vw - 32px))',
  zIndex: 50,
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

const headerClass = css({ display: 'grid', gap: '8px' })

const footerClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '8px',
  marginTop: '20px',
  paddingTop: '16px',
})

const titleClass = css({
  margin: 0,
  color: 'var(--colors-textStrong)',
  fontSize: '18px',
  lineHeight: '26px',
  fontWeight: 600,
})

const descriptionClass = css({
  margin: 0,
  color: 'var(--colors-textMuted)',
  fontSize: '14px',
  lineHeight: '20px',
  maxWidth: '56ch',
  whiteSpace: 'pre-line',
})

export interface IAlertDialogProps {
  trigger?: React.ReactNode
  title: string
  description?: string | React.ReactNode
  cancelText?: string
  confirmText?: string
  onClose?: () => void
  onConfirm?: () => void
  zIndex?: number
  actionable?: boolean
}

function AlertDialog(props: PropsWithChildren<IAlertDialogProps & AlertDialogProps>) {
  const {
    trigger,
    title,
    description,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    onConfirm,
    onClose,
    zIndex,
    actionable = true,
    ...rest
  } = props

  return (
    <Root {...rest}>
      <Trigger asChild>{trigger}</Trigger>
      <Portal>
        <Overlay className={overlayClass} style={{ zIndex }} />
        <Content className={contentClass} style={{ zIndex }}>
          <div className={headerClass}>
            <AlertTitle className={titleClass}>{title}</AlertTitle>
            {description && <Description className={descriptionClass}>{description}</Description>}
          </div>
          {actionable && (
            <Flex className={footerClass}>
              {onClose && (
                <Cancel asChild>
                  <Button variant="soft" size="md" onClick={onClose}>
                    {cancelText}
                  </Button>
                </Cancel>
              )}
              {onConfirm && (
                <Action asChild>
                  <Button variant="solid" critical size="md" onClick={onConfirm}>
                    {confirmText}
                  </Button>
                </Action>
              )}
            </Flex>
          )}
        </Content>
      </Portal>
    </Root>
  )
}

export { AlertDialog }
