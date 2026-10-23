import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NumericSlider } from '../src/templates/numeric/NumericSlider'
import type { NumericCancelReason } from '../src/interaction/numeric/types'
import { css } from '../styled-system/css'

const frame = css({ display: 'grid', gap: '12px', width: 'min(460px, 100%)', minWidth: 0 })
const rollback = (reason: NumericCancelReason) =>
  ['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason)
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'NumericSlider 把数值输入框和滑块连接到同一个值，适合既要快速拖动又要精确输入的参数。\n\nvalue/onValueChange 控制实时值，onValueCommit 表示完成一次编辑；输入框与滑块共用这组回调。min/max 是硬范围，softMin/softMax 可单独限定滑块的可见范围，文本仍可输入硬范围内的值。\n\n受控取消由应用恢复编辑前的值。异步提交可返回 Promise，拒绝后可继续编辑或重试；切换对象时更新 resetKey。id 对应数值输入框，滑块有单独的可访问名称。',
      },
    },
  },
  title: 'Templates/NumericSlider',
  component: NumericSlider,
  tags: ['autodocs'],
} satisfies Meta<typeof NumericSlider>
export default meta
type Story = StoryObj<typeof meta>
function SliderExample({ reject = false }: { reject?: boolean }) {
  const [value, setValue] = useState(25)
  const [events, setEvents] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const start = useRef(value)
  const record = (event: string) => setEvents((list) => [...list.slice(-9), event])
  return (
    <div className={frame}>
      <label htmlFor="numeric-slider-value">Exposure</label>
      <NumericSlider
        id="numeric-slider-value"
        label="Exposure"
        value={value}
        min={0}
        max={100}
        step={1}
        dragStep={0.1}
        precision={2}
        unit="%"
        resetKey={revision}
        onEditStart={(source) => {
          start.current = value
          record(`begin:${source}`)
        }}
        onValueChange={(next) => {
          record(`change:${next}`)
          if (!reject) setValue(next)
        }}
        onValueCommit={(next, reason) => record(`commit:${next}:${reason}`)}
        onEditCancel={(reason) => {
          if (rollback(reason) && !reject) setValue(start.current)
          record(`cancel:${reason}`)
        }}
      />
      <button
        onClick={() => {
          setValue(25)
          setEvents([])
          setRevision((value) => value + 1)
        }}>
        Reset
      </button>
      <pre>{JSON.stringify({ value, reject, events }, null, 2)}</pre>
    </div>
  )
}
function SoftRangeExample() {
  const [value, setValue] = useState(150)
  const start = useRef(value)
  return (
    <div className={frame}>
      <p>
        在输入框填入 150，观察数值和滑块端点的显示，再拖动滑块尝试 −50…50 内的快速调整。
        需要同时支持大范围输入和小范围拖动时，可分别设置 min/max 与 softMin/softMax。
      </p>
      <NumericSlider
        label="Offset"
        value={value}
        onValueChange={setValue}
        min={-200}
        max={200}
        softMin={-50}
        softMax={50}
        step={0.5}
        dragStep={0.1}
        precision={2}
        unit="px"
        onEditStart={() => {
          start.current = value
        }}
        onEditCancel={(reason) => {
          if (rollback(reason)) setValue(start.current)
        }}
      />
      <pre>{JSON.stringify({ value })}</pre>
    </div>
  )
}
function AsyncExample() {
  const [value, setValue] = useState(10)
  const [authority, setAuthority] = useState(10)
  const [reject, setReject] = useState(true)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value)
  const record = (event: string) => setEvents((list) => [...list, event])
  return (
    <div className={frame}>
      <label>
        <input type="checkbox" checked={reject} onChange={(event) => setReject(event.target.checked)} /> Reject next
        commit until unchecked
      </label>
      <NumericSlider
        label="Async amount"
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        onEditStart={(source) => {
          start.current = value
          record(`begin:${source}`)
        }}
        onValueCommit={async (next) => {
          record(`request:${next}`)
          await new Promise((resolve) => setTimeout(resolve, 350))
          if (reject) {
            setValue(authority)
            record('rejected')
            throw new Error('数值未保存，请继续修改或重试。')
          }
          setAuthority(next)
          setValue(next)
          record('accepted')
        }}
        onEditCancel={(reason) => {
          if (rollback(reason)) setValue(start.current)
          record(`cancel:${reason}`)
        }}
      />
      <pre>{JSON.stringify({ value, authority, events }, null, 2)}</pre>
    </div>
  )
}
export const Overview: Story = { render: () => <SliderExample /> }
export const ControlledRefusal: Story = { render: () => <SliderExample reject /> }
export const SoftHardAndUnits: Story = { render: () => <SoftRangeExample /> }
export const AsyncCommit: Story = { render: () => <AsyncExample /> }
export const Availability: Story = {
  render: () => (
    <div className={frame}>
      <NumericSlider label="Disabled amount" defaultValue={25} disabled />
      <NumericSlider label="Readonly amount" defaultValue={50} readOnly />
      <NumericSlider label="Mixed amount" defaultValue={0} mixed />
    </div>
  ),
}
