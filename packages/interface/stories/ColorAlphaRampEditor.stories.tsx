import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ColorAlphaRampEditor } from '../src/editors/color/ColorAlphaRampEditor'
import type { ColorAlphaRampValue } from '../src/values/color-ramp'
import { alphaRamp } from './support/color-samples'
import { describeComponent } from './support/describe'
import { Column, Grid, Item, StateView } from './support/layout'

const meta = {
  title: 'Editors/Color/ColorAlphaRampEditor',
  component: ColorAlphaRampEditor,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '颜色和透明度分两条轨道编辑的渐变：上轨是颜色色标，下轨是透明度色标，位置互相独立。',
    use: ['粒子、特效：颜色变化和淡入淡出的时机不同'],
    avoid: ['颜色与透明度一起变化 → 用 `ColorRampEditor`，更简单'],
    related: ['`ColorRampEditor`：单轨渐变', '`ColorRampPicker`：`variant="channels"` 时打开本组件'],
    notes: [
      '`value` 是 `{ color, alpha }`：`color` 与 `ColorRampEditor` 的值相同，`alpha` 是 `{ id, position, alpha }` 列表',
      '两条轨道各自有选中的色标（`activeStopId` / `activeAlphaStopId`）',
    ],
    keyboard: [
      ['Tab', '在颜色色标、透明度色标和输入框之间移动'],
      ['← / →', '移动聚焦的色标；Shift 0.1，Ctrl（⌘）0.001'],
      ['Delete / Backspace', '删除聚焦的色标'],
      ['Escape', '取消当前编辑'],
    ],
  }),
  args: { defaultValue: alphaRamp, onValueChange: fn(), onValueCommit: fn() },
  argTypes: { value: { control: false }, defaultValue: { control: false }, capabilities: { control: false } },
} satisfies Meta<typeof ColorAlphaRampEditor>
export default meta
type Story = StoryObj<typeof meta>

/** 颜色从暖到冷，透明度在中间最高、两端淡出。 */
export const Basic: Story = {
  render: (args) => (
    <Column width={360}>
      <ColorAlphaRampEditor {...args} />
    </Column>
  ),
}

/** 只读与禁用。 */
export const States: Story = {
  render: () => (
    <Grid>
      <Item label="readOnly">
        <ColorAlphaRampEditor defaultValue={alphaRamp} readOnly />
      </Item>
      <Item label="disabled">
        <ColorAlphaRampEditor defaultValue={alphaRamp} disabled />
      </Item>
    </Grid>
  ),
}

/** 受控值与两条轨道的选中色标。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<ColorAlphaRampValue>(alphaRamp)
    const [colorStop, setColorStop] = useState<string | null>('warm')
    const [alphaStop, setAlphaStop] = useState<string | null>('solid')
    return (
      <Column width={380}>
        <ColorAlphaRampEditor
          value={value}
          onValueChange={setValue}
          onValueCommit={setValue}
          activeStopId={colorStop}
          onActiveStopIdChange={setColorStop}
          activeAlphaStopId={alphaStop}
          onActiveAlphaStopIdChange={setAlphaStop}
        />
        <StateView value={{ colorStop, alphaStop, alpha: value.alpha }} />
      </Column>
    )
  },
}
