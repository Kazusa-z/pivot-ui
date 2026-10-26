import { useState, useSyncExternalStore } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PropertyField } from '../src/property/PropertyField'
import type { ChoiceValue, EditResult } from '../src'
import { Button } from '../src/widgets/buttons'
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

type MixedState = {
  name: boolean
  description: boolean
  visible: boolean
  mode: boolean
  distance: boolean
  slider: boolean
}
type ResultSummary = { status: EditResult<unknown>['status']; target: string } | null

const choiceOptions = [
  { key: 'code', label: 'Code 001 (string)', value: '001' },
  { key: 'number', label: 'One (number)', value: 1 },
  { key: 'empty', label: 'Empty string', value: '' },
  { key: 'locked', label: 'Unavailable', value: 2, disabled: true, disabledReason: '应用未提供此操作' },
] as const

function makeHosts(delay: number) {
  return {
    name: createMockPropertyAccess<string>({
      target: { objectId: 'cube', propertyId: 'name' },
      descriptor: {
        kind: 'string',
        id: 'name',
        label: 'Name',
        description: 'Enter 或失焦提交；Escape 取消。',
      },
      value: 'Cube',
      delayMs: delay,
    }),
    description: createMockPropertyAccess<string>({
      target: { objectId: 'cube', propertyId: 'description' },
      descriptor: {
        kind: 'string',
        id: 'description',
        label: 'Description',
        description: '多行文本使用 Ctrl/⌘+Enter 提交。',
      },
      value: 'A rounded cube in the scene.',
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
      descriptor: { kind: 'enum', id: 'mode', label: 'Mode', options: choiceOptions },
      value: '001',
      delayMs: delay,
    }),
    distance: createMockPropertyAccess<number>({
      target: { objectId: 'cube', propertyId: 'distance' },
      descriptor: {
        id: 'distance',
        label: 'Distance',
        kind: 'number',
        unit: 'm',
        description: '允许 -100…100；常用范围 -10…10。',
        constraints: { min: -100, max: 100, softMin: -10, softMax: 10, step: 1, dragStep: 0.1, precision: 3 },
      },
      value: 2,
      delayMs: delay,
    }),
    slider: createMockPropertyAccess<number>({
      target: { objectId: 'cube', propertyId: 'weight' },
      descriptor: {
        id: 'weight',
        label: 'Weight',
        kind: 'number',
        description: '拖动滑块或精确输入，提交后写入属性。',
        constraints: { min: 0, max: 100, softMin: 0, softMax: 100, step: 1, dragStep: 0.1, precision: 2 },
      },
      value: 40,
      delayMs: delay,
    }),
  }
}

