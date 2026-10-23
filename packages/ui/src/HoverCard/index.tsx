import { forwardRef, type ReactNode } from 'react'
import {
  HoverCard as NextHoverCard,
  type HoverCardContentProps,
  type HoverCardRootProps,
  type HoverCardPortalProps,
} from '@pivot-ui/react'

export interface HoverCardProps extends HoverCardContentProps {
  trigger: ReactNode
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: HoverCardRootProps['onOpenChange']
  openDelay?: number
  closeDelay?: number
  container?: HoverCardPortalProps['container']
  /** @deprecated Hidden previews are unmounted to release their listeners. */
  forceMount?: true
}
export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(function HoverCard(
  {
    trigger,
    children,
    open,
    defaultOpen,
    onOpenChange,
    openDelay,
    closeDelay,
    container,
    forceMount: _forceMount,
    ...contentProps
  },
  ref
) {
  return (
    <NextHoverCard
      ref={ref}
      trigger={trigger}
      rootProps={{ open, defaultOpen, onOpenChange, openDelay, closeDelay }}
      portalProps={{ container }}
      contentProps={contentProps}>
      {children}
    </NextHoverCard>
  )
})
