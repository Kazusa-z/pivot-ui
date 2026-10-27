import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { PartitionSlider } from '../src/controls/sliders/PartitionSlider'
import { describeComponent } from './support/describe'
import { Column, Item, StateView } from './support/layout'

const meta = {
  title: 'Controls/PartitionSlider',
  component: PartitionSlider,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '把一个总量分成几段，拖动分界点调整相邻两段的长度，总量保持不变。',
    use: ['LOD 距离分段、阴影级联比例、混合权重等"加起来等于一个总数"的参数'],
    avoid: [
      '随机分布（固定值 / 范围 / 曲线）→ 用 `NumericDistributionEditor`',
      '互相独立的几个数 → 用 `NumberTupleInput`',
    ],
    related: ['`Slider`：每个滑块是独立的值', '`NumericDistributionEditor`：随机分布，与分段无关'],
    notes: ['`value` 是各段长度，不是分界点位置；n 段有 n − 1 个分界点', '`minSegment` 限制每段的最小长度'],
    keyboard: [['← / →', '移动当前分界点']],
  }),
  args: { 'aria-label': 'Cascade split', defaultValue: [20, 30, 50], onValueChange: fn(), onValueCommit: fn() },
} satisfies Meta<typeof PartitionSlider>
export default meta
type Story = StoryObj<typeof meta>

/** 三段，总量由当前长度之和决定（这里是 100）。 */
export const Basic: Story = {
  render: (args) => (
    <Column width={320}>
      <PartitionSlider {...args} />
    </Column>
  ),
}

/** 固定 `total` 和自定义单位；`minSegment` 保证每段至少 10。 */
export const TotalAndMinimum: Story = {
  args: { 'aria-label': 'LOD distances', defaultValue: [40, 80, 120], total: 240, unit: 'm', minSegment: 10 },
  render: (args) => (
    <Column width={320}>
      <PartitionSlider {...args} />
    </Column>
  ),
}

/** 与 `Slider` 相同的三档高度。 */
export const Sizes: Story = {
  render: (args) => (
    <Column width={320}>
      {(['xs', 'sm', 'md'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ xs: 20, sm: 24, md: 32 }[size]}px`}>
          <PartitionSlider {...args} size={size} />
        </Item>
      ))}
    </Column>
  ),
}

/** 受控使用时显示各段长度与总量。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState([25, 25, 50])
    return (
      <Column width={320}>
        <PartitionSlider aria-label="Weights" value={value} onValueChange={setValue} minSegment={5} />
        <StateView value={{ value, total: value.reduce((sum, item) => sum + item, 0) }} />
      </Column>
    )
  },
}
