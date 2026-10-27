import { forwardRef, type HTMLAttributes } from 'react'
import { css, cva, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

const separatorRecipe = cva({
  base: { backgroundColor: 'var(--colors-border)', flexShrink: 0 },
  variants: {
    orientation: {
      horizontal: { height: '1px', width: '100%' },
      vertical: { width: '1px', height: '100%' },
    },
  },
  defaultVariants: { orientation: 'horizontal' },
})

export interface SeparatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role' | 'aria-orientation'> {
  /** 方向。 */
  orientation?: 'horizontal' | 'vertical'
  /** 纯装饰的线设为 `true`，对读屏隐藏；默认作为内容分组的分隔被读屏识别。 */
  decorative?: boolean
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', decorative = false, css: cssProp, className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-hidden={decorative ? true : props['aria-hidden']}
      aria-orientation={decorative ? undefined : orientation}
      data-orientation={orientation}
      className={cx(css(separatorRecipe.raw({ orientation }), cssProp), className)}
    />
  )
})
