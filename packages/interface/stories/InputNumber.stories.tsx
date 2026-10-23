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
          ? '数值的输入范围与拖动范围'
          : frozen
            ? '应用保留原值时的显示'
            : mixedInitially
              ? '多个对象的数值不一致'
              : '输入、拖动与步进调整'
      }
      description={
        soft
          ? 'min/max 设置硬范围 −100…100，softMin/softMax 设置调节范围 0…10。当前值为 25 时，向内一步到 24，向外保持 25；手动输入仍可填写硬范围内的 80，拖动也会包含本次起始值。'
          : frozen
            ? '拖动输入框或键入数值，比较下方的修改请求与显示的原值。此例让应用保留原值；接入时在 onValueChange 中更新 value，就可以接受用户的调整。'
            : mixedInitially
              ? '输入一个值来替换多个对象的不同数值，或试着拖动、点击步进按钮，从参考值 10 开始调整。保存后下方 mixed 变为 false，输入框显示统一的值；应用可用这个标志控制多选对象的显示。'
              : '未聚焦时可横向拖动，短点击进入文本编辑。按住 Ctrl/⌘ 使用 0.1 倍步长，Shift 使用 10 倍，前者优先。Enter 或失焦触发一次 onValueCommit；Escape 触发 onEditCancel，由应用恢复编辑前的值。'
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
      title="中间输入、校验与原生事件"
      description="输入 -、. 或 1e- 时保留文本，暂不发送数值变化；1+2 会作为非法数值提示错误。可以继续修正或按 Escape 取消。precision=2 时，1.005 请求更新为 1.01；需要观察键入事件时可另用原生 onChange。"
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
      <StatePanel label="文本输入事件" value={{ value, events }} />
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
      title="等待保存与失败重试"
      description="输入数值并按 Enter，随后点击 Accept 完成保存，或点击“拒绝保存并恢复原值”体验失败提示；失败后可继续编辑或按 Enter 重试。下方记录展示等待和完成的过程，应用可在 onValueCommit 返回 Promise 来接入保存服务。"
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
            request.current?.reject(new Error('数值未保存，请修正后重试。'))
            request.current = null
            setPending(false)
          }}>
          拒绝保存并恢复原值
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
      <StatePanel label="等待保存时的数值状态" value={{ value, revision, pending, mounted, events }} />
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
      title="非受控取消、只读与禁用"
      description="修改数值后按 Escape，观察使用 defaultValue 的输入框恢复原值；再切换只读和禁用按钮，用 Tab 比较焦点与文本选择体验。适合只需要初始值的表单可使用 defaultValue，需要同步应用数据时使用 value/onValueChange。"
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

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Input Number',
  parameters: {
    docs: {
      description: {
        component:
          'InputNumber 用于精确输入、拖动调节或逐步调整一个有限数值，适合尺寸、角度、强度等参数。\n\nvalue/onValueChange 用于受控值，defaultValue 用于非受控初值。onEditStart 标记开始编辑，onValueCommit 在 Enter、失焦或手势结束时通知保存，onEditCancel 通知取消。中间文本会留在输入框中，合法数值才发送变化。\n\nmin/max、softMin/softMax、step、dragStep 和 precision 分别控制范围、调节步长与精度。受控取消由应用恢复值；异步提交失败后保留草稿，resetKey 用于切换对象或重置编辑状态。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <NumberExample /> }
export const TextDrafts: Story = { render: () => <DraftExample /> }
export const SoftRanges: Story = { render: () => <NumberExample soft /> }
export const FrozenControlled: Story = { render: () => <NumberExample frozen /> }
export const Mixed: Story = { render: () => <NumberExample mixedInitially /> }
export const PendingAndRejection: Story = { render: () => <PendingExample /> }
export const Availability: Story = { render: () => <AvailabilityExample /> }
