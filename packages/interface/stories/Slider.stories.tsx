import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Slider } from '../src/widgets/sliders/Slider'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'

function SliderOverview() {
  const [value, setValue] = useState([25])
  const [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const initial = useRef(value)
  return (
    <ContractFrame
      title="Slider"
      description="拖动时通过 onValueChange 连续请求新值，由父组件回传；松开时调用 onValueCommit。Escape、指针取消或窗口失焦调用 onEditCancel，由应用恢复预览。Ctrl/⌘ 可细调，也支持方向键、PageUp/PageDown 和 Home/End。"
      onReset={() => {
        setValue([25])
        setRevision((next) => next + 1)
        setEvents([])
      }}>
      <Slider
        aria-label="Opacity"
        value={value}
        onValueChange={setValue}
        resetKey={revision}
        min={0}
        max={100}
        step={1}
        startSlot="Opacity"
        endSlot="%"
        showRuler
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
      <StatePanel label="当前值与编辑事件" value={{ value, revision, events }} />
    </ContractFrame>
  )
}

function MultipleThumbs() {
  const [value, setValue] = useState([20, 60, 80])
  return (
    <ContractFrame
      title="多个滑块与间距限制"
      description="把上方一个滑块拖过另一个，观察位置数组的顺序变化；再操作下方滑块，体验保留顺序和至少 10 单位间距的效果。每个滑块都可用 Tab 访问，应用可以按区间含义为它们提供名称。"
      onReset={() => setValue([20, 60, 80])}>
      <Slider
        aria-label="Range"
        thumbLabels={['Lower', 'Middle', 'Upper']}
        value={value}
        onValueChange={setValue}
        compact
      />
      <Slider
        aria-label="Ordered range"
        thumbLabels={['First boundary', 'Second boundary', 'Third boundary']}
        value={value}
        onValueChange={setValue}
        minStepsBetweenThumbs={10}
        preserveThumbOrder
      />
      <StatePanel label="Positions" value={value} />
    </ContractFrame>
  )
}

function SliderDirections() {
  const [key, setKey] = useState(0)
  return (
    <ContractFrame
      title="方向与反向刻度"
      description="分别拖动横排、从右到左和竖排的滑块，再试试方向键，比较数值增加的方向。可通过 orientation、dir 和 inverted 选择布局与刻度方向，容器或样式用于设置长度。"
      onReset={() => setKey((current) => current + 1)}>
      <div key={key} className={contractStyles.stack}>
        <Slider aria-label="LTR" defaultValue={[30]} startSlot="LTR" />
        <Slider aria-label="RTL" defaultValue={[30]} dir="rtl" startSlot="RTL" />
        <div className={contractStyles.row}>
          <Slider aria-label="Vertical" defaultValue={[30]} orientation="vertical" />
          <Slider aria-label="Inverted vertical" defaultValue={[30]} orientation="vertical" inverted compact />
        </div>
      </div>
    </ContractFrame>
  )
}

function SliderRanges() {
  const [key, setKey] = useState(0)
  return (
    <ContractFrame
      title="范围、步长与刻度"
      description="拖动带负数和小数刻度的滑块，观察 step 对调整幅度的影响。再比较下方不同刻度与固定值的外观；应用可以用 min/max 指定范围，用 rulerInterval 设置刻度间距。"
      onReset={() => setKey((current) => current + 1)}>
      <div key={key} className={contractStyles.stack}>
        <Slider
          aria-label="Negative"
          min={-100}
          max={-20}
          defaultValue={[-60]}
          showRuler
          rulerInterval={0}
          startSlot="−100"
          endSlot="−20"
        />
        <Slider
          aria-label="Fine interval"
          min={0}
          max={1}
          step={0.001}
          precision={3}
          defaultValue={[0.125]}
          showRuler
          rulerInterval={0.00001}
          size="xs"
        />
        <Slider aria-label="Fixed value" min={3} max={3} defaultValue={[3]} showRuler />
        <Slider aria-label="No thumbs" defaultValue={[]} />
      </div>
    </ContractFrame>
  )
}

function SliderModes() {
  const [requests, setRequests] = useState<number[][]>([])
  return (
    <ContractFrame
      title="只读、禁用与拒绝变化"
      description="用 Tab 依次访问这些滑块，比较只读、禁用和正常可编辑状态。再拖动固定值示例，查看下方记录的修改请求；受控用法中，应用更新 value 后滑块才采用新位置。"
      onReset={() => setRequests([])}>
      <Slider
        aria-label="Read only"
        value={[30]}
        readOnly
        onValueChange={(next) => setRequests((current) => [...current, next])}
      />
      <Slider aria-label="Disabled" value={[50]} disabled />
      <Slider
        aria-label="Rejected requests"
        value={[30]}
        onValueChange={(next) => setRequests((current) => [...current, next])}
      />
      <StatePanel label="Requested values" value={requests} />
    </ContractFrame>
  )
}

function SliderPending() {
  const [value, setValue] = useState([25])
  const [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const request = useRef<{ resolve: () => void; reject: (cause: Error) => void } | null>(null)
  const initial = useRef(value)
  useEffect(
    () => () => {
      request.current?.resolve()
      request.current = null
    },
    []
  )
  function reset() {
    request.current?.resolve()
    request.current = null
    setPending(false)
    setValue([25])
    setRevision((current) => current + 1)
    setEvents([])
  }
  return (
    <ContractFrame
      title="异步保存与外部更新"
      description="拖动滑块并松开，再点击 Accept 完成保存，或点击 Reject 体验恢复原值和错误提示。也可点击 External value 75，模拟应用传入新数据。下方记录展示每一步；接入时在 onValueCommit 返回 Promise，用 resetKey 标识外部更新。"
      onReset={reset}>
      <Slider
        aria-label="Async slider"
        value={value}
        onValueChange={setValue}
        resetKey={revision}
        onEditStart={() => {
          initial.current = value
          setEvents((current) => [...current, 'start'])
        }}
        onValueCommit={(next, reason) => {
          setPending(true)
          setEvents((current) => [...current, `${reason}: ${next}`])
          return new Promise<void>((resolve, reject) => {
            request.current = { resolve, reject }
          })
        }}
        onEditCancel={(reason) => {
          if (!['external-update', 'reset', 'target-change', 'unmount'].includes(reason)) setValue(initial.current)
          setEvents((current) => [...current, `cancel: ${reason}`])
        }}
      />
      <div className={contractStyles.row}>
        <ControlButton
          disabled={!pending}
          onClick={() => {
            request.current?.resolve()
            request.current = null
            setPending(false)
          }}>
          Accept
        </ControlButton>
        <ControlButton
          disabled={!pending}
          onClick={() => {
            setValue(initial.current)
            request.current?.reject(new Error('数值未保存，请重新调整后重试。'))
            request.current = null
            setPending(false)
          }}>
          Reject
        </ControlButton>
        <ControlButton
          onClick={() => {
            setValue([75])
            setRevision((current) => current + 1)
          }}>
          External value 75
        </ControlButton>
        <ControlButton onClick={() => setRevision((current) => current + 1)}>Same-value revision</ControlButton>
      </div>
      <StatePanel label="Async state" value={{ value, revision, pending, events }} />
    </ContractFrame>
  )
}

export default {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Slider 用于通过拖动或键盘调整一个或多个数值位置。value 数组中的每一项对应一个滑块，适合单值参数或区间选择。\n\n应用通过 onValueChange 接收预览数组，并在 onValueCommit 中保存一次完整调整。方向键、PageUp/PageDown、Home/End 可用于键盘操作；min/max 和 step 限制范围与步长。\n\n受控用法中，应用必须回传 value，并在 onEditCancel 中决定是否恢复编辑前的值。多滑块可配置顺序与最小间距；readOnly 保留焦点供查看，disabled 禁止交互。',
      },
    },
  },
  title: 'Widgets/Sliders/Slider',
} satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <SliderOverview /> }
export const Multiple: Story = { render: () => <MultipleThumbs /> }
export const Directions: Story = { render: () => <SliderDirections /> }
export const RangesAndRulers: Story = { render: () => <SliderRanges /> }
export const ReadOnlyDisabledRejected: Story = { render: () => <SliderModes /> }
export const PendingAndExternalUpdates: Story = { render: () => <SliderPending /> }
