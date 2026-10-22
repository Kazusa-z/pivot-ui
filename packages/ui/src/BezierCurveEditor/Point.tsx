import React, { useRef, useState, useEffect } from 'react'

import type { IPoint } from './types'

import { styled } from '../../styled-system/jsx'
import { css, cva } from '../../styled-system/css'

export const POINT_HIT_RADIUS = 10
const POINT_RING_RADIUS = 5
const POINT_CENTER_RADIUS = 2
const POINT_HOVER_RING_RADIUS = 10
const POINT_HOVER_CENTER_RADIUS = 6

const pointStyles = cva({
  base: {
    fill: 'var(--colors-green9)',
    cursor: 'pointer',
    transition: 'r 0.2s ease',
    '&[data-point-type="hitpoint"]': { stroke: 'transparent', fill: 'transparent' },
    '&[data-point-type="ring"]': { fill: 'var(--colors-green4)' },
  },
  variants: {
    pointType: {
      main: {
        fill: 'var(--colors-orange9)',
        '&[data-point-type="ring"]': { fill: 'var(--colors-orange4)' },
      },
      control: {
        fill: 'var(--colors-green8)',
        '&[data-point-type="ring"]': { fill: 'var(--colors-green4)' },
      },
      placeholder: {
        fill: 'var(--colors-amber9)',
        '&[data-point-type="ring"]': { fill: 'var(--colors-amber4)' },
      },
    },
  },
})

const StyledPointRoot = styled('g', {
  base: {
    cursor: 'grab',
    touchAction: 'none',
    '&:hover [data-point-type="ring"]': { r: POINT_HOVER_RING_RADIUS },
    '&:hover [data-point-type="point"]': { r: POINT_HOVER_CENTER_RADIUS },
  },
})

const pointLabelClass = css({
  fill: 'var(--colors-gray12)',
  fontSize: '10px',
  pointerEvents: 'none',
  userSelect: 'none',
})

const pointLabelBgClass = css({
  fill: 'var(--colors-gray2)',
  stroke: 'var(--colors-gray7)',
  strokeWidth: 1,
  rx: 3,
  ry: 3,
  pointerEvents: 'none',
})

interface PointProps {
  point: IPoint
  main?: boolean
  onPointChange: (svgPos: IPoint) => void
  onHoverChange?: (hovered: boolean) => void
  getRoot: () => SVGSVGElement
  type?: 'pivot' | 'control'
  hoverLabel?: string
  pointClipPath?: string
}

export function Point(props: PointProps) {
  const { point, main, type = 'pivot', onPointChange, onHoverChange, getRoot, hoverLabel, pointClipPath } = props
  const onPointChangeRef = useRef(onPointChange)
  onPointChangeRef.current = onPointChange
  const getRootRef = useRef(getRoot)
  getRootRef.current = getRoot
  const pointerRef = useRef<DOMPoint>(undefined)
  const [moving, setMoving] = useState(false)
  const [hovered, setHovered] = useState(false)

  function toSvgPoint(clientX: number, clientY: number): IPoint {
    if (!pointerRef.current) {
      pointerRef.current = getRootRef.current().createSVGPoint()
    }
    pointerRef.current.x = clientX
    pointerRef.current.y = clientY
    const ctm = getRootRef.current().getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const p = pointerRef.current.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  function handleMouseDown(event: React.MouseEvent<SVGGElement>) {
    // Only respond to left-click; right-click must not trigger drag
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    window.getSelection()?.removeAllRanges()
    if (!moving) {
      setMoving(true)
    }
  }

  useEffect(() => {
    if (!moving) return

    const onViewMouseUp = () => setMoving(false)
    const onViewMouseMove = (event: MouseEvent) => {
      event.preventDefault()
      onPointChangeRef.current(toSvgPoint(event.clientX, event.clientY))
    }

    window.addEventListener('mouseup', onViewMouseUp)
    window.addEventListener('mousemove', onViewMouseMove)
    return () => {
      window.removeEventListener('mouseup', onViewMouseUp)
      window.removeEventListener('mousemove', onViewMouseMove)
    }
  }, [moving])

  return (
    <StyledPointRoot
      onMouseDown={handleMouseDown}
      onMouseEnter={() => {
        setHovered(true)
        onHoverChange?.(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
        onHoverChange?.(false)
      }}>
      {hoverLabel && (hovered || moving) && (
        <>
          <rect
            className={pointLabelBgClass}
            x={point.x - (hoverLabel.length * 6 + 8) / 2}
            y={point.y - 24}
            width={hoverLabel.length * 6 + 8}
            height={14}
          />
          <text className={pointLabelClass} x={point.x} y={point.y - 14} textAnchor="middle">
            {hoverLabel}
          </text>
        </>
      )}
      <g style={pointClipPath ? { clipPath: pointClipPath } : undefined}>
        <circle className={pointStyles()} data-point-type="hitpoint" cx={point.x} cy={point.y} r={POINT_HIT_RADIUS} />
        <circle
          className={pointStyles({ pointType: main ? 'main' : 'control' })}
          data-point-type="ring"
          cx={point.x}
          cy={point.y}
          r={POINT_RING_RADIUS}
        />
        <circle
          className={pointStyles({ pointType: main ? 'main' : 'control' })}
          data-point-type="point"
          data-type={type}
          cx={point.x}
          cy={point.y}
          r={POINT_CENTER_RADIUS}
        />
      </g>
    </StyledPointRoot>
  )
}
