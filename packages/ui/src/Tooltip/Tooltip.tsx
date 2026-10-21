import React, { type PropsWithChildren } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { css } from '../../styled-system/css'

const contentClass = css({
  display: 'flex',
  alignItems: 'center',
  fontSize: '13px',
  padding: '8px 12px',
  backgroundColor: 'var(--colors-gray2)',
  borderRadius: '8px',
  color: 'var(--colors-gray12)',
  boxShadow: 'inset 0 0 0 1px var(--colors-grayA4)',
  transformOrigin: 'var(--radix-tooltip-content-transform-origin)',
  animationName: 'scaleIn',
  animationDuration: '0.2s',
  animationTimingFunction: 'ease',
  animationFillMode: 'forwards',
})

export interface TooltipProps extends Omit<TooltipPrimitive.TooltipContentProps, 'content'> {
  content?: React.ReactNode
  delayDuration?: number
}

function Tooltip(props: PropsWithChildren<TooltipProps>) {
  const { children, content, side = 'bottom', sideOffset = 6, delayDuration = 0, ...rest } = props
  return (
    <TooltipPrimitive.TooltipProvider>
      <TooltipPrimitive.Root delayDuration={delayDuration} {...rest}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className={contentClass} sideOffset={sideOffset} side={side}>
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.TooltipProvider>
  )
}

export { Tooltip }
