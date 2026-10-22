import { forwardRef } from 'react'
import { IconFrame, type IconProps } from '../Icon'
import { css } from '../../../../styled-system/css'

const breathingClass = css({
  '@media (prefers-reduced-motion: no-preference)': {
    animation: 'iconPendingPulse 2.6s ease-in-out infinite',
  },
})

export const IconPendingFile = forwardRef<SVGSVGElement, IconProps>(function IconPendingFile(props, ref) {
  return (
    <IconFrame
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 120"
      fill="none"
      width={100}
      height={120}
      ref={ref}
      {...props}>
      <path
        className={breathingClass}
        fill="var(--colors-surfaceSubtle)"
        fillRule="evenodd"
        d="m60 0 40 40v66c0 7.732-6.268 14-14 14H14c-7.732 0-14-6.268-14-14V14C0 6.268 6.268 0 14 0h46Z"
        clipRule="evenodd"
      />
      <path
        fill="var(--colors-border)"
        fillRule="evenodd"
        d="M100 40H74.707C66.975 40 60 33.025 60 25.293V0l40 40Z"
        clipRule="evenodd"
      />
    </IconFrame>
  )
})
