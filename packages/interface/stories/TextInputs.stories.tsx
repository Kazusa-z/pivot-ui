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
      title="Native Input"
      description="受控值保持字符串身份；onChange 收到原生 React ChangeEvent，onValueChange 单独返回字符串。普通输入无提交事务。"
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
      title="Native Textarea"
      description="Enter 正常换行，Escape 不建立事务。rows、maxLength、name、ref 与原生事件都直接交给 textarea。"
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
      title="Text sizes, slots, state and narrow width"
      description="四种 Input 尺寸、三种表面与真实 disabled/readOnly。0 插槽可见，错误态带 aria-invalid；局部 CSS 覆盖只有一组最终原子样式。"
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
      title="EditableText lifecycle"
      description="点击或 Enter/Space 开始；Enter 或失焦仅提交一次，Escape 真取消。IME 输入候选确认不提交。父级接受后回写 value。"
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
      title="Async acceptance and rejection"
      description="提交后输入只读并显示 Saving。Reject 保留草稿与错误，可修改或重试；External update 取消本地会话，宿主也按请求版本忽略旧结果。"
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
      title={multiline ? 'Opt-in multiline editing session' : 'External revisions and availability'}
      description={
        multiline
          ? 'Textarea 默认无事务；这里显式使用共享内核。Enter 换行，Ctrl/Meta+Enter 提交，Escape 回滚，blur 提交。'
          : '按钮在 pointerdown 阻止焦点离开，便于测试正在编辑时发生外部更新、同值 revision、只读和禁用。草稿随外部权威版本取消。'
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
      title="EditableText availability and unmount"
      description="禁用按钮不可进入；只读可聚焦但不可开始。卸载活动编辑器会取消本地草稿，不触发提交。"
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

const meta = { title: 'Widgets/Text Inputs', parameters: { layout: 'fullscreen' } } satisfies Meta
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
