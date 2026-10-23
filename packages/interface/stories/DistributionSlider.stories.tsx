import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DistributionSlider } from '../src/widgets/sliders/DistributionSlider'
import { ContractFrame, StatePanel, contractStyles } from './support/ContractFrame'

function DistributionOverview() {
  const [value, setValue] = useState([20, 30, 50])
  const [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const initial = useRef(value)
  return (
    <ContractFrame
      title="固定总量的分段分配"
      description="拖动两个分段边界，或用 Tab 选中后按方向键，观察三段长度怎样此消彼长且总量保持 100。下方展示完整长度数组；应用通过 onValueChange 保存这份数组，取消时恢复本次调整前的分配。"
      onReset={() => {
        setValue([20, 30, 50])
        setRevision((current) => current + 1)
        setEvents([])
      }}>
      <DistributionSlider
        aria-label="Distribution"
        value={value}
        total={100}
        onValueChange={setValue}
        resetKey={revision}
        thumbLabels={['First segment boundary', 'Second segment boundary']}
        onEditStart={() => {
          initial.current = value
          setEvents((current) => [...current, 'start'])
        }}
        onValueCommit={(next, reason) => setEvents((current) => [...current, `${reason}: ${next.join(', ')}`])}
        onEditCancel={(reason) => {
          if (!['external-update', 'reset', 'target-change', 'unmount'].includes(reason)) setValue(initial.current)
          setEvents((current) => [...current, `cancel: ${reason}`])
        }}
      />
      <StatePanel label="各段长度与总量" value={{ value, total: value.reduce((sum, item) => sum + item, 0), events }} />
    </ContractFrame>
  )
}

function DistributionZeros() {
  const [key, setKey] = useState(0)
  return (
    <ContractFrame
      title="零长度、单段与空分布"
      description="用 Tab 分别选中重合的边界，再按方向键，尝试把零长度段展开。下方还展示单段与空数组的外观，方便为加载中或尚未分配的内容选择合适的数据形状。"
      onReset={() => setKey((current) => current + 1)}>
      <div key={key} className={contractStyles.stack}>
        <DistributionSlider aria-label="Zero length segments" defaultValue={[0, 20, 0, 80]} />
        <DistributionSlider aria-label="Single segment" defaultValue={[100]} />
        <DistributionSlider aria-label="Zero total" defaultValue={[0, 0, 0]} />
        <DistributionSlider aria-label="Empty distribution" defaultValue={[]} />
      </div>
    </ContractFrame>
  )
}

function DistributionMinimum() {
  const [value, setValue] = useState([20, 30, 50])
  const [requested, setRequested] = useState<number[] | null>(null)
  return (
    <ContractFrame
      title="最小长度与受控值"
      description="拖动上方边界到尽头，或按 Home/End，观察 minSegment=10 怎样为每段保留空间。再操作下方固定值示例，比较修改请求与原位置；受控用法中，应用在 onValueChange 更新数组后才会采用新分配。"
      onReset={() => {
        setValue([20, 30, 50])
        setRequested(null)
      }}>
      <DistributionSlider
        aria-label="Minimum segment"
        value={value}
        total={100}
        minSegment={10}
        step={5}
        onValueChange={setValue}
      />
      <DistributionSlider
        aria-label="Rejected distribution"
        value={[20, 30, 50]}
        minSegment={10}
        onValueChange={setRequested}
      />
      <DistributionSlider aria-label="Read only distribution" value={[20, 30, 50]} readOnly />
      <DistributionSlider aria-label="Disabled distribution" value={[20, 30, 50]} disabled />
      <StatePanel label="当前长度与最近的修改请求" value={{ value, requested }} />
    </ContractFrame>
  )
}

function DistributionDirections() {
  const [key, setKey] = useState(0)
  return (
    <ContractFrame
      title="单位、精度和排列方向"
      description="试着拖动从右到左和竖排的分段条，观察方向与文字显示。应用用 unit 或 formatter 显示业务单位，并通过 step 与 precision 设置小数调整的步长和精度。"
      onReset={() => setKey((current) => current + 1)}>
      <div key={key} className={contractStyles.stack}>
        <DistributionSlider
          aria-label="Meters"
          defaultValue={[0.2, 0.3, 0.5]}
          total={1}
          minSegment={0.05}
          step={0.01}
          precision={2}
          unit="m"
          formatter={(value) => value.toFixed(2)}
        />
        <DistributionSlider aria-label="RTL distribution" defaultValue={[20, 30, 50]} dir="rtl" />
        <div className={contractStyles.row}>
          <DistributionSlider aria-label="Vertical distribution" defaultValue={[20, 30, 50]} orientation="vertical" />
          <DistributionSlider
            aria-label="Inverted distribution"
            defaultValue={[20, 30, 50]}
            orientation="vertical"
            inverted
          />
        </div>
      </div>
    </ContractFrame>
  )
}

export default {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'DistributionSlider 用于调整各部分在固定总量中的分配，例如百分比权重或时间占比。value 数组保存分段长度，界面中的滑块表示相邻段之间的边界。\n\n移动一个边界只改变相邻两段，onValueChange 返回完整长度数组，onValueCommit 表示完成一次拖动或键盘调整。total 规定总量，minSegment 规定每段的最小长度。\n\n应用通过受控 value 接受变化并处理取消。空数组、单段和零长度段均可保留；单位文字和 formatter 只影响显示，不改变数值。',
      },
    },
  },
  title: 'Widgets/Sliders/DistributionSlider',
} satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <DistributionOverview /> }
export const ZeroAndEmptySegments: Story = { render: () => <DistributionZeros /> }
export const MinimumReadOnlyRejected: Story = { render: () => <DistributionMinimum /> }
export const DirectionsAndUnits: Story = { render: () => <DistributionDirections /> }
