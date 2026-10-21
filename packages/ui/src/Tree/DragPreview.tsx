import React from 'react'

import { styled } from '../../styled-system/jsx'

const StyledDragPreview = styled('div', {
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '300px',
    height: '28px',
    fontSize: '12px',
    boxSizing: 'border-box',
    justifyContent: 'space-between',
    padding: '0 8px',
    color: 'white',
    backgroundColor: 'var(--colors-blue9)',
    borderRadius: '4px',
    '& > span:nth-child(2)': {
      display: 'flex',
      alignItems: 'center',
      height: '20px',
      fontSize: '10px',
      padding: '0 8px',
      borderRadius: '9999px',
      backgroundColor: 'white',
      color: 'var(--colors-blue9)',
    },
  },
})

type IDragPreview = {
  text: React.ReactNode
  size?: number
}

function DragPreview(props: IDragPreview) {
  const { text, size } = props
  return (
    <StyledDragPreview>
      <span>{text}</span>
      {size > 1 && <span>{size}</span>}
    </StyledDragPreview>
  )
}

export { DragPreview }
