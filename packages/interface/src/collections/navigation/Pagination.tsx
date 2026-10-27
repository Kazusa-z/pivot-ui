import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { getPaginationState } from '../../values/pagination'

export interface PaginationLabels {
  navigation: string
  previous: string
  next: string
  page: (page: number) => string
  ellipsis: string
  empty: string
}
export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  /** 条目总数。 */
  totalCount: number
  /** 每页条目数。 */
  pageSize: number
  /** 当前页（从 1 开始，受控）。 */
  page?: number
  /** 非受控时的初始页，默认 1。 */
  defaultPage?: number
  /** 翻页请求。 */
  onPageChange?: (page: number) => void
  /** 当前页两侧显示的页码数，默认 1。 */
  siblingCount?: number
  /** 首尾始终显示的页码数，默认 1。 */
  boundaryCount?: number
  /** 禁用翻页，例如加载中。 */
  disabled?: boolean
  /** `sm` 24（面板）、`md` 32。 */
  size?: 'sm' | 'md'
  /** 导航区、前后页按钮、页码、省略号和空结果的文字。 */
  labels?: Partial<PaginationLabels>
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}
const defaults: PaginationLabels = {
  navigation: 'Pagination',
  previous: 'Previous page',
  next: 'Next page',
  page: (page) => `Page ${page}`,
  ellipsis: 'More pages',
  empty: 'No results',
}
const buttonRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 var(--space-1)',
    border: '1px solid var(--colors-border)',
    backgroundColor: 'var(--colors-softBg)',
    color: 'var(--colors-text)',
    borderRadius: 'var(--radii-control)',
    font: 'inherit',
    cursor: 'pointer',
    '&:hover:not(:disabled)': {
      backgroundColor: 'var(--colors-softBgHover)',
      borderColor: 'var(--colors-borderStrong)',
    },
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
    '&:disabled': { cursor: 'default', opacity: 0.5 },
    '&[aria-current=page]': {
      backgroundColor: 'var(--colors-selectionBg)',
      color: 'var(--colors-selectionText)',
      borderColor: 'var(--colors-selectionBorder)',
    },
  },
  variants: {
    size: {
      sm: {
        minWidth: 'var(--sizes-controlSm)',
        height: 'var(--sizes-controlSm)',
        fontSize: 'var(--fontSizes-control)',
      },
      md: {
        minWidth: 'var(--sizes-controlMd)',
        height: 'var(--sizes-controlMd)',
        fontSize: 'var(--fontSizes-controlLarge)',
        borderRadius: 'var(--radii-controlMd)',
      },
    },
  },
})

/** Controlled requests never change the displayed page until the parent accepts them. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    totalCount,
    pageSize,
    page,
    defaultPage = 1,
    onPageChange,
    siblingCount,
    boundaryCount,
    disabled = false,
    size = 'sm',
    labels,
    css: cssProp,
    className,
    ...props
  },
  ref
) {
  const [internal, setInternal] = useState(defaultPage)
  const state = getPaginationState({ totalCount, pageSize, page: page ?? internal, siblingCount, boundaryCount })
  const text = { ...defaults, ...labels }
  // A shrinking result invalidates the old uncontrolled page, without inventing an application request.
  useEffect(() => {
    if (page === undefined && internal !== state.page) setInternal(state.page)
  }, [page, internal, state.page])
  const request = (next: number) => {
    if (disabled || next < 1 || next > state.pageCount || next === state.page) return
    if (page === undefined) setInternal(next)
    onPageChange?.(next)
  }
  const buttonClass = css(buttonRecipe.raw({ size }))
  return (
    <nav
      {...props}
      ref={ref}
      aria-label={props['aria-label'] ?? text.navigation}
      className={cx(css({ color: 'var(--colors-text)', minWidth: 0 }, cssProp), className)}>
      {state.pageCount === 0 ? (
        <span className={css({ fontSize: 'var(--fontSizes-control)', color: 'var(--colors-textMuted)' })}>
          {text.empty}
        </span>
      ) : (
        <ol
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-1_5)',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            '& > li': { display: 'flex' },
          })}>
          <li>
            <button
              type="button"
              className={buttonClass}
              aria-label={text.previous}
              disabled={disabled || state.page <= 1}
              onClick={() => request(state.page - 1)}>
              <IconChevronLeft aria-hidden="true" size={14} />
            </button>
          </li>
          {state.items.map((item) => (
            <li key={item}>
              {typeof item === 'number' ? (
                <button
                  type="button"
                  className={buttonClass}
                  aria-label={text.page(item)}
                  aria-current={item === state.page ? 'page' : undefined}
                  disabled={disabled}
                  onClick={() => request(item)}>
                  {item}
                </button>
              ) : (
                <span
                  role="img"
                  aria-label={text.ellipsis}
                  className={css({ padding: '0 var(--space-1)', color: 'var(--colors-textMuted)' })}>
                  …
                </span>
              )}
            </li>
          ))}
          <li>
            <button
              type="button"
              className={buttonClass}
              aria-label={text.next}
              disabled={disabled || state.page >= state.pageCount}
              onClick={() => request(state.page + 1)}>
              <IconChevronRight aria-hidden="true" size={14} />
            </button>
          </li>
        </ol>
      )}
    </nav>
  )
})
