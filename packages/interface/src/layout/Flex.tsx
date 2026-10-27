import { forwardRef, type HTMLAttributes } from 'react'
import { css, cva, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

const flexRecipe = cva({
  base: { display: 'flex', boxSizing: 'border-box', minWidth: 0 },
  variants: {
    direction: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
      'row-reverse': { flexDirection: 'row-reverse' },
      'column-reverse': { flexDirection: 'column-reverse' },
    },
    gap: {
      none: { gap: '0' },
      xxs: { gap: 'var(--space-0_5)' },
      xs: { gap: 'var(--space-1)' },
      sm: { gap: 'var(--space-2)' },
      md: { gap: 'var(--space-3)' },
      lg: { gap: 'var(--space-4)' },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
      baseline: { alignItems: 'baseline' },
    },
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      evenly: { justifyContent: 'space-evenly' },
    },
    wrap: {
      nowrap: { flexWrap: 'nowrap' },
      wrap: { flexWrap: 'wrap' },
      'wrap-reverse': { flexWrap: 'wrap-reverse' },
    },
  },
  defaultVariants: { direction: 'row', gap: 'none', align: 'stretch', justify: 'start', wrap: 'nowrap' },
})

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  /** 主轴方向。 */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  /** 间距：`xxs` 2、`xs` 4、`sm` 8、`md` 12、`lg` 16。 */
  gap?: 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg'
  /** 交叉轴对齐。 */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  /** 主轴分布。 */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  /** 是否换行。 */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex(
  { direction, gap, align, justify, wrap, css: cssProp, className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx(css(flexRecipe.raw({ direction, gap, align, justify, wrap }), cssProp), className)}
    />
  )
})
