import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { css } from '../styled-system/css'
import { Arrow, type ArrowDirection } from '../src/foundation/icons'

const directions: ArrowDirection[] = ['up', 'right', 'down', 'left', 'up-left', 'up-right', 'down-left', 'down-right']
const grid = css({ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', width: 'min(460px, 90vw)' })
const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Arrow 是显示方向或展开状态的装饰箭头，适合放在折叠按钮、菜单入口旁。direction 决定方向，size 决定尺寸，animate 为方向变化添加过渡。展开状态与点击行为由外层按钮保存；请在按钮上设置 aria-expanded、aria-controls 和可访问名称。',
      },
    },
  },
  title: 'Foundation/Arrow',
  component: Arrow,
} satisfies Meta<typeof Arrow>
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
        外层按钮保存展开状态并处理点击，Arrow 根据该状态显示方向。
      </p>
    </div>
  )
}

export const WithinAControl: Story = { render: () => <ArrowExample /> }
