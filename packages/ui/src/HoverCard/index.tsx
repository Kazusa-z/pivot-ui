import { PropsWithChildren, ReactNode } from 'react'
import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import { styled } from '../../styled-system/jsx'

const StyledContent = styled(HoverCardPrimitive.Content, {
  base: {
    all: 'unset',
    display: 'block',
    borderRadius: '8px',
    backgroundColor: 'var(--colors-gray2)',
    padding: '4px',
    fontSize: '12px',
    border: '1px solid var(--colors-gray5)',
    animationName: 'slideRightAndFade',
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transformOrigin: 'var(--radix-hover-card-content-transform-origin)',
    willChange: 'transform, opacity',
    '&[data-side="top"]': { animationName: 'slideUpAndFade' },
    '&[data-side="bottom"]': { animationName: 'slideDownAndFade' },
    '&[data-side="left"]': { animationName: 'slideLeftAndFade' },
    '&[data-side="right"]': { animationName: 'slideRightAndFade' },
  },
})

interface HoverCardProps extends HoverCardPrimitive.HoverCardContentProps {
  children: ReactNode
  trigger: ReactNode
}

const HoverCard = (props: PropsWithChildren<HoverCardProps>) => {
  const { trigger, children, ...rest } = props

  return (
    <HoverCardPrimitive.Root>
      <HoverCardPrimitive.Trigger asChild>{trigger}</HoverCardPrimitive.Trigger>
      <HoverCardPrimitive.Portal>
        <StyledContent {...rest}>{children}</StyledContent>
      </HoverCardPrimitive.Portal>
    </HoverCardPrimitive.Root>
  )
}

export { HoverCard }
