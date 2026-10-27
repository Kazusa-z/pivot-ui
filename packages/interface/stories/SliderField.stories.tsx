import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { SliderField } from '../src/editors/numeric'
import type { NumericCancelReason } from '../src/interaction/numeric/types'
import { Checkbox } from '../src/controls/choices/Checkbox'
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
  title: 'Editors/Numeric/SliderField',
  component: SliderField,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '数字输入框加滑块：键入精确值，或拖动滑块快速调整，两者编辑同一个值。',
    use: [
      '有明确范围、需要看到比例的参数：不透明度、强度、粗糙度',
      '常用范围小、偶尔需要输入更大值：`softMin` / `softMax` 限定滑块',
    ],
    avoid: ['没有自然范围的数（位置、数量）→ 用 `NumberInput`', '只需拖动、不需要输入 → 用 `Slider`'],
    related: ['`NumberInput`：只有输入框', '`Slider`：只有滑块', '`PartitionSlider`：把总量分成几段'],
    notes: [
      '`min` / `max` 是输入的硬范围；滑块轨道使用 `softMin` / `softMax`，没有时用 `min` / `max`',
      '输入框和滑块共用 `onEditStart`、`onValueChange`、`onValueCommit`、`onEditCancel`，编辑时另一个暂时只读',
      '`mixed` 只影响输入框，滑块仍显示 `value`',
    ],
    keyboard: [
      ['↑ / ↓（输入框）', '按 `step` 增减'],
      ['← / → / Home / End（滑块）', '按步长移动，或跳到两端'],
      ['Enter', '提交输入'],
      ['Escape', '取消本次编辑'],
    ],
  }),
  args: { label: 'Opacity', value: 25, min: 0, max: 100, unit: '%', onValueChange: fn(), onValueCommit: fn() },
  argTypes: { startSlot: { control: false }, endSlot: { control: false } },
} satisfies Meta<typeof SliderField>
export default meta
type Story = StoryObj<typeof meta>

/** 受控使用：在 `onValueChange` 里更新 `value`。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? 0)
    return (
      <Column width={280}>
        <SliderField
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

/** 输入允许 −200…200，滑块只覆盖常用的 −50…50；键入 150 后滑块停在末端。 */
export const SoftRange: Story = {
  args: {
    label: 'Offset',
    value: 12,
    min: -200,
    max: 200,
    softMin: -50,
    softMax: 50,
    step: 0.5,
    precision: 1,
    unit: 'px',
  },
  render: Basic.render,
}

/** `xs` 20、`sm` 24（默认）、`md` 32；没有 36 档。 */
export const Sizes: Story = {
  render: () => (
    <Column width={280}>
      {(['xs', 'sm', 'md'] as const).map((size) => (
        <Item key={size} label={size}>
          <SliderField label={`${size} amount`} size={size} defaultValue={32} min={0} max={100} unit="%" />
        </Item>
      ))}
    </Column>
  ),
}

/** `mixed` 只影响输入框；只读、禁用、校验与 `NumberInput` 一致。 */
export const States: Story = {
  render: () => (
    <Column width={280}>
      <Item label="mixed">
        <SliderField label="Mixed amount" defaultValue={40} max={100} mixed />
      </Item>
      <Item label="invalid">
        <SliderField label="Invalid amount" defaultValue={80} max={100} state="invalid" aria-invalid />
      </Item>
      <Item label="readOnly">
        <SliderField label="Read only amount" defaultValue={25} max={100} readOnly />
      </Item>
      <Item label="disabled">
        <SliderField label="Disabled amount" defaultValue={25} max={100} disabled />
      </Item>
    </Column>
  ),
}

/** 异步保存：勾选后下一次提交会被拒绝，值回到上次保存的结果。 */
export const BehaviorAsyncCommit: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState(10)
    const [saved, setSaved] = useState(10)
    const [reject, setReject] = useState(false)
    const [events, setEvents] = useState<string[]>([])
    const start = useRef(value)
    const record = (event: string) => setEvents((list) => [...list.slice(-9), event])
    return (
      <Column width={320}>
        <Checkbox
          checked={reject}
          onCheckedChange={(checked) => setReject(checked === true)}
          label="Reject next commit"
        />
        <SliderField
          label="Async amount"
          value={value}
          min={0}
          max={100}
          onEditStart={(source) => {
            start.current = value
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            setValue(next)
            record(`change:${next}`)
          }}
          onValueCommit={async (next, reason) => {
            record(`request:${reason}:${next}`)
            await new Promise((resolve) => setTimeout(resolve, 350))
            if (reject) {
              setValue(saved)
              record('rejected')
              throw new Error('数值未保存，请继续修改或重试。')
            }
            setSaved(next)
            record('accepted')
          }}
          onEditCancel={(reason) => {
            if (rollbackReasons.has(reason)) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
        <StateView value={{ value, saved, reject, events }} />
      </Column>
    )
  },
}
