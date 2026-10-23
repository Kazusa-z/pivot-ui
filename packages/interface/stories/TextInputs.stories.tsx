import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Input, Textarea, EditableText, useTextEdit } from '../src/widgets/inputs'
import { css } from '../styled-system/css'
import { ContractFrame, ControlButton, ControlField, StatePanel, contractStyles } from './support/ContractFrame'

function NativeInputExample() {
  const [value, setValue] = useState('001')
  const [nativeEvents, setNativeEvents] = useState(0)
  const [uncontrolled, setUncontrolled] = useState('Native default')
  const [generation, setGeneration] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const [refs, setRefs] = useState('Not checked')
  return (
    <ContractFrame
      title="普通单行文本输入"
      description="Input 适合普通字符串输入。onChange 接收 React ChangeEvent，onValueChange 直接返回字符串；应用可回写 value，或用 defaultValue 让输入框保存当前值。需要确认后保存的流程可组合 useTextEdit。"
      onReset={() => {
        setValue('001')
        setNativeEvents(0)
        setUncontrolled('Native default')
        setGeneration((n) => n + 1)
        setRefs('Not checked')
      }}>
      <ControlField label="Controlled text">
        <Input
          aria-label="Controlled text"
          value={value}
          onValueChange={setValue}
          onChange={() => setNativeEvents((n) => n + 1)}
          ref={input}
          rootRef={root}
          startSlot="Aa"
          endSlot={value.length}
        />
      </ControlField>
      <ControlField label="Uncontrolled text">
        <Input
          key={generation}
          aria-label="Uncontrolled text"
          defaultValue="Native default"
          onValueChange={setUncontrolled}
        />
      </ControlField>
      <div className={contractStyles.row}>
        <ControlButton
          onClick={() => {
            input.current?.focus()
            setRefs(`${input.current?.tagName} inside ${root.current?.tagName}`)
          }}>
          Focus native ref
        </ControlButton>
        <ControlButton onClick={() => setValue('External 002')}>External value</ControlButton>
      </div>
      <StatePanel label="Native values" value={{ value, type: typeof value, nativeEvents, uncontrolled, refs }} />
    </ContractFrame>
  )
}

function NativeTextareaExample() {
  const [value, setValue] = useState('First line\nSecond line')
  const [events, setEvents] = useState(0)
  const input = useRef<HTMLTextAreaElement>(null)
  return (
    <ContractFrame
      title="普通多行文本输入"
      description="Textarea 适合多行文字，Enter 插入换行。rows、maxLength、name、ref 与事件按原生 textarea 使用；应用在 onValueChange 中接收文本，提交和取消流程可按需要另外组合。"
      onReset={() => {
        setValue('First line\nSecond line')
        setEvents(0)
      }}>
      <ControlField label="Notes">
        <Textarea
          ref={input}
          aria-label="Notes"
          name="notes"
          rows={5}
          maxLength={500}
          value={value}
          onValueChange={setValue}
          onChange={() => setEvents((n) => n + 1)}
          css={{ resize: 'vertical' }}
        />
      </ControlField>
      <ControlButton onClick={() => input.current?.focus()}>Focus textarea ref</ControlButton>
      <StatePanel label="Textarea value" value={{ value, events }} />
    </ContractFrame>
  )
}

function AppearanceExample() {
  const [generation, setGeneration] = useState(0)
  return (
    <ContractFrame
      title="输入尺寸、插槽与可用状态"
      description="根据面板密度选择尺寸和表面样式，startSlot 与 endSlot 可放单位、图标或数值。state=`invalid` 提供错误外观及 aria-invalid；disabled 表示不可操作，readOnly 允许查看和复制，css 用于局部样式调整。"
      onReset={() => setGeneration((n) => n + 1)}>
      <div key={generation} className={contractStyles.grid}>
        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
          <ControlField key={size} label={`Size ${size}`}>
            <Input
              size={size}
              aria-label={`Size ${size}`}
              defaultValue="A very long string that must fit the field"
              ellipsis
              startSlot={0}
              endSlot="px"
            />
          </ControlField>
        ))}
        {(['outline', 'soft', 'subtle'] as const).map((variant) => (
          <ControlField key={variant} label={`Variant ${variant}`}>
            <Input variant={variant} aria-label={`Variant ${variant}`} defaultValue={variant} />
          </ControlField>
        ))}
        <Input aria-label="Valid input" state="valid" defaultValue="Valid" />
        <Input aria-label="Invalid input" state="invalid" defaultValue="Invalid" />
        <Input aria-label="Disabled input" disabled defaultValue="Disabled" />
        <Input aria-label="Read only input" readOnly value="Read only, selectable" />
        <Textarea aria-label="Disabled textarea" disabled value="Disabled multiline" />
        <Textarea aria-label="Read only textarea" readOnly value="Read only\nSelectable text" />
        <Input
          aria-label="CSS override"
          defaultValue="18px custom frame"
          css={{ height: '18px', borderColor: 'var(--colors-dangerBorder)' }}
        />
      </div>
      <div className={css({ width: '150px', maxWidth: '100%' })}>
        <Input aria-label="Narrow input" defaultValue="Long value in a narrow control" ellipsis endSlot="suffix" />
      </div>
    </ContractFrame>
  )
}

