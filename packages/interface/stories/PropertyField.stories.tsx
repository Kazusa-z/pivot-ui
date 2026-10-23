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
          { key: 'locked', label: 'Unavailable', value: 2, disabled: true, disabledReason: '应用未提供此操作' },
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
      title="连接应用数据的属性字段"
      description="修改 Name 并按 Enter，勾选 Visible，或在 Mode 中选择一项，再看下方数值与历史次数怎样变化。点击 Reject next name 可体验保存失败后的修正重试，Switch target 可切换对象。应用通过 PropertyAccess 提供数据，PropertyField 负责把这些操作连接到字段。"
      onReset={reset}>
      <Flex gap="sm" wrap="wrap">
        <Button onClick={() => access.rejectNext('名称未保存，请修改后重试。')}>Reject next name</Button>
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
        label="已保存值与当前预览"
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

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'PropertyField 把一个 PropertyAccess 连接到带名称、说明和错误提示的字段，适合需要预览、异步保存、取消或撤销记录的属性表单。\n\n字符串、数值、布尔值和单选项可使用默认控件，widget 可选择多行文本、搜索选择或数值滑块。PropertyAccess 提供已保存值、临时预览和版本号；onEditResult 用于观察提交结果。\n\n应用实现数据读写与校验，示例使用内存数据模拟。外部更新或切换对象会使原编辑失效，已经提交的请求仍属于原对象。复杂值通过显式 render 接入。',
      },
    },
  },
  title: 'Property/PropertyField',
  component: FieldPlayground,
} satisfies Meta<typeof FieldPlayground>
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
    // 名称限制由应用校验提供；PropertyField 负责显示校验结果。
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
                    error: { code: 'invalid-value', message: '此例的名称不能包含 /。' },
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
      title="编辑过程中的应用校验"
      description="在名称中输入 / 并提交，查看字段旁的校验提示；删掉 / 后重新提交，或按 Escape 恢复原值。下方历史次数可以区分失败与成功的保存。接入时把同样的名称规则放在自己的 PropertyAccess 校验中。"
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
          description:
            '允许输入 -100…100；拖动与步进的常用范围为 -10…10。按钮步长为 1，拖动步长为 0.1，最多保留 3 位小数。',
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
                ? { status: 'invalid', error: { code: 'invalid-value', message: '此例不接受 13，请输入其他数值。' } }
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
      title="数值字段的预览与一次提交"
      description="拖动数值后松开，观察预览数值、保存结果和历史次数；也可在调整时按 Escape 恢复原值。用上方按钮试试延迟保存、拒绝或切换对象，了解应用通过 PropertyAccess 连接数值输入和滑块的方式。"
      onReset={() => {
        hosts.a.reset()
        hosts.b.reset()
        setTarget('a')
        setMixed(initialMixed)
        setMounted(true)
        setResults([])
      }}>
      <Flex gap="sm" wrap="wrap">
        <Button onClick={() => current.rejectNext('数值未保存，请修正后重试。')}>Reject next</Button>
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
        label="已保存数值与当前预览"
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
