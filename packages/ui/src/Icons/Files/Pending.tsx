import { SVGProps, forwardRef } from 'react'
import { css } from '../../../styled-system/css'

const breathingClass = css({
  animationName: 'breathing',
  animationDuration: '2.6s',
  animationTimingFunction: 'ease',
  animationIterationCount: 'infinite',
})

const IconPendingFile = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  function IconPendingFile(props, forwardedRef) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="none" ref={forwardedRef} {...props}>
        <path
          className={breathingClass}
          fill="rgb(221 234 248 / 8%)"
          fillRule="evenodd"
          d="m60 0 40 40v66c0 7.732-6.268 14-14 14H14c-7.732 0-14-6.268-14-14V14C0 6.268 6.268 0 14 0h46Z"
          clipRule="evenodd"
        />
        <path
          fill="rgb(211 237 248 / 11%)"
          fillRule="evenodd"
          d="M100 40H74.707C66.975 40 60 33.025 60 25.293V0l40 40Z"
          clipRule="evenodd"
        />
      </svg>
    )
  }
)

export default IconPendingFile
