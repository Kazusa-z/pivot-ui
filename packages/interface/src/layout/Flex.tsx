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
      xxs: { gap: '2px' },
      xs: { gap: '4px' },
      sm: { gap: '8px' },
      md: { gap: '12px' },
      lg: { gap: '16px' },
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
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  gap?: 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg'
  /** Alignment on the cross axis. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  /** Distribution on the main axis. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
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
