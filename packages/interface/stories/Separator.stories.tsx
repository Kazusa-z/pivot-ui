import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '../src/layout/Separator'
import { Button } from '../src/controls/buttons'
import { Text } from '../src/foundation/typography'
import { describeComponent } from './support/describe'
import { Column, Row } from './support/layout'

const meta = {
  title: 'Layout/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '一条细分隔线，横向或竖向。',
    use: ['工具栏里分开几组按钮（竖向）', '面板中分开两块内容（横向）'],
    avoid: ['需要文字标题的分组 → 用 `SectionDivider`', '菜单里的分隔 → 用菜单自带的 `*MenuSeparator`'],
    related: ['`SectionDivider`：带文字的分组标题线'],
  }),
  args: { orientation: 'horizontal' },
} satisfies Meta<typeof Separator>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: (args) => (
    <Column width={280}>
      <Text size="sm">Transform</Text>
      <Separator {...args} />
      <Text size="sm">Rendering</Text>
    </Column>
  ),
}

/** 竖向分隔线在工具栏中分组按钮；纯视觉用途时设 `decorative`。 */
export const InToolbar: Story = {
  render: () => (
    <Row>
      <Button variant="subtle">Undo</Button>
      <Button variant="subtle">Redo</Button>
      <Separator orientation="vertical" decorative css={{ height: '16px' }} />
      <Button variant="subtle">Play</Button>
    </Row>
  ),
}
