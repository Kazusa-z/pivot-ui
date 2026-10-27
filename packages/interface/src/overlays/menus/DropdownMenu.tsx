import * as Primitive from '@radix-ui/react-dropdown-menu'
import { forwardRef } from 'react'
import { MenuSizeContext, createMenuParts } from './createMenuParts'
import type { MenuSize } from './menu.styles'
import { assertMenuChild } from './slot'

export interface DropdownMenuRootProps extends Primitive.DropdownMenuProps {
  /** 菜单项高度，子菜单和 Portal 内容会继承：`xs` 20、`sm` 24（默认）、`md` 32。 */
  size?: MenuSize
}
export function DropdownMenuRoot({ size = 'sm', children, ...props }: DropdownMenuRootProps) {
  return (
    <MenuSizeContext.Provider value={size}>
      <Primitive.Root {...props}>{children}</Primitive.Root>
    </MenuSizeContext.Provider>
  )
}
export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger(props, ref) {
    assertMenuChild(props.asChild, props.children)
    return <Primitive.Trigger {...props} ref={ref} />
  }
)
export type DropdownMenuTriggerProps = Primitive.DropdownMenuTriggerProps
export type DropdownMenuPortalProps = Omit<Primitive.DropdownMenuPortalProps, 'forceMount'>

const parts = createMenuParts(Primitive, 'DropdownMenu')
export const DropdownMenuPortal = parts.Portal
export const DropdownMenuContent = parts.Content
export const DropdownMenuItem = parts.Item
export const DropdownMenuCheckboxItem = parts.CheckboxItem
export const DropdownMenuRadioGroup = parts.RadioGroup
export const DropdownMenuRadioItem = parts.RadioItem
export const DropdownMenuGroup = parts.Group
export const DropdownMenuLabel = parts.Label
export const DropdownMenuSeparator = parts.Separator
export const DropdownMenuSub = parts.Sub
export const DropdownMenuSubTrigger = parts.SubTrigger
export const DropdownMenuSubContent = parts.SubContent
export type {
  SharedMenuContentProps as DropdownMenuContentProps,
  SharedMenuItemProps as DropdownMenuItemProps,
  SharedMenuCheckboxItemProps as DropdownMenuCheckboxItemProps,
  SharedMenuRadioGroupProps as DropdownMenuRadioGroupProps,
  SharedMenuRadioItemProps as DropdownMenuRadioItemProps,
  SharedMenuGroupProps as DropdownMenuGroupProps,
  SharedMenuLabelProps as DropdownMenuLabelProps,
  SharedMenuSeparatorProps as DropdownMenuSeparatorProps,
  SharedMenuSubProps as DropdownMenuSubProps,
  SharedMenuSubTriggerProps as DropdownMenuSubTriggerProps,
  SharedMenuSubContentProps as DropdownMenuSubContentProps,
} from './createMenuParts'
