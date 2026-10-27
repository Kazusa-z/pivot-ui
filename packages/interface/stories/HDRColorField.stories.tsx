import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { HDRColorField } from '../src/editors/color/HDRColorField'
import type { ColorValue } from '../src/values/color'
import { emissive } from './support/color-samples'
import { describeComponent } from './support/describe'
import { Column, Item } from './support/layout'

const meta = {
  title: 'Editors/Color/HDRColorField',
  component: HDRColorField,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '可以超过 1 的 HDR 颜色字段：色块 + 强度输入，强度是 RGB 的峰值倍率。',
    use: ['发光、灯光颜色等需要比白色更亮的值'],
    avoid: ['普通 0–1 颜色 → 用 `ColorField`'],
    related: ['`ColorField`：普通颜色字段', '`ColorEditor`：`hdr` 打开后的完整编辑器'],
    notes: [
      '强度由 RGB 计算：修改强度会等比缩放 RGB，回调仍返回完整的 `ColorValue`',
      '界面使用曝光档位（EV）时，应用把档位换算成倍率再设置 `intensityMin` / `intensityMax`',
    ],
  }),
  args: { label: 'Emission', value: emissive, onValueChange: fn(), onValueCommit: fn() },
  argTypes: { value: { control: false }, capabilities: { control: false } },
} satisfies Meta<typeof HDRColorField>
export default meta
type Story = StoryObj<typeof meta>

/** 红色通道是白色的 4 倍；修改强度会等比缩放 RGB。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<ColorValue>(args.value)
    return (
      <Column width={320}>
        <HDRColorField
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
      </Column>
    )
  },
}

/** 强度限定在 1–10，步长 0.5。 */
export const IntensityRange: Story = {
  args: { intensityMin: 1, intensityMax: 10, intensityStep: 0.5 },
  render: Basic.render,
}

/** 只读与禁用。 */
export const States: Story = {
  render: () => (
    <Column width={320}>
      <Item label="readOnly">
        <HDRColorField label="Read only emission" value={emissive} readOnly />
      </Item>
      <Item label="disabled">
        <HDRColorField label="Disabled emission" value={emissive} disabled />
      </Item>
    </Column>
  ),
}
