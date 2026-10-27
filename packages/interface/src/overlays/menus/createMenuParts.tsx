import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import * as Primitive from '@radix-ui/react-dropdown-menu'
import { IconCheck, IconChevronRight, IconMinus } from '@tabler/icons-react'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { KbdGroup, type KbdGroupProps } from '../../display/Kbd'
import { OverlayLayerContext, useOverlayLayer, useOverlayTheme } from '../shared'
import { assertMenuChild } from './slot'
import {
  getMenuContentClass,
  getMenuItemClass,
  getMenuLabelClass,
  getMenuSeparatorClass,
  menuClasses,
  type MenuSize,
} from './menu.styles'

export const MenuSizeContext = createContext<MenuSize>('sm')

type StyledProps = { css?: SystemStyleObject }
type ItemSlots = { icon?: ReactNode; shortcuts?: KbdGroupProps['shortcuts']; critical?: boolean }
export type SharedMenuItemProps = Primitive.DropdownMenuItemProps & StyledProps & ItemSlots
export type SharedMenuCheckboxItemProps = Primitive.DropdownMenuCheckboxItemProps & StyledProps & ItemSlots
export type SharedMenuRadioItemProps = Primitive.DropdownMenuRadioItemProps & StyledProps & ItemSlots
export type SharedMenuSubTriggerProps = Primitive.DropdownMenuSubTriggerProps & StyledProps & ItemSlots
export type SharedMenuContentProps = Omit<Primitive.DropdownMenuContentProps, 'forceMount'> & StyledProps
export type SharedMenuSubContentProps = Omit<Primitive.DropdownMenuSubContentProps, 'forceMount'> & StyledProps
type SharedMenuPortalProps = Omit<Primitive.DropdownMenuPortalProps, 'forceMount'>
export type SharedMenuLabelProps = Primitive.DropdownMenuLabelProps & StyledProps
export type SharedMenuSeparatorProps = Primitive.DropdownMenuSeparatorProps & StyledProps

type Parts = Pick<
  typeof Primitive,
  | 'Item'
  | 'CheckboxItem'
  | 'RadioItem'
  | 'SubTrigger'
  | 'Content'
  | 'SubContent'
  | 'Label'
  | 'Separator'
  | 'Group'
  | 'RadioGroup'
  | 'Sub'
  | 'ItemIndicator'
  | 'Portal'
>

// Put slots inside the actual child. A Fragment cannot receive Radix Slot's props or ref.
function itemChildren(
  children: ReactNode,
  asChild: boolean | undefined,
  icon: ReactNode,
  shortcuts: ItemSlots['shortcuts'],
  indicator?: ReactNode,
  submenu = false
) {
  assertMenuChild(asChild, children)
  const child = asChild && isValidElement<{ children?: ReactNode }>(children) ? children : null
  const content = (
    <>
      {indicator}
      {icon && (
        <span aria-hidden="true" className={menuClasses.icon}>
          {icon}
        </span>
      )}
      <span className={menuClasses.label}>{child ? child.props.children : children}</span>
      {shortcuts && <KbdGroup aria-hidden="true" shortcuts={shortcuts} size="xs" />}
      {submenu && <IconChevronRight aria-hidden="true" className={menuClasses.chevron} />}
    </>
  )
  return child ? cloneElement(child, undefined, content) : content
}

