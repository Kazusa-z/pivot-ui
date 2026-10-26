import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

const valueRecipe = cva({
  base: {
    minWidth: 0,
    fontSize: 'var(--fontSizes-control)',
    lineHeight: 'var(--lineHeights-2)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    userSelect: 'text',
    color: 'var(--colors-textStrong)',
  },
  variants: { code: { true: { fontFamily: 'var(--fonts-mono)' } } },
})

export interface ReadonlyValueProps extends HTMLAttributes<HTMLDivElement> {
  /** Used for null, undefined or empty-string content. Zero is preserved. */
  emptyText?: ReactNode
  code?: boolean
  css?: SystemStyleObject
}

/** Present already-formatted content without parsing a property value or announcing live updates. */
export const ReadonlyValue = forwardRef<HTMLDivElement, ReadonlyValueProps>(function ReadonlyValue(
  { children, emptyText = '—', code, css: cssProp, className, ...props },
  ref
) {
  return (
    <div {...props} ref={ref} className={cx(css(valueRecipe.raw({ code }), cssProp), className)}>
      {children == null || children === '' ? emptyText : children}
    </div>
  )
})