function EditableExample() {
  const [value, setValue] = useState('Camera 001')
  const [events, setEvents] = useState<string[]>([])
  const [generation, setGeneration] = useState(0)
  const record = (event: string) => {
    setEvents((items) => [...items.slice(-11), event])
  }
  return (
    <ContractFrame
      title="从文字展示进入编辑"
      description="EditableText 适合名称等平时以文字展示的字段。点击或按 Enter/Space 进入编辑，Enter 或失焦提交，Escape 取消；输入法确认候选时继续编辑。应用在 onCommit 中保存文字并回写 value。"
      onReset={() => {
        setValue('Camera 001')
        setEvents([])
        setGeneration((n) => n + 1)
      }}>
      <EditableText
        label="Object name"
        value={value}
        resetKey={generation}
        showIcon
        onBegin={() => record('begin')}
        onDraftChange={(draft) => record(`draft: ${draft}`)}
        onCommit={(draft, reason) => {
          record(`commit (${reason}): ${draft}`)
          setValue(draft)
        }}
        onCancel={(reason) => record(`cancel: ${reason}`)}
      />
      <ControlButton>Blur target</ControlButton>
      <StatePanel label="Editing events" value={{ authoritative: value, events }} />
    </ContractFrame>
  )
}

function AsyncExample() {
  const [value, setValue] = useState('Accepted name')
  const [generation, setGeneration] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const [requestPending, setRequestPending] = useState(false)
  const request = useRef<{ accept: () => void; reject: () => void } | null>(null)
  const generationRef = useRef(0)
  const record = (message: string) => {
    setEvents((items) => [...items.slice(-11), message])
  }
  const invalidate = () => {
    generationRef.current += 1
    setGeneration(generationRef.current)
  }
  return (
    <ContractFrame
      title="异步保存与失败重试"
      description="提交异步操作后，输入进入等待状态。Accept 保存并回写 value，Reject 显示错误并保留草稿，用户可修改后重试。外部更新通过 value 和 resetKey 开启新的数据版本，应用也按请求版本判断结果是否仍然有效。"
      onReset={() => {
        invalidate()
        setValue('Accepted name')
        request.current?.accept()
        request.current = null
        setRequestPending(false)
        setEvents([])
      }}>
      <EditableText
        label="Async name"
        value={value}
        resetKey={generation}
        onCommit={async (draft, reason) => {
          const version = generationRef.current
          record(`request (${reason}): ${draft}`)
          setRequestPending(true)
          await new Promise<void>((resolve, reject) => {
            request.current = {
              accept: resolve,
              reject: () => reject(new Error('Name rejected. Edit the draft or retry.')),
            }
          })
          if (version === generationRef.current) {
            setValue(draft)
            record(`accepted: ${draft}`)
          } else record(`ignored stale request: ${draft}`)
        }}
        onCancel={(reason) => {
          record(`cancel: ${reason}`)
        }}
      />
      <div className={contractStyles.row}>
        <ControlButton
          disabled={!requestPending}
          onClick={() => {
            const current = request.current
            request.current = null
            setRequestPending(false)
            current?.accept()
          }}>
          Accept request
        </ControlButton>
        <ControlButton
          disabled={!requestPending}
          onClick={() => {
            const current = request.current
            request.current = null
            setRequestPending(false)
            current?.reject()
            record('rejected')
          }}>
          Reject request
        </ControlButton>
        <ControlButton
          onClick={() => {
            invalidate()
            setValue('Externally updated')
          }}>
          External update
        </ControlButton>
      </div>
      <StatePanel label="Async events" value={{ authoritative: value, requestPending, revision: generation, events }} />
    </ContractFrame>
  )
}

