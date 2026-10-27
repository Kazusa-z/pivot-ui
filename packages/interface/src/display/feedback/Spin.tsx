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
  /** 尺寸：`xs` 12、`sm` 16、`md` 20。 */
  size?: 'xs' | 'sm' | 'md'
  /** 颜色：`primary` 强调色，`inherit` 跟随文字色（放在按钮里），`default` 中性色。 */
  color?: 'primary' | 'inherit' | 'default'
  /** 无障碍名称，默认 "Loading"。 */
  label?: string
  /** 纯装饰：放在已经声明忙碌状态的控件里（例如加载中的按钮）时使用，不再单独播报。 */
  decorative?: boolean
  /** 追加 Panda 样式对象。 */
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
