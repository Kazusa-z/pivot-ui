import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css, cva, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

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
  /** 内容为 null、undefined 或空字符串时显示的文字；数字 0 会正常显示。 */
  emptyText?: ReactNode
  /** 使用等宽字体，适合路径、哈希、标识符。 */
  code?: boolean
  /** 追加 Panda 样式对象。 */
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
