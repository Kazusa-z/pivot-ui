import React, { useEffect, useCallback } from 'react'
import { colord } from 'colord'
import { extend } from 'colord'
import minifyPlugin from 'colord/plugins/minify'
import mixPlugin from 'colord/plugins/mix'

import { styled } from '../../styled-system/jsx'

import { type GradientColor, type Color } from '../ColorPicker/helper'
import { Flex } from '../Flex'
import { clamp } from '../utils'

extend([minifyPlugin, mixPlugin])

const StyledThumb = styled('div', {
  base: {
    position: 'relative',
    top: 3,
    height: '16px',
    width: '8px',
    borderRadius: '4px',
    border: '1px solid CurrentColor',
    transform: 'translateX(-8px)',
    backgroundImage:
      'linear-gradient(45deg, #b0b0b0 25%, transparent 25%), linear-gradient(-45deg, #b0b0b0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #b0b0b0 75%), linear-gradient(-45deg, #fff 75%, #b0b0b0 75%)',
    backgroundSize: '5px 5px',
    backgroundPosition: '0 0, 0 2.5px, 2.5px -2.5px, -2.5px 0px',
    '&::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      bottom: '11.6px',
      width: 0,
      right: -1,
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderBottom: '4px solid currentColor',
      transform: 'translateY(-2px)',
    },
    '& > div': {
      position: 'absolute',
      inset: 0,
      borderRadius: '4px',
      backgroundSize: '100% 100%',
    },
    '& > div:first-child': {
      backgroundImage:
        'linear-gradient(45deg, #b0b0b0 25%, transparent 25%), linear-gradient(-45deg, #b0b0b0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #b0b0b0 75%), linear-gradient(-45deg, #fff 75%, #b0b0b0 75%)',
      backgroundSize: '5px 5px',
      backgroundPosition: '0 0, 0 2.5px, 2.5px -2.5px, -2.5px 0px',
    },
  },
})

const StyledThumbRoot = styled(Flex, {
  base: {
    position: 'relative',
    width: '14px',
    color: 'var(--colors-gray12)',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    '&:hover': { color: 'var(--colors-gray12)' },
  },
  variants: {
    active: {
      true: {
        color: 'var(--colors-gray12)',
        '& [data-thumb]': { transform: 'translateX(-8px) scale(1.1)' },
      },
    },
  },
})

interface ThumbProps {
  range: { min: number; max: number }
  color: Color
  index: number
  active?: boolean
  onSelect?: (index: number) => void
  position: number
  onPositionChange: (position: number, index: number) => void
  onColorChange?: (color: string) => void
  onRemove?: (index: number) => void
}

function Thumb(props: ThumbProps) {
  const { range, position, onPositionChange, onRemove, active } = props
  const [dragging, setDragging] = React.useState(false)
  const [startX, setStartX] = React.useState(0)
  const [startY, setStartY] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const translateX = position * range.max

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDragging(true)
    setStartX(e.clientX)
    setStartY(e.clientY)
  }

  const handleMouseMove = useCallback(
    function handleMouseMove(e: MouseEvent) {
      if (!dragging || !ref.current) return
      e.stopPropagation()
      e.preventDefault()
      const { clientX, clientY } = e
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      const nextPosition = clamp((translateX + deltaX) / range.max, 0, 1)
      onPositionChange(nextPosition, props.index)
      if (deltaY > 50) {
        setDragging(false)
        onRemove && onRemove(props.index)
      }
    },
    [startX, range]
  )

  function handleMouseUp() {
    setDragging(false)
  }

  function handleSelectThumb(e: React.MouseEvent) {
    e.stopPropagation()
    if (props.onSelect) {
      props.onSelect(props.index)
    }
  }

  useEffect(() => {
    if (!dragging) {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    } else {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging])

  return (
    <StyledThumbRoot
      active={active}
      orientation="column"
      align="v"
      ref={ref}
      onClick={handleSelectThumb}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        transform: `translateX(${translateX}px)`,
      }}>
      <StyledThumb data-thumb>
        <div />
        <div style={{ backgroundColor: colord(props.color).toHex() }} />
      </StyledThumb>
    </StyledThumbRoot>
  )
}

const ThumbContainer = styled('div', {
  base: { width: '100%', height: '20px' },
  variants: {
    flipY: { true: { transform: 'scaleY(-1)' } },
  },
})

interface ThumbGroupProps {
  selectedIndex: number
  positions: number[]
  colors: Color[]
  onChange: (colors: GradientColor) => void
  onSelect: (index: number) => void
  flipY?: boolean
  width: number
}

function ThumbGroup(props: ThumbGroupProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { colors, positions, onSelect, onChange, selectedIndex, flipY, width } = props

  const handlePositionChange = (position: number, index: number) => {
    // Keep each color attached to its stop, including stops at the same position.
    const nextStops = colors
      .map((value, originalIndex) => ({
        value,
        position: originalIndex === index ? position : positions[originalIndex],
        originalIndex,
      }))
      .sort((a, b) => a.position - b.position)
    const nextIndex = nextStops.findIndex((stop) => stop.originalIndex === selectedIndex)

    if (nextIndex !== -1) {
      onSelect(nextIndex)
    }

    onChange(nextStops.map(({ value, position }) => ({ value, position })))
  }

  const handleAddThumb = (e) => {
    const { current } = ref
    if (!current) return
    const { clientX } = e
    const { left } = current.getBoundingClientRect()
    const x = clientX - left
    const position = x / width

    let afterIndex = positions.findIndex((p) => p > position)
    let newColor: Color

    // if no position is greater than the new position, insert at the end
    if (afterIndex === -1) {
      afterIndex = positions.length
      newColor = colors[afterIndex - 1]
      // if the new position is 0, insert at the beginning
    } else if (afterIndex === 0) {
      newColor = colors[afterIndex]
    } else {
      newColor = colord(colors[afterIndex - 1])
        .mix(colors[afterIndex], position)
        .toRgb()
    }

    const colorsCopy = colors.map((c) => ({ ...c }))
    const positionsCopy = [...positions]

    colorsCopy.splice(afterIndex, 0, newColor)
    positionsCopy.splice(afterIndex, 0, position)

    onSelect(afterIndex)
    onChange(positionsCopy.map((p, i) => ({ value: colorsCopy[i], position: p })))
  }

  const handleRemoveThumb = (index: number) => {
    if (positions.length <= 2) return
    const colorsCopy = colors.map((c) => ({ ...c }))
    const positionsCopy = [...positions]
    colorsCopy.splice(index, 1)
    positionsCopy.splice(index, 1)
    const ret = positionsCopy.map((p, i) => ({ value: colorsCopy[i], position: p }))
    onSelect(Math.max(0, index - 1))
    onChange(ret)
  }

  const handleSelectThumb = (index: number) => {
    onSelect(index)
  }

  return (
    <ThumbContainer ref={ref} onDoubleClick={handleAddThumb} flipY={flipY}>
      {positions.map((position, i) => {
        return (
          <Thumb
            range={{ min: 0, max: width }}
            index={i}
            key={i}
            position={position}
            active={selectedIndex === i}
            onSelect={handleSelectThumb}
            color={colors[i]}
            onPositionChange={handlePositionChange}
            onRemove={handleRemoveThumb}
          />
        )
      })}
    </ThumbContainer>
  )
}

export { Thumb, ThumbGroup }
