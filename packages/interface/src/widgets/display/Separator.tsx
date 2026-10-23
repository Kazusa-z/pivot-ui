import { forwardRef, type HTMLAttributes } from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

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
  orientation?: 'horizontal' | 'vertical'
  /** Decorative lines are hidden from assistive technology. */
  decorative?: boolean
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
