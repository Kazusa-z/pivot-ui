import { forwardRef } from 'react'
import { css, cx } from '../../../../styled-system/css'
import type { SystemStyleObject } from '../../../../styled-system/types'
import { IconFrame, type IconProps } from '../Icon'

export type ArrowDirection = 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right'

export interface ArrowProps extends IconProps {
  direction?: ArrowDirection
  size?: 'xs' | 'sm'
  animate?: boolean
  css?: SystemStyleObject
}

const rotations: Record<ArrowDirection, number> = {
  down: 0,
  left: 90,
  up: 180,
  right: -90,
  'down-left': 45,
  'up-left': 135,
  'up-right': -135,
  'down-right': -45,
}

const animatedClass = css({
  '@media (prefers-reduced-motion: no-preference)': { transition: 'transform 0.2s' },
})

/** 显示方向提示，适合折叠按钮或菜单项。点击与键盘操作由包含它的按钮处理。 */
export const Arrow = forwardRef<SVGSVGElement, ArrowProps>(function Arrow(
  { direction = 'down', size = 'sm', animate, css: cssProp, className, style, ...props },
  ref
) {
  return (
    <IconFrame
      viewBox="0 0 12 12"
      width={size === 'xs' ? 8 : 12}
      height={size === 'xs' ? 8 : 12}
      fill="currentColor"
      {...props}
      ref={ref}
      className={cx(animate && animatedClass, css(cssProp), className)}
      style={{ display: 'inline-block', flexShrink: 0, transform: `rotate(${rotations[direction]}deg)`, ...style }}>
      <path d="M0 3h12L6 9z" />
    </IconFrame>
  )
})