function SessionExample({ multiline = false }: { multiline?: boolean }) {
  const [value, setValue] = useState('Original text')
  const [revision, setRevision] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const record = (message: string) => {
    setEvents((items) => [...items.slice(-11), message])
  }
  const editor = useTextEdit({
    value,
    resetKey: revision,
    disabled,
    readOnly,
    multiline,
    onBegin: () => record('begin'),
    onDraftChange: (draft) => record(`draft: ${draft}`),
    onCommit: (draft, reason) => {
      record(`commit (${reason}): ${draft}`)
      setValue(draft)
    },
    onCancel: (reason) => record(`cancel: ${reason}`),
  })
  const native = {
    ...editor.inputProps,
    value: editor.draft,
    disabled,
    readOnly: readOnly || editor.phase === 'pending',
    'aria-label': 'Session text',
  }
  return (
    <ContractFrame
      title={multiline ? '为多行文本添加提交与取消' : '编辑时接收外部数据更新'}
      description={
        multiline
          ? '多行文本需要明确提交时，可将 Textarea 与 useTextEdit 组合。Enter 换行，Ctrl/Meta+Enter 或失焦提交，Escape 取消；应用在 onCommit 保存文本，并在 onCancel 处理预览清理。'
          : '编辑期间也可能收到外部值、同值的新版本或可用性变化。这里的按钮保留输入焦点，便于观察草稿如何结束；应用通过 value、resetKey、readOnly 和 disabled 传入这些变化。'
      }
      onReset={() => {
        editor.cancel('reset')
        setValue('Original text')
        setRevision((n) => n + 1)
        setDisabled(false)
        setReadOnly(false)
        setEvents([])
      }}>
      {multiline ? <Textarea {...native} /> : <Input {...native} />}
      <div className={contractStyles.row}>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setValue('External text')}>
          External value
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setRevision((n) => n + 1)}>
          Same value new revision
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setReadOnly((v) => !v)}>
          Toggle read only
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setDisabled((v) => !v)}>
          Toggle disabled
        </ControlButton>
        <ControlButton>Blur target</ControlButton>
      </div>
      <StatePanel
        label="Text session"
        value={{
          authoritative: value,
          revision,
          draft: editor.draft,
          phase: editor.phase,
          error: editor.error,
          disabled,
          readOnly,
          events,
        }}
      />
    </ContractFrame>
  )
}

function AvailabilityExample() {
  const [mounted, setMounted] = useState(true)
  const [value, setValue] = useState('Unmount me while editing')
  const [events, setEvents] = useState<string[]>([])
  return (
    <ContractFrame
      title="只读、禁用与移除编辑器"
      description="disabled 表示字段暂不可用，readOnly 保留聚焦查看能力。正在编辑时卸载组件会通过取消回调结束草稿；应用可以据此清理预览，已经提交的保存请求仍按自己的异步流程处理。"
      onReset={() => {
        setMounted(true)
        setValue('Unmount me while editing')
        setEvents([])
      }}>
      <EditableText value="Disabled name" label="Disabled name" disabled onCommit={() => {}} />
      <EditableText value="Read only name" label="Read only name" readOnly onCommit={() => {}} />
      {mounted && (
        <EditableText
          label="Mounted name"
          value={value}
          onCommit={setValue}
          onCancel={(reason) => setEvents((items) => [...items, reason])}
        />
      )}
      <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setMounted((v) => !v)}>
        {mounted ? 'Unmount editor' : 'Mount editor'}
      </ControlButton>
      <StatePanel label="Unmount events" value={{ mounted, value, events }} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Text Inputs',
  parameters: {
    docs: {
      description: {
        component:
          'Input 和 Textarea 用于普通文本输入，onChange 接收 React 事件，onValueChange 接收字符串。EditableText 用于先展示、再进入编辑的文字，提交通过回调交给应用，失败可保留草稿重试。需要给原生输入增加提交与取消流程时组合 useTextEdit，并用 resetKey 表示外部版本变化。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const NativeInput: Story = { render: () => <NativeInputExample /> }
export const NativeTextarea: Story = { render: () => <NativeTextareaExample /> }
export const Appearance: Story = { render: () => <AppearanceExample /> }
export const EditableLifecycle: Story = { render: () => <EditableExample /> }
export const AsyncCommit: Story = { render: () => <AsyncExample /> }
export const ExternalUpdates: Story = { render: () => <SessionExample /> }
export const MultilineSession: Story = { render: () => <SessionExample multiline /> }
export const AvailabilityAndUnmount: Story = { render: () => <AvailabilityExample /> }
