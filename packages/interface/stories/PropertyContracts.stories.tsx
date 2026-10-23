import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { HostCapabilities } from '../src/contracts'
import type { ChoiceOption, ChoiceValue } from '../src/values'
import { createMockPropertyAccess } from './support/mock-property-access'
import {
  ContractFrame,
  ControlButton,
  ControlField,
  ControlInput,
  ControlSelect,
  StatePanel,
  contractStyles,
} from './support/ContractFrame'

type NumberAccess = ReturnType<typeof createMockPropertyAccess<number>>
type NumberSession = Extract<ReturnType<NumberAccess['begin']>, { status: 'started' }>['session']
type EditResult = Awaited<ReturnType<NumberSession['commit']>>
type Scenario = 'lifecycle' | 'delayed' | 'external-edit' | 'external-pending' | 'targets' | 'availability'
type EventEntry = { event: string; target: string; detail?: unknown }

const descriptions: Record<Scenario, { title: string; description: string }> = {
  lifecycle: {
    title: '开始、预览、提交与取消',
    description:
      '点击 Begin 开始编辑，再修改 Preview。预览会变化，但已保存值 authoritative 与版本号 revision 保持不变；Commit 接受后才保存并增加历史。再次编辑后点击 Cancel，界面恢复已保存的值。',
  },
  delayed: {
    title: '等待保存与拒绝结果',
    description:
      '此例默认等待 1800 ms 保存，点击 Begin、修改数值后再 Commit，可看到 pending 等待状态。先点 Reject next commit 再提交，会得到 rejected 结果，已保存值和历史数量保持不变。应用可用这一结果提示用户或允许重试。',
  },
  'external-edit': {
    title: '编辑时收到外部更新',
    description:
      '开始编辑并修改预览后，点击 External update 模拟应用收到新数据。字段改为显示外部值，原草稿失效；再次点击 Begin，会按新的 revision 版本号开始编辑。',
  },
  'external-pending': {
    title: '等待保存时收到更新的数据',
    description:
      '提交后在 1800 ms 内点击 External update。较早的提交随后返回 superseded，表示已被新版本替代；它不会覆盖外部数据或增加历史。应用可以据此忽略过期的保存结果。',
  },
  targets: {
    title: '切换正在编辑的对象',
    description:
      '尚未提交时切换对象会取消草稿；提交后再切换到 B，已发出的请求仍只更新 A。等待 A 时可独立编辑 B，下方两份快照帮助确认每次保存对应哪个对象。',
  },
  availability: {
    title: '只读、禁用与可选应用能力',
    description:
      '开始编辑并修改预览后，开启 Read only 或 Disabled 会取消未提交的编辑，已保存值保持不变。关闭限制后可以重新编辑。剪贴板、文件选择和偏好保存需要应用提供相应方法，缺失时对应按钮不可用。',
  },
}

function makeAccess(objectId: string, value: number, delay: number) {
  const access = createMockPropertyAccess<number>({
    target: { objectId, propertyId: 'size' },
    descriptor: { id: 'size', kind: 'number', label: 'Size', constraints: { min: 0, max: 100, step: 1 } },
    value,
  })
  access.setDelay(delay)
  return access
}

