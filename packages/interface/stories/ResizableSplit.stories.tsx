import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ResizableSplit } from '../src/layout/ResizableSplit'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { StateView } from './support/layout'

const frame = css({
  height: '220px',
  width: '100%',
  maxWidth: '640px',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-controlMd)',
  overflow: 'hidden',
})
const pane = css({
  height: '100%',
  boxSizing: 'border-box',
  padding: 'var(--space-3)',
  fontSize: 'var(--fontSizes-control)',
  color: 'var(--colors-textMuted)',
})

const meta = {
  title: 'Layout/ResizableSplit',
  component: ResizableSplit,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '两个面板之间的可拖动分隔条，用来调整侧栏宽度或上下区域高度。',
    use: ['属性侧栏、资源浏览器与视口之间的分栏', '时间线与视口的上下分栏'],
    notes: [
      '`primary` 是被调整尺寸的面板，`children` 占据剩余空间；尺寸单位是像素',
      '拖动中 `onSizeChange` 给出预览，松开或按键后 `onSizeCommit` 给出最终值，适合在这里保存布局偏好',
      '父容器需要明确的宽高',
    ],
    keyboard: [
      ['← / → 或 ↑ / ↓', '按 `keyboardStep` 调整'],
      ['Shift + 方向键', '10 倍步长'],
      ['Home / End', '最小 / 最大尺寸'],
      ['Escape', '取消拖动'],
    ],
  }),
  args: {
    defaultSize: 220,
    minSize: 140,
    maxSize: 420,
    separatorLabel: 'Resize inspector',
    primary: <div className={pane}>Inspector</div>,
    children: <div className={pane}>Viewport</div>,
  },
  argTypes: { primary: { control: false }, children: { control: false } },
} satisfies Meta<typeof ResizableSplit>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: (args) => (
    <div className={frame}>
      <ResizableSplit {...args} />
    </div>
  ),
}

/** `primarySide="end"` 把可调整的面板放在右侧，常用于右侧属性栏。 */
export const PrimaryOnEnd: Story = {
  args: { primarySide: 'end' },
  render: (args) => (
    <div className={frame}>
      <ResizableSplit {...args} />
    </div>
  ),
}

/** `orientation="vertical"` 上下分栏，调整的是高度。 */
export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    defaultSize: 90,
    minSize: 60,
    maxSize: 160,
    separatorLabel: 'Resize timeline',
    primary: <div className={pane}>Viewport</div>,
    children: <div className={pane}>Timeline</div>,
  },
  render: (args) => (
    <div className={frame}>
      <ResizableSplit {...args} />
    </div>
  ),
}

/** 受控尺寸：记录拖动预览、提交和取消。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [size, setSize] = useState(220)
    const [events, setEvents] = useState<string[]>([])
    const record = (event: string) => setEvents((items) => [...items.slice(-5), event])
    return (
      <div>
        <div className={frame}>
          <ResizableSplit
            size={size}
            minSize={140}
            maxSize={420}
            separatorLabel="Resize inspector"
            onSizeChange={setSize}
            onSizeCommit={(next) => record(`commit ${next}`)}
            onResizeCancel={(reason) => record(`cancel ${reason}`)}
            primary={<div className={pane}>Inspector</div>}>
            <div className={pane}>Viewport</div>
          </ResizableSplit>
        </div>
        <StateView value={{ size, events }} />
      </div>
    )
  },
}
