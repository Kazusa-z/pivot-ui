import { forwardRef, type HTMLAttributes } from 'react'
import {
  Breadcrumbs as NewBreadcrumbs,
  BreadcrumbItem as NewBreadcrumbItem,
  type BreadcrumbsProps,
  type BreadcrumbItemProps as NewBreadcrumbItemProps,
} from '@pivot-ui/react'

export interface BreadcrumbProps extends Omit<BreadcrumbsProps, 'items'> {
  items: readonly { id: string | number; label: string; href?: string; disabled?: boolean }[]
}
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumbs({ items, ...props }, ref) {
  return <NewBreadcrumbs {...props} ref={ref} items={items.map(({ id, ...item }) => ({ ...item, key: id }))} />
})
export interface BreadcrumbItemProps extends Omit<NewBreadcrumbItemProps, 'current'> {
  isCurrent?: boolean
  onClick?: HTMLAttributes<HTMLLIElement>['onClick']
}
export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { isCurrent, disabled, onClick, onNavigate, ...props },
  ref
) {
  return (
    <NewBreadcrumbItem
      {...props}
      ref={ref}
      current={isCurrent}
      disabled={disabled}
      onClick={disabled || isCurrent ? undefined : onClick}
      onNavigate={disabled || isCurrent ? undefined : (onNavigate ?? (onClick ? () => {} : undefined))}
    />
  )
})