function NumericContractPlayground({ scenario }: { scenario: Scenario }) {
  const delayed = scenario === 'delayed' || scenario === 'external-pending' || scenario === 'targets'
  const initialDelay = delayed ? 1800 : 0
  const [accesses] = useState(() => ({
    a: makeAccess('object-a', 10, initialDelay),
    b: makeAccess('object-b', 30, initialDelay),
  }))
  const [activeTarget, setActiveTarget] = useState<'a' | 'b'>('a')
  const snapshotA = useSyncExternalStore(accesses.a.subscribe, accesses.a.getSnapshot, accesses.a.getSnapshot)
  const snapshotB = useSyncExternalStore(accesses.b.subscribe, accesses.b.getSnapshot, accesses.b.getSnapshot)
  const access = accesses[activeTarget]
  const snapshot = activeTarget === 'a' ? snapshotA : snapshotB
  const sessions = useRef(new Map<string, NumberSession>())
  const generation = useRef(0)
  const [events, setEvents] = useState<EventEntry[]>([])
  const [result, setResult] = useState<EditResult | null>(null)
  const [delay, setDelay] = useState(initialDelay)
  const [clipboardEnabled, setClipboardEnabled] = useState(false)
  const [clipboardText, setClipboardText] = useState('')
  const capabilities: HostCapabilities = clipboardEnabled
    ? {
        clipboard: {
          readText: () => Promise.resolve(clipboardText),
          writeText: (text) => {
            setClipboardText(text)
            return Promise.resolve()
          },
        },
      }
    : {}
  const objectId = snapshot.target.objectId
  const phase = snapshot.edit?.phase ?? 'idle'
  const preview = snapshot.edit?.previewValue ?? snapshot.value
  const config = descriptions[scenario]

  useEffect(() => {
    const activeSessions = sessions.current
    return () => {
      generation.current += 1
      activeSessions.forEach((session) => void session.cancel('unmount'))
      activeSessions.clear()
    }
  }, [accesses])

  function record(event: string, target: string, detail?: unknown) {
    setEvents((previous) => [...previous.slice(-11), { event, target, detail }])
  }

  function observe(event: string, target: string, pendingResult: Promise<EditResult>) {
    const currentGeneration = generation.current
    void pendingResult.then(
      (nextResult) => {
        if (generation.current !== currentGeneration) return
        setResult(nextResult)
        record(event, target, nextResult)
      },
      (error: unknown) => {
        if (generation.current !== currentGeneration) return
        record('Unexpected error', target, error instanceof Error ? error.message : String(error))
      }
    )
  }

  function begin() {
    const started = access.begin()
    if (started.status === 'started') {
      sessions.current.set(objectId, started.session)
      setResult(null)
      record('begin', objectId)
    } else {
      record('begin unavailable', objectId, started)
    }
  }

  function change(value: number) {
    if (!Number.isFinite(value)) return
    sessions.current.get(objectId)?.change(value)
    record('change', objectId, value)
  }

  function commit() {
    const session = sessions.current.get(objectId)
    if (!session) return
    record('commit requested', objectId)
    observe('commit result', objectId, session.commit())
  }

  function cancel() {
    const session = sessions.current.get(objectId)
    if (!session) return
    observe('cancel result', objectId, session.cancel('escape'))
  }

  function externalUpdate() {
    const interrupted = snapshot.edit?.phase === 'editing' ? sessions.current.get(objectId) : undefined
    access.externalUpdate(70)
    record('external update', objectId, { value: 70, revision: access.getSnapshot().revision })
    if (interrupted) observe('interrupted session result', objectId, interrupted.cancel('external-update'))
  }

  function switchTarget(target: 'a' | 'b') {
    if (target === activeTarget) return
    if (snapshot.edit?.phase === 'editing') {
      const session = sessions.current.get(objectId)
      if (session) observe('target change cancellation', objectId, session.cancel('target-change'))
    }
    record('switch target', accesses[target].getSnapshot().target.objectId, { previousTarget: objectId })
    setActiveTarget(target)
  }

  function changeAvailability(key: 'readOnly' | 'disabled', checked: boolean) {
    const interrupted = snapshot.edit ? sessions.current.get(objectId) : undefined
    access.setAvailability({ [key]: checked })
    record('availability changed', objectId, { [key]: checked })
    if (checked && interrupted) {
      observe('availability cancellation', objectId, interrupted.cancel(key === 'readOnly' ? 'read-only' : 'disabled'))
    }
  }

  function reset() {
    generation.current += 1
    sessions.current.clear()
    accesses.a.reset()
    accesses.b.reset()
    accesses.a.setDelay(initialDelay)
    accesses.b.setDelay(initialDelay)
    setActiveTarget('a')
    setDelay(initialDelay)
    setEvents([])
    setResult(null)
    setClipboardEnabled(false)
    setClipboardText('')
  }

  return (
    <ContractFrame title={config.title} description={config.description} onReset={reset}>
      {scenario === 'targets' && (
        <div className={contractStyles.row} aria-label="Active object">
          <ControlButton aria-pressed={activeTarget === 'a'} onClick={() => switchTarget('a')}>
            Object A
          </ControlButton>
          <ControlButton aria-pressed={activeTarget === 'b'} onClick={() => switchTarget('b')}>
            Object B
          </ControlButton>
        </div>
      )}
      <p className={contractStyles.note} role="status">
        Current target: {objectId} · phase: {phase} · revision: {snapshot.revision} · history: {snapshot.historyCount}
      </p>
      <div className={contractStyles.row}>
        <ControlButton onClick={begin} disabled={phase !== 'idle' || snapshot.readOnly || snapshot.disabled}>
          Begin
        </ControlButton>
        <ControlField label="Preview value">
          <ControlInput
            type="number"
            min={0}
            max={100}
            step={1}
            value={preview}
            disabled={phase !== 'editing' || snapshot.disabled}
            readOnly={snapshot.readOnly}
            onChange={(event) => change(event.currentTarget.valueAsNumber)}
          />
        </ControlField>
        <ControlButton onClick={() => change(Math.min(100, preview + 1))} disabled={phase !== 'editing'}>
          Preview + 1
        </ControlButton>
        <ControlButton onClick={commit} disabled={phase !== 'editing'}>
          Commit
        </ControlButton>
        <ControlButton onClick={cancel} disabled={phase === 'idle'}>
          Cancel
        </ControlButton>
      </div>
      {delayed && (
        <div className={contractStyles.stack}>
          <p className={contractStyles.note}>
            Commit 发出保存请求后，等待期间再调用 Cancel 会得到同一个结果，不能撤回已经提交的操作。 Reset
            重置此示例，并忽略重置前请求返回的界面结果。
          </p>
          <div className={contractStyles.row}>
            <ControlField label="Commit delay (ms)">
              <ControlInput
                type="number"
                min={0}
                max={10000}
                step={100}
                value={delay}
                onChange={(event) => {
                  const next = event.currentTarget.valueAsNumber
                  if (!Number.isFinite(next) || next < 0 || next > 10000) return
                  setDelay(next)
                  accesses.a.setDelay(next)
                  accesses.b.setDelay(next)
                }}
              />
            </ControlField>
            {scenario === 'delayed' && (
              <ControlButton
                onClick={() => {
                  access.rejectNext('此例模拟保存失败，原值保持不变。')
                  record('next commit will be rejected', objectId)
                }}>
                Reject next commit
              </ControlButton>
            )}
          </div>
        </div>
      )}
      {(scenario === 'external-edit' || scenario === 'external-pending') && (
        <ControlButton onClick={externalUpdate}>External update → 70</ControlButton>
      )}
      {scenario === 'availability' && (
        <div className={contractStyles.stack}>
          <div className={contractStyles.row}>
            <label>
              <input
                type="checkbox"
                checked={snapshot.readOnly}
                onChange={(event) => changeAvailability('readOnly', event.currentTarget.checked)}
              />{' '}
              Read only
            </label>
            <label>
              <input
                type="checkbox"
                checked={snapshot.disabled}
                onChange={(event) => changeAvailability('disabled', event.currentTarget.checked)}
              />{' '}
              Disabled
            </label>
          </div>
          <label>
            <input
              type="checkbox"
              checked={clipboardEnabled}
              onChange={(event) => setClipboardEnabled(event.currentTarget.checked)}
            />{' '}
            Provide mock clipboard
          </label>
          <p className={contractStyles.note}>
            可选操作需要应用提供对应方法。勾选 Provide mock clipboard 后，Copy value 会把内容写入本例的内存剪贴板；
            正式应用可以在同一接口中连接系统剪贴板。
          </p>
          <div className={contractStyles.row}>
            <ControlButton
              disabled={!capabilities.clipboard}
              onClick={() => {
                void capabilities.clipboard?.writeText(String(preview))
              }}>
              Copy value
            </ControlButton>
            <ControlButton disabled={!capabilities.preferences} title="应用未提供偏好保存方法">
              Save preference
            </ControlButton>
            <ControlButton disabled={!capabilities.files} title="应用未提供文件选择方法">
              Choose file
            </ControlButton>
          </div>
          <StatePanel
            label="Host capabilities"
            value={{
              clipboard: Boolean(capabilities.clipboard),
              preferences: Boolean(capabilities.preferences),
              files: Boolean(capabilities.files),
              mockClipboard: clipboardText,
            }}
          />
        </div>
      )}
      <div className={contractStyles.grid}>
        <StatePanel
          label="Preview / authoritative"
          value={{
            preview,
            authoritative: snapshot.value,
            revision: snapshot.revision,
            historyCount: snapshot.historyCount,
          }}
        />
        <StatePanel label="Session" value={snapshot.edit} />
        <StatePanel label="Result" value={result} />
        <StatePanel
          label="Availability / error"
          value={{ readOnly: snapshot.readOnly, disabled: snapshot.disabled, error: snapshot.error }}
        />
      </div>
      {scenario === 'targets' && (
        <div className={contractStyles.grid}>
          <StatePanel label="对象 A 的属性数据" value={snapshotA} />
          <StatePanel label="对象 B 的属性数据" value={snapshotB} />
        </div>
      )}
      <StatePanel label="Events (latest 12)" value={events} />
    </ContractFrame>
  )
}

