import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NumericTupleInput } from '../src/templates/numeric/NumericTupleInput'
import { Vector2Input, Vector3Input, Vector4Input, RectInput } from '../src/templates/numeric/GeometryInputs'
import type { Vector3, Rect } from '../src/values/geometry'
import type { NumericCancelReason } from '../src/interaction/numeric/types'
import { css } from '../styled-system/css'

const frame = css({ display: 'grid', gap: '14px', width: 'min(520px, 100%)', minWidth: 0 })
const rollback = (reason: NumericCancelReason) =>
  ['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason)
const axes = [
  { key: 'x', label: 'X' },
  { key: 'y', label: 'Y' },
  { key: 'z', label: 'Z' },
] as const
const meta = {
  title: 'Templates/NumericTupleInput',
  component: NumericTupleInput,
  tags: ['autodocs'],
  args: { axes },
} satisfies Meta<typeof NumericTupleInput>
export default meta
type Story = StoryObj<typeof meta>
function ShapesExample() {
  const [two, setTwo] = useState({ x: 10, y: 20 })
  const [four, setFour] = useState({ x: 1, y: 2, z: 3, w: 4 })
  const [revision, setRevision] = useState(0)
  const twoStart = useRef(two),
    fourStart = useRef(four)
  return (
    <div className={frame}>
      <Vector2Input
        value={two}
        onValueChange={setTwo}
        resetKey={revision}
        onEditStart={() => {
          twoStart.current = two
        }}
        onEditCancel={(reason) => {
          if (rollback(reason)) setTwo(twoStart.current)
        }}
        axes={{ x: { label: 'Horizontal', unit: 'px' }, y: { label: 'Vertical', unit: 'px' } }}
      />
      <Vector4Input
        value={four}
        onValueChange={setFour}
        resetKey={revision}
        onEditStart={() => {
          fourStart.current = four
        }}
        onEditCancel={(reason) => {
          if (rollback(reason)) setFour(fourStart.current)
        }}
      />
      <button
        onClick={() => {
          setTwo({ x: 10, y: 20 })
          setFour({ x: 1, y: 2, z: 3, w: 4 })
          setRevision((value) => value + 1)
        }}>
        Reset
      </button>
      <pre>{JSON.stringify({ two, four }, null, 2)}</pre>
    </div>
  )
}
function LinkedExample({ zero = false }: { zero?: boolean }) {
  const initial: Vector3 = zero ? { x: 0, y: 4, z: 6 } : { x: 2, y: 4, z: -6 }
  const [value, setValue] = useState(initial)
  const [linked, setLinked] = useState(true)
  const [events, setEvents] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const start = useRef(value)
  return (
    <div className={frame}>
      <p>
        {zero
          ? 'X starts at zero. Editing X changes only X; Y/Z keep their edit-start values.'
          : 'The common ratio is limited by Y ≤ 10 and Z ≥ −12, so linked X can reach at most 4. Derived axes are not independently rounded.'}
      </p>
      <Vector3Input
        value={value}
        onValueChange={setValue}
        linked={linked}
        onLinkedChange={setLinked}
        resetKey={revision}
        axes={{
          x: { min: 0, max: 20, precision: 2 },
          y: { min: 0, max: 10, precision: 2 },
          z: { min: -12, max: 12, precision: 2 },
        }}
        onEditStart={(source, axis) => {
          start.current = value
          setEvents((list) => [...list, `begin:${axis}:${source}`])
        }}
        onValueCommit={(next, reason, axis) =>
          setEvents((list) => [...list, `commit:${axis}:${reason}:${JSON.stringify(next)}`])
        }
        onEditCancel={(reason, axis) => {
          if (rollback(reason)) setValue(start.current)
          setEvents((list) => [...list, `cancel:${axis}:${reason}`])
        }}
      />
      <button
        onClick={() => {
          setValue(initial)
          setLinked(true)
          setEvents([])
          setRevision((value) => value + 1)
        }}>
        Reset
      </button>
      <pre>{JSON.stringify({ value, linked, events }, null, 2)}</pre>
    </div>
  )
}
function RectExample() {
  const [value, setValue] = useState<Rect>({ x: -20, y: 10, width: 120, height: 60 })
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const start = useRef(value)
  return (
    <div className={frame}>
      <RectInput
        value={value}
        onValueChange={setValue}
        positionConstraints={{ min: -500, max: 500, precision: 1 }}
        sizeConstraints={{ min: 0, max: 300, precision: 0 }}
        axes={{ width: { unit: 'px' }, height: { unit: 'px' } }}
        disabled={disabled}
        readOnly={readOnly}
        onEditStart={() => {
          start.current = value
        }}
        onEditCancel={(reason) => {
          if (rollback(reason)) setValue(start.current)
        }}
      />
      <label>
        <input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} /> Disabled
      </label>
      <label>
        <input type="checkbox" checked={readOnly} onChange={(event) => setReadOnly(event.target.checked)} /> Readonly
      </label>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}
function ExternalExample() {
  const [value, setValue] = useState<readonly number[]>([2, 4, 6])
  const [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value)
  return (
    <div className={frame}>
      <NumericTupleInput
        axes={axes}
        value={value}
        onValueChange={setValue}
        resetKey={revision}
        onEditStart={() => {
          start.current = value
        }}
        onEditCancel={(reason) => {
          if (rollback(reason)) setValue(start.current)
          setEvents((list) => [...list, reason])
        }}
      />
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setValue([10, 20, 30])
          setRevision((value) => value + 1)
        }}>
        External target update
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setValue((current) => [current[0], 99, current[2]])}>
        External Y update
      </button>
      <pre>{JSON.stringify({ value, revision, events }, null, 2)}</pre>
    </div>
  )
}
export const Overview: Story = { render: () => <ShapesExample /> }
export const ProportionalBounds: Story = { render: () => <LinkedExample /> }
export const ZeroAxis: Story = { render: () => <LinkedExample zero /> }
export const RectConstraints: Story = { render: () => <RectExample /> }
export const ExternalResetAndCancel: Story = { render: () => <ExternalExample /> }
