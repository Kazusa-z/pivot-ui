import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import type { CurvePreset } from '../src/contracts/curve'
import { NumericDistributionEditor } from '../src/editors/numeric/NumericDistributionEditor'
import { copyCurveValue, type CurveValue } from '../src/values/curve'
import {
  copyNumericDistributionValue,
  type NumericDistributionCache,
  type NumericDistributionMode,
  type NumericDistributionValue,
} from '../src/values/numeric-distribution'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { describeComponent } from './support/describe'
import { Column, Grid, Item, Panel, StateView } from './support/layout'

const ease: CurveValue = {
  interpolation: 'bezier',
  points: [
    { id: 'start', x: 0, y: 2, outHandle: { x: 0.35, y: 2 } },
    { id: 'end', x: 1, y: 5, inHandle: { x: 0.65, y: 5 } },
  ],
}
const linear: CurveValue = {
  interpolation: 'linear',
  points: [
    { id: 'a', x: 0, y: 0 },
    { id: 'b', x: 1, y: 10 },
  ],
}
const presets: readonly CurvePreset[] = [
  { id: 'ease', label: 'Ease 2 to 5', value: ease },
  { id: 'linear', label: 'Linear 0 to 10', value: linear },
]
const sample: Record<NumericDistributionMode, NumericDistributionValue> = {
  constant: { mode: 'constant', value: 2 },
  'two-constant': { mode: 'two-constant', values: [2, 5] },
  curve: { mode: 'curve', curve: copyCurveValue(ease) },
  'two-curve': { mode: 'two-curve', curves: [copyCurveValue(ease), copyCurveValue(linear)] },
}
const rollbackReasons = new Set(['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only'])

const meta = {
  title: 'Editors/Numeric/NumericDistributionEditor',
  component: NumericDistributionEditor,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '编辑一个可以随机或随时间变化的数值：固定值、两值之间随机、一条曲线，或两条曲线之间随机。',
    use: ['粒子、特效参数：发射速度、生命周期、尺寸随时间变化', '同一个参数需要在固定值和曲线之间切换'],
    avoid: ['普通的单个数值 → 用 `NumberInput` 或 `SliderField`', '只编辑一条曲线 → 用 `CurvePicker`'],
    related: [
      '`CurvePicker`：曲线模式使用的曲线字段',
      '`ColorDistributionEditor`：颜色版本',
      '`PartitionSlider`：按比例分段，不是随机',
    ],
    notes: [
      '`value` 是带 `mode` 的联合类型；切换模式会产生新的值，旧模式的值记在模式缓存里，切回时恢复',
      '需要随文档保存各模式的值时，用 `cache` / `onCacheChange` 受控；`resetKey` 变化会清空缓存',
      '`min` / `max` 等约束作用于固定值；曲线的范围用 `curveBounds`',
    ],
    keyboard: [
      ['Tab', '在模式选择、数值输入和曲线按钮之间移动'],
      ['Escape', '取消当前编辑，包括模式切换'],
    ],
  }),
  args: { value: sample.constant, label: 'Start speed', unit: 'm/s', min: 0, onValueChange: fn(), onValueCommit: fn() },
  argTypes: {
    value: { control: false },
    cache: { control: false },
    defaultCache: { control: false },
    curveViewport: { control: false },
    curveBounds: { control: false },
    curvePresets: { control: false },
    curvePresetService: { control: false },
  },
} satisfies Meta<typeof NumericDistributionEditor>
export default meta
type Story = StoryObj<typeof meta>

/** 受控使用：切换模式或编辑数值后更新 `value`。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    const update = (next: NumericDistributionValue) => {
      args.onValueChange?.(next)
      setValue(next)
    }
    return (
      <Panel>
        <NumericDistributionEditor
          {...args}
          value={value}
          curvePresets={presets}
          onValueChange={update}
          onValueCommit={(next, reason) => {
            args.onValueCommit?.(next, reason)
            setValue(next)
          }}
        />
      </Panel>
    )
  },
}

/** 四种模式。 */
export const Modes: Story = {
  render: () => (
    <Column width={360}>
      {(Object.keys(sample) as NumericDistributionMode[]).map((mode) => (
        <Item key={mode} label={mode}>
          <ModeExample mode={mode} />
        </Item>
      ))}
    </Column>
  ),
}

function ModeExample({ mode }: { mode: NumericDistributionMode }) {
  const [value, setValue] = useState(sample[mode])
  return (
    <NumericDistributionEditor
      label={`${mode} distribution`}
      value={value}
      curvePresets={presets}
      onValueChange={setValue}
      onValueCommit={setValue}
    />
  )
}

/** 只读仍可展开查看曲线，禁用不能操作。 */
export const States: Story = {
  render: () => (
    <Grid>
      <Item label="readOnly">
        <NumericDistributionEditor label="Read only" value={sample['two-constant']} readOnly />
      </Item>
      <Item label="disabled">
        <NumericDistributionEditor label="Disabled" value={sample.curve} disabled />
      </Item>
    </Grid>
  ),
}

/** 受控模式缓存与异步提交：来回切换模式，缓存保留各模式的值；勾选后下一次提交会被拒绝。 */
export const BehaviorCacheAndCommit: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<NumericDistributionValue>(sample.constant)
    const [cache, setCache] = useState<NumericDistributionCache>({})
    const [reject, setReject] = useState(false)
    const [events, setEvents] = useState<string[]>([])
    const start = useRef(value)
    const record = (event: string) => setEvents((list) => [...list.slice(-9), event])
    return (
      <Column width={360}>
        <Checkbox
          checked={reject}
          onCheckedChange={(checked) => setReject(checked === true)}
          label="Reject next commit"
        />
        <NumericDistributionEditor
          label="Lifetime"
          unit="s"
          min={0}
          value={value}
          cache={cache}
          onCacheChange={setCache}
          curvePresets={presets}
          onEditStart={(source) => {
            start.current = copyNumericDistributionValue(value)
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            setValue(next)
            record(`change:${next.mode}`)
          }}
          onValueCommit={async (next, reason) => {
            record(`request:${reason}:${next.mode}`)
            await new Promise((resolve) => setTimeout(resolve, 300))
            if (reject) {
              setReject(false)
              setValue(start.current)
              record('rejected')
              throw new Error('Distribution was not saved.')
            }
            setValue(next)
            record('accepted')
          }}
          onEditCancel={(reason) => {
            if (rollbackReasons.has(reason)) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
        <StateView value={{ value, cachedModes: Object.keys(cache), events }} />
      </Column>
    )
  },
}
