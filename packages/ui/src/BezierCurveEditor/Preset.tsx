import { useState } from 'react'
import { styled } from '../../styled-system/jsx'
import { css } from '../../styled-system/css'
import { IPoint } from './types'
import { IconCirclePlusFilled, IconCircleXFilled } from '@tabler/icons-react'
import { Flex } from '../Flex'
import { Button } from '../Button'

const presetPathClass = css({
  fill: 'none',
  stroke: 'var(--colors-grayA8)',
  strokeWidth: '1.5px',
  transition: 'stroke .2s ease-in-out, stroke-width .2s ease-in-out',
})

const presetSvgClass = css({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  '&:hover path': { stroke: 'var(--colors-orange10)', strokeWidth: '2px' },
})

const defaultPresets = [
  [
    { x: 0, y: 0 },
    { x: 0.2, y: 0.8 },
    { x: 0.8, y: 0.2 },
    { x: 1, y: 1 },
  ],
  [
    { x: 0, y: 0 },
    { x: 0.25, y: 0.75 },
    { x: 0.75, y: 0.75 },
    { x: 1, y: 0 },
  ],
  [
    { x: 0, y: 0 },
    { x: 0.7, y: 0 },
    { x: 1, y: 0.5 },
    { x: 1, y: 1 },
  ],
  [
    { x: 0, y: 0 },
    { x: 0.42, y: 0 },
    { x: 0.58, y: 1 },
    { x: 1, y: 1 },
  ],
]

const PresetList = styled('div', {
  base: {
    width: '100%',
    display: 'grid',
    padding: '4px 0',
    gridTemplateColumns: 'repeat(5, 1fr)',
    alignItems: 'center',
    gap: '8px',
  },
})

const DeleteButton = styled('button', {
  base: {
    all: 'unset',
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: '9999px',
    color: 'var(--colors-gray9)',
    transform: 'translate(50%, -50%)',
    '&:hover': { color: 'var(--colors-red10)' },
  },
})

const CurvePresetItem = styled('div', {
  base: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '32px',
    borderRadius: '4px',
    color: 'var(--colors-grayA9)',
    cursor: 'pointer',
    backgroundColor: 'var(--colors-appBg)',
    border: '1px solid var(--colors-grayA3)',
    transition: 'color .2s ease-in-out',
    '&:hover': { color: 'var(--colors-orange10)' },
  },
})

interface PresetItemProps extends React.HTMLAttributes<HTMLDivElement> {
  points?: IPoint[]
  width?: number
  height?: number
  deletable?: boolean
  onDelete?: () => void
}

function PresetItem(props: PresetItemProps) {
  const { points, width = 74, height = 34, deletable = false, onDelete, ...rest } = props
  const genPath = (points: IPoint[]) => {
    if (points.length < 4) {
      return ''
    }

    let d = `M${points[0].x * width} ${-points[0].y * height}`

    for (let i = 1; i < points.length; i += 3) {
      d += ` C${points[i].x * width} ${-points[i].y * height}, ${points[i + 1].x * width} ${-points[i + 1].y * height}, ${points[i + 2].x * width} ${-points[i + 2].y * height}`
    }

    return d
  }
  return (
    <CurvePresetItem {...rest}>
      <svg className={presetSvgClass} width={width} height={height} viewBox={`0 -${height} ${width} ${height}`}>
        <path className={presetPathClass} d={genPath(points)} />
      </svg>
      {deletable && (
        <DeleteButton>
          <IconCircleXFilled size="14px" onClick={onDelete} />
        </DeleteButton>
      )}
    </CurvePresetItem>
  )
}

interface BezierCurveEditorProps {
  presets?: IPoint[][]
  onApplyPreset: (points: IPoint[]) => void
  onAddPreset: () => void
  onDeletePreset: (index: number) => void
}

export function BezierCurvePresets(props: BezierCurveEditorProps) {
  const { presets = [], onApplyPreset, onAddPreset, onDeletePreset } = props
  const [deletable, setDeletable] = useState(false)

  return (
    <>
      <Flex
        align="v"
        justifyContent="between"
        css={{ fontSize: '12px', marginTop: '28px', color: 'var(--colors-gray11)', userSelect: 'none' }}>
        Presets
        {presets.length > 0 && (
          <Button variant="subtle" onClick={() => setDeletable(!deletable)}>
            {deletable ? 'Done' : 'Edit'}
          </Button>
        )}
      </Flex>
      <PresetList>
        {defaultPresets.map((points, index) => (
          <PresetItem key={index} points={points} onClick={() => onApplyPreset && onApplyPreset(points)} />
        ))}
        {presets.map((points, index) => (
          <PresetItem
            deletable={deletable}
            key={index}
            points={points}
            onDelete={() => onDeletePreset(index)}
            onClick={() => onApplyPreset && onApplyPreset(points)}
          />
        ))}
        <CurvePresetItem onClick={onAddPreset}>
          <IconCirclePlusFilled size="16px" />
        </CurvePresetItem>
      </PresetList>
    </>
  )
}
