import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ColorRampEditor } from '../src/editors/color/ColorRampEditor'
import type { ColorRampValue } from '../src/values/color-ramp'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { ramp, rollbackReasons } from './support/color-samples'
import { describeComponent } from './support/describe'
import { Column, Grid, Item, StateView } from './support/layout'

const meta = {
  title: 'Editors/Color/ColorRampEditor',
  component: ColorRampEditor,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '编辑颜色渐变：在轨道上拖动色标，选中色标后编辑它的颜色和位置。',
    use: ['颜色随某个参数变化：高度、温度、粒子生命周期', '每个色标自带透明度就够用的渐变'],
    avoid: ['颜色和透明度需要分开控制 → 用 `ColorAlphaRampEditor`', '属性面板的一行 → 用 `ColorRampPicker`'],
    related: [
      '`ColorAlphaRampEditor`：颜色轨与透明度轨分开',
      '`ColorRampPicker`：色带按钮打开浮层',
      '`ColorDistributionEditor`：渐变是其中一种模式',
    ],
    notes: [
      '每个色标有稳定 `id`、0–1 的 `position` 和带透明度的颜色；`interpolation` 为 `linear` 或 `constant`（阶梯）',
      '选中色标是界面状态，可以用 `activeStopId` 受控；增删、移动和改色都通过 `onValueChange` / `onValueCommit` 返回整个渐变',
    ],
    keyboard: [
      ['← / →', '移动聚焦的色标，步长 0.01；Shift 0.1，Ctrl（⌘）0.001'],
      ['Home / End', '把色标移到 0 或 1'],
      ['Delete / Backspace', '删除聚焦的色标'],
      ['Escape', '取消当前编辑'],
    ],
  }),
  args: { defaultValue: ramp, onValueChange: fn(), onValueCommit: fn() },
  argTypes: { value: { control: false }, defaultValue: { control: false }, capabilities: { control: false } },
} satisfies Meta<typeof ColorRampEditor>
export default meta
type Story = StoryObj<typeof meta>

/** 拖动色标调整位置，点击选中后在下方编辑颜色；"Add color stop" 在选中位置添加色标。 */
export const Basic: Story = {
  render: (args) => (
    <Column width={360}>
      <ColorRampEditor {...args} />
    </Column>
  ),
}

/** `interpolation: 'constant'`：色标之间不过渡，形成色阶。 */
export const Constant: Story = {
  args: { defaultValue: { ...ramp, interpolation: 'constant' } },
  render: Basic.render,
}

/** 只读可以选中色标查看，禁用不能操作；空渐变可以从添加第一个色标开始。 */
export const States: Story = {
  render: () => (
    <Grid>
      <Item label="readOnly">
        <ColorRampEditor defaultValue={ramp} readOnly />
      </Item>
      <Item label="disabled">
        <ColorRampEditor defaultValue={ramp} disabled />
      </Item>
      <Item label="没有色标">
        <ColorRampEditor defaultValue={{ interpolation: 'linear', stops: [] }} />
      </Item>
    </Grid>
  ),
}

/** 受控值和选中色标；勾选后下一次提交会被拒绝并恢复。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<ColorRampValue>(ramp)
    const [selected, setSelected] = useState<string | null>('blue')
    const [reject, setReject] = useState(false)
    const [events, setEvents] = useState<string[]>([])
    const start = useRef(value)
    const record = (event: string) => setEvents((current) => [...current.slice(-9), event])
    return (
      <Column width={380}>
        <Checkbox
          checked={reject}
          onCheckedChange={(checked) => setReject(checked === true)}
          label="Reject next commit"
        />
        <ColorRampEditor
          value={value}
          activeStopId={selected}
          onActiveStopIdChange={(id) => {
            setSelected(id)
            record(`select:${id ?? 'none'}`)
          }}
          onEditStart={(source) => {
            start.current = value
            record(`begin:${source}`)
          }}
          onValueChange={setValue}
          onValueCommit={async (next, reason) => {
            record(`commit:${reason}`)
            await new Promise((resolve) => setTimeout(resolve, 220))
            if (reject) {
              setReject(false)
              setValue(start.current)
              record('rejected')
              throw new Error('渐变未保存。')
            }
            setValue(next)
          }}
          onEditCancel={(reason) => {
            record(`cancel:${reason}`)
            if (rollbackReasons.includes(reason)) setValue(start.current)
          }}
        />
        <StateView value={{ selected, stops: value.stops.map((stop) => `${stop.id}@${stop.position}`), events }} />
      </Column>
    )
  },
}
