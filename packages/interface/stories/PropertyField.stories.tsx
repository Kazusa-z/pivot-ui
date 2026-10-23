import { useState, useSyncExternalStore } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PropertyField } from '../src/property/PropertyField'
import { Button } from '../src/widgets/buttons'
import { Flex } from '../src/layout/Flex'
import { Section } from '../src/layout/Section'
import type { ChoiceValue, EditResult, PropertyAccess } from '../src'
import { createMockPropertyAccess } from './support/mock-property-access'
import { ContractFrame, StatePanel } from './support/ContractFrame'

function FieldPlayground({
  delay = 0,
  multiline = false,
  initialMixed = false,
  searchable = false,
}: {
  delay?: number
  multiline?: boolean
  initialMixed?: boolean
  searchable?: boolean
}) {
  const [properties] = useState(() => ({
    a: createMockPropertyAccess<string>({
      target: { objectId: 'cube', propertyId: 'name' },
      descriptor: {
        kind: 'string',
        id: 'name',
        label: 'Name',
        description: 'Enter 或失焦提交；Escape 取消。多行使用 Ctrl/⌘+Enter。',
      },
      value: 'Cube',
      delayMs: delay,
    }),
    b: createMockPropertyAccess<string>({
      target: { objectId: 'sphere', propertyId: 'name' },
      descriptor: { kind: 'string', id: 'name', label: 'Name' },
      value: 'Sphere',
      delayMs: delay,
    }),
    visible: createMockPropertyAccess<boolean>({
      target: { objectId: 'cube', propertyId: 'visible' },
      descriptor: { kind: 'boolean', id: 'visible', label: 'Visible' },
      value: true,
      delayMs: delay,
    }),
    mode: createMockPropertyAccess<ChoiceValue>({
      target: { objectId: 'cube', propertyId: 'mode' },
      descriptor: {
        kind: 'enum',
        id: 'mode',
        label: 'Mode',
        options: [
          { key: 'code', label: 'Code 001 (string)', value: '001' },
          { key: 'number', label: 'One (number)', value: 1 },
          { key: 'empty', label: 'Empty string', value: '' },
          { key: 'locked', label: 'Unavailable', value: 2, disabled: true, disabledReason: 'Host capability missing' },
        ],
      },
      value: '001',
      delayMs: delay,
    }),
  }))
  const [target, setTarget] = useState<'a' | 'b'>('a')
  const [mixed, setMixed] = useState({ name: initialMixed, visible: initialMixed, mode: initialMixed })
  const [result, setResult] = useState<EditResult<string> | null>(null)
  const a = useSyncExternalStore(properties.a.subscribe, properties.a.getSnapshot, properties.a.getSnapshot)
  const b = useSyncExternalStore(properties.b.subscribe, properties.b.getSnapshot, properties.b.getSnapshot)
  const visible = useSyncExternalStore(
    properties.visible.subscribe,
    properties.visible.getSnapshot,
    properties.visible.getSnapshot
  )
  const mode = useSyncExternalStore(properties.mode.subscribe, properties.mode.getSnapshot, properties.mode.getSnapshot)
  const access = properties[target]
  const active = target === 'a' ? a : b
  const reset = () => {
    Object.values(properties).forEach((property) => property.reset())
    setTarget('a')
    setMixed({ name: initialMixed, visible: initialMixed, mode: initialMixed })
    setResult(null)
  }

  return (
    <ContractFrame
      title="PropertyField / Real widgets + mock host"
      description="草稿立即显示；权威值和历史只在接受提交后变化。拒绝可重试，外部更新和切换对象使旧编辑失效。"
      onReset={reset}>
      <Flex gap="sm" wrap="wrap">
        <Button onClick={() => access.rejectNext('Name rejected by mock host')}>Reject next name</Button>
        <Button onClick={() => access.externalUpdate('External name')}>External name</Button>
        <Button onPointerDown={(event) => event.preventDefault()} onClick={() => setTarget(target === 'a' ? 'b' : 'a')}>
          Switch target
        </Button>
        <Button
          onPointerDown={(event) => event.preventDefault()}
          onClick={() =>
            Object.values(properties).forEach((property) => property.setAvailability({ readOnly: !active.readOnly }))
          }>
          Toggle read only
        </Button>
        <Button
          onPointerDown={(event) => event.preventDefault()}
          onClick={() =>
            Object.values(properties).forEach((property) => property.setAvailability({ disabled: !active.disabled }))
          }>
          Toggle disabled
        </Button>
        <Button
          onClick={() =>
            setMixed((current) => {
              const next = !Object.values(current).some(Boolean)
              return { name: next, visible: next, mode: next }
            })
          }>
          Toggle mixed
        </Button>
      </Flex>
      <Section title={`Object: ${active.target.objectId}`}>
        <PropertyField
          access={access}
          widget={multiline ? 'textarea' : 'input'}
          mixed={mixed.name}
          onEditResult={(next) => {
            setResult(next)
            if (next.status === 'committed' || next.status === 'unchanged')
              setMixed((current) => ({ ...current, name: false }))
          }}
        />
        <PropertyField
          access={properties.visible}
          mixed={mixed.visible}
          onEditResult={(next) => {
            if (next.status === 'committed' || next.status === 'unchanged')
              setMixed((current) => ({ ...current, visible: false }))
          }}
        />
        <PropertyField
          access={properties.mode}
          widget={searchable ? 'combobox' : 'select'}
          mixed={mixed.mode}
          onEditResult={(next) => {
            if (next.status === 'committed' || next.status === 'unchanged')
              setMixed((current) => ({ ...current, mode: false }))
          }}
        />
      </Section>
      <StatePanel
        label="Authoritative and preview"
        value={{
          activeTarget: active.target.objectId,
          a: { value: a.value, preview: a.edit?.previewValue, phase: a.edit?.phase, history: a.historyCount },
          b: { value: b.value, preview: b.edit?.previewValue, phase: b.edit?.phase, history: b.historyCount },
          visible: { value: visible.value, history: visible.historyCount },
          choice: { value: mode.value, type: typeof mode.value, history: mode.historyCount },
          result: result?.status,
        }}
      />
    </ContractFrame>
  )
}

