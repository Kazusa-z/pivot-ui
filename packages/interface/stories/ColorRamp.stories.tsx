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
      title="颜色渐变与停靠点"
      description="先分别选择位于同一位置的 blue 和 green，再拖动其中一个点，观察渐变与下方数据。也可用方向键调整位置、Delete 删除或 Escape 撤销本次调整。接入时用 onValueChange 更新预览，在 onValueCommit 中保存整条渐变。"
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
                  throw Error('渐变未保存，请将 Commit 切换为 Accept 后重试。')
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
      <StatePanel label="渐变数据、当前选择与编辑事件" value={{ value, selected, revision, refuse, events }} />
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
      title="只读、禁用与窄空间布局"
      description="比较只读、禁用和 240px 窄布局中的编辑器。可在只读示例里选择点查看颜色，再用 Tab 体验各控件的焦点；第三个示例可以直接编辑，方便观察窄表单中的换行效果。"
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
      title="弹出式渐变编辑器"
      description="点击渐变预览打开编辑器，再点击当前颜色打开单色选择器。改好颜色后关闭并重新打开，查看保存的渐变；应用只需用 value/onValueChange 连接状态，就能把这种紧凑入口放进表单。"
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
  tags: ['autodocs'],
  title: 'Templates/ColorRamp',
  component: ColorRamp,
  parameters: {
    docs: {
      description: {
        component:
          'ColorRamp 用于编辑随位置变化的颜色渐变；ColorRampPicker 提供紧凑按钮和弹出编辑器。每个停靠点都有稳定 id、0 到 1 的 position 和一个颜色值。\n\n选择停靠点只切换编辑对象；拖动、键盘移动、增删或改色通过 onValueChange 更新整个渐变，并由 onValueCommit 表示一次完整编辑。应用保存 value，并在受控取消时恢复编辑前的值。\n\ninterpolation 控制线性或阶梯过渡，同一位置可以有多个独立停靠点。颜色按声明的色彩空间插值；HDR 值保留在数据中，预览会限制到屏幕可显示范围。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ColorRamp>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <RampExample /> }
export const Empty: Story = { render: () => <EmptyRamp /> }
export const ControlledRefusal: Story = { render: () => <RefusedRamp /> }
export const PendingAndReset: Story = { render: () => <PendingRamp /> }
export const StatesAndNarrow: Story = { render: () => <RampStates /> }
export const Picker: Story = { render: () => <RampPopup /> }
