import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { createCollection, type CollectionKey } from '../../values/collection'

export interface BreadcrumbEntry {
  key: CollectionKey
  label: ReactNode
  href?: string
  disabled?: boolean
}
export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: readonly BreadcrumbEntry[]
  onNavigate?: (key: CollectionKey) => void
  size?: 'sm' | 'md'
  disabled?: boolean
  separator?: ReactNode
  css?: SystemStyleObject
}
export interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {
  current?: boolean
  href?: string
  onNavigate?: () => void
  disabled?: boolean
  size?: 'sm' | 'md'
  separator?: ReactNode
  css?: SystemStyleObject
}
const itemRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,
    gap: '6px',
    color: 'var(--colors-textMuted)',
    '& [data-breadcrumb-control]': {
      padding: '2px 4px',
      font: 'inherit',
      color: 'inherit',
      background: 'none',
      border: 0,
      borderRadius: '3px',
      textDecoration: 'none',
      overflowWrap: 'anywhere',
    },
    '& :is(a, button)[data-breadcrumb-control]': {
      cursor: 'pointer',
      '&:hover': { color: 'var(--colors-textStrong)', textDecoration: 'underline' },
      '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
    },
    '& [aria-current=page]': { color: 'var(--colors-textStrong)' },
    '& [aria-disabled=true]': { opacity: 0.5 },
  },
  variants: { size: { sm: { fontSize: '12px', minHeight: '20px' }, md: { fontSize: '14px', minHeight: '24px' } } },
})
/** One li including its decorative separator; the current page is readable text. */
export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { current, href, onNavigate, disabled, size = 'sm', separator = '/', css: cssProp, className, children, ...props },
  ref
) {
  return (
    <li {...props} ref={ref} className={cx(css(itemRecipe.raw({ size }), cssProp), className)}>
      {current || disabled || (!href && !onNavigate) ? (
        <span
          data-breadcrumb-control=""
          aria-current={current ? 'page' : undefined}
          aria-disabled={disabled || undefined}>
          {children}
        </span>
      ) : href ? (
        <a data-breadcrumb-control="" href={href} onClick={() => onNavigate?.()}>
          {children}
        </a>
      ) : (
        <button type="button" data-breadcrumb-control="" onClick={onNavigate}>
          {children}
        </button>
      )}
      {!current && separator != null && <span aria-hidden="true">{separator}</span>}
    </li>
  )
})

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, onNavigate, size, disabled, separator, css: cssProp, className, ...props },
  ref
) {
  const collection = createCollection(items, (item) => item.key)
  return (
    <nav
      {...props}
      ref={ref}
      aria-label={props['aria-label'] ?? 'Breadcrumb'}
      className={cx(css({ minWidth: 0 }, cssProp), className)}>
      <ol
        className={css({
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '4px',
          margin: 0,
          padding: 0,
          listStyle: 'none',
        })}>
        {collection.items.map((item, index) => (
          <BreadcrumbItem
            key={`${typeof item.key}:${String(item.key)}`}
            current={index === items.length - 1}
            href={item.href}
            onNavigate={onNavigate ? () => onNavigate(item.key) : undefined}
            disabled={disabled || item.disabled}
            size={size}
            separator={separator}>
            {item.label}
          </BreadcrumbItem>
        ))}
      </ol>
    </nav>
  )
})
