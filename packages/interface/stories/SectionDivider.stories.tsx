import type { Meta, StoryObj } from '@storybook/react'
import { SectionDivider } from '../src/layout/SectionDivider'
import { Flex } from '../src/layout/Flex'
import { Title, Text } from '../src/foundation/typography'

const meta = { title: 'Layout/SectionDivider', component: SectionDivider } satisfies Meta<typeof SectionDivider>
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
      <Text size="sm">A heading remains a heading. The surrounding lines are decoration.</Text>
    </Flex>
  ),
}
export const LongLabel: Story = {
  render: () => (
    <SectionDivider css={{ width: '220px' }}>
      A long group label that wraps inside a narrow property sidebar
    </SectionDivider>
  ),
}
