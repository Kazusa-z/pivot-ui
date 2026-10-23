import { createContext, forwardRef, useContext, type ComponentType, type ReactNode } from 'react'
import * as Menu from '@pivot-ui/react'

// B11 removes these convenience adapters. All menu behavior and visuals live in @pivot-ui/react.
type MenuKind = 'dropdown' | 'context' | 'menubar'
const LegacyMenuContext = createContext<MenuKind>('dropdown')
const families = {
  dropdown: {
    Item: Menu.DropdownMenuItem,
    Sub: Menu.DropdownMenuSub,
    SubTrigger: Menu.DropdownMenuSubTrigger,
    SubContent: Menu.DropdownMenuSubContent,
    Portal: Menu.DropdownMenuPortal,
    Group: Menu.DropdownMenuGroup,
    Label: Menu.DropdownMenuLabel,
    Separator: Menu.DropdownMenuSeparator,
    CheckboxItem: Menu.DropdownMenuCheckboxItem,
    RadioGroup: Menu.DropdownMenuRadioGroup,
    RadioItem: Menu.DropdownMenuRadioItem,
  },
  context: {
    Item: Menu.ContextMenuItem,
    Sub: Menu.ContextMenuSub,
    SubTrigger: Menu.ContextMenuSubTrigger,
    SubContent: Menu.ContextMenuSubContent,
    Portal: Menu.ContextMenuPortal,
    Group: Menu.ContextMenuGroup,
    Label: Menu.ContextMenuLabel,
    Separator: Menu.ContextMenuSeparator,
    CheckboxItem: Menu.ContextMenuCheckboxItem,
    RadioGroup: Menu.ContextMenuRadioGroup,
    RadioItem: Menu.ContextMenuRadioItem,
  },
  menubar: {
    Item: Menu.MenubarItem,
    Sub: Menu.MenubarSub,
    SubTrigger: Menu.MenubarSubTrigger,
    SubContent: Menu.MenubarSubContent,
    Portal: Menu.MenubarPortal,
    Group: Menu.MenubarGroup,
    Label: Menu.MenubarLabel,
    Separator: Menu.MenubarSeparator,
    CheckboxItem: Menu.MenubarCheckboxItem,
    RadioGroup: Menu.MenubarRadioGroup,
    RadioItem: Menu.MenubarRadioItem,
  },
}
function useParts() {
  return families[useContext(LegacyMenuContext)]
}

export interface MenuItemProps extends Menu.DropdownMenuItemProps {
  name?: string
  label?: string
}
export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { name, label, children, ...props },
  ref
) {
  const { Item } = useParts()
  return (
    <Item {...props} ref={ref}>
      {children ?? name ?? label}
    </Item>
  )
})

export function SubMenuItem({
  name,
  icon,
  disabled,
  children,
}: {
  name: string
  icon?: ReactNode
  disabled?: boolean
  children?: ReactNode
}) {
  const { Sub, SubTrigger, SubContent, Portal } = useParts()
  return (
    <Sub>
      <SubTrigger icon={icon} disabled={disabled}>
        {name}
      </SubTrigger>
      <Portal>
        <SubContent>{children}</SubContent>
      </Portal>
    </Sub>
  )
}

export function MenuSeparator(props: Menu.DropdownMenuSeparatorProps) {
  const { Separator } = useParts()
  return <Separator {...props} />
}

interface GroupProps extends Menu.DropdownMenuGroupProps {
  label?: string
  divider?: 'top' | 'both' | 'bottom' | boolean
}
export function MenuGroup({ label, divider, children, ...props }: GroupProps) {
  const { Group, Label } = useParts()
  return (
    <>
      {(divider === 'top' || divider === 'both') && <MenuSeparator />}
      <Group {...props}>
        {label && <Label>{label}</Label>}
        {children}
      </Group>
      {(divider === true || divider === 'bottom' || divider === 'both') && <MenuSeparator />}
    </>
  )
}

