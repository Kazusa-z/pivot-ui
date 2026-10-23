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
      description="每次拖动一个开始/终结；实时请求由父级回传。Escape、pointercancel 或窗口失焦通知父级恢复预览。Ctrl/⌘ 拖动细调，键盘箭头/Page/Home/End 可操作。"
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
      <StatePanel label="Value and lifecycle" value={{ value, revision, events }} />
    </ContractFrame>
  )
}

function MultipleThumbs() {
  const [value, setValue] = useState([20, 60, 80])
  return (
    <ContractFrame
      title="Multiple thumbs"
      description="数组是已排序的位置。上方允许跨越换序；下方锁定顺序并保持至少10单位距离。每个thumb提供独立名称。"
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
      title="Directions"
      description="水平LTR/RTL与竖排分别保持键盘和指针方向；inverted反转视觉轴，尺寸由调用者约束。"
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
      title="Ranges and rulers"
      description="负范围和小数step使用共享数值规则；刻度最多199条。0/负rulerInterval回退自动间距。min=max保留固定可读值。"
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
      title="Read only, disabled and controlled refusal"
      description="只读保留键盘焦点但不写值；disabled跳过焦点。固定受控值不会伪装接受拖动，仍记录请求供宿主判断。"
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
      title="Pending and external updates"
      description="拖动结束后等待模拟宿主。等待期间不开始第二次编辑；拒绝回到权威值并显示错误。外部revision使旧结果失效。"
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
            request.current?.reject(new Error('Host rejected the value'))
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

export default { title: 'Widgets/Sliders/Slider' } satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <SliderOverview /> }
export const Multiple: Story = { render: () => <MultipleThumbs /> }
export const Directions: Story = { render: () => <SliderDirections /> }
export const RangesAndRulers: Story = { render: () => <SliderRanges /> }
export const ReadOnlyDisabledRejected: Story = { render: () => <SliderModes /> }
export const PendingAndExternalUpdates: Story = { render: () => <SliderPending /> }
