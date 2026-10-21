import React, { forwardRef, SVGProps } from 'react'

import { styled } from '../../styled-system/jsx'
import { TransparentPattern } from './TransparentPattern'
import { Flex } from '../Flex'
import { Color, ColorSpace, ColorPickerMode, ParticleColor, GradientColor, generatePreviewColor } from './helper'
import { useColorSpaceConversion } from './useColorSpaceConversion'

function IconHDR(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="6"
      viewBox="0 0 15 6"
      fill="none"
      stroke="CurrentColor"
      {...props}>
      <g clipPath="url(#clip0_28_2)">
        <path
          d="M1 1V3.1875M1 3.1875V5.375M1 3.1875H3.8125M3.8125 3.1875V1M3.8125 3.1875V5.375"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 5.375V3.625M11 3.625V1H12.7857C13.2321 1 14.125 1 14.125 2.3125C14.125 3.625 13.2321 3.625 12.7857 3.625M11 3.625H12.7857M12.7857 3.625L14.125 5.375"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 3.1875V1C7.5625 1 9.125 1 9.125 3.1875C9.125 5.375 7.5625 5.375 6 5.375V3.1875Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_28_2">
          <rect width="15" height="6" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

const StyledTrigger = styled('button', {
  base: {
    all: 'unset',
    position: 'relative',
    height: '24px',
    width: '24px',
    textAlign: 'right',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'box-shadow .2s ease',
    cursor: 'pointer',
    overflow: 'hidden',
    '& > div': { position: 'absolute', inset: 0, borderRadius: '4px' },
    '&:focus-visible': { boxShadow: '0 0 0 2px var(--colors-gray7)' },
  },
  variants: {
    fullsize: {
      true: {
        width: '100%',
        borderRadius: '4px',
        '&::before': { width: '100%' },
      },
    },
  },
})

const StyledHDRBadge = styled('div', {
  base: {
    position: 'absolute',
    bottom: '1px',
    right: '1px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px',
    justifyContent: 'center',
    borderRadius: '4px 0 3px 0',
    backgroundColor: 'var(--colors-gray3)',
    strokeWidth: 1.2,
    color: 'var(--colors-gray12)',
  },
})

const StyledTransparentPattern = styled(TransparentPattern, {
  base: {
    position: 'absolute',
    inset: 0,
    borderRadius: '4px',
    height: '24px',
    width: '24px',
    border: '1px solid transparent',
    perspective: 1000,
    backfaceVisibility: 'hidden',
    transform: 'translate3d(0,0,0)',
  },
  variants: {
    fullsize: { true: { width: '100%' } },
  },
})

interface ColorPickerTriggerProps {
  color: Color | GradientColor | ParticleColor
  colorSpace: ColorSpace
  fullsize?: boolean
  mode?: ColorPickerMode
}

export const ColorPickerTrigger = forwardRef<HTMLButtonElement, ColorPickerTriggerProps>(function Trigger(props, ref) {
  const { color, colorSpace, mode, fullsize, ...rest } = props

  const isGradientMode = mode === 'particle' || mode === 'gradient'

  const { displayValue } = useColorSpaceConversion(
    isGradientMode ? ({ r: 0, g: 0, b: 0, a: 1 } as Color) : (color as Color),
    colorSpace,
    'sRGB'
  )

  const backgroundStyle = isGradientMode
    ? generatePreviewColor(mode, color, colorSpace, 'sRGB')
    : `rgba(${displayValue.r}, ${displayValue.g}, ${displayValue.b}, ${displayValue.a})`

  const borderColor = 'transparent'

  return (
    <StyledTrigger ref={ref} fullsize={fullsize} {...rest}>
      <StyledTransparentPattern
        fullsize={fullsize}
        style={{
          borderColor,
        }}
      />
      <Flex style={{ background: backgroundStyle }} align="both">
        {mode === 'hdr' && (
          <StyledHDRBadge>
            <IconHDR />
          </StyledHDRBadge>
        )}
      </Flex>
    </StyledTrigger>
  )
})
