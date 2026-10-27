import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { NumberTupleInput, type NumericAxisConfig } from '../src/editors/numeric'
import { describeComponent } from './support/describe'
import { Column, StateView } from './support/layout'

const marginAxes: readonly NumericAxisConfig[] = [
  { key: 'top', label: 'T', unit: 'px', min: 0 },
  { key: 'right', label: 'R', unit: 'px', min: 0 },
  { key: 'bottom', label: 'B', unit: 'px', min: 0 },
  { key: 'left', label: 'L', unit: 'px', min: 0 },
]

const meta = {
  title: 'Editors/Numeric/NumberTupleInput',
  component: NumberTupleInput,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '一行编辑一组命名的数值，轴名、单位、范围逐项配置；值是数组。',
    use: ['不是 x / y / z 形状的参数组：边距、圆角、RGB 系数、时间段', '需要按轴设置不同的范围或单位'],
    avoid: ['向量和矩形 → 用 `Vector3Input`、`RectInput`，值保持对象形状', '只有一个数 → 用 `NumberInput`'],
    related: ['`VectorInput`：基于本组件的向量与矩形输入', '`NumberInput`：每一项使用的输入框'],
    notes: [
      '`value` 的长度和顺序与 `axes` 一致；回调返回完整数组和正在编辑的下标',
      '整组的 `min`、`step` 等是默认值，`axes` 里每一项可以覆盖',
      '提供 `onLinkedChange` 后显示联动按钮，开启时按编辑开始时的比例一起变化',
    ],
  }),
  args: { label: 'Margin', axes: marginAxes, value: [8, 16, 8, 16], onValueChange: fn(), onValueCommit: fn() },
  argTypes: { axes: { control: false }, value: { control: false }, defaultValue: { control: false } },
} satisfies Meta<typeof NumberTupleInput>
export default meta
type Story = StoryObj<typeof meta>

/** 四个方向的边距，每项都不小于 0。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? [])
    return (
      <Column width={400}>
        <NumberTupleInput
          {...args}
          value={value}
          onValueChange={(next, axis) => {
            args.onValueChange?.(next, axis)
            setValue(next)
          }}
        />
      </Column>
    )
  },
}

/** 每一项不同的范围和精度：起点、长度、权重。 */
export const PerAxisConstraints: Story = {
  render: () => (
    <Column width={400}>
      <NumberTupleInput
        label="Segment"
        defaultValue={[0.25, 2, 0.5]}
        axes={[
          { key: 'start', label: 'Start', unit: 's', min: 0, precision: 2 },
          { key: 'length', label: 'Length', unit: 's', min: 0.1, step: 0.5, precision: 1 },
          { key: 'weight', label: 'Weight', min: 0, max: 1, step: 0.05, precision: 2 },
        ]}
      />
    </Column>
  ),
}

/** 联动开启时修改一项，其余项按比例变化。 */
export const BehaviorLinked: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<readonly number[]>([4, 4, 8, 8])
    const [linked, setLinked] = useState(true)
    const [events, setEvents] = useState<string[]>([])
    return (
      <Column width={420}>
        <NumberTupleInput
          label="Corner radius"
          axes={marginAxes}
          value={value}
          linked={linked}
          onLinkedChange={setLinked}
          onValueChange={setValue}
          onValueCommit={(next, reason, axis) =>
            setEvents((list) => [...list.slice(-7), `commit:${axis}:${reason}:${next.join(',')}`])
          }
        />
        <StateView value={{ value, linked, events }} />
      </Column>
    )
  },
}
