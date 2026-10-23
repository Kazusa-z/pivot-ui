import type { Meta, StoryObj } from '@storybook/react'
import { SectionDivider } from '../src/layout/SectionDivider'
import { Flex } from '../src/layout/Flex'
import { Title, Text } from '../src/foundation/typography'

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'SectionDivider 用于在内容组之间放置带文字的分隔线。children 决定标题内容，两侧线条提供视觉分组；长文字在可用宽度内换行。需要文档标题语义时在其中放入 Title 或原生标题元素，并按页面层级选择 as。',
      },
    },
  },
  title: 'Layout/SectionDivider',
  component: SectionDivider,
} satisfies Meta<typeof SectionDivider>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = {
  render: () => (
    <Flex direction="column" gap="md" css={{ width: '320px' }}>
      <SectionDivider>
        <Title as="h2" size={1}>
          Lighting
        </Title>
      </SectionDivider>
      <Text size="sm">标题通过 as 选择文档层级，两侧线条用于视觉分组。</Text>
    </Flex>
  ),
}
export const LongLabel: Story = {
  render: () => <SectionDivider css={{ width: '220px' }}>较长的分组标题会在窄侧栏的可用宽度内换行</SectionDivider>,
}
