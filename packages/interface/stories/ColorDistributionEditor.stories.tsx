import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ColorDistributionEditor } from '../src/editors/color/ColorDistributionEditor'
import type {
  ColorDistributionCache,
  ColorDistributionMode,
  ColorDistributionValue,
} from '../src/values/color-distribution'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { alphaRamp, blue, emissive, orange, rollbackReasons } from './support/color-samples'
import { describeComponent } from './support/describe'
import { Column, Grid, Item, Panel, StateView } from './support/layout'

const sample: Record<ColorDistributionMode, ColorDistributionValue> = {
  constant: { mode: 'constant', color: blue },
  'two-constant': { mode: 'two-constant', colors: [blue, orange] },
  gradient: { mode: 'gradient', ramp: alphaRamp },
  'two-gradient': {
    mode: 'two-gradient',
    ramps: [alphaRamp, { ...alphaRamp, alpha: [{ id: 'solid', position: 0, alpha: 1 }] }],
  },
}

const meta = {
  title: 'Editors/Color/ColorDistributionEditor',
  component: ColorDistributionEditor,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '编辑一个可以随机或随时间变化的颜色：固定颜色、两色之间随机、渐变，或两条渐变之间随机。',
    use: ['粒子、特效的颜色：出生颜色随机、颜色随生命周期变化', '同一个参数需要在固定颜色和渐变之间切换'],
    avoid: ['普通颜色 → 用 `ColorField`', '只编辑一条渐变 → 用 `ColorRampPicker`'],
    related: ['`NumericDistributionEditor`：数值版本', '`ColorAlphaRampEditor`：渐变模式使用的编辑器'],
    notes: [
      '`value` 是带 `mode` 的联合类型；切换模式时旧模式的值记在模式缓存里，切回时恢复',
      '需要随文档保存各模式的值时，用 `cache` / `onCacheChange` 受控；`resetKey` 变化会清空缓存',
    ],
    keyboard: [
      ['Tab', '在模式选择、颜色字段和渐变按钮之间移动'],
      ['Escape', '取消当前编辑，包括模式切换'],
    ],
  }),
  args: { value: sample.constant, label: 'Start color', onValueChange: fn(), onValueCommit: fn() },
  argTypes: {
    value: { control: false },
    cache: { control: false },
    defaultCache: { control: false },
    capabilities: { control: false },
  },
} satisfies Meta<typeof ColorDistributionEditor>
export default meta
type Story = StoryObj<typeof meta>

/** 受控使用：切换模式或编辑颜色后更新 `value`。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <Panel>
        <ColorDistributionEditor
          {...args}
          value={value}
          onValueChange={(next) => {
            args.onValueChange?.(next)
            setValue(next)
          }}
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
      {(Object.keys(sample) as ColorDistributionMode[]).map((mode) => (
        <Item key={mode} label={mode}>
          <ModeExample mode={mode} />
        </Item>
      ))}
    </Column>
  ),
}

function ModeExample({ mode }: { mode: ColorDistributionMode }) {
  const [value, setValue] = useState(sample[mode])
  return (
    <ColorDistributionEditor label={`${mode} color`} value={value} onValueChange={setValue} onValueCommit={setValue} />
  )
}

/** `hdr` 允许颜色超过 1；只读、禁用。 */
export const States: Story = {
  render: () => (
    <Grid>
      <Item label="hdr">
        <ColorDistributionEditor label="HDR color" value={{ mode: 'constant', color: emissive }} hdr />
      </Item>
      <Item label="readOnly">
        <ColorDistributionEditor label="Read only color" value={sample['two-constant']} readOnly />
      </Item>
      <Item label="disabled">
        <ColorDistributionEditor label="Disabled color" value={sample.constant} disabled />
      </Item>
    </Grid>
  ),
}

/** 受控模式缓存与异步提交：来回切换模式，缓存保留各模式的值；勾选后下一次提交会被拒绝。 */
export const BehaviorCacheAndCommit: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<ColorDistributionValue>(sample.constant)
    const [cache, setCache] = useState<ColorDistributionCache>({})
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
        <ColorDistributionEditor
          label="Particle color"
          value={value}
          cache={cache}
          onCacheChange={setCache}
          onEditStart={(source) => {
            start.current = value
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
              throw new Error('Color distribution was not saved.')
            }
            setValue(next)
            record('accepted')
          }}
          onEditCancel={(reason) => {
            if (rollbackReasons.includes(reason)) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
        <StateView value={{ mode: value.mode, cachedModes: Object.keys(cache), events }} />
      </Column>
    )
  },
}
