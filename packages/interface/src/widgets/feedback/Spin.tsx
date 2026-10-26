import { forwardRef, type HTMLAttributes } from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

const spinRecipe = cva({
  base: { display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' },
  variants: {
    size: {
      xs: { width: 'var(--sizes-iconXs)', height: 'var(--sizes-iconXs)' },
      sm: { width: 'var(--sizes-iconMd)', height: 'var(--sizes-iconMd)' },
      md: { width: 'var(--sizes-controlXs)', height: 'var(--sizes-controlXs)' },
    },
    color: {
      primary: { color: 'var(--colors-primary)' },
      inherit: { color: 'inherit' },
      default: { color: 'var(--colors-textStrong)' },
    },
  },
  defaultVariants: { size: 'md', color: 'primary' },
})
const ringClass = css({
  display: 'block',
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  borderRadius: 'var(--radii-pill)',
  border: '2px solid var(--colors-border)',
  borderLeftColor: 'currentColor',
  animationName: 'spin',
  animationDuration: '0.8s',
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
})

export interface SpinProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  size?: 'xs' | 'sm' | 'md'
  color?: 'primary' | 'inherit' | 'default'
  label?: string
  /** Use inside a control which already exposes its own accessible busy state. */
  decorative?: boolean
  css?: SystemStyleObject
}

export const Spin = forwardRef<HTMLSpanElement, SpinProps>(function Spin(
  { size, color, label = 'Loading', decorative = false, css: cssProp, className, children: _children, ...props },
  ref
) {
  return (
    <span
      {...props}
      ref={ref}
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative || props['aria-hidden'] || undefined}
      aria-label={decorative ? undefined : (props['aria-label'] ?? label)}
      className={cx(css(spinRecipe.raw({ size, color }), cssProp), className)}>
      <span aria-hidden="true" className={ringClass} />
    </span>
  )
})
