import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { InputNumber } from '../src/widgets/inputs/InputNumber'
import type { NumericCancelReason } from '../src/interaction/numeric/types'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'

const rollsBackPreview = (reason: NumericCancelReason) =>
  ['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason)

function NumberExample({
  soft = false,
  frozen = false,
  mixedInitially = false,
}: {
  soft?: boolean
  frozen?: boolean
  mixedInitially?: boolean
}) {
  const initial = soft ? 25 : 10
  const [value, setValue] = useState(initial)
  const [mixed, setMixed] = useState(mixedInitially)
  const [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(initial)
  const input = useRef<HTMLInputElement>(null)
  const record = (message: string) => {
    setEvents((old) => [...old.slice(-15), message])
  }
  return (
    <ContractFrame
      title={
        soft
          ? 'Hard and soft numeric ranges'
          : frozen
            ? 'Frozen controlled value'
            : mixedInitially
              ? 'Mixed numeric selection'
              : 'InputNumber: text, drag and step'
      }
      description={
        soft
          ? '硬范围 −100…100，软范围 0…10，起点25。向内一步到24，向外保持25；手动文本可输入80。拖动范围包含本次起点。'
          : frozen
            ? '宿主记录请求但拒绝更新value。拖动显示始终是外部值；文本草稿可编辑，提交后恢复外部值，不伪装已接受。'
            : mixedInitially
              ? '混合态空占位；未修改的聚焦/失焦不写0。拖动和步进从有限实际值10开始，接受提交后清除mixed。'
              : '未聚焦时横向拖动；短点击进入文本。Ctrl/Meta ×0.1细调，Shift ×10加速；Ctrl/Meta优先。Enter/blur一次提交，Escape由此故事宿主回滚preview。'
      }
      onReset={() => {
        setValue(initial)
        setMixed(mixedInitially)
        setRevision((n) => n + 1)
        setEvents([])
      }}>
      <InputNumber
        ref={input}
        aria-label="Numeric value"
        value={value}
        mixed={mixed}
        resetKey={revision}
        min={-100}
        max={100}
        softMin={soft ? 0 : undefined}
        softMax={soft ? 10 : undefined}
        step={1}
        dragStep={0.1}
        precision={3}
        stepper
        startSlot="X"
        endSlot="px"
        onEditStart={(source) => {
          start.current = value
          record(`begin:${source}`)
        }}
        onValueChange={(next) => {
          record(`change:${next}`)
          if (!frozen) setValue(next)
        }}
        onValueCommit={(next, reason) => {
          record(`commit:${reason}:${next}`)
          setMixed(false)
        }}
        onEditCancel={(reason) => {
          record(`cancel:${reason}`)
          if (!frozen && rollsBackPreview(reason)) setValue(start.current)
        }}
      />
      <div className={contractStyles.row}>
        <ControlButton onClick={() => input.current?.focus()}>Focus native input</ControlButton>
        <ControlButton
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            setValue(70)
            setRevision((n) => n + 1)
          }}>
          External 70
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setRevision((n) => n + 1)}>
          Same value new revision
        </ControlButton>
        <ControlButton>Blur target</ControlButton>
      </div>
      <StatePanel label="Numeric state" value={{ value, mixed, revision, events }} />
    </ContractFrame>
  )
}

function DraftExample() {
  const [value, setValue] = useState(2)
  const [generation, setGeneration] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  return (
    <ContractFrame
      title="Numeric drafts and native event"
      description="中间文本 -、.、1e- 保留，不发送NaN；表达式1+2不求值。非法文本提交显示错误，可继续编辑或Escape恢复。输入1.005以两位精度请求1.01；原生onChange只观察真实输入事件。"
      onReset={() => {
        setValue(2)
        setGeneration((n) => n + 1)
        setEvents([])
      }}>
      <InputNumber
        aria-label="Numeric draft"
        value={value}
        resetKey={generation}
        min={-10}
        max={10}
        precision={2}
        onValueChange={setValue}
        onChange={(event) => {
          const draft = event.currentTarget.value
          setEvents((list) => [...list.slice(-10), `native:${draft}`])
        }}
        onValueCommit={(number, reason) => setEvents((list) => [...list, `commit:${reason}:${number}`])}
      />
      <InputNumber
        aria-label="Uncontrolled decimal"
        key={generation}
        defaultValue={0.001}
        step={0.001}
        dragStep={0.0001}
        stepper
      />
      <ControlButton>Blur target</ControlButton>
      <StatePanel label="Text draft events" value={{ value, events }} />
    </ContractFrame>
  )
}

