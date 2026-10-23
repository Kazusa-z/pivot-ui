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
      title="Distribution slider"
      description="value保存分段长度，总量固定100。三个段只有两个累计边界；每次边界移动只改变相邻两段。键盘与取消复用Slider内核。"
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
      <StatePanel
        label="Lengths and total"
        value={{ value, total: value.reduce((sum, item) => sum + item, 0), events }}
      />
    </ContractFrame>
  )
}

function DistributionZeros() {
  const [key, setKey] = useState(0)
  return (
    <ContractFrame
      title="Zero and empty segments"
      description="零长度段不会被删；可用Tab访问重合边界。单段没有可拖边界，空数组保持空分布，零总量不产生NaN。"
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
      title="Minimum segments and controlled refusal"
      description="minSegment=10约束首尾和相邻分段，Home/End也不会越界。下方固定受控数组只记录请求，保持原显示。"
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
      <StatePanel label="Accepted and requested lengths" value={{ value, requested }} />
    </ContractFrame>
  )
}

function DistributionDirections() {
  const [key, setKey] = useState(0)
  return (
    <ContractFrame
      title="Units, precision and direction"
      description="分段长度可用自定义单位/formatter。RTL和竖排让分段颜色顺序与边界轴保持一致；小数步长沿用共享精度规则。"
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

export default { title: 'Widgets/Sliders/DistributionSlider' } satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <DistributionOverview /> }
export const ZeroAndEmptySegments: Story = { render: () => <DistributionZeros /> }
export const MinimumReadOnlyRejected: Story = { render: () => <DistributionMinimum /> }
export const DirectionsAndUnits: Story = { render: () => <DistributionDirections /> }