/** One shared anatomy; each adapter supplies its own Radix interaction context. */
export function createMenuParts(primitive: Parts, family: string) {
  const Portal = (props: SharedMenuPortalProps) => <primitive.Portal {...props} forceMount={undefined} />
  const Item = forwardRef<HTMLDivElement, SharedMenuItemProps>(function MenuItem(
    { css, className, children, icon, shortcuts, critical = false, asChild, ...props },
    ref
  ) {
    const size = useContext(MenuSizeContext)
    return (
      <primitive.Item
        {...props}
        asChild={asChild}
        ref={ref}
        className={cx(getMenuItemClass(size, critical, false, css), className)}>
        {itemChildren(children, asChild, icon, shortcuts)}
      </primitive.Item>
    )
  })
  const CheckboxItem = forwardRef<HTMLDivElement, SharedMenuCheckboxItemProps>(function MenuCheckboxItem(
    { css, className, children, icon, shortcuts, critical = false, asChild, checked, ...props },
    ref
  ) {
    const size = useContext(MenuSizeContext)
    const indicator = (
      <primitive.ItemIndicator aria-hidden="true" className={menuClasses.indicator}>
        {checked === 'indeterminate' ? <IconMinus size={12} /> : <IconCheck size={12} />}
      </primitive.ItemIndicator>
    )
    return (
      <primitive.CheckboxItem
        {...props}
        checked={checked}
        asChild={asChild}
        ref={ref}
        className={cx(getMenuItemClass(size, critical, true, css), className)}>
        {itemChildren(children, asChild, icon, shortcuts, indicator)}
      </primitive.CheckboxItem>
    )
  })
  const RadioItem = forwardRef<HTMLDivElement, SharedMenuRadioItemProps>(function MenuRadioItem(
    { css, className, children, icon, shortcuts, critical = false, asChild, ...props },
    ref
  ) {
    const size = useContext(MenuSizeContext)
    const indicator = (
      <primitive.ItemIndicator aria-hidden="true" className={menuClasses.indicator}>
        <span className={menuClasses.dot} />
      </primitive.ItemIndicator>
    )
    return (
      <primitive.RadioItem
        {...props}
        asChild={asChild}
        ref={ref}
        className={cx(getMenuItemClass(size, critical, true, css), className)}>
        {itemChildren(children, asChild, icon, shortcuts, indicator)}
      </primitive.RadioItem>
    )
  })
  const SubTrigger = forwardRef<HTMLDivElement, SharedMenuSubTriggerProps>(function MenuSubTrigger(
    { css, className, children, icon, shortcuts, critical = false, asChild, ...props },
    ref
  ) {
    const size = useContext(MenuSizeContext)
    return (
      <primitive.SubTrigger
        {...props}
        asChild={asChild}
        ref={ref}
        className={cx(getMenuItemClass(size, critical, false, css), className)}>
        {itemChildren(children, asChild, icon, shortcuts, undefined, true)}
      </primitive.SubTrigger>
    )
  })
  const Content = forwardRef<HTMLDivElement, SharedMenuContentProps>(function MenuContent(
    { css, className, sideOffset = 4, ...props },
    ref
  ) {
    const theme = useOverlayTheme()
    const { layer, style } = useOverlayLayer(css, props.style, props.asChild ? props.children : undefined)
    assertMenuChild(props.asChild, props.children)
    return (
      <OverlayLayerContext.Provider value={layer}>
        <primitive.Content
          {...props}
          {...theme}
          style={style}
          forceMount={undefined}
          sideOffset={sideOffset}
          ref={ref}
          className={cx(theme.className, getMenuContentClass(css), className)}
        />
      </OverlayLayerContext.Provider>
    )
  })
  const SubContent = forwardRef<HTMLDivElement, SharedMenuSubContentProps>(function MenuSubContent(
    { css, className, sideOffset = 4, ...props },
    ref
  ) {
    const theme = useOverlayTheme()
    const { layer, style } = useOverlayLayer(css, props.style, props.asChild ? props.children : undefined)
    assertMenuChild(props.asChild, props.children)
    return (
      <OverlayLayerContext.Provider value={layer}>
        <primitive.SubContent
          {...props}
          {...theme}
          style={style}
          forceMount={undefined}
          sideOffset={sideOffset}
          ref={ref}
          className={cx(theme.className, getMenuContentClass(css), className)}
        />
      </OverlayLayerContext.Provider>
    )
  })
  const Label = forwardRef<HTMLDivElement, SharedMenuLabelProps>(function MenuLabel({ css, className, ...props }, ref) {
    assertMenuChild(props.asChild, props.children)
    return <primitive.Label {...props} ref={ref} className={cx(getMenuLabelClass(css), className)} />
  })
  const Separator = forwardRef<HTMLDivElement, SharedMenuSeparatorProps>(function MenuSeparator(
    { css, className, ...props },
    ref
  ) {
    assertMenuChild(props.asChild, props.children)
    return <primitive.Separator {...props} ref={ref} className={cx(getMenuSeparatorClass(css), className)} />
  })
  const Group = forwardRef<HTMLDivElement, SharedMenuGroupProps>(function MenuGroup(props, ref) {
    assertMenuChild(props.asChild, props.children)
    return <primitive.Group {...props} ref={ref} />
  })
  const RadioGroup = forwardRef<HTMLDivElement, SharedMenuRadioGroupProps>(function MenuRadioGroup(props, ref) {
    assertMenuChild(props.asChild, props.children)
    return <primitive.RadioGroup {...props} ref={ref} />
  })
  for (const [name, component] of Object.entries({
    Item,
    CheckboxItem,
    RadioItem,
    SubTrigger,
    Content,
    SubContent,
    Label,
    Separator,
    Group,
    RadioGroup,
  }))
    component.displayName = `${family}${name}`
  return {
    Item,
    CheckboxItem,
    RadioItem,
    SubTrigger,
    Content,
    SubContent,
    Label,
    Separator,
    Group,
    RadioGroup,
    Portal,
    Sub: primitive.Sub,
  }
}

export type SharedMenuGroupProps = ComponentPropsWithoutRef<typeof Primitive.Group>
export type SharedMenuRadioGroupProps = ComponentPropsWithoutRef<typeof Primitive.RadioGroup>
export type SharedMenuSubProps = ComponentPropsWithoutRef<typeof Primitive.Sub>
