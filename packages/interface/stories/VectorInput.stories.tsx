import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { RectInput, Vector2Input, Vector3Input, Vector4Input } from '../src/editors/numeric'
import type { Rect, Vector3 } from '../src/values/geometry'
import type { NumericCancelReason } from '../src/interaction/numeric/types'
import { describeComponent } from './support/describe'
import { Column, Item, StateView } from './support/layout'

const rollbackReasons = new Set<NumericCancelReason>([
  'escape',
  'pointer-cancel',
  'window-blur',
  'read-only',
  'disabled',
])

const meta = {
  title: 'Editors/Numeric/VectorInput',
  component: Vector3Input,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '`Vector2Input`、`Vector3Input`、`Vector4Input` 和 `RectInput`：一行编辑一个向量或矩形，值保持对象形状。',
    use: ['位置、旋转、缩放、尺寸等 `{ x, y, z }` 形状的值', '矩形区域 `{ x, y, width, height }` → `RectInput`'],
    avoid: ['分量不是 x / y / z / w 的数组 → 用 `NumberTupleInput` 自定义轴', '单个数值 → 用 `NumberInput`'],
    related: ['`NumberTupleInput`：这些组件的底层，可自定义轴', '`NumberInput`：每个分量使用的输入框'],
    notes: [
      '回调总是返回完整的对象，第二个参数是正在编辑的分量',
      '`axes` 按分量覆盖轴名、单位和范围；`RectInput` 还可以用 `positionConstraints` / `sizeConstraints` 统一设置',
      '提供 `onLinkedChange` 后显示联动按钮：开启时按编辑开始时的比例一起缩放（`RectInput` 没有联动）',
    ],
    keyboard: [
      ['Tab', '在各分量和联动按钮之间移动'],
      ['↑ / ↓', '按 `step` 增减当前分量'],
      ['Enter / Escape', '提交 / 取消当前分量'],
    ],
  }),
  args: { label: 'Location', value: { x: 0, y: 1.5, z: -2 }, precision: 2, onValueChange: fn(), onValueCommit: fn() },
  argTypes: { value: { control: false }, defaultValue: { control: false }, axes: { control: false } },
} satisfies Meta<typeof Vector3Input>
export default meta
type Story = StoryObj<typeof meta>

/** 受控使用：`onValueChange` 返回整个 `{ x, y, z }`。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<Vector3>(args.value ?? { x: 0, y: 0, z: 0 })
    return (
      <Column width={360}>
        <Vector3Input
          {...args}
          value={value}
          onValueChange={(next, axis) => {
            args.onValueChange?.(next, axis)
            setValue(next)
          }}
        />
      </Column>
    )
  },
}

/** 二维、四维向量；`axes` 改轴名和单位。 */
export const Dimensions: Story = {
  render: () => (
    <Column width={360}>
      <Item label="Vector2Input">
        <Vector2Input label="Offset" defaultValue={{ x: 10, y: 20 }} axes={{ x: { unit: 'px' }, y: { unit: 'px' } }} />
      </Item>
      <Item label="Vector4Input">
        <Vector4Input label="Quaternion" defaultValue={{ x: 0, y: 0, z: 0, w: 1 }} precision={3} />
      </Item>
    </Column>
  ),
}

/** 打开联动后修改一个分量，其余分量按比例变化，例如等比缩放。 */
export const Linked: Story = {
  render: function Render() {
    const [value, setValue] = useState<Vector3>({ x: 1, y: 2, z: 4 })
    const [linked, setLinked] = useState(true)
    return (
      <Column width={400}>
        <Vector3Input
          label="Scale"
          value={value}
          precision={2}
          onValueChange={setValue}
          linked={linked}
          onLinkedChange={setLinked}
        />
      </Column>
    )
  },
}

/** 位置和尺寸各自一套范围，尺寸不能小于 0。 */
export const Rectangle: Story = {
  render: () => (
    <Column width={420}>
      <RectInput
        label="Crop"
        defaultValue={{ x: -20, y: 10, width: 120, height: 60 }}
        positionConstraints={{ min: -500, max: 500, precision: 1 }}
        sizeConstraints={{ min: 0, max: 300, precision: 0 }}
        axes={{ width: { unit: 'px' }, height: { unit: 'px' } }}
      />
    </Column>
  ),
}

/** 整组只读或禁用；也可以在 `axes` 里只锁定一个分量。 */
export const States: Story = {
  render: () => (
    <Column width={360}>
      <Item label="readOnly">
        <Vector3Input label="Read only" defaultValue={{ x: 1, y: 2, z: 3 }} readOnly />
      </Item>
      <Item label="disabled">
        <Vector3Input label="Disabled" defaultValue={{ x: 1, y: 2, z: 3 }} disabled />
      </Item>
      <Item label="z 只读">
        <Vector3Input label="Locked Z" defaultValue={{ x: 1, y: 2, z: 0 }} axes={{ z: { readOnly: true } }} />
      </Item>
    </Column>
  ),
}

/** 记录每个分量的 begin / commit / cancel；Escape 取消时恢复编辑前的值。 */
export const BehaviorEditLifecycle: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<Rect>({ x: 0, y: 0, width: 100, height: 50 })
    const [events, setEvents] = useState<string[]>([])
    const start = useRef(value)
    const record = (event: string) => setEvents((list) => [...list.slice(-9), event])
    return (
      <Column width={420}>
        <RectInput
          label="Bounds"
          value={value}
          sizeConstraints={{ min: 0 }}
          onEditStart={(source, axis) => {
            start.current = value
            record(`begin:${axis}:${source}`)
          }}
          onValueChange={setValue}
          onValueCommit={(next, reason, axis) => record(`commit:${axis}:${reason}:${JSON.stringify(next)}`)}
          onEditCancel={(reason, axis) => {
            if (rollbackReasons.has(reason)) setValue(start.current)
            record(`cancel:${axis}:${reason}`)
          }}
        />
        <StateView value={{ value, events }} />
      </Column>
    )
  },
}