function FieldExample() {
  const [hosts] = useState(() => makeHosts(0))
  const [density, setDensity] = useState<'compact' | 'regular'>('compact')
  const [mixed, setMixed] = useState<MixedState>({
    name: false,
    description: false,
    visible: false,
    mode: false,
    distance: false,
    slider: false,
  })
  const [readOnly, setReadOnly] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [delay, setDelay] = useState(0)
  const [result, setResult] = useState<ResultSummary>(null)
  const [rejectedNext, setRejectedNext] = useState(false)

  const name = useSyncExternalStore(hosts.name.subscribe, hosts.name.getSnapshot, hosts.name.getSnapshot)
  const description = useSyncExternalStore(
    hosts.description.subscribe,
    hosts.description.getSnapshot,
    hosts.description.getSnapshot
  )
  const visible = useSyncExternalStore(hosts.visible.subscribe, hosts.visible.getSnapshot, hosts.visible.getSnapshot)
  const mode = useSyncExternalStore(hosts.mode.subscribe, hosts.mode.getSnapshot, hosts.mode.getSnapshot)
  const distance = useSyncExternalStore(
    hosts.distance.subscribe,
    hosts.distance.getSnapshot,
    hosts.distance.getSnapshot
  )
  const slider = useSyncExternalStore(hosts.slider.subscribe, hosts.slider.getSnapshot, hosts.slider.getSnapshot)

  const all = Object.values(hosts)
  const applyAvailability = (next: { readOnly?: boolean; disabled?: boolean }) => {
    for (const access of all) access.setAvailability(next)
  }
  const applyDelay = (ms: number) => {
    setDelay(ms)
    for (const access of Object.values(hosts)) access.setDelay(ms)
  }
  const reset = () => {
    for (const access of Object.values(hosts)) access.reset()
    setDensity('compact')
    setMixed({ name: false, description: false, visible: false, mode: false, distance: false, slider: false })
    setReadOnly(false)
    setDisabled(false)
    setDelay(0)
    setResult(null)
    setRejectedNext(false)
  }
  const resultHandler = (next: EditResult<unknown>) => {
    setResult({ status: next.status, target: next.target.objectId })
  }

  return (
    <StoryPage
      eyebrow="Property"
      title="PropertyField"
      summary="PropertyField 把 PropertyAccess 接到带标签、说明和错误的字段。density 让内置 Input、Textarea、Select、Combobox、InputNumber、NumericSlider 与 Checkbox 跟随 24/32 两档；应用负责数据、校验和异步保存。"
      meta={
        <>
          <span>compact 24 / regular 32</span>
          <span>·</span>
          <span>7 widgets</span>
          <span>·</span>
          <span>contract lifecycle</span>
        </>
      }
      actions={
        <StoryRow>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDensity((value) => (value === 'compact' ? 'regular' : 'compact'))}>
            {density === 'compact' ? 'Regular density' : 'Compact density'}
          </Button>
          <Button size="sm" variant="soft" onClick={reset}>
            Reset
          </Button>
        </StoryRow>
      }>
      <StorySection title="Density" description="同一字段在两档下切换：标签/说明为 12/14，控件高度 24/32。">
        <StoryGrid>
          {(['compact', 'regular'] as const).map((tier) => (
            <StoryCard
              key={tier}
              title={tier === 'compact' ? 'Compact · 24' : 'Regular · 32'}
              description={tier === 'compact' ? '工具栏、属性面板、树、表格。' : '对话框、常规表单、文档页。'}>
              <PropertyField
                access={hosts.name}
                density={tier}
                onEditResult={resultHandler}
                description="名字会立即预览，Enter 或失焦提交。"
              />
              <PropertyField
                access={hosts.distance}
                density={tier}
                widget="input-number"
                onEditResult={resultHandler}
              />
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="Widgets" description="默认按属性类型选择控件；widget 可显式覆盖文本、选择或数值的呈现。">
        <StoryGrid>
          <StoryCard title="Input / Textarea">
            <PropertyField access={hosts.name} density={density} onEditResult={resultHandler} />
            <PropertyField
              access={hosts.description}
              density={density}
              widget="textarea"
              onEditResult={resultHandler}
            />
          </StoryCard>
          <StoryCard title="Boolean / Enum">
            <PropertyField access={hosts.visible} density={density} onEditResult={resultHandler} />
            <PropertyField access={hosts.mode} density={density} widget="select" onEditResult={resultHandler} />
            <PropertyField access={hosts.mode} density={density} widget="combobox" onEditResult={resultHandler} />
          </StoryCard>
          <StoryCard title="Number / Slider">
            <PropertyField
              access={hosts.distance}
              density={density}
              widget="input-number"
              onEditResult={resultHandler}
            />
            <PropertyField
              access={hosts.slider}
              density={density}
              widget="numeric-slider"
              onEditResult={resultHandler}
            />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="States"
        description="mixed 表示多个对象的值不一致；只读、禁用和保存失败由 PropertyAccess 状态驱动。">
        <StoryCard title="Availability and mixed values">
          <StoryRow>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const next = !readOnly
                setReadOnly(next)
                applyAvailability({ readOnly: next })
              }}>
              {readOnly ? 'Allow editing' : 'Toggle read only'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const next = !disabled
                setDisabled(next)
                applyAvailability({ disabled: next })
              }}>
              {disabled ? 'Enable fields' : 'Toggle disabled'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const next = !Object.values(mixed).some(Boolean)
                setMixed({ name: next, description: next, visible: next, mode: next, distance: next, slider: next })
              }}>
              Toggle mixed
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyDelay(delay ? 0 : 1200)}>
              {delay ? 'Clear delay' : 'Delay 1200 ms'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                hosts.name.rejectNext('名称未保存，请修改后重试。')
                setRejectedNext(true)
                setResult(null)
              }}>
              Reject next name
            </Button>
            <Button size="sm" variant="outline" onClick={() => hosts.name.externalUpdate('External name')}>
              External name
            </Button>
          </StoryRow>
          <StoryNote tone="muted">
            点击 Reject next name，再编辑 Name 并提交，即可看到 danger 错误和重试路径；Delay 用来观察 pending。 当前
            density：{density}。{rejectedNext ? ' 下一次 Name 提交会被拒绝。' : ''}
          </StoryNote>
          <PropertyField access={hosts.name} density={density} mixed={mixed.name} onEditResult={resultHandler} />
          <PropertyField
            access={hosts.distance}
            density={density}
            widget="input-number"
            mixed={mixed.distance}
            onEditResult={resultHandler}
          />
          <PropertyField
            access={hosts.mode}
            density={density}
            widget="combobox"
            mixed={mixed.mode}
            onEditResult={resultHandler}
          />
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<PropertyField access={access} density="compact" />
<PropertyField access={access} widget="textarea" />
<PropertyField access={access} widget="numeric-slider" />
<PropertyField access={access} render={(field) => <MyEditor {...field.editProps} />} />`}
          />
          <StoryProps
            rows={[
              { name: 'access', type: 'PropertyAccess<T>', description: '应用数据、预览、提交和可用状态。' },
              {
                name: 'widget',
                type: "'input' | 'textarea' | 'checkbox' | 'select' | 'combobox' | 'input-number' | 'numeric-slider'",
                defaultValue: '按 kind 推断',
                description: '选择内置呈现。',
              },
              {
                name: 'density',
                type: "'compact' | 'regular'",
                defaultValue: "'compact'",
                description: '行高 24/32，内置控件 sm/md。',
              },
              {
                name: 'mixed',
                type: 'boolean',
                defaultValue: 'false',
                description: '多对象值不一致时显示空值/indeterminate。',
              },
              { name: 'render', type: '(field) => ReactNode', description: '接入颜色、向量、曲线或资源编辑器。' },
            ]}
          />
        </StoryGrid>
      </StorySection>

      <StoryState
        label="Field state"
        value={{
          density,
          readOnly,
          disabled,
          delay,
          mixed,
          rejectedNext,
          result,
          fields: {
            name: {
              value: name.value,
              phase: name.edit?.phase,
              revision: name.revision,
              history: name.historyCount,
              error: name.error?.message,
            },
            description: { value: description.value, phase: description.edit?.phase },
            visible: { value: visible.value, phase: visible.edit?.phase },
            mode: { value: mode.value, type: typeof mode.value, phase: mode.edit?.phase },
            distance: { value: distance.value, preview: distance.edit?.previewValue, phase: distance.edit?.phase },
            slider: { value: slider.value, preview: slider.edit?.previewValue, phase: slider.edit?.phase },
          },
        }}
      />
    </StoryPage>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'PropertyField 把一个 PropertyAccess 连接到带名称、说明和错误提示的字段。默认控件覆盖字符串、数值、布尔值和单选项；density 统一 24/32 两档，widget 可切换多行文本、搜索选择或数值滑块。应用负责数据、校验和异步保存，onEditResult 用于观察结果。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Property/PropertyField',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { render: () => <FieldExample /> }
