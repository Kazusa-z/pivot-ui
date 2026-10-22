import { forwardRef, type HTMLAttributes } from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

const progressRecipe = cva({
  base: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'var(--colors-softBg)',
    borderRadius: '9999px',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  variants: { size: { sm: { height: '4px' }, md: { height: '6px' }, lg: { height: '8px' } } },
  defaultVariants: { size: 'md' },
})
const indicatorClass = css({
  height: '100%',
  borderRadius: 'inherit',
  backgroundColor: 'var(--colors-selectionBg)',
  transition: 'width .2s ease-out',
  '&[data-state="indeterminate"]': {
    opacity: 0.6,
    backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 4px, var(--colors-softBg) 4px 8px)',
  },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number | null
  max?: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
  getValueLabel?: (value: number, max: number) => string
  css?: SystemStyleObject
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value: rawValue, max: rawMax = 100, size, label = 'Progress', getValueLabel, css: cssProp, className, ...props },
  ref
) {
  const max = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : 100
  const value = rawValue == null || !Number.isFinite(rawValue) ? null : Math.max(0, Math.min(max, rawValue))
  const state = value === null ? 'indeterminate' : value === max ? 'complete' : 'loading'
  return (
    <div
      {...props}
      ref={ref}
      role="progressbar"
      aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : label)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value ?? undefined}
      aria-valuetext={props['aria-valuetext'] ?? (value === null ? undefined : getValueLabel?.(value, max))}
      data-state={state}
      data-value={value ?? undefined}
      data-max={max}
      className={cx(css(progressRecipe.raw({ size }), cssProp), className)}>
      <div
        aria-hidden="true"
        data-state={state}
        className={indicatorClass}
        style={{ width: value === null ? '100%' : `${(value / max) * 100}%` }}
      />
    </div>
  )
})
