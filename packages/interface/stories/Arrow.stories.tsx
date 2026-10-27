import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Arrow, type ArrowDirection } from '../src/foundation/icons'
import { Button } from '../src/controls/buttons'
import { Text } from '../src/foundation/typography'
import { StoryPage, StorySection, StoryCard, StoryGrid, StoryCode, StoryRow } from './support/StoryPage'

const directions: ArrowDirection[] = ['up', 'right', 'down', 'left', 'up-left', 'up-right', 'down-left', 'down-right']

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Arrow 显示方向或展开状态，适合放在折叠按钮和菜单入口旁。direction 决定方向，size 决定尺寸，animate 为方向变化添加过渡；展开状态和点击行为由外层按钮负责。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Foundation/Arrow',
  component: Arrow,
} satisfies Meta<typeof Arrow>
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Foundation"
      title="Arrow"
      summary="装饰箭头，用于指示方向或展开状态。它不保存状态，也不处理点击；外层按钮负责 aria-expanded、aria-controls 和实际行为。">
      <StorySection title="Directions" description="八方向箭头；默认尺寸为 1em，随周围文字缩放。">
        <StoryGrid>
          {directions.map((direction) => (
            <StoryCard key={direction} title={direction}>
              <StoryRow>
                <Arrow direction={direction} />
                <Text size="sm" tone="muted">
                  {direction}
                </Text>
              </StoryRow>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="Inside a control" description="外层按钮保存展开状态，Arrow 只根据状态切换方向。">
        <StoryCard>
          <ArrowControl />
        </StoryCard>
      </StorySection>

      <StorySection title="Usage" description="把箭头放在可访问名称完整的按钮里；单独表达含义时提供 aria-label。">
        <StoryCode
          label="tsx"
          code={`<Button
  aria-expanded={expanded}
  aria-controls="panel"
  onClick={() => setExpanded(!expanded)}>
  <Arrow direction={expanded ? 'down' : 'right'} animate />
  {expanded ? 'Collapse' : 'Expand'}
</Button>`}
        />
      </StorySection>
    </StoryPage>
  ),
}

function ArrowControl() {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <Button
        aria-expanded={expanded}
        aria-controls="arrow-example-panel"
        onClick={() => setExpanded((value) => !value)}>
        <Arrow direction={expanded ? 'down' : 'right'} animate size="xs" />
        {expanded ? 'Collapse group' : 'Expand group'}
      </Button>
      <div id="arrow-example-panel" hidden={!expanded}>
        <Text size="sm" tone="muted">
          外层按钮保存展开状态并处理点击，Arrow 根据该状态显示方向。
        </Text>
      </div>
    </>
  )
}
