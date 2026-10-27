import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ColorField } from '../src/editors/color/ColorField'
import type { ColorValue } from '../src/values/color'
import { blue, createDemoCapabilities } from './support/color-samples'
import { describeComponent } from './support/describe'
import { Column, Item } from './support/layout'

const meta = {
  title: 'Editors/Color/ColorField',
  component: ColorField,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '一行的颜色字段：色块（点击打开完整编辑器）、HEX 输入和透明度输入。',
    use: ['属性面板里的颜色属性，需要直接看到和键入 HEX'],
    avoid: ['空间很窄、只放得下色块 → 用 `ColorPicker`', 'HDR 发光颜色 → 用 `HDRColorField`'],
    related: ['`ColorPicker`：只有色块', '`ColorEditor`：浮层里的完整编辑器', '`HDRColorField`：加上强度输入'],
    notes: [
      'HEX 按 sRGB 显示；保存为 Linear 的颜色会自动换算',
      '透明度输入为 0–1；`capabilities` 在浮层里提供复制、粘贴和取色',
    ],
    keyboard: [
      ['Enter / Space（色块）', '打开编辑浮层'],
      ['Enter（输入框）', '提交 HEX 或透明度'],
      ['Escape', '取消输入，或关闭浮层'],
    ],
  }),
  args: { label: 'Base color', value: blue, onValueChange: fn(), onValueCommit: fn() },
  argTypes: { value: { control: false }, capabilities: { control: false } },
} satisfies Meta<typeof ColorField>
export default meta
type Story = StoryObj<typeof meta>

/** 受控使用；点击色块打开完整编辑器。 */
export const Basic: Story = {
  render: function Render(args) {
    const capabilities = useMemo(createDemoCapabilities, [])
    const [value, setValue] = useState<ColorValue>(args.value)
    return (
      <Column width={280}>
        <ColorField
          {...args}
          value={value}
          capabilities={capabilities}
          onValueChange={(next) => {
            args.onValueChange?.(next)
            setValue(next)
          }}
          onValueCommit={(next, reason) => {
            args.onValueCommit?.(next, reason)
            setValue(next)
          }}
        />
      </Column>
    )
  },
}

/** 只读与禁用。 */
export const States: Story = {
  render: () => (
    <Column width={280}>
      <Item label="readOnly">
        <ColorField label="Read only color" value={blue} readOnly />
      </Item>
      <Item label="disabled">
        <ColorField label="Disabled color" value={blue} disabled />
      </Item>
    </Column>
  ),
}
