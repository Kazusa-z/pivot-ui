import type { Meta, StoryObj } from '@storybook/react'
import { SectionDivider } from '../src/layout/SectionDivider'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { describeComponent } from './support/describe'
import { Column, Panel } from './support/layout'

const meta = {
  title: 'Layout/SectionDivider',
  component: SectionDivider,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '带文字的分组标题线，在一个分组内部再分出小节，不能折叠。',
    use: ['`Section` 内部再细分几组属性：Shadows / Reflections'],
    avoid: ['需要折叠的分组 → 用 `Section`', '没有文字的分隔 → 用 `Separator`'],
    related: ['`Separator`：一条线', '`Section`：可折叠的分组'],
    notes: ['命名文档结构里的一节时，用 `<h3>` 等标题元素作为 children，读屏才能按标题导航'],
  }),
  args: { children: 'Shadows' },
} satisfies Meta<typeof SectionDivider>
export default meta
type Story = StoryObj<typeof meta>

/** 在面板里把属性分成几个小节。 */
export const Basic: Story = {
  render: (args) => (
    <Panel>
      <Column>
        <SectionDivider {...args} />
        <Checkbox label="Cast shadows" defaultChecked />
        <Checkbox label="Receive shadows" defaultChecked />
        <SectionDivider>Reflections</SectionDivider>
        <Checkbox label="Use reflection probes" />
      </Column>
    </Panel>
  ),
}