const meta = { title: 'Property/PropertyField', component: FieldPlayground } satisfies Meta<typeof FieldPlayground>
export default meta
type Story = StoryObj<typeof meta>
export const Lifecycle: Story = {}
export const DelayedAndRejected: Story = { args: { delay: 1200 } }
export const TargetAndExternalUpdates: Story = { args: { delay: 1800 } }
export const Multiline: Story = { args: { multiline: true } }
export const MixedAndAvailability: Story = { args: { initialMixed: true } }
export const SearchableChoice: Story = { args: { searchable: true } }

function ValidationExample() {
  const [{ base, access }] = useState(() => {
    const base = createMockPropertyAccess<string>({
      target: { objectId: 'object', propertyId: 'name' },
      descriptor: { kind: 'string', id: 'name', label: 'Validated name' },
      value: 'Cube',
    })
    // Example application rule. The widget never embeds resource naming restrictions.
    const access: PropertyAccess<string> = {
      getSnapshot: base.getSnapshot,
      subscribe: base.subscribe,
      begin() {
        const started = base.begin()
        if (started.status !== 'started') return started
        return {
          ...started,
          session: {
            ...started.session,
            change(value) {
              return value.includes('/')
                ? {
                    status: 'invalid',
                    error: { code: 'invalid-value', message: 'Name cannot contain / in this example' },
                  }
                : started.session.change(value)
            },
          },
        }
      },
    }
    return { base, access }
  })
  const snapshot = useSyncExternalStore(base.subscribe, base.getSnapshot, base.getSnapshot)
  return (
    <ContractFrame
      title="Change-stage validation"
      description="输入包含 / 的名称并提交：保留草稿、显示错误、不生成历史；修正后重试，或 Escape 取消。"
      onReset={() => base.reset()}>
      <PropertyField access={access} />
      <StatePanel
        label="Host snapshot"
        value={{
          value: snapshot.value,
          preview: snapshot.edit?.previewValue,
          phase: snapshot.edit?.phase,
          history: snapshot.historyCount,
        }}
      />
    </ContractFrame>
  )
}

export const ChangeValidation: Story = { render: () => <ValidationExample /> }

