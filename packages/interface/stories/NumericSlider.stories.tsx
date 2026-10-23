import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NumericSlider } from '../src/templates/numeric/NumericSlider'
import type { NumericCancelReason } from '../src/interaction/numeric/types'
import { css } from '../styled-system/css'

const frame = css({ display: 'grid', gap: '12px', width: 'min(460px, 100%)', minWidth: 0 })
const rollback = (reason: NumericCancelReason) =>
  ['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason)
const meta = { title: 'Templates/NumericSlider', component: NumericSlider, tags: ['autodocs'] } satisfies Meta<
  typeof NumericSlider
>
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
      <p>Text permits −200…200. The slider shows −50…50. Cancel restores the value captured at edit start.</p>
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
            throw new Error('The host rejected this value. Change the value or retry.')
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