const identityOptions = [
  { key: 'string-001', label: 'String "001"', value: '001' },
  { key: 'string-1', label: 'String "1"', value: '1' },
  { key: 'number-1', label: 'Number 1', value: 1 },
  { key: 'number-0', label: 'Number 0', value: 0 },
] as const satisfies readonly ChoiceOption[]

type ChoiceAccess = ReturnType<typeof createMockPropertyAccess<ChoiceValue>>
type ChoiceSession = Extract<ReturnType<ChoiceAccess['begin']>, { status: 'started' }>['session']
type ChoiceResult = Awaited<ReturnType<ChoiceSession['commit']>>

function ChoiceIdentityPlayground() {
  const [access] = useState(() =>
    createMockPropertyAccess<ChoiceValue>({
      target: { objectId: 'choice-demo', propertyId: 'identifier' },
      descriptor: { id: 'identifier', kind: 'enum', label: 'Identifier', options: identityOptions },
      value: '001',
    })
  )
  const snapshot = useSyncExternalStore(access.subscribe, access.getSnapshot, access.getSnapshot)
  const session = useRef<ChoiceSession | null>(null)
  const generation = useRef(0)
  const [result, setResult] = useState<ChoiceResult | null>(null)
  const [events, setEvents] = useState<EventEntry[]>([])
  const preview = snapshot.edit?.previewValue ?? snapshot.value
  const selectedKey = identityOptions.find((option) => Object.is(option.value, preview))?.key ?? ''

  useEffect(
    () => () => {
      generation.current += 1
      void session.current?.cancel('unmount')
    },
    [access]
  )

  function record(event: string, detail?: unknown) {
    setEvents((previous) => [...previous.slice(-11), { event, target: 'choice-demo', detail }])
  }

  function end(action: 'commit' | 'cancel') {
    const activeSession = session.current
    if (!activeSession) return
    const currentGeneration = generation.current
    const pendingResult = action === 'commit' ? activeSession.commit() : activeSession.cancel('escape')
    void pendingResult.then((next) => {
      if (generation.current !== currentGeneration) return
      setResult(next)
      record(action, next)
    })
  }

  function reset() {
    generation.current += 1
    access.reset()
    session.current = null
    setResult(null)
    setEvents([])
  }

  return (
    <ContractFrame
      title="选项 ID 与原始值类型"
      description={
        '点击 Begin 后选择字符串或数字选项，再 Commit。option.key 用来区分选项，option.value 保留应用原来的类型，因此字符串 "001"、字符串 "1" 与数字 1 是不同值。下方 type 和 value 展示结果，Cancel 可恢复原值。'
      }
      onReset={reset}>
      <div className={contractStyles.row}>
        <ControlButton
          disabled={snapshot.edit !== null}
          onClick={() => {
            const started = access.begin()
            if (started.status === 'started') {
              session.current = started.session
              setResult(null)
              record('begin')
            }
          }}>
          Begin
        </ControlButton>
        <ControlField label="Choice (stable key)">
          <ControlSelect
            value={selectedKey}
            disabled={snapshot.edit?.phase !== 'editing'}
            onChange={(event) => {
              const option = identityOptions.find((item) => item.key === event.currentTarget.value)
              if (!option) return
              session.current?.change(option.value)
              record('change', { key: option.key, value: option.value, type: typeof option.value })
            }}>
            {identityOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </ControlSelect>
        </ControlField>
        <ControlButton disabled={snapshot.edit?.phase !== 'editing'} onClick={() => end('commit')}>
          Commit
        </ControlButton>
        <ControlButton disabled={snapshot.edit === null} onClick={() => end('cancel')}>
          Cancel
        </ControlButton>
      </div>
      <div className={contractStyles.grid}>
        <StatePanel
          label="Preview / authoritative"
          value={{
            selectedKey,
            preview: { value: preview, type: typeof preview },
            authoritative: { value: snapshot.value, type: typeof snapshot.value },
            revision: snapshot.revision,
            historyCount: snapshot.historyCount,
          }}
        />
        <StatePanel label="Session" value={snapshot.edit} />
        <StatePanel label="Result" value={result} />
        <StatePanel label="Options" value={identityOptions} />
      </div>
      <StatePanel label="Events (latest 12)" value={events} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Contracts/Property editing',
  parameters: {
    docs: {
      description: {
        component:
          'PropertyAccess 是把 React 界面连接到应用数据的接口，适用于需要临时预览、异步保存、取消和版本检查的编辑器。这里用按钮逐步演示接口行为，不依赖具体输入组件。\n\nbegin 创建一次编辑，change 更新预览，commit 请求保存，cancel 结束尚未提交的编辑。getSnapshot 返回当前快照，subscribe 通知变化，可通过 useSyncExternalStore 读取。只有接受提交后，已保存值、revision 版本号和历史记录才更新。\n\n应用负责提供持久化、对象查找和可选能力。提交固定属于开始编辑的对象；外部新版本可以让过期请求失效。各故事使用内存实现，便于观察这些结果。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Lifecycle: Story = { render: () => <NumericContractPlayground scenario="lifecycle" /> }
export const DelayedAndRejected: Story = { render: () => <NumericContractPlayground scenario="delayed" /> }
export const ExternalDuringEdit: Story = { render: () => <NumericContractPlayground scenario="external-edit" /> }
export const ExternalDuringPending: Story = { render: () => <NumericContractPlayground scenario="external-pending" /> }
export const TargetSwitch: Story = { render: () => <NumericContractPlayground scenario="targets" /> }
export const AvailabilityAndCapabilities: Story = {
  render: () => <NumericContractPlayground scenario="availability" />,
}
export const ChoiceIdentity: Story = { render: () => <ChoiceIdentityPlayground /> }
