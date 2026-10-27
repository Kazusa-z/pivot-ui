import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColorRampPicker } from '../src/editors/color/ColorRampPicker'
import type { ColorAlphaRampValue, ColorRampValue } from '../src/values/color-ramp'
import { alphaRamp, ramp } from './support/color-samples'
import { describeComponent } from './support/describe'
import { Column, Item } from './support/layout'

const meta = {
  title: 'Editors/Color/ColorRampPicker',
  component: ColorRampPicker,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '显示渐变预览的按钮，点击后在浮层里编辑渐变。',
    use: ['属性面板里的渐变属性'],
    avoid: ['有足够空间常驻显示 → 直接用 `ColorRampEditor`'],
    related: ['`ColorRampEditor`：默认打开的编辑器', '`ColorAlphaRampEditor`：`variant="channels"` 时打开的编辑器'],
    notes: [
      '`variant` 决定值的形状：默认 `ramp` 使用 `ColorRampValue`，`channels` 使用 `ColorAlphaRampValue`',
      '除下表的浮层属性外，其余属性与对应编辑器相同，原样传给浮层里的编辑器',
    ],
    keyboard: [
      ['Enter / Space', '打开浮层'],
      ['Escape', '关闭浮层'],
    ],
  }),
  args: { label: 'Edit gradient' },
} satisfies Meta<typeof ColorRampPicker>
export default meta
type Story = StoryObj<typeof meta>

/** 默认 `variant="ramp"`：每个色标自带透明度。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<ColorRampValue>(ramp)
    return (
      <Column width={200}>
        <ColorRampPicker label={args.label} value={value} onValueChange={setValue} onValueCommit={setValue} />
      </Column>
    )
  },
}

/** `variant="channels"`：颜色和透明度分开编辑。 */
export const Channels: Story = {
  render: function Render() {
    const [value, setValue] = useState<ColorAlphaRampValue>(alphaRamp)
    return (
      <Column width={200}>
        <ColorRampPicker
          variant="channels"
          label="Edit fade"
          value={value}
          onValueChange={setValue}
          onValueCommit={setValue}
        />
      </Column>
    )
  },
}

/** 禁用时不能打开。 */
export const Disabled: Story = {
  render: () => (
    <Column width={200}>
      <Item label="disabled">
        <ColorRampPicker label="Disabled gradient" defaultValue={ramp} disabled />
      </Item>
    </Column>
  ),
}
