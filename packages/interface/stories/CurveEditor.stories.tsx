import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { CurveEditor } from '../src/editors/curve/CurveEditor'
import type { CurvePointId, CurveValue, CurveViewport } from '../src/values/curve'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { easeCurve, falloffCurve } from './support/curve-samples'
import { describeComponent } from './support/describe'
import { Column, Grid, Item, StateView } from './support/layout'

const rollbackReasons = ['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only']

const meta = {
  title: 'Editors/Curve/CurveEditor',
  component: CurveEditor,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '完整的曲线编辑器：在图表上增删、拖动点和贝塞尔手柄，平移缩放视图，并精确输入选中点的坐标。',
    use: ['动画缓动、衰减、响应曲线', '侧栏或独立面板里需要大尺寸编辑'],
    avoid: ['属性面板的一行 → 用 `CurvePicker`', '随机范围或在固定值与曲线间切换 → 用 `NumericDistributionEditor`'],
    related: ['`CurvePicker`：曲线预览按钮打开本编辑器', '`CurvePresets`：预设列表'],
    notes: [
      '曲线值、选中的点和可见范围是三份独立的状态，可以分别受控（`value` / `selectedPointIds` / `viewport`）',
      '`bounds` 限制点能移动到的范围；业务单位（秒、米）直接作为坐标使用，用 `formatXTick` / `formatYTick` 显示单位',
      '双击图表空白处添加点；拖动空白处平移，滚轮缩放',
    ],
    keyboard: [
      ['Enter / Space', '选中聚焦的点'],
      ['方向键', '移动选中的点或手柄；Shift 10 倍步长，Ctrl（⌘）0.1 倍'],
      ['Delete / Backspace', '删除选中的点'],
      ['Escape', '取消当前编辑'],
    ],
  }),
  args: { value: easeCurve, label: 'Ease', onValueChange: fn(), onValueCommit: fn() },
  argTypes: {
    value: { control: false },
    viewport: { control: false },
    defaultViewport: { control: false },
    bounds: { control: false },
    selectedPointIds: { control: false },
    defaultSelectedPointIds: { control: false },
  },
} satisfies Meta<typeof CurveEditor>
export default meta
type Story = StoryObj<typeof meta>

/** 受控使用：在 `onValueChange` 里更新 `value`。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<CurveValue>(args.value)
    return (
      <Column width={420}>
        <CurveEditor
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
      </Column>
    )
  },
}

/** 业务单位：距离 0–10 m，强度 0–2；`bounds` 把点限制在这个范围内，刻度带单位。 */
export const Units: Story = {
  args: {
    value: falloffCurve,
    label: 'Falloff',
    xLabel: 'Distance',
    yLabel: 'Intensity',
    defaultViewport: { xMin: 0, xMax: 10, yMin: 0, yMax: 2 },
    bounds: { xMin: 0, xMax: 10, yMin: 0, yMax: 2 },
    xStep: 0.1,
    formatXTick: (value: number) => `${value} m`,
  },
  render: Basic.render,
}

/** 紧凑尺寸：降低 `height`、隐藏插值选择，并显示播放预览按钮。 */
export const Compact: Story = {
  args: { height: 160, showInterpolationSelector: false, showAnimation: true },
  render: Basic.render,
}

/** 只读可以选中、平移和缩放，禁用不能操作。 */
export const States: Story = {
  render: () => (
    <Grid>
      <Item label="readOnly">
        <CurveEditor label="Read only curve" value={easeCurve} height={160} readOnly />
      </Item>
      <Item label="disabled">
        <CurveEditor label="Disabled curve" value={easeCurve} height={160} disabled />
      </Item>
    </Grid>
  ),
}

/** 曲线、选中点和视图分别受控；勾选后下一次提交会被拒绝并恢复。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<CurveValue>(easeCurve)
    const [selected, setSelected] = useState<readonly CurvePointId[]>(['end'])
    const [viewport, setViewport] = useState<CurveViewport>({ xMin: 0, xMax: 1, yMin: 0, yMax: 1 })
    const [reject, setReject] = useState(false)
    const [events, setEvents] = useState<string[]>([])
    const start = useRef(value)
    const record = (event: string) => setEvents((items) => [...items.slice(-9), event])
    return (
      <Column width={440}>
        <Checkbox
          checked={reject}
          onCheckedChange={(checked) => setReject(checked === true)}
          label="Reject next commit"
        />
        <CurveEditor
          label="Controlled curve"
          value={value}
          selectedPointIds={selected}
          onSelectedPointIdsChange={setSelected}
          viewport={viewport}
          onViewportChange={setViewport}
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
              throw new Error('曲线未保存。')
            }
            setValue(next)
          }}
          onEditCancel={(reason) => {
            record(`cancel:${reason}`)
            if (rollbackReasons.includes(reason)) setValue(start.current)
          }}
        />
        <StateView value={{ selected, viewport, points: value.points.length, events }} />
      </Column>
    )
  },
}
