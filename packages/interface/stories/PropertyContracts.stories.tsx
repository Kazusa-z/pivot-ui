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
    title: '编辑生命周期 / Edit lifecycle',
    description:
      'Begin 后修改 Preview；authoritative 与 revision 在 Commit 前保持不变。Commit 完成一次事务；再次 Begin 并修改后 Cancel，预览恢复到已接受的值。',
  },
  delayed: {
    title: '延迟与拒绝 / Delayed and rejected commits',
    description:
      '默认提交延迟 1800 ms。Begin → 修改 → Commit，可观察 pending。点击 Reject next commit 后再编辑提交，权威值和历史数量应保持不变，结果显示 rejected。',
  },
  'external-edit': {
    title: '编辑中的外部更新 / External update while editing',
    description:
      'Begin → 修改 Preview → External update。新版本使旧编辑会话失效，显示外部权威值；再次 Begin 才能基于新 revision 编辑。',
  },
  'external-pending': {
    title: '过期确认 / External update while pending',
    description:
      'Begin → 修改 → Commit，然后在 1800 ms 内点击 External update。等待确认：旧提交返回 superseded，不能覆盖外部更新或增加有效历史。',
  },
  targets: {
    title: '固定提交目标 / Target switching',
    description:
      '编辑中切换目标会取消草稿。提交 pending 时切换到 B，原提交仍只更新 A；可以在等待 A 时对 B 发起独立编辑。下方同时展示两份快照。',
  },
  availability: {
    title: '编辑能力变化 / Availability and missing capabilities',
    description:
      'Begin → 修改，然后开启 Read only 或 Disabled，当前编辑应取消且权威值不变。关闭限制后可重新编辑。宿主能力缺失时，相应操作保持不可用。',
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
            Commit locks the terminal request. Cancel during pending observes the same result; it cannot retract a
            submitted commit. Reset discards the scenario state and ignores its old acknowledgement.
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
                  access.rejectNext('Mock host rejected this value.')
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
            Optional host capabilities start unavailable. Enable the mock clipboard to copy into its local memory; this
            never changes the system clipboard.
          </p>
          <div className={contractStyles.row}>
            <ControlButton
              disabled={!capabilities.clipboard}
              onClick={() => {
                void capabilities.clipboard?.writeText(String(preview))
              }}>
              Copy value
            </ControlButton>
            <ControlButton disabled={!capabilities.preferences} title="Preferences capability unavailable">
              Save preference
            </ControlButton>
            <ControlButton disabled={!capabilities.files} title="File picker capability unavailable">
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
          <StatePanel label="Object A snapshot" value={snapshotA} />
          <StatePanel label="Object B snapshot" value={snapshotB} />
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
      title="选择值身份 / Choice identity"
      description={
        'Begin 后分别选择 String "001"、String "1"、Number 1 或 Number 0，再 Commit。DOM 保存稳定 option key，按 key 查表恢复原值；右侧 type 与 value 可验证字符串和数字不会被混淆。Cancel 恢复原值。'
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
  title: 'Contracts/Property editing',
  parameters: { layout: 'fullscreen' },
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
