import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from '../src/display/feedback'
import { describeComponent } from './support/describe'
import { Column, Item } from './support/layout'

const meta = {
  title: 'Display/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '显示任务进度的细条；不知道进度时显示不确定状态的动画。',
    use: ['导入、烘焙、上传等耗时任务'],
    avoid: ['按钮或字段里的短暂等待 → 用 `Spin` 或按钮的 `loading`', '可以拖动调整的值 → 用 `Slider`'],
    related: ['`Spin`：小的加载指示'],
    notes: ['提供 `label` 说明是什么任务；需要读出 "3 / 12 assets" 这类文字时用 `getValueLabel`'],
  }),
  args: { label: 'Importing assets', value: 40 },
} satisfies Meta<typeof Progress>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: (args) => (
    <Column width={320}>
      <Progress {...args} />
    </Column>
  ),
}

/** `value` 为 `null` 时显示不确定进度。 */
export const Indeterminate: Story = {
  render: () => (
    <Column width={320}>
      <Progress label="Baking lightmaps" value={null} />
    </Column>
  ),
}

/** 三档高度：`sm` 4、`md` 6、`lg` 8。 */
export const Sizes: Story = {
  render: (args) => (
    <Column width={320}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Item key={size} label={size}>
          <Progress {...args} size={size} />
        </Item>
      ))}
    </Column>
  ),
}

/** 自定义 `max` 和读屏文字。 */
export const CustomLabel: Story = {
  render: function Render() {
    const [done, setDone] = useState(3)
    useEffect(() => {
      const timer = setInterval(() => setDone((value) => (value >= 12 ? 0 : value + 1)), 600)
      return () => clearInterval(timer)
    }, [])
    return (
      <Column width={320}>
        <Progress label="Uploading" value={done} max={12} getValueLabel={(value, max) => `${value} / ${max} assets`} />
      </Column>
    )
  },
}
