import { forwardRef } from 'react'
import * as Primitive from '@radix-ui/react-context-menu'
import { MenuSizeContext, createMenuParts } from './createMenuParts'
import type { MenuSize } from './menu.styles'
import { assertMenuChild } from './slot'

// This primitive has open/onOpenChange but no defaultOpen: opening needs a trigger position.
export interface ContextMenuRootProps extends Primitive.ContextMenuProps {
  size?: MenuSize
}
export function ContextMenuRoot({ size = 'sm', children, ...props }: ContextMenuRootProps) {
  return (
    <MenuSizeContext.Provider value={size}>
      <Primitive.Root {...props}>{children}</Primitive.Root>
    </MenuSizeContext.Provider>
  )
}
export type ContextMenuTriggerProps = Primitive.ContextMenuTriggerProps
export const ContextMenuTrigger = forwardRef<HTMLSpanElement, ContextMenuTriggerProps>(function ContextMenuTrigger(
  { disabled, onKeyDown, tabIndex, ...props },
  ref
) {
  assertMenuChild(props.asChild, props.children)
  return (
    <Primitive.Trigger
      {...props}
      ref={ref}
      disabled={disabled}
      tabIndex={tabIndex ?? (disabled ? -1 : 0)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (
          event.defaultPrevented ||
          disabled ||
          !(event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))
        )
          return
        event.preventDefault()
        const rect = event.currentTarget.getBoundingClientRect()
        // Use the primitive's contextmenu path so keyboard and pointer opening share positioning/state.
        event.currentTarget.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
          })
        )
      }}
    />
  )
})
export type ContextMenuPortalProps = Omit<Primitive.ContextMenuPortalProps, 'forceMount'>

const parts = createMenuParts(Primitive, 'ContextMenu')
export const ContextMenuPortal = parts.Portal
export const ContextMenuContent = parts.Content
export const ContextMenuItem = parts.Item
export const ContextMenuCheckboxItem = parts.CheckboxItem
export const ContextMenuRadioGroup = parts.RadioGroup
export const ContextMenuRadioItem = parts.RadioItem
export const ContextMenuGroup = parts.Group
export const ContextMenuLabel = parts.Label
export const ContextMenuSeparator = parts.Separator
export const ContextMenuSub = parts.Sub
export const ContextMenuSubTrigger = parts.SubTrigger
export const ContextMenuSubContent = parts.SubContent
export type {
  SharedMenuContentProps as ContextMenuContentProps,
  SharedMenuItemProps as ContextMenuItemProps,
  SharedMenuCheckboxItemProps as ContextMenuCheckboxItemProps,
  SharedMenuRadioGroupProps as ContextMenuRadioGroupProps,
  SharedMenuRadioItemProps as ContextMenuRadioItemProps,
  SharedMenuGroupProps as ContextMenuGroupProps,
  SharedMenuLabelProps as ContextMenuLabelProps,
  SharedMenuSeparatorProps as ContextMenuSeparatorProps,
  SharedMenuSubProps as ContextMenuSubProps,
  SharedMenuSubTriggerProps as ContextMenuSubTriggerProps,
  SharedMenuSubContentProps as ContextMenuSubContentProps,
} from './createMenuParts'
