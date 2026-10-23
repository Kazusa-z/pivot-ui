import { StrictMode, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColorRamp } from '../src/templates/color/ColorRamp'
import { ColorRampPicker } from '../src/templates/color/ColorRampPicker'
import type { ColorRampValue } from '../src/values/color-ramp'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'

const initialRamp: ColorRampValue = {
  interpolation: 'linear',
  stops: [
    { id: 'red', position: 0, color: { space: 'srgb', r: 1, g: 0.1, b: 0.05, a: 1 } },
    { id: 'blue', position: 0.5, color: { space: 'srgb', r: 0.1, g: 0.2, b: 1, a: 1 } },
    { id: 'green', position: 0.5, color: { space: 'srgb', r: 0.1, g: 1, b: 0.25, a: 0.6 } },
  ],
}
function RampExample({
  empty = false,
  refuse = false,
  asynchronous = false,
}: {
  empty?: boolean
  refuse?: boolean
  asynchronous?: boolean
}) {
  const initial = empty ? { interpolation: 'linear' as const, stops: [] } : initialRamp
  const [value, setValue] = useState<ColorRampValue>(initial)
  const [selected, setSelected] = useState<string | null>(empty ? null : 'blue')
  const [events, setEvents] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const [reject, setReject] = useState(asynchronous)
  const [mounted, setMounted] = useState(true)
  const currentRevision = useRef(revision)
  currentRevision.current = revision
  const start = useRef(value)
  const append = (text: string) => setEvents((current) => [...current.slice(-11), text])
  return (
    <ContractFrame
      title="Color ramp"
      description="重合blue/green停靠点拥有独立ID。选择不写value；箭头/Home/End编辑位置，按住后松开只提交一次。Delete删除焦点点；Escape取消拖动。色彩以模型的显式空间插值，显示只做预览裁剪。"
      onReset={() => {
        setValue(initial)
        setSelected(empty ? null : 'blue')
        setRevision((current) => current + 1)
        setEvents([])
        setMounted(true)
      }}>
      <div className={contractStyles.row}>
        <ControlButton
          onClick={() => {
            setValue({ ...value, stops: [...value.stops].reverse() })
            setRevision((current) => current + 1)
          }}>
          Reverse source order
        </ControlButton>
        {asynchronous && (
          <>
            <ControlButton onClick={() => setReject((current) => !current)}>
              Commit: {reject ? 'Reject' : 'Accept'}
            </ControlButton>
            <ControlButton
              onClick={() => {
                setMounted((current) => !current)
                setRevision((current) => current + 1)
              }}>
              {mounted ? 'Unmount' : 'Mount'}
            </ControlButton>
          </>
        )}
      </div>
      {mounted && (
        <StrictMode>
          <ColorRamp
            value={value}
            activeStopId={selected}
            onActiveStopIdChange={(id) => {
              setSelected(id)
              append(`select ${id}`)
            }}
            resetKey={revision}
            onEditStart={(source) => {
              start.current = value
              append(`start ${source}`)
            }}
            onValueChange={(next) => {
              append('value request')
              if (!refuse) setValue(next)
            }}
            onValueCommit={async (next, reason) => {
              const initialValue = start.current
              append(`commit ${reason}`)
              if (asynchronous) {
                await new Promise((resolve) => setTimeout(resolve, 500))
                if (currentRevision.current !== revision) return
                if (reject) {
                  setValue(initialValue)
                  throw Error('Host rejected the color ramp. Change Commit to Accept and retry.')
                }
              }
              if (!refuse) setValue(next)
            }}
            onEditCancel={(reason) => {
              append(`cancel ${reason}`)
              if (!['external-update', 'target-change', 'reset', 'unmount'].includes(reason)) setValue(start.current)
            }}
          />
        </StrictMode>
      )}
      <StatePanel label="Ramp, selection and lifecycle" value={{ value, selected, revision, refuse, events }} />
    </ContractFrame>
  )
}
function EmptyRamp() {
  return <RampExample empty />
}
function RefusedRamp() {
  return <RampExample refuse />
}
function PendingRamp() {
  return <RampExample asynchronous />
}
function RampStates() {
  const [revision, setRevision] = useState(0)
  return (
    <ContractFrame
      title="Read-only, disabled and narrow ramp"
      description="只读停靠点仍可聚焦和选择以检查颜色，数值编辑不可用。disabled阻止所有交互。第三个编辑器限制到240px以检查换行。"
      onReset={() => setRevision((value) => value + 1)}>
      <ColorRamp value={initialRamp} readOnly aria-label="Read-only ramp" />
      <ColorRamp value={initialRamp} disabled aria-label="Disabled ramp" />
      <div style={{ maxWidth: 240 }}>
        <ColorRamp key={revision} defaultValue={initialRamp} />
      </div>
    </ContractFrame>
  )
}
function RampPopup() {
  const [value, setValue] = useState(initialRamp)
  const [revision, setRevision] = useState(0)
  return (
    <ContractFrame
      title="Ramp picker"
      description="紧凑入口使用主题感知Popover；选中色的单色Picker可嵌套打开。关闭后再打开保留父级数值；触发器ref和原生属性可转发。"
      onReset={() => {
        setValue(initialRamp)
        setRevision((value) => value + 1)
      }}>
      <div style={{ width: 180 }}>
        <ColorRampPicker value={value} onValueChange={setValue} resetKey={revision} label="Edit material ramp" />
      </div>
      <StatePanel label="Ramp" value={value} />
    </ContractFrame>
  )
}
const meta = {
  title: 'Templates/ColorRamp',
  component: ColorRamp,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ColorRamp>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <RampExample /> }
export const Empty: Story = { render: () => <EmptyRamp /> }
export const ControlledRefusal: Story = { render: () => <RefusedRamp /> }
export const PendingAndReset: Story = { render: () => <PendingRamp /> }
export const StatesAndNarrow: Story = { render: () => <RampStates /> }
export const Picker: Story = { render: () => <RampPopup /> }
