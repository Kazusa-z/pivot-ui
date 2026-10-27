import { forwardRef, useContext } from 'react'
import * as Primitive from '@radix-ui/react-menubar'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { MenuSizeContext, createMenuParts } from './createMenuParts'
import { getMenubarClass, getMenubarTriggerClass, type MenuSize } from './menu.styles'
import { assertMenuChild } from './slot'

export interface MenubarRootProps extends Primitive.MenubarProps {
  size?: MenuSize
  css?: SystemStyleObject
}
export const MenubarRoot = forwardRef<HTMLDivElement, MenubarRootProps>(function MenubarRoot(
  { size = 'sm', css, className, children, ...props },
  ref
) {
  assertMenuChild(props.asChild, children)
  return (
    <MenuSizeContext.Provider value={size}>
      <Primitive.Root {...props} ref={ref} className={cx(getMenubarClass(css), className)}>
        {children}
      </Primitive.Root>
    </MenuSizeContext.Provider>
  )
})
export const MenubarMenu = Primitive.Menu
export type MenubarMenuProps = Primitive.MenubarMenuProps
export interface MenubarTriggerProps extends Primitive.MenubarTriggerProps {
  css?: SystemStyleObject
}
export const MenubarTrigger = forwardRef<HTMLButtonElement, MenubarTriggerProps>(function MenubarTrigger(
  { css, className, ...props },
  ref
) {
  const size = useContext(MenuSizeContext)
  assertMenuChild(props.asChild, props.children)
  return <Primitive.Trigger {...props} ref={ref} className={cx(getMenubarTriggerClass(size, css), className)} />
})
export type MenubarPortalProps = Omit<Primitive.MenubarPortalProps, 'forceMount'>

const parts = createMenuParts(Primitive, 'Menubar')
export const MenubarPortal = parts.Portal
export const MenubarContent = parts.Content
export const MenubarItem = parts.Item
export const MenubarCheckboxItem = parts.CheckboxItem
export const MenubarRadioGroup = parts.RadioGroup
export const MenubarRadioItem = parts.RadioItem
export const MenubarGroup = parts.Group
export const MenubarLabel = parts.Label
export const MenubarSeparator = parts.Separator
export const MenubarSub = parts.Sub
export const MenubarSubTrigger = parts.SubTrigger
export const MenubarSubContent = parts.SubContent
export type {
  SharedMenuContentProps as MenubarContentProps,
  SharedMenuItemProps as MenubarItemProps,
  SharedMenuCheckboxItemProps as MenubarCheckboxItemProps,
  SharedMenuRadioGroupProps as MenubarRadioGroupProps,
  SharedMenuRadioItemProps as MenubarRadioItemProps,
  SharedMenuGroupProps as MenubarGroupProps,
  SharedMenuLabelProps as MenubarLabelProps,
  SharedMenuSeparatorProps as MenubarSeparatorProps,
  SharedMenuSubProps as MenubarSubProps,
  SharedMenuSubTriggerProps as MenubarSubTriggerProps,
  SharedMenuSubContentProps as MenubarSubContentProps,
} from './createMenuParts'
