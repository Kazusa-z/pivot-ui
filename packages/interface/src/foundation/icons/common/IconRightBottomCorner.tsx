import { forwardRef } from 'react'
import { IconFrame, type IconProps } from '../Icon'

export const IconRightBottomCorner = forwardRef<SVGSVGElement, IconProps>(function IconRightBottomCorner(props, ref) {
  return (
    <IconFrame xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" ref={ref} {...props}>
      <path fill="currentColor" d="M16 16H0L16 0z" />
    </IconFrame>
  )
})