function PendingExample() {
  const [value, setValue] = useState(10)
  const [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [mounted, setMounted] = useState(true)
  const initial = useRef(10)
  const request = useRef<{ resolve: () => void; reject: (reason: Error) => void } | null>(null)
  const record = (message: string) => {
    setEvents((old) => [...old.slice(-14), message])
  }
  return (
    <ContractFrame
      title="Pending submission and rejection"
      description="提交后pending。Reject先将宿主preview恢复起点（同revision），再拒绝Promise；控件保留草稿供重试。External revision使旧completion失效；pending不再发cancel。"
      onReset={() => {
        setRevision((n) => n + 1)
        setValue(10)
        setMounted(true)
        request.current?.resolve()
        request.current = null
        setPending(false)
        setEvents([])
      }}>
      {mounted && (
        <InputNumber
          aria-label="Pending numeric"
          value={value}
          resetKey={revision}
          stepper
          onEditStart={(source) => {
            initial.current = value
            record(`begin:${source}`)
          }}
          onValueChange={setValue}
          onValueCommit={async (next, reason) => {
            record(`request:${reason}:${next}`)
            setPending(true)
            await new Promise<void>((resolve, reject) => {
              request.current = { resolve, reject }
            })
            record(`resolved:${next}`)
          }}
          onEditCancel={(reason) => {
            record(`cancel:${reason}`)
            if (rollsBackPreview(reason)) setValue(initial.current)
          }}
        />
      )}
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
            request.current?.reject(new Error('Host rejected this number'))
            request.current = null
            setPending(false)
          }}>
          Reject and restore authority
        </ControlButton>
        <ControlButton
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            setValue(80)
            setRevision((n) => n + 1)
          }}>
          External revision 80
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setMounted((v) => !v)}>
          {mounted ? 'Unmount' : 'Mount'}
        </ControlButton>
      </div>
      <StatePanel label="Pending numeric state" value={{ value, revision, pending, mounted, events }} />
    </ContractFrame>
  )
}

function AvailabilityExample() {
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  return (
    <ContractFrame
      title="Uncontrolled cancellation and availability"
      description="非受控模式由控件恢复手势起点。正在编辑时切换disabled/readOnly会取消；disabled不能聚焦，readOnly仍可选择文本。"
      onReset={() => {
        setDisabled(false)
        setReadOnly(false)
        setGeneration((n) => n + 1)
        setEvents([])
      }}>
      <InputNumber
        key={generation}
        aria-label="Uncontrolled numeric"
        defaultValue={5}
        disabled={disabled}
        readOnly={readOnly}
        stepper
        onEditCancel={(reason) => setEvents((old) => [...old, reason])}
      />
      <div className={contractStyles.row}>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setDisabled((v) => !v)}>
          Toggle disabled
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setReadOnly((v) => !v)}>
          Toggle read only
        </ControlButton>
      </div>
      <StatePanel label="Availability state" value={{ disabled, readOnly, events }} />
    </ContractFrame>
  )
}

const meta = { title: 'Widgets/Input Number', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <NumberExample /> }
export const TextDrafts: Story = { render: () => <DraftExample /> }
export const SoftRanges: Story = { render: () => <NumberExample soft /> }
export const FrozenControlled: Story = { render: () => <NumberExample frozen /> }
export const Mixed: Story = { render: () => <NumberExample mixedInitially /> }
export const PendingAndRejection: Story = { render: () => <PendingExample /> }
export const Availability: Story = { render: () => <AvailabilityExample /> }
