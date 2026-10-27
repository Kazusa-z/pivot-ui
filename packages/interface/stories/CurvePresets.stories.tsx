import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { CurvePresets } from '../src/editors/curve/CurvePresets'
import type { CurveValue } from '../src/values/curve'
import { easeCurve, useMemoryPresetService } from './support/curve-samples'
import { describeComponent } from './support/describe'
import { Column, StateView } from './support/layout'

const meta = {
  title: 'Editors/Curve/CurvePresets',
  component: CurvePresets,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '曲线预设列表：选择后应用到当前曲线；接入服务后可以保存和删除个人预设。',
    use: ['自己组合曲线编辑界面时，在 `CurveEditor` 旁边放预设'],
    avoid: ['使用 `CurvePicker` 时不需要单独放，浮层里已经包含'],
    related: ['`CurvePicker`：内置本组件', '`CurveEditor`：编辑应用后的曲线'],
    notes: [
      '内置预设来自 `presets`（默认 `defaultCurvePresets`）；个人预设来自 `presetService`',
      '`CurvePresetService` 的 `save`、`remove` 可选：没有实现时对应按钮禁用，并显示说明',
      '应用预设只调用 `onApplyPreset`，替换曲线由应用完成',
    ],
  }),
  args: { value: easeCurve, onApplyPreset: fn() },
  argTypes: { value: { control: false }, presets: { control: false }, presetService: { control: false } },
} satisfies Meta<typeof CurvePresets>
export default meta
type Story = StoryObj<typeof meta>

/** 只有内置预设。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<CurveValue>(args.value)
    return (
      <Column width={320}>
        <CurvePresets
          {...args}
          value={value}
          onApplyPreset={(next) => {
            args.onApplyPreset?.(next)
            setValue(next)
          }}
        />
      </Column>
    )
  },
}

/** 接入个人预设服务：可以保存当前曲线、加载和删除。 */
export const PersonalPresets: Story = {
  render: function Render() {
    const presetService = useMemoryPresetService()
    const [value, setValue] = useState<CurveValue>(easeCurve)
    return (
      <Column width={320}>
        <CurvePresets value={value} presetService={presetService} onApplyPreset={setValue} />
      </Column>
    )
  },
}

/** 记录应用的曲线。 */
export const BehaviorApply: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const presetService = useMemoryPresetService()
    const [value, setValue] = useState<CurveValue>(easeCurve)
    return (
      <Column width={320}>
        <CurvePresets value={value} presetService={presetService} onApplyPreset={setValue} />
        <StateView value={value} />
      </Column>
    )
  },
}
