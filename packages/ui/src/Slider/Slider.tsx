import React, { useState } from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { styled } from '../../styled-system/jsx'
import type { ComponentProps } from 'react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
// import { Tooltip } from "../Tooltip";

const StyledTrack = styled(SliderPrimitive.Track, {
  base: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    flexGrow: 1,
    borderRadius: '4px',
    overflow: 'hidden',
    color: 'var(--colors-text)',
    '&[data-orientation="horizontal"]': { height: '100%' },
    '&[data-orientation="vertical"]': { width: '100%' },
    '&[data-disabled]': { backgroundColor: 'var(--colors-softBg)' },
  },
})

const StyledRange = styled(SliderPrimitive.Range, {
  base: {
    position: 'absolute',
    backgroundColor: 'var(--colors-softBgHover)',
    height: '100%',
    borderRadius: 'inherit',
    transition: 'background-color .2s ease',
    '&[data-orientation="vertical"]': { width: '100%' },
    '&[data-disabled]': { backgroundColor: 'var(--colors-surfaceSubtle)' },
  },
})

const StyledThumb = styled(SliderPrimitive.Thumb, {
  base: {
    all: 'unset',
    position: 'relative',
    display: 'block',
    width: '2px',
    height: 'var(--slider-thumb-height, 24px)',
    backgroundColor: 'var(--colors-borderStrong)',
    transition: 'opacity .2s ease, background-color .2s ease, width .2s ease',
    '&[data-orientation="vertical"]': { width: '24px', height: '2px' },
    '&[data-disabled]': { backgroundColor: 'var(--colors-border)' },
  },
})

const StyledSlider = styled(SliderPrimitive.Root, {
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
    touchAction: 'none',
    width: '100%',
    '&[data-orientation="horizontal"]': {
      height: '24px',
      backgroundColor: 'var(--colors-softBg)',
      borderRadius: '4px',
    },
    '&[data-orientation="vertical"]': { flexDirection: 'column', width: '24px' },
    cursor: 'ew-resize',
    '&:hover [data-part="range"]': { backgroundColor: 'var(--colors-selectionBgHover)' },
    '&:hover [data-part="thumb"]': { width: '3px', backgroundColor: 'var(--colors-selectionText)' },
    '&[data-disabled]': { pointerEvents: 'none', color: 'var(--colors-textMuted)' },
  },
  variants: {
    compact: {
      true: {
        '& [data-part="track"]': { height: '3px', borderRadius: '4px' },
        '& [data-part="thumb"]': {
          width: '14px',
          height: '14px',
          borderRadius: '9999px',
          '&[data-disabled]': { backgroundColor: 'var(--colors-textMuted)' },
        },
        '& [data-part="range"]': {
          backgroundColor: 'var(--colors-selectionBg)',
          '&[data-disabled]': { backgroundColor: 'var(--colors-focusRingMuted)' },
        },
      },
    },
    size: {
      xs: {
        '--slider-thumb-height': '20px',
        '&[data-orientation="horizontal"]': { height: '20px' },
        '& [data-part="track"]': { borderRadius: '4px' },
      },
    },
  },
})

const StyledSliderSlot = styled('div', {
  base: {
    position: 'absolute',
    pointerEvents: 'none',
    top: '50%',
    fontSize: '9px',
    fontFamily: 'var(--fonts-mono)',
    color: 'var(--colors-textMuted)',
  },
  variants: {
    position: {
      start: { left: '4px', transform: 'translateY(-50%)' },
      center: { left: '50%', transform: 'translate(-50%, -50%)' },
      end: { right: '4px', transform: 'translateY(-50%)' },
    },
  },
  defaultVariants: { position: 'start' },
})

const RulerContainer = styled('div', {
  base: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    '& svg': { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' },
  },
})

const StyledLine = styled('line', {
  base: { stroke: 'var(--colors-borderStrong)' },
})

interface RulerProps {
  length: number
  interval: number
  majorInterval?: number
}

function Ruler({ length, interval, majorInterval }: RulerProps) {
  const ticks: number[] = []
  for (let i = 0; i <= length; i += interval) {
    ticks.push(i)
  }

  return (
    <RulerContainer>
      <svg width="100%" height="24px">
        {ticks.map((tick, index, arr) => {
          if (index === 0 || index === arr.length - 1) return null
          return (
            <StyledLine
              key={index}
              x1={(tick / length) * 100 + '%'}
              y1="24"
              x2={(tick / length) * 100 + '%'}
              y2={majorInterval ? (index % majorInterval === 0 ? '12' : '19') : '19'} // Adjust major tick length
            />
          )
        })}
      </svg>
    </RulerContainer>
  )
}

export interface SliderProps extends ComponentProps<typeof StyledSlider> {
  tooltip?: boolean
  /**
   * Whether to show the ruler, default is `false`
   */
  showRuler?: boolean
  /**
   * You could add some custom slots at the start via this prop. By default it will show the `MIN` when the value is at the minimum.
   */
  startSlot?: React.ReactNode
  /**
   * You could add some custom slots at the end via this prop. By default it will show the `MAX` when the value is at the maximum.
   */
  endSlot?: React.ReactNode
}

/**
 * A slider component allows users to select a value from a range of values.
 *
 * This component is built on top of the `@radix-ui/react-slider`
 *
 * This component provide controlled and uncontrolled modes.
 */
export function Slider(props: SliderProps) {
  const {
    onValueChange,
    step = 0.1,
    disabled,
    tooltip = true,
    startSlot,
    endSlot,
    compact,
    min = 0,
    max = 100,
    showRuler = false,
    ...rest
  } = props
  const [value, setValue] = useControllableState({
    prop: props.value,
    defaultProp: props.defaultValue || [0],
    onChange: props.onValueChange,
  })
  const [showTooltip, setShowTooltip] = useState(false)
  const [accurateMode, setAccurateMode] = useState(false)

  const handleValueChange = (v) => {
    setValue(v)
    if (onValueChange) {
      onValueChange(v)
    }
  }

  const handlePointerDown = (e) => {
    setAccurateMode(e.ctrlKey || e.metaKey)
    setShowTooltip(true)
  }

  const handlePointerUp = () => {
    setShowTooltip(false)
  }

  return (
    <StyledSlider
      max={max}
      min={min}
      step={accurateMode ? step / 10 : step}
      onValueChange={handleValueChange}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      disabled={disabled}
      {...rest}
      compact={compact}>
      <StyledTrack data-part="track" className="slider-track">
        <StyledRange data-part="range" className="slider-range" />
        {value![0] === min && <StyledSliderSlot position="start">MIN</StyledSliderSlot>}
        {value![value!.length - 1] === max && <StyledSliderSlot position="end">MAX</StyledSliderSlot>}
        {showRuler && <Ruler length={max} interval={1} majorInterval={Math.round(max / 10)} />}
      </StyledTrack>
      {value?.map((v, i) => (
        <StyledThumb data-part="thumb" key={i} />
      ))}
      {/* {tooltip ? (
        <Tooltip content={value[0]} arrow open={showTooltip}>
          <StyledThumb />
        </Tooltip>
      ) : ( */}
      {/* )} */}
    </StyledSlider>
  )
}
