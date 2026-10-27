import type { Meta, StoryObj } from '@storybook/react'
import { Spin } from '../src/display/feedback'
import { Button } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Item, Row } from './support/layout'

const meta = {
  title: 'Display/Spin',
  component: Spin,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '小的旋转加载指示，表示正在等待。',
    use: ['面板或列表区域正在加载', '自定义控件里的等待状态'],
    avoid: ['按钮的等待 → 直接用 `Button` 的 `loading` 或 `async`', '有明确进度的任务 → 用 `Progress`'],
    related: ['`Progress`：有进度的任务'],
    notes: ['单独使用时会以 `role="status"` 播报 `label`；放在已经声明忙碌状态的控件里时设 `decorative`'],
  }),
  args: { label: 'Loading assets' },
} satisfies Meta<typeof Spin>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** 三档尺寸。 */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {(['xs', 'sm', 'md'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ xs: 12, sm: 16, md: 20 }[size]}px`}>
          <Spin {...args} size={size} />
        </Item>
      ))}
    </Row>
  ),
}

/** `primary` 强调色（默认）、`default` 中性色、`inherit` 跟随文字色。 */
export const Colors: Story = {
  render: (args) => (
    <Row>
      {(['primary', 'default', 'inherit'] as const).map((color) => (
        <Item key={color} label={color}>
          <Spin {...args} color={color} />
        </Item>
      ))}
      <Item label="在按钮中（由 loading 提供）">
        <Button loading>Save</Button>
      </Item>
    </Row>
  ),
}
