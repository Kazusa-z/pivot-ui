import { forwardRef, type ReactNode } from 'react'
import {
  Tooltip as NextTooltip,
  type TooltipContentProps,
  type TooltipRootProps,
  type TooltipPortalProps,
} from '@pivot-ui/react'

/** Requires a shared TooltipProvider at the application/composition boundary. */
export interface TooltipProps extends Omit<TooltipContentProps, 'content'> {
  content?: ReactNode
  delayDuration?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: TooltipRootProps['onOpenChange']
  disableHoverableContent?: boolean
  container?: TooltipPortalProps['container']
  /** @deprecated Hidden tooltip content is unmounted to release its listeners. */
  forceMount?: true
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  {
    children,
    content,
    delayDuration = 0,
    open,
    defaultOpen,
    onOpenChange,
    disableHoverableContent,
    container,
    forceMount: _forceMount,
    ...contentProps
  },
  ref
) {
  return (
    <NextTooltip
      ref={ref}
      trigger={children}
      rootProps={{ delayDuration, open, defaultOpen, onOpenChange, disableHoverableContent }}
      portalProps={{ container }}
      contentProps={contentProps}>
      {content}
    </NextTooltip>
  )
})
