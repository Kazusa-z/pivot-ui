import React, {
  createContext,
  useContext,
  forwardRef,
  PropsWithChildren,
  ReactNode,
  isValidElement,
  Fragment,
} from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import * as MenubarPrimitive from '@radix-ui/react-menubar'
import { IconChevronRight, IconCheck } from '@tabler/icons-react'
import type {
  ContextMenuCheckboxItemProps,
  ContextMenuRadioItemProps,
  ContextMenuRadioGroupProps,
  ContextMenuGroupProps,
  ContextMenuProps,
  ContextMenuContentProps as ContextMenuContentProps,
} from '@radix-ui/react-context-menu'
import type {
  DropdownMenuProps,
  DropdownMenuContentProps,
  DropdownMenuCheckboxItemProps,
} from '@radix-ui/react-dropdown-menu'

import { styled } from '../../styled-system/jsx'
import {
  checkboxItemConfig,
  contentConfig,
  contextContentConfig,
  dotConfig,
  dropdownContentConfig,
  indicatorConfig,
  itemConfig,
  labelConfig,
  menuItemContentConfig,
  menubarRootConfig,
  menubarTriggerConfig,
  radioGroupConfig,
  separatorConfig,
  subMenuItemConfig,
} from './menuStyles'
import { KbdGroup } from '../Kbd'
import { ScrollArea } from '../ScrollArea'

type MenuType = 'context' | 'dropdown' | 'menubar'
type MenuSize = 'xs' | 'sm' | 'md'
type PickedContentProps = 'side' | 'sideOffset' | 'align' | 'alignOffset'

const StyledMenuItemContent = styled('span', menuItemContentConfig)

const anatomy = {
  context: {
    Root: ContextMenuPrimitive.Root,
    Group: ContextMenuPrimitive.Group,
    Sub: ContextMenuPrimitive.Sub,
    Portal: ContextMenuPrimitive.Portal,
    RadioGroup: styled(ContextMenuPrimitive.RadioGroup, radioGroupConfig),
    MenuLabel: styled(ContextMenuPrimitive.Label, labelConfig),
    MenuItem: styled(ContextMenuPrimitive.Item, itemConfig),
    Content: styled(ContextMenuPrimitive.Content, contextContentConfig),
    SubContent: styled(ContextMenuPrimitive.SubContent, contextContentConfig),
    SubMenuItem: styled(ContextMenuPrimitive.SubTrigger, subMenuItemConfig),
    Separator: styled(ContextMenuPrimitive.Separator, separatorConfig),
    CheckboxItem: styled(ContextMenuPrimitive.CheckboxItem, checkboxItemConfig),
    RadioItem: styled(ContextMenuPrimitive.RadioItem, checkboxItemConfig),
    ItemIndicator: styled(ContextMenuPrimitive.ItemIndicator, indicatorConfig),
  },
  dropdown: {
    Root: DropdownMenuPrimitive.Root,
    Group: DropdownMenuPrimitive.Group,
    RadioGroup: styled(DropdownMenuPrimitive.RadioGroup, radioGroupConfig),
    Sub: DropdownMenuPrimitive.Sub,
    Portal: DropdownMenuPrimitive.Portal,
    MenuLabel: styled(DropdownMenuPrimitive.Label, labelConfig),
    MenuItem: styled(DropdownMenuPrimitive.Item, itemConfig),
    Content: styled(DropdownMenuPrimitive.Content, dropdownContentConfig),
    SubContent: styled(DropdownMenuPrimitive.SubContent, dropdownContentConfig),
    SubMenuItem: styled(DropdownMenuPrimitive.SubTrigger, subMenuItemConfig),
    Separator: styled(DropdownMenuPrimitive.Separator, separatorConfig),
    CheckboxItem: styled(DropdownMenuPrimitive.CheckboxItem, checkboxItemConfig),
    RadioItem: styled(DropdownMenuPrimitive.RadioItem, checkboxItemConfig),
    ItemIndicator: styled(DropdownMenuPrimitive.ItemIndicator, indicatorConfig),
  },
  menubar: {
    Root: MenubarPrimitive.Root,
    Group: MenubarPrimitive.Group,
    RadioGroup: styled(MenubarPrimitive.RadioGroup, radioGroupConfig),
    Sub: MenubarPrimitive.Sub,
    Portal: MenubarPrimitive.Portal,
    MenuLabel: styled(MenubarPrimitive.Label, labelConfig),
    MenuItem: styled(MenubarPrimitive.Item, itemConfig),
    Content: styled(MenubarPrimitive.Content, contentConfig),
    SubContent: styled(MenubarPrimitive.SubContent, contentConfig),
    SubMenuItem: styled(MenubarPrimitive.SubTrigger, subMenuItemConfig),
    Separator: styled(MenubarPrimitive.Separator, separatorConfig),
    CheckboxItem: styled(MenubarPrimitive.CheckboxItem, checkboxItemConfig),
    RadioItem: styled(MenubarPrimitive.RadioItem, checkboxItemConfig),
    ItemIndicator: styled(MenubarPrimitive.ItemIndicator, indicatorConfig),
  },
} as const

