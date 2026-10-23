import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '../src/widgets/display/Separator'
import { Flex } from '../src/layout/Flex'

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Separator 用于在相邻内容之间建立水平或垂直分隔。orientation 决定方向；decorative 表示线条仅用于视觉，decorative={false} 会提供 separator 语义。垂直分隔线需要外层给出可用高度，分组标题可使用 SectionDivider 组合。',
      },
    },
  },
  title: 'Display/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = {
  render: () => (
    <Flex direction="column" gap="md" css={{ width: '280px' }}>
      <span>Before the horizontal separator</span>
      <Separator decorative={false} />
      <span>After the horizontal separator</span>
      <Flex align="center" gap="md" css={{ height: '36px' }}>
        <span>Left</span>
        <Separator orientation="vertical" decorative={false} />
        <span>Right</span>
      </Flex>
    </Flex>
  ),
}
export const Decorative: Story = {
  render: () => (
    <Flex gap="sm" align="center" css={{ height: '24px' }}>
      <span>Mesh</span>
      <Separator orientation="vertical" decorative />
      <span>12 vertices</span>
    </Flex>
  ),
}
