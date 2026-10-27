import { useState, useSyncExternalStore } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { ColorValue } from '../src/values/color'
import type { CurveValue } from '../src/values/curve'
import type { Vector3 } from '../src/values/geometry'
import { PropertyField, type PropertyFieldRenderProps } from '../src/property/PropertyField'
import { Vector3Input } from '../src/editors/numeric/GeometryInputs'
import { ColorField } from '../src/editors/color/ColorField'
import { CurvePicker } from '../src/editors/curve/CurvePicker'
import { Button } from '../src/controls/buttons'
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

const color: ColorValue = { space: 'srgb', r: 0.2, g: 0.4, b: 0.8, a: 1 }
const curve: CurveValue = {
  interpolation: 'linear',
  points: [
    { id: 'start', x: 0, y: 0 },
    { id: 'end', x: 1, y: 1 },
  ],
}
const curvePresets = [
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
]

function LinkedVector({ field }: { field: PropertyFieldRenderProps<Vector3> }) {
  const [linked, setLinked] = useState(false)
  return (
    <Vector3Input
      {...field.editProps}
      label="Position"
      size={field.density === 'regular' ? 'md' : 'sm'}
      linked={linked}
      onLinkedChange={setLinked}
      step={0.1}
    />
  )
}

function makeHosts() {
  return {
    vector: createMockPropertyAccess<Vector3>({
      target: { objectId: 'cube', propertyId: 'position' },
      descriptor: { kind: 'vector3', id: 'position', label: 'Position' },
      value: { x: 1, y: 2, z: 3 },
    }),
    color: createMockPropertyAccess<ColorValue>({
      target: { objectId: 'cube', propertyId: 'color' },
      descriptor: { kind: 'color', id: 'color', label: 'Color' },
      value: color,
    }),
    curve: createMockPropertyAccess<CurveValue>({
      target: { objectId: 'cube', propertyId: 'curve' },
      descriptor: { kind: 'curve', id: 'curve', label: 'Curve' },
      value: curve,
    }),
  }
}

