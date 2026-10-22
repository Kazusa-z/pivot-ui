import { forwardRef } from 'react'
import { Callout as BaseCallout, type CalloutProps as BaseCalloutProps } from '@pivot-ui/react'

/** Legacy type alias, removed with the old package in B11. */
export interface CalloutProps extends BaseCalloutProps {
  type?: BaseCalloutProps['severity']
}

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout({ type, severity, ...props }, ref) {
  return <BaseCallout {...props} ref={ref} severity={severity ?? type} />
})
