import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { Slider } from '../src/controls/sliders/Slider'
import { Button } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const meta = {
  title: 'Controls/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '在固定范围内拖动调整数值；一个滑块是单值，两个是区间，也可以有更多。',
    use: ['不透明度、强度等比例参数', '可见范围、过渡区间等区间值（多个滑块）'],
    avoid: [
      '需要精确输入数值 → 用 `SliderField`（输入框 + 滑块）',
      '把一个总量分成几段 → 用 `PartitionSlider`',
      '没有固定上限的数值 → 用 `NumberInput`',
    ],
    related: ['`SliderField`：输入框 + 滑块', '`PartitionSlider`：分段比例'],
    notes: ['`value` 始终是数组；拖动中 `onValueChange` 给出预览，松开或按键后 `onValueCommit` 给出最终值'],
    keyboard: [
      ['← / → 或 ↓ / ↑', '按 `step` 调整'],
      ['Page Up / Page Down', '大步调整'],
      ['Home / End', '跳到最小 / 最大值'],
      ['Escape', '取消本次拖动'],
    ],
  }),
  args: { 'aria-label': 'Opacity', defaultValue: [40], min: 0, max: 100, onValueChange: fn(), onValueCommit: fn() },
} satisfies Meta<typeof Slider>
export default meta
type Story = StoryObj<typeof meta>

/** 块状轨道：填充表示当前值，竖条是滑块；可以在轨道内显示参数名和单位。 */
export const Basic: Story = {
  args: { startSlot: 'Opacity', endSlot: '%' },
  render: (args) => (
    <Column width={280}>
      <Slider {...args} />
    </Column>
  ),
}

/** 两个滑块表示区间，`minStepsBetweenThumbs` 保持最小间隔，`thumbLabels` 为每个滑块命名。 */
export const Range: Story = {
  args: {
    'aria-label': 'Visible range',
    defaultValue: [20, 80],
    minStepsBetweenThumbs: 5,
    thumbLabels: ['Start', 'End'],
  },
  render: (args) => (
    <Column width={280}>
      <Slider {...args} />
    </Column>
  ),
}

/** `compact` 使用细轨道和短竖条，适合紧凑面板里的多个滑块。 */
export const Compact: Story = {
  args: {
    'aria-label': 'Levels',
    defaultValue: [20, 60, 80],
    compact: true,
    minStepsBetweenThumbs: 5,
    thumbLabels: ['Low', 'Mid', 'High'],
  },
  render: (args) => (
    <Column width={280}>
      <Slider {...args} />
    </Column>
  ),
}

/** `showRuler` 显示刻度，便于对齐常用值。 */
export const WithRuler: Story = {
  args: { showRuler: true, startSlot: 'Strength' },
  render: (args) => (
    <Column width={280}>
      <Slider {...args} />
    </Column>
  ),
}

/** `xs` 20 / `sm` 24 用于面板，`md` 32 用于表单。 */
export const Sizes: Story = {
  render: (args) => (
    <Column width={280}>
      {(['xs', 'sm', 'md'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ xs: 20, sm: 24, md: 32 }[size]}px`}>
          <Slider {...args} size={size} />
        </Item>
      ))}
    </Column>
  ),
}

/** 竖向滑块，默认高 160px。 */
export const Vertical: Story = {
  render: (args) => (
    <Row>
      <Slider {...args} orientation="vertical" />
      <Slider {...args} orientation="vertical" defaultValue={[30, 70]} aria-label="Range" />
    </Row>
  ),
}

/** 只读可以聚焦和浏览但不修改；禁用不可交互。 */
export const States: Story = {
  render: (args) => (
    <Column width={280}>
      <Item label="readOnly">
        <Slider {...args} readOnly />
      </Item>
      <Item label="disabled">
        <Slider {...args} disabled />
      </Item>
    </Column>
  ),
}

/** 记录 start / commit / cancel；External 50 模拟外部更新，会取消正在进行的拖动。 */
export const BehaviorEditLifecycle: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState([25])
    const [revision, setRevision] = useState(0)
    const [events, setEvents] = useState<string[]>([])
    const initial = useRef(value)
    const record = (event: string) => setEvents((items) => [...items.slice(-7), event])
    return (
      <Column width={280}>
        <Slider
          aria-label="Opacity"
          value={value}
          onValueChange={setValue}
          resetKey={revision}
          startSlot="Opacity"
          endSlot="%"
          onEditStart={(source) => {
            initial.current = value
            record(`start: ${source}`)
          }}
          onValueCommit={(next, reason) => record(`${reason}: ${next.join(', ')}`)}
          onEditCancel={(reason) => {
            if (!['external-update', 'reset', 'target-change', 'unmount'].includes(reason)) setValue(initial.current)
            record(`cancel: ${reason}`)
          }}
        />
        <Row>
          <Button size="sm" variant="outline" onClick={() => setValue([50])}>
            External 50
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRevision((current) => current + 1)}>
            Change target
          </Button>
        </Row>
        <StateView value={{ value, events }} />
      </Column>
    )
  },
}