function NumericFieldExample({
  slider = false,
  delay = 0,
  initialMixed = false,
  validateChange = false,
}: {
  slider?: boolean
  delay?: number
  initialMixed?: boolean
  validateChange?: boolean
}) {
  const [hosts] = useState(() => {
    const make = (objectId: string, value: number) =>
      createMockPropertyAccess<number>({
        target: { objectId, propertyId: 'distance' },
        descriptor: {
          id: 'distance',
          label: 'Distance',
          kind: 'number',
          unit: 'm',
          description: '硬范围 -100…100；软范围 -10…10；步进 1，拖动 0.1，精度 3。',
          constraints: { min: -100, max: 100, softMin: -10, softMax: 10, step: 1, dragStep: 0.1, precision: 3 },
        },
        value,
        delayMs: delay,
      })
    const a = make('cube', 2)
    const b = make('sphere', 8)
    const withValidation = (base: typeof a): PropertyAccess<number> => ({
      subscribe: base.subscribe,
      getSnapshot: base.getSnapshot,
      begin() {
        const started = base.begin()
        if (started.status !== 'started') return started
        return {
          ...started,
          session: {
            ...started.session,
            change(value) {
              return value === 13
                ? { status: 'invalid', error: { code: 'invalid-value', message: '13 is unavailable in this example.' } }
                : started.session.change(value)
            },
          },
        }
      },
    })
    return { a, b, accessA: validateChange ? withValidation(a) : a, accessB: validateChange ? withValidation(b) : b }
  })
  const [target, setTarget] = useState<'a' | 'b'>('a')
  const [mixed, setMixed] = useState(initialMixed)
  const [mounted, setMounted] = useState(true)
  const [results, setResults] = useState<EditResult<number>[]>([])
  const a = useSyncExternalStore(hosts.a.subscribe, hosts.a.getSnapshot, hosts.a.getSnapshot)
  const b = useSyncExternalStore(hosts.b.subscribe, hosts.b.getSnapshot, hosts.b.getSnapshot)
  const current = hosts[target]
  const snapshot = target === 'a' ? a : b
  return (
    <ContractFrame
      title="Numeric PropertyField / One gesture, one transaction"
      description="拖动实时更新 preview，松开后才接受为权威值并增加一条历史；Escape 回滚。可观察延迟、拒绝、外部版本、同值更新与目标切换。"
      onReset={() => {
        hosts.a.reset()
        hosts.b.reset()
        setTarget('a')
        setMixed(initialMixed)
        setMounted(true)
        setResults([])
      }}>
      <Flex gap="sm" wrap="wrap">
        <Button onClick={() => current.rejectNext('The numeric host rejected this edit.')}>Reject next</Button>
        <Button onClick={() => current.externalUpdate(7)}>External value</Button>
        <Button onClick={() => current.externalUpdate(snapshot.value)}>Same value revision</Button>
        <Button onClick={() => setTarget((value) => (value === 'a' ? 'b' : 'a'))}>Switch target</Button>
        <Button onClick={() => current.setAvailability({ readOnly: !snapshot.readOnly })}>Toggle read only</Button>
        <Button onClick={() => current.setAvailability({ disabled: !snapshot.disabled })}>Toggle disabled</Button>
        <Button onClick={() => setMixed((value) => !value)}>Toggle mixed</Button>
        <Button onClick={() => setMounted((value) => !value)}>Toggle field</Button>
      </Flex>
      <Section title={`Object: ${snapshot.target.objectId}`}>
        {mounted && (
          <PropertyField
            access={target === 'a' ? hosts.accessA : hosts.accessB}
            widget={slider ? 'numeric-slider' : 'input-number'}
            mixed={mixed}
            onEditResult={(result) => {
              setResults((currentResults) => [...currentResults, result])
              if (result.status === 'committed' || result.status === 'unchanged') setMixed(false)
            }}
          />
        )}
      </Section>
      <StatePanel
        label="Numeric authority and preview"
        value={{
          activeTarget: snapshot.target.objectId,
          a: {
            value: a.value,
            preview: a.edit?.previewValue,
            phase: a.edit?.phase,
            history: a.historyCount,
            revision: a.revision,
          },
          b: {
            value: b.value,
            preview: b.edit?.previewValue,
            phase: b.edit?.phase,
            history: b.historyCount,
            revision: b.revision,
          },
          results: results.map((result) => ({ status: result.status, target: result.target.objectId })),
        }}
      />
    </ContractFrame>
  )
}

export const NumericLifecycle: Story = { render: () => <NumericFieldExample /> }
export const NumericSliderLifecycle: Story = { render: () => <NumericFieldExample slider /> }
export const NumericDelayedAndRejected: Story = { render: () => <NumericFieldExample delay={1200} /> }
export const NumericTargetsAndVersions: Story = { render: () => <NumericFieldExample slider delay={1600} /> }
export const NumericMixedAndAvailability: Story = { render: () => <NumericFieldExample initialMixed /> }
export const NumericChangeValidation: Story = { render: () => <NumericFieldExample validateChange /> }
