import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ColorPicker } from '../src/editors/color/ColorPicker'
import type { ColorValue } from '../src/values/color'
import { blue, orange } from './support/color-samples'
import { describeComponent } from './support/describe'
import { Item, Row, StateView } from './support/layout'

const meta = {
  title: 'Editors/Color/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '一个色块按钮，点击后在浮层里打开完整的颜色编辑器。',
    use: ['空间很小的位置：工具栏、表格单元格、列表项', '一行里并排多个颜色'],
    avoid: ['需要直接看到和键入 HEX → 用 `ColorField`'],
    related: ['`ColorField`：色块 + HEX + 透明度', '`ColorEditor`：浮层里的编辑器'],
    notes: ['浮层可以受控打开（`open` / `onOpenChange`）；`contentProps` 调整浮层的位置', '色块按棋盘格显示透明度'],
    keyboard: [
      ['Enter / Space', '打开浮层'],
      ['Escape', '关闭浮层；正在编辑时先取消编辑'],
    ],
  }),
  args: { label: 'Fill color', value: blue, onValueChange: fn(), onValueCommit: fn() },
  argTypes: { value: { control: false }, capabilities: { control: false } },
} satisfies Meta<typeof ColorPicker>
export default meta
type Story = StoryObj<typeof meta>

/** 受控使用；点击色块打开浮层。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<ColorValue>(args.value)
    return (
      <ColorPicker
        {...args}
        value={value}
        onValueChange={(next) => {
          args.onValueChange?.(next)
          setValue(next)
        }}
        onValueCommit={(next, reason) => {
          args.onValueCommit?.(next, reason)
          setValue(next)
        }}
      />
    )
  },
}

/** 只读仍可打开查看，禁用不能打开。 */
export const States: Story = {
  render: () => (
    <Row>
      <Item label="readOnly">
        <ColorPicker label="Read only color" value={orange} readOnly />
      </Item>
      <Item label="disabled">
        <ColorPicker label="Disabled color" value={orange} disabled />
      </Item>
    </Row>
  ),
}

/** 受控打开状态。 */
export const BehaviorControlledOpen: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<ColorValue>(blue)
    const [open, setOpen] = useState(false)
    return (
      <Row>
        <ColorPicker
          label="Controlled color"
          value={value}
          open={open}
          onOpenChange={setOpen}
          onValueChange={setValue}
          onValueCommit={setValue}
        />
        <StateView value={{ open, value }} />
      </Row>
    )
  },
}
