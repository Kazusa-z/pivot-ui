import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { createCollection, type CollectionKey } from '../../values/collection'

export interface BreadcrumbEntry {
  /** 稳定 key，`onNavigate` 回传它。 */
  key: CollectionKey
  /** 显示的文字。 */
  label: ReactNode
  /** 提供后渲染为链接，由浏览器导航。 */
  href?: string
  /** 禁用这一级。 */
  disabled?: boolean
}
export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** 路径上的每一级：`key`、`label`，可选 `href`；最后一级是当前位置。 */
  items: readonly BreadcrumbEntry[]
  /** 点击某一级时调用，应用切换到对应位置。 */
  onNavigate?: (key: CollectionKey) => void
  /** `sm` 20（默认，面板）、`md` 24。 */
  size?: 'sm' | 'md'
  /** 禁用整条路径。 */
  disabled?: boolean
  /** 替换默认的分隔符 `/`。 */
  separator?: ReactNode
  /** 追加 Panda 样式对象。 */
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
    gap: 'var(--space-1_5)',
    color: 'var(--colors-textMuted)',
    '& [data-breadcrumb-control]': {
      padding: 'var(--space-0_5) var(--space-1)',
      font: 'inherit',
      color: 'inherit',
      background: 'none',
      border: 0,
      borderRadius: 'var(--radii-control)',
      textDecoration: 'none',
      overflowWrap: 'anywhere',
    },
    '& :is(a, button)[data-breadcrumb-control]': {
      cursor: 'pointer',
      '&:hover': {
        color: 'var(--colors-textStrong)',
        backgroundColor: 'var(--colors-softBgHover)',
        textDecoration: 'none',
      },
      '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
    },
    '& [aria-current=page]': { color: 'var(--colors-textStrong)' },
    '& [aria-disabled=true]': { opacity: 0.5 },
  },
  variants: {
    size: {
      sm: { fontSize: 'var(--fontSizes-control)', minHeight: 'var(--sizes-controlXs)' },
      md: { fontSize: 'var(--fontSizes-controlLarge)', minHeight: 'var(--sizes-controlSm)' },
    },
  },
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
          gap: 'var(--space-1)',
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