function useResolveMenuAnatomy() {
  const ctx = useContext(MenuContext)
  const ret = anatomy[ctx.type]

  if (!ret) {
    throw new Error(`Cannot resolve Primitive Component by type ${ctx.type}`)
  }

  return ret
}

const MenuContext = createContext<{ type: MenuType; size: MenuSize }>({
  type: 'dropdown',
  size: 'sm',
})
MenuContext.displayName = 'MenuContext'

const MenuProvider = function MenuProvider(props: PropsWithChildren<{ type: MenuType; size: MenuSize }>) {
  return <MenuContext.Provider value={{ type: props.type, size: props.size }}>{props.children}</MenuContext.Provider>
}

export interface MenuItemProps {
  icon?: ReactNode
  name?: string
  label?: string
  shortcuts?: string[] | string
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  onSelect?: (e: Event) => void
  critical?: boolean
  children?: ReactNode
  asChild?: boolean
}

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(props, forwardedRef) {
  const { icon, name, shortcuts, label, disabled, onSelect, onClick, asChild, critical, children, ...rest } = props
  const { size } = useContext(MenuContext)
  const { MenuItem: Item } = useResolveMenuAnatomy()

  return (
    <Item
      ref={forwardedRef}
      disabled={disabled}
      onSelect={onSelect}
      onClick={onClick}
      size={size}
      critical={critical}
      asChild={asChild}
      {...rest}>
      {isValidElement(children) ? (
        children
      ) : (
        <Fragment>
          <StyledMenuItemContent>
            {icon}
            {name}
          </StyledMenuItemContent>
          <KbdGroup shortcuts={shortcuts} />
        </Fragment>
      )}
    </Item>
  )
})

type ISubMenuItemProps = {
  name: string
  icon?: ReactNode
  disabled?: boolean
}

interface MenuContentProps
  extends ContextMenuContentProps, DropdownMenuContentProps, MenubarPrimitive.MenubarContentProps {
  hidden?: boolean
}

const Content = forwardRef<HTMLDivElement, MenuContentProps>(function Content(props: MenuContentProps, ref) {
  const { Content: PrimitiveContent } = useResolveMenuAnatomy()
  const { size } = useContext(MenuContext)
  return <PrimitiveContent size={size} ref={ref} {...props} />
})

/* -------------------------------------------------------------------------- */
/*                                 SubMenuItem                                */
/* -------------------------------------------------------------------------- */

function SubMenuItem(props: PropsWithChildren<ISubMenuItemProps>) {
  const { name, icon, disabled, children } = props
  const { size } = useContext(MenuContext)
  const { SubMenuItem: SubItem, SubContent, Sub, Portal } = useResolveMenuAnatomy()

  return (
    <Sub>
      <SubItem size={size} disabled={disabled}>
        <StyledMenuItemContent>
          {icon}
          {name}
        </StyledMenuItemContent>
        <IconChevronRight size="12px" />
      </SubItem>
      <Portal>
        <SubContent>
          <ScrollArea type="always" subtle={false} asContainer>
            {children}
          </ScrollArea>
        </SubContent>
      </Portal>
    </Sub>
  )
}

interface GroupProps extends ContextMenuGroupProps {
  label?: string
  divider?: 'top' | 'both' | 'bottom' | boolean
}

function MenuGroup(props: GroupProps) {
  const { Group, MenuLabel } = useResolveMenuAnatomy()
  const { label, divider, children, ...rest } = props
  const dividerVal = typeof divider === 'boolean' && divider ? 'bottom' : divider
  const showTopDivider = dividerVal === 'top' || dividerVal === 'both'
  const showBottomDivider = dividerVal === 'bottom' || dividerVal === 'both'

  return (
    <React.Fragment>
      {showTopDivider && <MenuSeparator />}
      <Group {...rest}>
        {label && <MenuLabel data-menu-label>{label}</MenuLabel>}
        {children}
      </Group>
      {showBottomDivider && <MenuSeparator />}
    </React.Fragment>
  )
}

interface ICheckboxItemProps extends ContextMenuCheckboxItemProps, DropdownMenuCheckboxItemProps {
  name: string
  icon?: ReactNode
}

function MenuCheckboxItem(props: ICheckboxItemProps) {
  const { name, icon, ...rest } = props
  const { size } = useContext(MenuContext)
  const { CheckboxItem: StyledCheckboxItem, ItemIndicator } = useResolveMenuAnatomy()

  return (
    <StyledCheckboxItem {...rest} size={size}>
      <ItemIndicator>
        <IconCheck />
      </ItemIndicator>
      <StyledMenuItemContent>
        {icon}
        {name}
      </StyledMenuItemContent>
    </StyledCheckboxItem>
  )
}

interface RadioItemProps extends ContextMenuRadioItemProps {
  name: string
}

const DotIndicator = styled('div', dotConfig)

