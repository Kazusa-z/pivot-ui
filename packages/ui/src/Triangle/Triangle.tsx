import { forwardRef } from 'react'
import { Arrow, type ArrowDirection, type ArrowProps } from '@pivot-ui/react'

const directions = {
  top: 'up',
  bottom: 'down',
  left: 'left',
  right: 'right',
  lefttop: 'up-left',
  righttop: 'up-right',
  leftbottom: 'down-left',
  rightbottom: 'down-right',
} satisfies Record<string, ArrowDirection>

export interface TriangleProps extends Omit<ArrowProps, 'direction'> {
  direction?: keyof typeof directions
}

/** @deprecated Use Arrow from @pivot-ui/react. */
export const Triangle = forwardRef<SVGSVGElement, TriangleProps>(function Triangle(
  { direction = 'bottom', size, ...props },
  ref
) {
  return (
    <Arrow
      viewBox="0 3 12 6"
      width={size === 'xs' ? 8 : 12}
      height={size === 'xs' ? 4 : 6}
      size={size}
      {...props}
      direction={directions[direction]}
      ref={ref}
    />
  )
})
