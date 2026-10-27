import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { CurvePicker } from '../src/editors/curve/CurvePicker'
import type { CurveValue } from '../src/values/curve'
import { easeCurve, useMemoryPresetService } from './support/curve-samples'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const meta = {
  title: 'Editors/Curve/CurvePicker',
  component: CurvePicker,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '显示曲线缩略图的按钮，点击后在浮层里打开 `CurveEditor` 和预设列表。',
    use: ['属性面板里的曲线属性'],
    avoid: ['有足够空间常驻显示 → 直接用 `CurveEditor`'],
    related: ['`CurveEditor`：浮层里的编辑器，属性相同', '`CurvePresets`：浮层里的预设列表'],
    notes: [
      '`CurveEditor` 的所有属性都可以传入，原样交给浮层里的编辑器',
      '`presets` 默认是内置的 Linear / Ease / Arch 等；提供 `presetService` 后还可以保存个人预设',
    ],
    keyboard: [
      ['Enter / Space', '打开浮层'],
      ['Escape', '取消编辑，或关闭浮层'],
    ],
  }),
  args: { value: easeCurve, label: 'Ease curve', onValueChange: fn(), onValueCommit: fn() },
  argTypes: { value: { control: false }, presets: { control: false }, presetService: { control: false } },
} satisfies Meta<typeof CurvePicker>
export default meta
type Story = StoryObj<typeof meta>

/** 点击预览打开浮层，编辑曲线或应用预设。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<CurveValue>(args.value)
    return (
      <Column width={240}>
        <CurvePicker
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

/** 提供 `presetService` 后，浮层里可以保存当前曲线为个人预设，并删除。 */
export const PersonalPresets: Story = {
  render: function Render() {
    const presetService = useMemoryPresetService()
    const [value, setValue] = useState<CurveValue>(easeCurve)
    return (
      <Column width={240}>
        <CurvePicker
          label="Curve with presets"
          value={value}
          presetService={presetService}
          onValueChange={setValue}
          onValueCommit={setValue}
        />
      </Column>
    )
  },
}

/** 只读仍可打开查看，禁用不能打开。 */
export const States: Story = {
  render: () => (
    <Row>
      <Item label="readOnly">
        <CurvePicker label="Read only curve" value={easeCurve} readOnly />
      </Item>
      <Item label="disabled">
        <CurvePicker label="Disabled curve" value={easeCurve} disabled />
      </Item>
    </Row>
  ),
}

/** 受控打开状态与提交记录。 */
export const BehaviorControlledOpen: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<CurveValue>(easeCurve)
    const [open, setOpen] = useState(false)
    const [events, setEvents] = useState<string[]>([])
    return (
      <Column width={320}>
        <CurvePicker
          label="Controlled curve"
          value={value}
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            setEvents((items) => [...items.slice(-7), `open:${next}`])
          }}
          onValueChange={setValue}
          onValueCommit={(next, reason) => {
            setValue(next)
            setEvents((items) => [...items.slice(-7), `commit:${reason}`])
          }}
        />
        <StateView value={{ open, points: value.points, events }} />
      </Column>
    )
  },
}
