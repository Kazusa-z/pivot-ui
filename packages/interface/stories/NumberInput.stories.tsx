import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { NumberInput } from '../src/controls/inputs/NumberInput'
import { Button } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const meta = {
  title: 'Controls/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '数字输入框：可以键入、左右拖动输入框调整，或用方向键 / 步进按钮按步长增减。',
    use: [
      '属性面板里的单个数值：长度、角度、数量',
      '有常用范围但允许输入更大值的参数：`softMin` / `softMax` 限制拖动，`min` / `max` 限制输入',
      '多选对象值不一致：`mixed` 显示为空，输入新值后统一',
    ],
    avoid: [
      '需要快速拖动并看到比例的参数（不透明度、强度）→ 用 `SliderField`',
      '位置、尺寸等多个数 → 用 `Vector3Input`、`NumberTupleInput`',
    ],
    related: ['`SliderField`：输入框 + 滑块', '`Slider`：只有滑块'],
    notes: ['拖动和步进时，`onValueChange` 给出预览值，`onValueCommit` 在松开或 Enter 时给出最终值'],
    keyboard: [
      ['↑ / ↓', '按 `step` 增减'],
      ['按住 Shift / Ctrl（⌘）再按方向键或拖动', '10 倍 / 0.1 倍步长'],
      ['Enter', '提交文本；非法文本显示错误并保留草稿'],
      ['Escape', '取消本次编辑，恢复原值'],
    ],
  }),
  args: { 'aria-label': 'Distance', value: 12, onValueChange: fn(), onValueCommit: fn() },
} satisfies Meta<typeof NumberInput>
export default meta
type Story = StoryObj<typeof meta>

/** 受控使用：在 `onValueChange` 里更新 `value`。在输入框上左右拖动可以调整数值。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? 0)
    return (
      <Column width={200}>
        <NumberInput
          {...args}
          value={value}
          onValueChange={(next) => {
            args.onValueChange?.(next)
            setValue(next)
          }}
        />
      </Column>
    )
  },
}

/** 单位放 `endSlot`，轴名放 `startSlot`；`stepper` 显示 − / + 按钮。 */
export const UnitsAndStepper: Story = {
  render: (args) => (
    <Column width={200}>
      <NumberInput {...args} aria-label="X" startSlot="X" endSlot="px" defaultValue={12} value={undefined} />
      <NumberInput {...args} aria-label="Angle" endSlot="°" stepper defaultValue={90} value={undefined} />
    </Column>
  ),
}

/** 硬范围 −100…100，常用范围 0…10：拖动停在 0…10，但仍然可以键入 50。 */
export const SoftRange: Story = {
  args: { min: -100, max: 100, softMin: 0, softMax: 10, step: 1, dragStep: 0.1, precision: 2, stepper: true, value: 5 },
  render: (args) => (
    <Column width={200}>
      <NumberInput {...args} />
    </Column>
  ),
}

/** 与 `Input` 相同的四档高度。 */
export const Sizes: Story = {
  render: (args) => (
    <Column width={200}>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ xs: 20, sm: 24, md: 32, lg: 36 }[size]}px`}>
          <NumberInput {...args} size={size} stepper />
        </Item>
      ))}
    </Column>
  ),
}

/** `mixed` 表示多个对象的值不一致；校验、只读、禁用与 `Input` 一致。 */
export const States: Story = {
  render: (args) => (
    <Row>
      <Item label="mixed">
        <NumberInput {...args} mixed />
      </Item>
      <Item label="invalid">
        <NumberInput {...args} state="invalid" aria-invalid />
      </Item>
      <Item label="readOnly">
        <NumberInput {...args} readOnly />
      </Item>
      <Item label="disabled">
        <NumberInput {...args} disabled />
      </Item>
    </Row>
  ),
}

/** 记录拖动、步进、键入的 begin / change / commit / cancel；可以尝试键入 `-`、`1e-` 等不完整文本。 */
export const BehaviorEditLifecycle: Story = {
  tags: ['!autodocs'],
  render: () => <NumberBehaviorCard />,
}

/** Enter 后进入保存等待；Accept 接受，Reject 显示错误并保留草稿。 */
export const BehaviorAsyncCommit: Story = {
  tags: ['!autodocs'],
  render: () => <AsyncNumberBehaviorCard />,
}

const rollsBackPreview = (reason: string) =>
  ['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason)

function NumberBehaviorCard() {
  const [value, setValue] = useState(10)
  const [mixed, setMixed] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(10)
  const record = (message: string) => setEvents((items) => [...items.slice(-11), message])
  return (
    <Column width={280}>
      <NumberInput
        aria-label="Number behavior"
        value={value}
        mixed={mixed}
        min={-100}
        max={100}
        softMin={0}
        softMax={10}
        step={1}
        dragStep={0.1}
        precision={3}
        stepper
        startSlot="X"
        endSlot="px"
        onEditStart={(source) => {
          start.current = value
          record(`begin:${source}`)
        }}
        onValueChange={(next) => {
          record(`change:${next}`)
          setValue(next)
          setMixed(false)
        }}
        onValueCommit={(next, reason) => record(`commit:${reason}:${next}`)}
        onEditCancel={(reason) => {
          record(`cancel:${reason}`)
          if (rollsBackPreview(reason)) setValue(start.current)
        }}
      />
      <Row>
        <Button size="sm" variant="outline" onClick={() => setValue(70)}>
          External 70
        </Button>
        <Button size="sm" variant="outline" onClick={() => setMixed(true)}>
          Set mixed
        </Button>
        <Button size="sm" variant="outline">
          Blur target
        </Button>
      </Row>
      <StateView value={{ value, mixed, events }} />
    </Column>
  )
}

function AsyncNumberBehaviorCard() {
  const [value, setValue] = useState(10)
  const [pending, setPending] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(10)
  const request = useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(null)
  const record = (message: string) => setEvents((items) => [...items.slice(-11), message])
  return (
    <Column width={280}>
      <NumberInput
        aria-label="Async number"
        value={value}
        min={-100}
        max={100}
        step={1}
        stepper
        onEditStart={() => {
          start.current = value
          record('begin')
        }}
        onValueChange={setValue}
        onValueCommit={async (next, reason) => {
          record(`request:${reason}:${next}`)
          setPending(true)
          try {
            await new Promise<void>((resolve, reject) => {
              request.current = { resolve, reject }
            })
            setValue(next)
            record(`accepted:${next}`)
          } catch (error) {
            setValue(start.current)
            record(`rejected:${error instanceof Error ? error.message : String(error)}`)
            throw error
          } finally {
            request.current = null
            setPending(false)
          }
        }}
        onEditCancel={(reason) => {
          record(`cancel:${reason}`)
          if (rollsBackPreview(reason)) setValue(start.current)
        }}
      />
      <Row>
        <Button
          size="sm"
          variant="outline"
          disabled={!pending}
          onClick={() => {
            const current = request.current
            request.current = null
            current?.resolve()
          }}>
          Accept request
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!pending}
          onClick={() => {
            const current = request.current
            request.current = null
            current?.reject(new Error('Number rejected. Edit the draft or retry.'))
          }}>
          Reject request
        </Button>
      </Row>
      <StateView value={{ value, pending, events }} />
    </Column>
  )
}
