import type { Meta, StoryObj } from '@storybook/react'
import { Flex } from '../src/layout/Flex'
import { Button } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Column, Item } from './support/layout'

const meta = {
  title: 'Layout/Flex',
  component: Flex,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '用 token 间距排列子元素的 flex 容器。',
    use: ['按钮组、工具栏、行内元素的横向或纵向排列'],
    avoid: ['属性面板的标签 + 控件 → 用 `PropertyRow`', '复杂的二维布局 → 直接写 CSS grid'],
    notes: ['`gap` 只能取 token 间距，保证与组件内部的间距一致'],
  }),
  args: { gap: 'sm', align: 'center' },
} satisfies Meta<typeof Flex>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: (args) => (
    <Flex {...args}>
      <Button variant="solid">Save</Button>
      <Button>Cancel</Button>
      <Button variant="subtle">Reset</Button>
    </Flex>
  ),
}

/** `gap`：`xxs` 2 / `xs` 4 / `sm` 8 / `md` 12 / `lg` 16。 */
export const Gaps: Story = {
  render: () => (
    <Column>
      {(['xxs', 'xs', 'sm', 'md', 'lg'] as const).map((gap) => (
        <Item key={gap} label={gap}>
          <Flex gap={gap}>
            <Button>One</Button>
            <Button>Two</Button>
            <Button>Three</Button>
          </Flex>
        </Item>
      ))}
    </Column>
  ),
}

/** `justify="between"` 常用于标题栏：左边标题，右边操作。 */
export const Justify: Story = {
  render: () => (
    <Column width={360}>
      {(['start', 'center', 'end', 'between'] as const).map((justify) => (
        <Item key={justify} label={justify}>
          <Flex justify={justify} gap="sm">
            <Button>Left</Button>
            <Button>Right</Button>
          </Flex>
        </Item>
      ))}
    </Column>
  ),
}
