import { forwardRef, type ReactNode } from 'react'
import {
  Popover as NextPopover,
  PopoverClose,
  type PopoverContentProps,
  type PopoverRootProps,
  type PopoverPortalProps,
} from '@pivot-ui/react'

/** Compatibility entry. New consumers separate root, trigger, portal and content props. */
export interface PopoverProps extends PopoverContentProps {
  trigger: ReactNode
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: PopoverRootProps['onOpenChange']
  modal?: boolean
  /** Preserves state; hidden content has no active effects, focus layer or scroll lock. */
  forceRender?: boolean
  /** @deprecated Use forceRender here, or keepMounted on the new PopoverRoot. */
  forceMount?: true
  container?: PopoverPortalProps['container']
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    trigger,
    children,
    disabled,
    open,
    defaultOpen,
    onOpenChange,
    modal,
    forceRender,
    forceMount,
    container,
    onWheel,
    onTouchMove,
    ...contentProps
  },
  ref
) {
  return (
    <NextPopover
      ref={ref}
      trigger={trigger}
      rootProps={{ open, defaultOpen, onOpenChange, modal, keepMounted: forceRender || forceMount }}
      triggerProps={{ disabled }}
      portalProps={{ container }}
      contentProps={{
        ...contentProps,
        onWheel(event) {
          event.stopPropagation()
          onWheel?.(event)
        },
        onTouchMove(event) {
          event.stopPropagation()
          onTouchMove?.(event)
        },
      }}>
      {children}
    </NextPopover>
  )
})
export const PopoverCloseTrigger = PopoverClose
