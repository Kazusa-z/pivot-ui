import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '../src/widgets/display/Separator'
import { Flex } from '../src/layout/Flex'

const meta = { title: 'Display/Separator', component: Separator } satisfies Meta<typeof Separator>
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