interface CheckboxItemProps extends Menu.DropdownMenuCheckboxItemProps {
  name: string
}
export function MenuCheckboxItem({ name, children, ...props }: CheckboxItemProps) {
  const { CheckboxItem } = useParts()
  return <CheckboxItem {...props}>{children ?? name}</CheckboxItem>
}

interface RadioItemProps extends Menu.DropdownMenuRadioItemProps {
  name: string
}
interface RadioGroupProps extends Menu.DropdownMenuRadioGroupProps {
  items: RadioItemProps[]
  label?: string
}
export function MenuRadioGroup({ items, label, ...props }: RadioGroupProps) {
  const { RadioGroup, RadioItem, Label } = useParts()
  return (
    <RadioGroup {...props}>
      {label && <Label>{label}</Label>}
      {items.map(({ name, children, ...item }) => (
        <RadioItem key={item.value} {...item}>
          {children ?? name}
        </RadioItem>
      ))}
    </RadioGroup>
  )
}

function OptionalPortal({
  portal,
  component: Portal,
  children,
}: {
  portal: Element | boolean
  component: ComponentType<Menu.DropdownMenuPortalProps>
  children: ReactNode
}) {
  return portal ? <Portal container={typeof portal === 'object' ? portal : undefined}>{children}</Portal> : children
}

type DropdownMenuProps = Menu.DropdownMenuRootProps &
  Pick<Menu.DropdownMenuContentProps, 'side' | 'sideOffset' | 'align' | 'alignOffset'> & {
    trigger: ReactNode
    disabled?: boolean
    portal?: Element | boolean
  }
export function DropdownMenu({
  trigger,
  children,
  portal = true,
  disabled,
  side,
  sideOffset = 4,
  align = 'start',
  alignOffset,
  ...props
}: DropdownMenuProps) {
  return (
    <LegacyMenuContext.Provider value="dropdown">
      <Menu.DropdownMenuRoot modal={false} {...props}>
        <Menu.DropdownMenuTrigger asChild disabled={disabled}>
          {trigger}
        </Menu.DropdownMenuTrigger>
        <OptionalPortal portal={portal} component={Menu.DropdownMenuPortal}>
          <Menu.DropdownMenuContent side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}>
            {children}
          </Menu.DropdownMenuContent>
        </OptionalPortal>
      </Menu.DropdownMenuRoot>
    </LegacyMenuContext.Provider>
  )
}

type ContextMenuProps = Menu.ContextMenuRootProps & {
  trigger: ReactNode
  asChild?: boolean
  onPointerDownOutside?: Menu.ContextMenuContentProps['onPointerDownOutside']
  hidden?: boolean
  portal?: Element | boolean
  disabled?: boolean
}
export function ContextMenu({
  trigger,
  children,
  asChild,
  onPointerDownOutside,
  hidden,
  portal = true,
  disabled,
  ...props
}: ContextMenuProps) {
  return (
    <LegacyMenuContext.Provider value="context">
      <Menu.ContextMenuRoot {...props}>
        <Menu.ContextMenuTrigger asChild={asChild} disabled={disabled}>
          {trigger}
        </Menu.ContextMenuTrigger>
        <OptionalPortal portal={portal} component={Menu.ContextMenuPortal}>
          <Menu.ContextMenuContent hidden={hidden} onPointerDownOutside={onPointerDownOutside}>
            {children}
          </Menu.ContextMenuContent>
        </OptionalPortal>
      </Menu.ContextMenuRoot>
    </LegacyMenuContext.Provider>
  )
}

export function MenubarItem({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <Menu.MenubarMenu>
      <Menu.MenubarTrigger>{name}</Menu.MenubarTrigger>
      <Menu.MenubarPortal>
        <Menu.MenubarContent align="start" alignOffset={-4}>
          {children}
        </Menu.MenubarContent>
      </Menu.MenubarPortal>
    </Menu.MenubarMenu>
  )
}
export function Menubar(props: Menu.MenubarRootProps) {
  return (
    <LegacyMenuContext.Provider value="menubar">
      <Menu.MenubarRoot {...props} />
    </LegacyMenuContext.Provider>
  )
}
