import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColorRampChannels } from '../src/templates/color/ColorRampChannels'
import { ColorRampPicker } from '../src/templates/color/ColorRampPicker'
import type { ColorRampChannelsValue } from '../src/values/color-ramp'
import { ContractFrame, StatePanel } from './support/ContractFrame'

const channels: ColorRampChannelsValue = {
  color: {
    interpolation: 'linear',
    stops: [
      { id: 'warm', position: 0, color: { space: 'linear', r: 1.6, g: 0.1, b: 0.05, a: 1 } },
      { id: 'cool', position: 1, color: { space: 'linear', r: 0.05, g: 0.2, b: 1.2, a: 1 } },
    ],
  },
  alpha: [
    { id: 'fade-in', position: 0, alpha: 0 },
    { id: 'solid', position: 0.5, alpha: 1 },
    { id: 'fade-out', position: 1, alpha: 0 },
  ],
}
function ChannelsExample({ empty = false, popup = false }: { empty?: boolean; popup?: boolean }) {
  const initial = empty ? { ...channels, alpha: [] } : channels
  const [value, setValue] = useState(initial)
  const [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value)
  const append = (event: string) => setEvents((current) => [...current.slice(-9), event])
  const props = {
    value,
    hdr: true,
    onValueChange: setValue,
    resetKey: revision,
    onEditStart: () => {
      start.current = value
      append('start')
    },
    onValueCommit: () => append('commit'),
    onEditCancel: (
      reason: Parameters<NonNullable<React.ComponentProps<typeof ColorRampChannels>['onEditCancel']>>[0]
    ) => {
      append(`cancel ${reason}`)
      if (!['external-update', 'target-change', 'reset', 'unmount'].includes(reason)) setValue(start.current)
    },
  }
  return (
    <ContractFrame
      title="分别编辑颜色与透明度"
      description="先拖动颜色轨上的点，再调整透明度轨上的点，比较两条轨道怎样共同影响预览。下方展示每次编辑后的完整 value，应用可直接保存这份双轨数据。此例使用线性 HDR 颜色，最终透明度由颜色自身 alpha 与透明度轨共同决定。"
      onReset={() => {
        setValue(initial)
        setRevision((next) => next + 1)
        setEvents([])
      }}>
      {popup ? (
        <div style={{ maxWidth: 240 }}>
          <ColorRampPicker {...props} variant="channels" label="Edit particle ramp" />
        </div>
      ) : (
        <ColorRampChannels {...props} />
      )}
      <StatePanel label="双轨数据与编辑事件" value={{ value, events }} />
    </ContractFrame>
  )
}
const meta = {
  tags: ['autodocs'],
  title: 'Templates/ColorRampChannels',
  component: ColorRampChannels,
  parameters: {
    docs: {
      description: {
        component:
          'ColorRampChannels 适用于颜色和透明度需要分别布点的渐变。value 包含 color 色轨与 alpha 透明度轨，每条轨道有独立的停靠点 ID 和当前选择。\n\n选择停靠点不会修改属性。编辑任一轨道时，onValueChange 和 onValueCommit 都返回完整的双轨数据，便于应用预览、保存与撤销一次编辑。\n\n最终透明度是颜色自身 alpha 与透明度轨采样值的乘积；空透明度轨按 1 处理。应用负责保存 value、处理取消和提供可选取色能力。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ColorRampChannels>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <ChannelsExample /> }
export const EmptyAlpha: Story = { render: () => <ChannelsExample empty /> }
export const Picker: Story = { render: () => <ChannelsExample popup /> }
