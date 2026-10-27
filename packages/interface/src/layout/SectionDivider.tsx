import { forwardRef, type HTMLAttributes } from 'react'
import { css, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

export interface SectionDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}

/** 带文字的分组标题线：文字两侧延伸出细线。命名文档结构里的一节时，用标题元素（h3 等）作为 children。 */
export const SectionDivider = forwardRef<HTMLDivElement, SectionDividerProps>(function SectionDivider(
  { children, css: cssProp, className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx(
        css(
          {
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            width: '100%',
            minWidth: 0,
            color: 'var(--colors-textMuted)',
            fontSize: 'var(--fontSizes-control)',
            '&::before, &::after': {
              content: '""',
              flex: '1 0 var(--space-6)',
              borderBottom: '1px solid var(--colors-border)',
            },
          },
          cssProp
        ),
        className
      )}>
      <div className={css({ minWidth: 0, overflowWrap: 'anywhere' })}>{children}</div>
    </div>
  )
})
