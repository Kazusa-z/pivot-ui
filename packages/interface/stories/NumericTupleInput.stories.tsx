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
  parameters: {
    docs: {
      description: {
        component:
          'NumericTupleInput 用于编辑一组数值，axes 为每一项提供稳定 key、名称、单位和范围。Vector2Input、Vector3Input、Vector4Input 保留 x/y/z/w 对象形状，RectInput 保留 x/y/width/height。\n\nonValueChange 返回完整值和本次编辑轴；onValueCommit 表示一次完整编辑。比例联动由 linked 与 onLinkedChange 控制，并以本次开始编辑时的值计算比例。\n\n零值主轴只改变自身；可达到的比例范围会同时满足各轴限制。位置与尺寸可分别配置。受控用法由应用在取消时恢复起始值，并在外部重置时更新 resetKey。',
      },
    },
  },
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
          ? '把起始为 0 的 X 改成 3，观察 Y/Z 保持原值；再切换联动开关，比较各轴的调整方式。应用通过 linked 和 onLinkedChange 保存开关状态，零值轴适合用来了解联动的起始行为。'
          : '保持联动并提高 X，观察 Y/Z 按比例变化，直到 X=4、Y=8、Z=−12。这个例子为 Y 和 Z 设置了范围，联动会在可用比例内停止；应用可在 axes 中为每个轴配置范围和精度。'}
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
