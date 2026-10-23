import { useState, useSyncExternalStore, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { EditResult, PropertyDescriptor } from '../src/contracts/property'
import type { ColorValue } from '../src/values/color'
import type { ColorRampValue, ColorRampChannelsValue } from '../src/values/color-ramp'
import type { ColorDistributionValue } from '../src/values/color-distribution'
import type { CurveValue } from '../src/values/curve'
import type { NumericDistributionValue } from '../src/values/numeric-distribution'
import type { Vector2 as Vector2Value, Vector3, Vector4 as Vector4Value, Rect } from '../src/values/geometry'
import type { ChoiceValue } from '../src/values'
import { PropertyField, type PropertyFieldRenderProps } from '../src/property/PropertyField'
import { NumericTupleInput } from '../src/templates/numeric/NumericTupleInput'
import { Vector2Input, Vector3Input, Vector4Input, RectInput } from '../src/templates/numeric/GeometryInputs'
import { DistributionSlider } from '../src/widgets/sliders/DistributionSlider'
import { ColorInput } from '../src/templates/color/ColorInput'
import { HDRColorInput } from '../src/templates/color/HDRColorInput'
import { ColorRamp } from '../src/templates/color/ColorRamp'
import { ColorRampChannels } from '../src/templates/color/ColorRampChannels'
import { ColorDistributionTemplate } from '../src/templates/color/ColorDistributionTemplate'
import { CurvePicker } from '../src/templates/curve/CurvePicker'
import { NumericDistributionTemplate } from '../src/templates/curve/NumericDistributionTemplate'
import { AssetReferenceInput } from '../src/templates/resources/AssetReferenceInput'
import { CollectionTemplate } from '../src/templates/collections/CollectionTemplate'
import { Combobox } from '../src/widgets/choices/Combobox'
import { Button } from '../src/widgets/buttons/Button'
import { InputNumber } from '../src/widgets/inputs/InputNumber'
import { DragDropProvider } from '../src/interaction/drag-drop'
import { Section } from '../src/layout/Section'
import { createMockPropertyAccess, type MockPropertyOptions } from './support/mock-property-access'
import { createMockResourceProvider } from './support/mock-resource-provider'
import { ContractFrame, StatePanel, contractStyles } from './support/ContractFrame'

const color: ColorValue = { space: 'srgb', r: 0.2, g: 0.4, b: 0.8, a: 1 }
const ramp: ColorRampValue = {
  interpolation: 'linear',
  stops: [
    { id: 'start', position: 0, color },
    { id: 'end', position: 1, color: { ...color, r: 1, g: 0.2, b: 0.1 } },
  ],
}
const channels: ColorRampChannelsValue = {
  color: ramp,
  alpha: [
    { id: 'opaque', position: 0, alpha: 1 },
    { id: 'fade', position: 1, alpha: 0.2 },
  ],
}
const curve: CurveValue = {
  interpolation: 'linear',
  points: [
    { id: 'start', x: 0, y: 0 },
    { id: 'end', x: 1, y: 1 },
  ],
}
const choiceOptions = [
  { key: 'code', label: 'Code 001 (string)', value: '001' },
  { key: 'number', label: 'One (number)', value: 1 },
  { key: 'empty', label: 'Empty string', value: '' },
] as const

interface ExampleProps<T> {
  title: string
  descriptor: PropertyDescriptor<T>
  value: T
  externalValue?: T
  render: (field: PropertyFieldRenderProps<T>) => ReactNode
  delay?: number
  mixed?: boolean
}
function ComplexExample<T>({
  title,
  descriptor,
  value,
  externalValue = value,
  render,
  delay = 0,
  mixed: initialMixed = false,
}: ExampleProps<T>) {
  const [accesses] = useState(() =>
    ['cube', 'sphere'].map((objectId) =>
      createMockPropertyAccess<T>({
        target: { objectId, propertyId: descriptor.id },
        descriptor,
        value,
        delayMs: delay,
        adapter: {},
      } as MockPropertyOptions<T>)
    )
  )
  const [target, setTarget] = useState(0)
  const [mixed, setMixed] = useState(initialMixed)
  const [result, setResult] = useState<EditResult<T> | null>(null)
  const access = accesses[target]
  const snapshot = useSyncExternalStore(access.subscribe, access.getSnapshot, access.getSnapshot)
  return (
    <ContractFrame
      title={title}
      description="操作下方字段，比较预览值与保存后的属性值；下方 history 会记录成功保存的次数。点击 Reject next commit 后再改一次，可体验错误提示和重试；Delay 500 ms 与 Switch target 用来体验等待保存和切换对象。接入自己的控件时，在 render 中连接 editProps；资源选择、集合增删等整项操作可以调用 submit。"
      onReset={() => {
        accesses.forEach((item) => item.reset())
        setTarget(0)
        setMixed(initialMixed)
        setResult(null)
      }}>
      <div className={contractStyles.row}>
        <Button size="xs" onClick={() => access.rejectNext('属性未保存，请修正后重试。')}>
          Reject next commit
        </Button>
        <Button size="xs" onClick={() => access.setDelay(500)}>
          Delay 500 ms
        </Button>
        <Button size="xs" onClick={() => access.externalUpdate(externalValue)}>
          External update
        </Button>
        <Button size="xs" onClick={() => setTarget((current) => 1 - current)}>
          Switch target
        </Button>
        <Button size="xs" onClick={() => access.setAvailability({ readOnly: !snapshot.readOnly })}>
          Toggle readonly
        </Button>
        <Button size="xs" onClick={() => access.setAvailability({ disabled: !snapshot.disabled })}>
          Toggle disabled
        </Button>
      </div>
      <PropertyField
        access={access}
        direction="column"
        mixed={mixed}
        onEditResult={(next) => {
          setResult(next)
          if (next.status === 'committed') setMixed(false)
        }}
        render={render}
      />
      <StatePanel
        label="属性数据与编辑状态"
        value={{
          target: snapshot.target,
          authority: snapshot.value,
          preview: snapshot.edit?.previewValue,
          phase: snapshot.edit?.phase,
          revision: snapshot.revision,
          history: snapshot.historyCount,
          error: snapshot.error,
          mixed,
          result,
        }}
      />
    </ContractFrame>
  )
}

function LinkedVector({ field }: { field: PropertyFieldRenderProps<Vector3> }) {
  const [linked, setLinked] = useState(false)
  return <Vector3Input {...field.editProps} label="Position" linked={linked} onLinkedChange={setLinked} step={0.1} />
}
function ResourceControl({ field }: { field: PropertyFieldRenderProps<string | null> }) {
  const [provider] = useState(() => createMockResourceProvider())
  return (
    <AssetReferenceInput
      {...field.controlProps}
      provider={provider}
      value={field.snapshot.value}
      resetKey={field.resetKey}
      disabled={field.snapshot.disabled}
      readOnly={field.snapshot.readOnly}
      onValueChange={field.submit}
    />
  )
}
interface Entry {
  id: string
  name: string
  weight: number
}
const entries: readonly Entry[] = [
  { id: 'a', name: 'First', weight: 1 },
  { id: 'b', name: 'Second', weight: 2 },
]
function CollectionControl({ field }: { field: PropertyFieldRenderProps<readonly Entry[]> }) {
  const [nextId, setNextId] = useState(3)
  return (
    <DragDropProvider>
      <CollectionTemplate
        {...field.controlProps}
        items={field.value}
        getKey={(item) => item.id}
        getLabel={(item) => item.name}
        resetKey={field.resetKey}
        disabled={field.snapshot.disabled}
        readOnly={field.editProps.readOnly}
        defaultExpandedKeys={['a']}
        selectionMode="multiple"
        onAdd={async () => {
          const id = `item-${nextId}`
          await field.submit([...field.value, { id, name: `Item ${nextId}`, weight: 1 }])
          setNextId((old) => old + 1)
          return id
        }}
        onDelete={async (item) => {
          await field.submit(field.value.filter((candidate) => candidate.id !== item.id))
        }}
        onRename={async (item, name) => {
          await field.submit(
            field.value.map((candidate) => (candidate.id === item.id ? { ...candidate, name } : candidate))
          )
        }}
        onReorder={async (next) => {
          await field.submit(next)
        }}
        renderItem={(item) => (
          <Section title="项目属性" variant="transparent">
            <InputNumber
              aria-label={`${item.name} weight`}
              aria-errormessage={field.controlProps['aria-errormessage']}
              min={0}
              value={item.weight}
              disabled={field.snapshot.disabled}
              readOnly={field.editProps.readOnly}
              resetKey={field.resetKey}
              onEditStart={field.begin}
              onValueChange={(weight) =>
                field.change(
                  field.value.map((candidate) => (candidate.id === item.id ? { ...candidate, weight } : candidate))
                )
              }
              onValueCommit={async (weight) => {
                await field.commit(
                  field.value.map((candidate) => (candidate.id === item.id ? { ...candidate, weight } : candidate))
                )
              }}
              onEditCancel={field.cancel}
            />
          </Section>
        )}
      />
    </DragDropProvider>
  )
}
function MixedControl({ field }: { field: PropertyFieldRenderProps<Vector3> }) {
  return field.mixed ? (
    <div {...field.controlProps}>
      <span>多个向量值不一致</span>
      <Button
        disabled={field.snapshot.disabled || field.snapshot.readOnly || field.pending}
        onClick={() => {
          void field.submit({ x: 1, y: 1, z: 1 }).catch(() => {})
        }}>
        Replace all with unit vector
      </Button>
    </div>
  ) : (
    <Vector3Input {...field.editProps} label="Position" />
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Property/Complex bindings',
  parameters: {
    docs: {
      description: {
        component:
          '这些示例展示如何用 PropertyField 的 render 接入几何、颜色、渐变、曲线、资源、集合和多选字段。每个示例都把一个完整属性值连接到现成控件，适合组合自己的属性编辑表单。\n\nrender 参数中的 editProps 可直接连接支持预览、提交和取消的模板；资源、集合或多选等一次性操作可使用 submit。控件需要的范围、轴配置、资源查询和预设能力由调用代码明确传入。\n\n应用通过 PropertyAccess 保存数据并处理校验。onEditResult 可观察结果；外部更新与对象切换会使原编辑失效。多对象值不一致时，由 render 明确显示“多个值”并提供替换操作。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Vector2: Story = {
  render: () => (
    <ComplexExample<Vector2Value>
      title="二维向量属性"
      descriptor={{ kind: 'vector2', id: 'position', label: 'Position' }}
      value={{ x: 1, y: 2 }}
      externalValue={{ x: 8, y: 9 }}
      render={(field) => <Vector2Input {...field.editProps} label="Position" />}
    />
  ),
}
export const Vector3Linked: Story = {
  render: () => (
    <ComplexExample<Vector3>
      title="三维向量与比例联动"
      descriptor={{ kind: 'vector3', id: 'position', label: 'Position' }}
      value={{ x: 2, y: 4, z: -6 }}
      externalValue={{ x: 8, y: 9, z: 10 }}
      render={(field) => <LinkedVector field={field} />}
    />
  ),
}
export const Vector4: Story = {
  render: () => (
    <ComplexExample<Vector4Value>
      title="四维向量属性"
      descriptor={{ kind: 'vector4', id: 'rotation', label: 'Rotation' }}
      value={{ x: 0, y: 0, z: 0, w: 1 }}
      render={(field) => <Vector4Input {...field.editProps} label="Rotation" />}
    />
  ),
}
export const Rectangle: Story = {
  render: () => (
    <ComplexExample<Rect>
      title="矩形位置与尺寸属性"
      descriptor={{ kind: 'rect', id: 'bounds', label: 'Bounds' }}
      value={{ x: -10, y: 20, width: 100, height: 50 }}
      render={(field) => <RectInput {...field.editProps} label="Bounds" sizeConstraints={{ min: 0 }} />}
    />
  ),
}
const axes = [
  { key: 'u', label: 'U', min: 0, max: 10 },
  { key: 'v', label: 'V', precision: 2 },
]
export const NumericTuple: Story = {
  render: () => (
    <ComplexExample<readonly number[]>
      title="按轴配置的数值组属性"
      descriptor={{ kind: 'numeric-tuple', id: 'uv', label: 'UV', axes }}
      value={[1, 2]}
      render={(field) => <NumericTupleInput {...field.editProps} axes={axes} label="UV" />}
    />
  ),
}
export const Distribution: Story = {
  render: () => (
    <ComplexExample<number[]>
      title="分段权重属性"
      descriptor={{
        kind: 'distribution',
        id: 'weights',
        label: 'Weights',
        constraints: { total: 100, minSegment: 10 },
      }}
      value={[20, 30, 50]}
      render={(field) => <DistributionSlider {...field.editProps} total={100} minSegment={10} />}
    />
  ),
}
export const Color: Story = {
  render: () => (
    <ComplexExample<ColorValue>
      title="颜色属性与取色能力"
      descriptor={{ kind: 'color', id: 'color', label: 'Color' }}
      value={color}
      externalValue={{ ...color, r: 1 }}
      render={(field) => (
        <ColorInput
          {...field.editProps}
          label="Color"
          capabilities={{ eyeDropper: { pick: async () => ({ space: 'srgb', r: 0.8, g: 0.1, b: 0.2, a: 1 }) } }}
        />
      )}
    />
  ),
}
export const HDRColor: Story = {
  render: () => (
    <ComplexExample<ColorValue>
      title="HDR 颜色属性"
      descriptor={{ kind: 'color', hdr: true, id: 'emission', label: 'Emission' }}
      value={{ ...color, r: 3 }}
      render={(field) => <HDRColorInput {...field.editProps} label="Emission" />}
    />
  ),
}
export const Ramp: Story = {
  render: () => (
    <ComplexExample<ColorRampValue>
      title="颜色渐变属性"
      descriptor={{ kind: 'color-ramp', id: 'ramp', label: 'Ramp' }}
      value={ramp}
      render={(field) => <ColorRamp {...field.editProps} />}
    />
  ),
}
export const RampChannels: Story = {
  render: () => (
    <ComplexExample<ColorRampChannelsValue>
      title="颜色与透明度双轨属性"
      descriptor={{ kind: 'color-ramp-channels', id: 'ramp', label: 'Ramp channels' }}
      value={channels}
      render={(field) => <ColorRampChannels {...field.editProps} />}
    />
  ),
}
export const ColorDistribution: Story = {
  render: () => (
    <ComplexExample<ColorDistributionValue>
      title="颜色分布属性与模式缓存"
      descriptor={{ kind: 'color-distribution', id: 'color', label: 'Color distribution' }}
      value={{ mode: 'constant', color }}
      render={(field) => <ColorDistributionTemplate {...field.editProps} label="Color distribution" />}
    />
  ),
}
export const Curve: Story = {
  render: () => (
    <ComplexExample<CurveValue>
      title="带应用预设的曲线属性"
      descriptor={{ kind: 'curve', id: 'curve', label: 'Curve' }}
      value={curve}
      render={(field) => (
        <CurvePicker
          {...field.editProps}
          label="Curve"
          presets={[
            {
              id: 'descending',
              label: 'Descending',
              value: {
                ...curve,
                points: [
                  { id: 'start', x: 0, y: 1 },
                  { id: 'end', x: 1, y: 0 },
                ],
              },
            },
          ]}
        />
      )}
    />
  ),
}
export const NumericDistribution: Story = {
  render: () => (
    <ComplexExample<NumericDistributionValue>
      title="数值分布属性"
      descriptor={{ kind: 'numeric-distribution', id: 'factor', label: 'Factor' }}
      value={{ mode: 'constant', value: 2 }}
      externalValue={{ mode: 'constant', value: 8 }}
      render={(field) => <NumericDistributionTemplate {...field.editProps} label="Factor" />}
    />
  ),
}
export const Resource: Story = {
  render: () => (
    <ComplexExample<string | null>
      title="一次选择提交的资源引用属性"
      descriptor={{ kind: 'resource', id: 'material', label: 'Material' }}
      value="asset-15"
      render={(field) => <ResourceControl field={field} />}
    />
  ),
}
export const Collection: Story = {
  render: () => (
    <ComplexExample<readonly Entry[]>
      title="集合操作与项目内数值编辑"
      descriptor={{ kind: 'collection', id: 'items', label: 'Items', keyField: 'id', labelField: 'name' }}
      value={entries}
      render={(field) => <CollectionControl field={field} />}
    />
  ),
}
export const MultipleChoice: Story = {
  render: () => (
    <ComplexExample<readonly ChoiceValue[]>
      title="保留值类型的多选属性"
      descriptor={{ kind: 'multi-enum', id: 'tags', label: 'Tags', options: choiceOptions }}
      value={['001']}
      render={(field) => (
        <Combobox
          {...field.controlProps}
          multiple
          options={choiceOptions}
          value={field.value}
          disabled={field.snapshot.disabled}
          readOnly={field.snapshot.readOnly || field.pending}
          onValueChange={(next) => {
            void field.submit(next).catch(() => {})
          }}
        />
      )}
    />
  ),
}
export const DelayedTargetAndExternal: Story = {
  render: () => (
    <ComplexExample<Vector3>
      title="异步保存时切换对象或更新数据"
      descriptor={{ kind: 'vector3', id: 'position', label: 'Position' }}
      value={{ x: 1, y: 2, z: 3 }}
      externalValue={{ x: 7, y: 8, z: 9 }}
      delay={500}
      render={(field) => <Vector3Input {...field.editProps} label="Position" />}
    />
  ),
}
export const MixedGeometry: Story = {
  render: () => (
    <ComplexExample<Vector3>
      title="多个值不一致时的明确替换操作"
      descriptor={{ kind: 'vector3', id: 'position', label: 'Position' }}
      value={{ x: 1, y: 2, z: 3 }}
      mixed
      render={(field) => <MixedControl field={field} />}
    />
  ),
}
