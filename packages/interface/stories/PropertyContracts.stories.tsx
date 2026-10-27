import { useRef, useState, useSyncExternalStore } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { EditSession } from '../src/contracts'
import { Button } from '../src/controls/buttons'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { NumberInput } from '../src/controls/inputs/NumberInput'
import { Text } from '../src/foundation/typography'
import { createMockPropertyAccess } from './support/mock-property-access'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryState,
  StoryCode,
  StoryProps,
  StoryNote,
} from './support/StoryPage'

type Session = EditSession<number>
type CommitResult = Awaited<ReturnType<Session['commit']>>
type EventEntry = { event: string; target: string; detail?: unknown }

function makeAccess(objectId: string, value: number) {
  return createMockPropertyAccess<number>({
    target: { objectId, propertyId: 'size' },
    descriptor: { id: 'size', kind: 'number', label: 'Size', constraints: { min: 0, max: 100, step: 1 } },
    value,
  })
}

function ContractExample() {
  const [accesses] = useState(() => ({ a: makeAccess('object-a', 10), b: makeAccess('object-b', 30) }))
  const [activeTarget, setActiveTarget] = useState<'a' | 'b'>('a')
  const [events, setEvents] = useState<EventEntry[]>([])
  const [result, setResult] = useState<CommitResult | null>(null)
  const sessions = useRef(new Map<string, Session>())
  const generation = useRef(0)
  const access = accesses[activeTarget]
  const snapshotA = useSyncExternalStore(accesses.a.subscribe, accesses.a.getSnapshot, accesses.a.getSnapshot)
  const snapshotB = useSyncExternalStore(accesses.b.subscribe, accesses.b.getSnapshot, accesses.b.getSnapshot)
  const snapshot = activeTarget === 'a' ? snapshotA : snapshotB
  const objectId = snapshot.target.objectId
  const phase = snapshot.edit?.phase ?? 'idle'
  const preview = snapshot.edit?.previewValue ?? snapshot.value

  function record(event: string, target: string, detail?: unknown) {
    setEvents((previous) => [...previous.slice(-9), { event, target, detail }])
  }
  function observe(event: string, target: string, pending: Promise<CommitResult>) {
    const current = generation.current
    void pending.then(
      (next) => {
        if (generation.current !== current) return
        setResult(next)
        record(event, target, next)
      },
      (error: unknown) => {
        if (generation.current !== current) return
        record('unexpected error', target, error instanceof Error ? error.message : String(error))
      }
    )
  }
  function begin() {
    const started = access.begin()
    if (started.status === 'started') {
      sessions.current.set(objectId, started.session)
      setResult(null)
      record('begin', objectId)
    }
  }
  function change(value: number) {
    const session = sessions.current.get(objectId)
    if (!session || phase !== 'editing') return
    session.change(value)
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
    if (session) observe('cancel result', objectId, session.cancel('escape'))
  }
  function externalUpdate() {
    access.externalUpdate(70)
    record('external update', objectId, 70)
  }
  function switchTarget(target: 'a' | 'b') {
    if (target === activeTarget) return
    const session = sessions.current.get(objectId)
    if (session && phase === 'editing') observe('target change cancellation', objectId, session.cancel('target-change'))
    record('switch target', accesses[target].getSnapshot().target.objectId)
    setActiveTarget(target)
  }
  function availability(key: 'readOnly' | 'disabled', checked: boolean) {
    access.setAvailability({ [key]: checked })
    record('availability changed', objectId, { [key]: checked })
  }
  function reset() {
    generation.current++
    sessions.current.clear()
    accesses.a.reset()
    accesses.b.reset()
    accesses.a.setDelay(0)
    accesses.b.setDelay(0)
    setActiveTarget('a')
    setEvents([])
    setResult(null)
  }

  return (
    <StoryPage
      eyebrow="Contracts"
      title="Property editing"
      summary="PropertyAccess 把界面连接到应用数据：begin 创建编辑，change 更新预览，commit 请求保存，cancel 结束尚未提交的编辑。只有接受提交后，已保存值、revision 和历史才更新。"
      meta={
        <>
          <span>begin / change / commit / cancel</span>
          <span>·</span>
          <span>revision</span>
          <span>·</span>
          <span>async</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      }>
      <StorySection
        title="Lifecycle"
        description="开始编辑后修改 Preview，保存值保持不变；Commit 接受后才更新，Cancel 恢复已保存值。">
        <StoryCard title={`Current target: ${objectId}`} description="所有控件都驱动同一个 PropertyAccess。">
          <StoryRow>
            <Button
              size="sm"
              variant="soft"
              disabled={phase !== 'idle' || snapshot.readOnly || snapshot.disabled}
              onClick={begin}>
              Begin
            </Button>
            <Button size="sm" disabled={phase !== 'editing'} onClick={() => change(Math.min(100, preview + 1))}>
              Preview + 1
            </Button>
            <Button size="sm" disabled={phase !== 'editing'} onClick={commit}>
              Commit
            </Button>
            <Button size="sm" disabled={phase === 'idle'} onClick={cancel}>
              Cancel
            </Button>
          </StoryRow>
          <StoryRow>
            <Text size="sm" tone="muted">
              {objectId} · phase {phase} · revision {snapshot.revision} · history {snapshot.historyCount}
            </Text>
          </StoryRow>
          <NumberInput
            aria-label="Preview value"
            size="sm"
            value={preview}
            min={0}
            max={100}
            step={1}
            disabled={snapshot.disabled}
            readOnly={snapshot.readOnly || phase !== 'editing'}
            onValueChange={change}
          />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Async, rejection and external updates"
        description="延迟保存、拒绝下一次提交或写入外部版本，观察 pending / rejected / superseded 这些终态。">
        <StoryCard title="Host responses">
          <StoryRow>
            <Button size="sm" variant="outline" onClick={() => access.setDelay(500)}>
              Delay 500 ms
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                access.rejectNext('保存失败，请修正后重试。')
                record('next commit will be rejected', objectId)
              }}>
              Reject next commit
            </Button>
            <Button size="sm" variant="outline" onClick={externalUpdate}>
              External update → 70
            </Button>
          </StoryRow>
          <StoryNote tone="muted">
            提交后等待期间不能撤回已发出的保存；外部新版本会让旧请求失效。编辑中收到 External update 会取消草稿，再次
            Begin 按新的 revision 开始。
          </StoryNote>
        </StoryCard>
      </StorySection>

      <StorySection
        title="Targets and availability"
        description="提交固定属于开始编辑的对象；切换对象或开启只读/禁用会结束未提交的编辑。">
        <StoryCard title="Two objects">
          <StoryRow>
            <Button size="sm" variant={activeTarget === 'a' ? 'soft' : 'outline'} onClick={() => switchTarget('a')}>
              Object A
            </Button>
            <Button size="sm" variant={activeTarget === 'b' ? 'soft' : 'outline'} onClick={() => switchTarget('b')}>
              Object B
            </Button>
            <Checkbox
              size="sm"
              label="Read only"
              checked={snapshot.readOnly}
              onCheckedChange={(checked) => availability('readOnly', checked)}
            />
            <Checkbox
              size="sm"
              label="Disabled"
              checked={snapshot.disabled}
              onCheckedChange={(checked) => availability('disabled', checked)}
            />
          </StoryRow>
          <StoryState
            label="Both snapshots"
            value={{
              a: { value: snapshotA.value, revision: snapshotA.revision, phase: snapshotA.edit?.phase },
              b: { value: snapshotB.value, revision: snapshotB.revision, phase: snapshotB.edit?.phase },
            }}
          />
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="ts"
            code={`const started = access.begin()
if (started.status === 'started') {
  started.session.change(next)
  await started.session.commit()
}

access.getSnapshot()
const unsubscribe = access.subscribe(render)`}
          />
          <StoryProps
            rows={[
              { name: 'begin()', type: 'BeginEditResult', description: '创建一次编辑；已占用或不可用时返回状态。' },
              { name: 'change(value)', type: 'EditChangeResult', description: '更新临时预览，不写权威值。' },
              {
                name: 'commit()',
                type: 'Promise<EditResult>',
                description: '请求保存；接受后 revision/history 更新。',
              },
              { name: 'cancel(reason)', type: 'Promise<EditResult>', description: '结束未提交编辑并恢复显示。' },
              {
                name: 'externalUpdate(value)',
                type: 'boolean',
                description: '应用写入新版本；旧请求可能 superseded。',
              },
              { name: 'setAvailability()', type: 'void', description: '切换 readOnly / disabled 并取消未提交草稿。' },
            ]}
          />
        </StoryGrid>
      </StorySection>

      <StoryState
        label="Contract state"
        value={{
          target: objectId,
          phase,
          preview,
          authoritative: snapshot.value,
          revision: snapshot.revision,
          history: snapshot.historyCount,
          readOnly: snapshot.readOnly,
          disabled: snapshot.disabled,
          error: snapshot.error?.message,
          result: result?.status,
          events,
        }}
      />
    </StoryPage>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Contracts/Property editing',
  parameters: {
    docs: {
      description: {
        component:
          'PropertyAccess 是连接 React 界面与应用数据的接口，适合需要临时预览、异步保存、取消和版本检查的属性编辑器。begin 创建编辑，change 更新预览，commit 请求保存，cancel 结束尚未提交的编辑；外部版本可使过期请求失效。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { render: () => <ContractExample /> }
