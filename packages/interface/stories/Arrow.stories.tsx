import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { css } from '../styled-system/css'
import { Arrow, type ArrowDirection } from '../src/foundation/icons'

const directions: ArrowDirection[] = ['up', 'right', 'down', 'left', 'up-left', 'up-right', 'down-left', 'down-right']
const grid = css({ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', width: 'min(460px, 90vw)' })
const meta = { title: 'Foundation/Arrow', component: Arrow } satisfies Meta<typeof Arrow>
export default meta
type Story = StoryObj<typeof meta>

export const Directions: Story = {
  render: () => (
    <div className={grid}>
      {directions.map((direction) => (
        <span key={direction}>
          <Arrow direction={direction} /> {direction}
        </span>
      ))}
    </div>
  ),
}

function ArrowExample() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="arrow-example-panel"
        onClick={() => setExpanded((value) => !value)}>
        <Arrow direction={expanded ? 'down' : 'right'} animate size="xs" />{' '}
        {expanded ? 'Collapse group' : 'Expand group'}
      </button>
      <p id="arrow-example-panel" hidden={!expanded}>
        The containing control owns expansion; the arrow only displays its direction.
      </p>
    </div>
  )
}

export const WithinAControl: Story = { render: () => <ArrowExample /> }