function RadioItem(props: RadioItemProps) {
  const { value, onSelect, name } = props
  const { RadioItem: StyledRadioItem, ItemIndicator } = useResolveMenuAnatomy()

  return (
    <StyledRadioItem value={value} onSelect={onSelect}>
      <ItemIndicator>
        <DotIndicator />
      </ItemIndicator>
      {name}
    </StyledRadioItem>
  )
}

interface RadioGroupProps extends ContextMenuRadioGroupProps {
  items: RadioItemProps[]
  label?: string
}

function MenuRadioGroup(props: RadioGroupProps) {
  const { items, label, ...rest } = props
  const { RadioGroup: RadioGroupPrimitive, MenuLabel } = useResolveMenuAnatomy()
  const { size } = useContext(MenuContext)

  return (
    <RadioGroupPrimitive {...rest} size={size}>
      {label && <MenuLabel data-menu-label>{label}</MenuLabel>}
      {items.map((item, index) => (
        <RadioItem key={index} {...item} />
      ))}
    </RadioGroupPrimitive>
  )
}

function MenuSeparator() {
  const { Separator: StyledSeparator } = useResolveMenuAnatomy()
  return <StyledSeparator />
}

type IDropdownMenuProps = Pick<DropdownMenuContentProps, PickedContentProps> &
  DropdownMenuProps & {
    trigger: React.ReactNode
    size?: MenuSize
    sideOffset?: number
    disabled?: boolean
    portal?: Element | boolean
  }

function DropdownMenu(props: PropsWithChildren<IDropdownMenuProps>) {
  const {
    children,
    portal = true,
    size = 'sm',
    side,
    sideOffset = 4,
    align = 'start',
    alignOffset,
    disabled = false,
    ...rest
  } = props

  let Portal: any = Fragment
  let container: Element

  if (portal) {
    Portal = DropdownMenuPrimitive.Portal
    if (typeof portal === 'object') {
      container = portal
    }
  }

  const portalProps = Portal === Fragment ? {} : { container }

  return (
    <MenuProvider type="dropdown" size={size}>
      <DropdownMenuPrimitive.Root modal={false} {...rest}>
        <DropdownMenuPrimitive.Trigger disabled={disabled} asChild>
          {props.trigger}
        </DropdownMenuPrimitive.Trigger>
        <Portal {...portalProps}>
          <Content side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}>
            <ScrollArea type="always" subtle={false} asContainer>
              {children}
            </ScrollArea>
          </Content>
        </Portal>
      </DropdownMenuPrimitive.Root>
    </MenuProvider>
  )
}

type IContextMenuProps = ContextMenuProps & {
  trigger: React.ReactNode
  size?: MenuSize
  asChild?: boolean
  onPointerDownOutside?: (e: any) => void
  hidden?: boolean
  portal?: Element | boolean
  disabled?: boolean
}

function ContextMenu(props: IContextMenuProps) {
  const {
    trigger,
    size = 'sm',
    children,
    onOpenChange,
    onPointerDownOutside,
    portal = true,
    asChild,
    disabled = false,
    hidden,
  } = props

  let Portal: any = Fragment
  let container: Element

  if (portal) {
    Portal = ContextMenuPrimitive.Portal
    if (typeof portal === 'object') {
      container = portal
    }
  }

  return (
    <MenuProvider type="context" size={size}>
      <ContextMenuPrimitive.Root onOpenChange={onOpenChange}>
        <ContextMenuPrimitive.Trigger disabled={disabled} asChild={asChild}>
          {trigger}
        </ContextMenuPrimitive.Trigger>
        <Portal container={container}>
          <Content hidden={hidden} onPointerDownOutside={onPointerDownOutside}>
            <ScrollArea type="always" subtle={false} asContainer>
              {children}
            </ScrollArea>
          </Content>
        </Portal>
      </ContextMenuPrimitive.Root>
    </MenuProvider>
  )
}

const StyledMenubarTrigger = styled(MenubarPrimitive.Trigger, menubarTriggerConfig)

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>((props, ref) => <StyledMenubarTrigger ref={ref} {...props} />)
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

interface MenubarItemProps {
  name: string
  children?: ReactNode
}

function MenubarItem(props: MenubarItemProps) {
  const { name } = props
  return (
    <MenubarPrimitive.Menu>
      <MenubarTrigger>{name}</MenubarTrigger>
      <MenubarPrimitive.Portal>
        <Content align="start" alignOffset={-4} sideOffset={4}>
          {props.children}
        </Content>
      </MenubarPrimitive.Portal>
    </MenubarPrimitive.Menu>
  )
}

const StyledMenubarRoot = styled(MenubarPrimitive.Root, menubarRootConfig)

function Menubar(props: PropsWithChildren<{ size?: MenuSize }>) {
  const { size = 'sm' } = props
  return (
    <MenuProvider type="menubar" size={size}>
      <StyledMenubarRoot>{props.children}</StyledMenubarRoot>
    </MenuProvider>
  )
}

export {
  Menubar,
  MenubarItem,
  DropdownMenu,
  ContextMenu,
  MenuItem,
  SubMenuItem,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuGroup,
}
