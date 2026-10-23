import { forwardRef } from 'react'
import { DistributionSlider, type DistributionSliderProps } from '@pivot-ui/react'

/** @deprecated Segment lengths now use DistributionSlider's value/onValueChange/total API. */
export interface CascadeSliderProps extends Omit<DistributionSliderProps, 'onValueChange' | 'total' | 'onChange'> {
  onChange?: (value: number[]) => void
  max?: number
}

export const CascadeSlider = forwardRef<HTMLSpanElement, CascadeSliderProps>(function CascadeSlider(
  { onChange, max, ...props },
  ref
) {
  return <DistributionSlider {...props} ref={ref} total={max} onValueChange={onChange} />
})
