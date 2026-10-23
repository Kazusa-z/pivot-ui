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
      title="Color and alpha tracks"
      description="色轨与alpha轨独立维护ID和选择，但整组只有一个编辑会话。颜色保留线性HDR值；预览alpha = 色值alpha × 独立alpha轨。空alpha轨表示全不透明。"
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
      <StatePanel label="Both tracks and lifecycle" value={{ value, events }} />
    </ContractFrame>
  )
}
const meta = {
  title: 'Templates/ColorRampChannels',
  component: ColorRampChannels,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ColorRampChannels>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <ChannelsExample /> }
export const EmptyAlpha: Story = { render: () => <ChannelsExample empty /> }
export const Picker: Story = { render: () => <ChannelsExample popup /> }
