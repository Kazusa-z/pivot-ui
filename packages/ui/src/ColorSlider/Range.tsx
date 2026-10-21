import { forwardRef, useMemo } from 'react'
import { styled } from '../../styled-system/jsx'

import { generateLinearGradient, type Color } from '../ColorPicker/helper'

export const StyledTrack = styled('div', {
  base: {
    position: 'relative',
    width: '100%',
    height: '16px',
    borderRadius: '2px',
    boxShadow: 'inset 0 0 0 1px var(--colors-grayA5)',
    overflow: 'hidden',
    backgroundSize: '100% 100%',
    backgroundImage:
      'linear-gradient(45deg, #b0b0b0 25%, transparent 25%), linear-gradient(-45deg, #b0b0b0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #b0b0b0 75%), linear-gradient(-45deg, #fff 75%, #b0b0b0 75%)',
    backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
    '& > div:nth-child(1)': { position: 'absolute', inset: 0 },
  },
})

interface RangeProps {
  colors: Color[]
  positions: number[]
}

export const Range = forwardRef<HTMLDivElement, RangeProps>(function Range(props: RangeProps, forwardedRef) {
  const { colors, positions } = props

  const backgroundImage = useMemo(() => {
    return generateLinearGradient(colors, positions)
  }, [colors, positions])

  return (
    <StyledTrack ref={forwardedRef}>
      <div style={{ backgroundImage }} />
    </StyledTrack>
  )
})
