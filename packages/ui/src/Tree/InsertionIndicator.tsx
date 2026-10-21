import React from 'react'
import { styled } from '../../styled-system/jsx'
import { useDrop } from '../hooks/useDrop'

const IndicatorRoot = styled('div', {
  base: {
    display: 'flex',
    position: 'absolute',
    width: 'calc(100% - 32px)',
    height: '4px',
    alignItems: 'center',
    marginLeft: '12px',
    marginTop: '-2px',
    outline: 'none',
    flexDirection: 'row-reverse',
  },
})

const StyledIndicator = styled('div', {
  base: {
    position: 'relative',
    height: '1px',
    outline: 'none',
    pointerEvents: 'none',
    flexDirection: 'row-reverse',
    '&[data-drop-target="true"]': {
      backgroundColor: '#fff',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: -4,
        left: -8,
        width: 6,
        height: 6,
        borderRadius: '9999px',
        border: '1px solid white',
        zIndex: 1,
      },
    },
  },
})

export type TreeItemAcceptDropType<T> = {
  type: string
  value: T
}

export interface InsertionIndicatorProps {
  item: string
  position: 'before' | 'after'
  dropLayer?: any
  level?: number
  onDrop: (e, dragItem, position) => void
  onEnter: (e, dragItem) => void
}

export function InsertionIndicator(props: InsertionIndicatorProps) {
  const { item, position, dropLayer, level, onDrop } = props
  const [isTarget, setIsTarget] = React.useState(false)

  const dropRef = useDrop<HTMLDivElement, TreeItemAcceptDropType<string[]>>({
    accept: dropLayer ?? 0,
    onEnter(e, dragItem) {
      if (!dragItem) return
      setIsTarget(true)
    },
    onLeave() {
      setIsTarget(false)
    },
    onDrop: (e, dragItem) => {
      setIsTarget(false)
      onDrop(e, dragItem, position)
    },
  })

  const style = {
    width: `calc(100% - ${level * 12}px)`,
  }

  return (
    <IndicatorRoot
      ref={dropRef}
      role="option"
      aria-selected="false"
      data-key={`${item}-${position}`}
      aria-level={level}>
      <StyledIndicator style={style} data-drop-target={isTarget} />
    </IndicatorRoot>
  )
}