function ComplexExample() {
  const [hosts] = useState(makeHosts)
  const [density, setDensity] = useState<'compact' | 'regular'>('compact')
  const [readOnly, setReadOnly] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [mixedVector, setMixedVector] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const vector = useSyncExternalStore(hosts.vector.subscribe, hosts.vector.getSnapshot, hosts.vector.getSnapshot)
  const colorState = useSyncExternalStore(hosts.color.subscribe, hosts.color.getSnapshot, hosts.color.getSnapshot)
  const curveState = useSyncExternalStore(hosts.curve.subscribe, hosts.curve.getSnapshot, hosts.curve.getSnapshot)

  const applyAvailability = (next: { readOnly?: boolean; disabled?: boolean }) => {
    for (const access of Object.values(hosts)) access.setAvailability(next)
  }
  const reset = () => {
    for (const access of Object.values(hosts)) access.reset()
    setDensity('compact')
    setReadOnly(false)
    setDisabled(false)
    setMixedVector(false)
    setResult(null)
  }
  const resultHandler = (next: { status: string }) => setResult(next.status)

  return (
    <StoryPage
      eyebrow="Property"
      title="Complex bindings"
      summary="PropertyField 的 render 参数把完整属性值接到几何、颜色和曲线编辑器。editProps 连接预览、提交与取消；density 交给自定义控件选择 24/32，应用仍负责保存和校验。"
      meta={
        <>
          <span>vector3</span>
          <span>·</span>
          <span>color</span>
          <span>·</span>
          <span>curve</span>
          <span>·</span>
          <span>render</span>
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
      <StorySection
        title="Custom editors"
        description="三个字段分别把 editProps 接到 Vector3Input、ColorField 和 CurvePicker；它们都保留 PropertyField 的标签、说明、错误和保存生命周期。">
        <StoryGrid>
          <StoryCard title="Vector3 · render" description="比例联动由自定义编辑器自己维护，提交仍走 PropertyField。">
            <PropertyField
              access={hosts.vector}
              density={density}
              mixed={mixedVector}
              onEditResult={resultHandler}
              render={(field) => <LinkedVector field={field} />}
            />
            <StoryRow>
              <Button size="sm" variant="outline" onClick={() => setMixedVector((value) => !value)}>
                Toggle mixed
              </Button>
              <Button size="sm" variant="outline" onClick={() => hosts.vector.rejectNext('Position was rejected.')}>
                Reject next
              </Button>
              <Button size="sm" variant="outline" onClick={() => hosts.vector.externalUpdate({ x: 8, y: 9, z: 10 })}>
                External update
              </Button>
            </StoryRow>
          </StoryCard>

          <StoryCard
            title="Color · render"
            description="ColorField 负责取色、HEX 和 alpha；字段级错误由 PropertyField 统一渲染。">
            <PropertyField
              access={hosts.color}
              density={density}
              onEditResult={resultHandler}
              render={(field) => <ColorField {...field.editProps} label="Color" />}
            />
            <StoryRow>
              <Button size="sm" variant="outline" onClick={() => hosts.color.rejectNext('Color was rejected.')}>
                Reject next
              </Button>
              <Button size="sm" variant="outline" onClick={() => hosts.color.externalUpdate({ ...color, r: 1 })}>
                External update
              </Button>
            </StoryRow>
          </StoryCard>

          <StoryCard title="Curve · render" description="CurvePicker 的预设和曲线编辑都通过 editProps 提交。">
            <PropertyField
              access={hosts.curve}
              density={density}
              onEditResult={resultHandler}
              render={(field) => <CurvePicker {...field.editProps} label="Curve" presets={curvePresets} />}
            />
            <StoryRow>
              <Button size="sm" variant="outline" onClick={() => hosts.curve.rejectNext('Curve was rejected.')}>
                Reject next
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  hosts.curve.externalUpdate({
                    interpolation: 'bezier',
                    points: [
                      { id: 'start', x: 0, y: 0, outHandle: { x: 0.2, y: 0.8 } },
                      { id: 'end', x: 1, y: 1, inHandle: { x: 0.8, y: 0.2 } },
                    ],
                  })
                }>
                External update
              </Button>
            </StoryRow>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Field states" description="density、只读和禁用由 PropertyField 与 PropertyRow 统一控制。">
        <StoryCard title="Density and availability">
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
            <StoryNote tone="muted">当前 {density}，值修改在自定义编辑器内预览，提交后写入 PropertyAccess。</StoryNote>
          </StoryRow>
          <PropertyField access={hosts.vector} density={density} render={(field) => <LinkedVector field={field} />} />
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<PropertyField
  access={position}
  density="compact"
  render={(field) => (
    <Vector3Input {...field.editProps} label="Position" />
  )}
/>

<PropertyField
  access={color}
  render={(field) => <ColorField {...field.editProps} />}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'render', type: '(field) => ReactNode', description: '用 editProps 连接支持预览/提交的编辑器。' },
              {
                name: 'density',
                type: "'compact' | 'regular'",
                defaultValue: "'compact'",
                description: '自定义编辑器可据此选择 sm/md 控件。',
              },
              { name: 'mixed', type: 'boolean', description: '多个对象值不一致时由 render 明确显示替换操作。' },
              {
                name: 'onEditResult',
                type: '(result) => void',
                description: '观察 committed / rejected / cancelled 等结果。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>

      <StoryState
        label="Complex field state"
        value={{
          density,
          readOnly,
          disabled,
          mixedVector,
          result,
          vector: {
            value: vector.value,
            phase: vector.edit?.phase,
            revision: vector.revision,
            history: vector.historyCount,
          },
          color: { value: colorState.value, phase: colorState.edit?.phase, error: colorState.error?.message },
          curve: { value: curveState.value, phase: curveState.edit?.phase, error: curveState.error?.message },
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
          'PropertyField 的 render 参数用于把完整属性值接到颜色、向量、曲线、资源或集合编辑器。editProps 保留预览、提交、取消、只读和错误语义；density 传给自定义编辑器，由其选择 24/32 控件。应用通过 PropertyAccess 保存并校验数据。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Property/PropertyFieldComplex',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { render: () => <ComplexExample /> }
