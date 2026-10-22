import React, { forwardRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import type { PopoverContentProps as PrimitiveContentProps } from '@radix-ui/react-popover'
import { useControllableState } from '@radix-ui/react-use-controllable-state'

import { css } from '../../styled-system/css'
import { styled } from '../../styled-system/jsx'
import type { SystemStyleObject } from '../../styled-system/types'
import { composeEventHandlers } from '../utils/composeEventHandler'

const StyledContent = styled(PopoverPrimitive.Content, {
  base: {
    backgroundColor: 'var(--colors-overlayBg)',
    borderRadius: '6px',
    boxShadow: 'var(--shadows-popContainer)',
    border: '1px solid var(--colors-border)',
    transformOrigin: 'var(--radix-popover-content-transform-origin)',
    animationName: 'scaleIn',
    animationDuration: '300ms',
    animationTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
    willChange: 'transform, opacity',
    padding: '8px',
    fontSize: '12px',
    color: 'var(--colors-text)',
    minWidth: '160px',
    outline: 'none',
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: 'slideDownAndFade' },
      '&[data-side="right"]': { animationName: 'slideLeftAndFade' },
      '&[data-side="bottom"]': { animationName: 'slideUpAndFade' },
      '&[data-side="left"]': { animationName: 'slideRightAndFade' },
    },
  },
  variants: {
    compact: {
      true: { padding: 0 },
    },
    constrainSize: {
      true: {
        width: 'var(--radix-popover-trigger-width)',
        maxHeight: 'var(--radix-popover-content-available-height)',
      },
    },
  },
})
const disabledTriggerClass = css({ pointerEvents: 'none', userSelect: 'none' })

export type PopoverProps = PopoverContentProps & {
  trigger: React.ReactNode
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
  compact?: boolean
  constrainSize?: boolean
  css?: SystemStyleObject
  container?: Element
}

interface PopoverContentProps extends PrimitiveContentProps {
  children?: React.ReactNode
  open?: boolean
  forceRender?: boolean
  container?: Element
  compact?: boolean
  constrainSize?: boolean
  css?: SystemStyleObject
}

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  props: PopoverContentProps,
  forwardedRef
) {
  const {
    children,
    open,
    container,
    forceRender = false,
    compact,
    constrainSize,
    css: cssProp,
    className,
    ...rest
  } = props

  const [fragment, setFragment] = React.useState<DocumentFragment>()

  useLayoutEffect(() => {
    setFragment(new DocumentFragment())
  }, [])

  if (!open && forceRender) {
    const frag = fragment as unknown as Element | undefined
    return frag ? createPortal(children, frag) : null
  }

  return (
    <PopoverPrimitive.Portal container={container}>
      <StyledContent
        {...rest}
        ref={forwardedRef}
        compact={compact}
        constrainSize={constrainSize}
        css={cssProp}
        className={className}>
        {children}
      </StyledContent>
    </PopoverPrimitive.Portal>
  )
})

const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(props: PopoverProps, forwardedRef) {
  const { trigger, children, disabled, open: propOpen, onOpenChange, sideOffset = 6, ...rest } = props

  const [open, setOpen] = useControllableState({
    prop: propOpen,
    defaultProp: false,
    onChange: onOpenChange,
  })

  function stopPropagation(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled} className={disabled ? disabledTriggerClass : undefined}>
        {trigger}
      </PopoverPrimitive.Trigger>
      <PopoverContent
        {...rest}
        sideOffset={sideOffset}
        open={open}
        ref={forwardedRef}
        onWheel={composeEventHandlers(stopPropagation, rest.onWheel)}
        onTouchMove={composeEventHandlers(stopPropagation, rest.onTouchMove)}>
        {children}
      </PopoverContent>
    </PopoverPrimitive.Root>
  )
})

const PopoverCloseTrigger = PopoverPrimitive.Close

export { Popover, PopoverCloseTrigger }
