import { useState, useSyncExternalStore } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PropertyField } from '../src/property/PropertyField'
import type { ChoiceValue, EditResult } from '../src'
import type { ColorValue } from '../src/values/color'
import type { CurveValue } from '../src/values/curve'
import type { Vector3 } from '../src/values/geometry'
import { Vector3Input } from '../src/editors/numeric'
import { ColorField } from '../src/editors/color/ColorField'
import { CurvePicker } from '../src/editors/curve/CurvePicker'
import { Button } from '../src/controls/buttons'
import { createMockPropertyAccess, type MockPropertyAccess } from './support/mock-property-access'
import { blue } from './support/color-samples'
import { easeCurve } from './support/curve-samples'
import { describeComponent } from './support/describe'
import { Column, Item, Panel, Row, StateView } from './support/layout'

const modeOptions = [
  { key: 'solid', label: 'Solid', value: 'solid' },
  { key: 'wire', label: 'Wireframe', value: 'wire' },
  { key: 'points', label: 'Points', value: 'points' },
] as const

/** One cube's properties, each behind its own in-memory PropertyAccess. */
function createCube() {
  return {
    name: createMockPropertyAccess<string>({
      target: { objectId: 'cube', propertyId: 'name' },
      descriptor: { kind: 'string', id: 'name', label: 'Name' },
      value: 'Cube',
    }),
    visible: createMockPropertyAccess<boolean>({
      target: { objectId: 'cube', propertyId: 'visible' },
      descriptor: { kind: 'boolean', id: 'visible', label: 'Visible' },
      value: true,
    }),
    mode: createMockPropertyAccess<ChoiceValue>({
      target: { objectId: 'cube', propertyId: 'mode' },
      descriptor: { kind: 'enum', id: 'mode', label: 'Display', options: modeOptions },
      value: 'solid',
    }),
    distance: createMockPropertyAccess<number>({
      target: { objectId: 'cube', propertyId: 'distance' },
      descriptor: {
        kind: 'number',
        id: 'distance',
        label: 'Distance',
        unit: 'm',
        description: '拖动范围 0–10，可以输入到 100。',
        constraints: { min: 0, max: 100, softMax: 10, step: 0.1, precision: 2 },
      },
      value: 2.5,
    }),
  }
}

function useSnapshot<T>(access: MockPropertyAccess<T>) {
  return useSyncExternalStore(access.subscribe, access.getSnapshot, access.getSnapshot)
}

// The API table needs an `access` arg; examples create their own properties.
const sharedCube = createCube()

const meta = {
  title: 'Property/PropertyField',
  component: PropertyField,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '把一个属性接到应用数据：带标签、帮助文字和错误提示的一行字段，编辑、保存、拒绝和多选混合值都已处理。',
    use: ['属性面板、检查器：很多字段接到同一套数据服务', '需要撤销记录、保存失败提示、外部更新冲突处理'],
    avoid: ['只是一个本地状态的输入框 → 直接用 `Input`、`NumberInput` 等控件加 `PropertyRow`'],
    related: [
      '`PropertyRow`：只负责排版的字段行',
      '`Section`：把字段分组',
      '指南「编辑与数据」：`PropertyAccess` 的实现方式',
    ],
    notes: [
      '`access` 由应用实现（见「编辑与数据」）；字段读取快照显示值、只读/禁用和错误，编辑时开始一个会话并在提交时等待保存结果',
      '文本、数字、布尔、枚举属性自动选择控件，可以用 `widget` 改；其他类型用 `render` 组合 `Vector3Input`、`ColorField` 等，把参数里的 `editProps` 传给控件',
      '多选对象的值不一致时设置 `mixed`；保存被拒绝时显示错误并保留草稿',
    ],
  }),
  args: { access: sharedCube.name },
  argTypes: {
    access: { control: false },
    render: { control: false },
    label: { control: false },
    description: { control: false },
  },
} satisfies Meta<typeof PropertyField<string>>
export default meta
type Story = StoryObj<typeof meta>

/** 四种基本类型自动选择控件：文本、复选框、下拉、数字。 */
export const Basic: Story = {
  render: function Render(args) {
    const [cube] = useState(createCube)
    return (
      <Panel>
        <Column>
          <PropertyField density={args.density} direction={args.direction} access={cube.name} />
          <PropertyField density={args.density} direction={args.direction} access={cube.visible} />
          <PropertyField density={args.density} direction={args.direction} access={cube.mode} />
          <PropertyField density={args.density} direction={args.direction} access={cube.distance} />
        </Column>
      </Panel>
    )
  },
}

/** `regular` 32px 行，适合更宽松的设置页。 */
export const Regular: Story = { args: { density: 'regular' }, render: Basic.render }

/** `widget` 选择同一类型的其他控件：多行文本、滑块、可搜索的下拉。 */
export const Widgets: Story = {
  render: function Render() {
    const [hosts] = useState(() => ({
      notes: createMockPropertyAccess<string>({
        target: { objectId: 'cube', propertyId: 'notes' },
        descriptor: { kind: 'string', id: 'notes', label: 'Notes', description: 'Ctrl / ⌘ + Enter 提交。' },
        value: 'A rounded cube in the scene.',
      }),
      opacity: createMockPropertyAccess<number>({
        target: { objectId: 'cube', propertyId: 'opacity' },
        descriptor: { kind: 'number', id: 'opacity', label: 'Opacity', unit: '%', constraints: { min: 0, max: 100 } },
        value: 80,
      }),
      mode: createCube().mode,
    }))
    return (
      <Panel>
        <Column>
          <PropertyField access={hosts.notes} widget="textarea" />
          <PropertyField access={hosts.opacity} widget="numeric-slider" />
          <PropertyField access={hosts.mode} widget="combobox" />
        </Column>
      </Panel>
    )
  },
}

/** 多选值不一致（`mixed`），以及应用设置的只读、禁用和原因说明。 */
export const States: Story = {
  render: function Render() {
    const [hosts] = useState(() => {
      const mixed = createCube()
      const readOnly = createCube()
      readOnly.name.setAvailability({ readOnly: true, reason: 'Linked from a library asset.' })
      const disabled = createCube()
      disabled.distance.setAvailability({ disabled: true, reason: 'Enable physics to edit.' })
      return { mixed, readOnly, disabled }
    })
    return (
      <Panel>
        <Column>
          <Item label="mixed">
            <PropertyField access={hosts.mixed.distance} mixed />
          </Item>
          <Item label="readOnly">
            <PropertyField access={hosts.readOnly.name} />
          </Item>
          <Item label="disabled">
            <PropertyField access={hosts.disabled.distance} />
          </Item>
        </Column>
      </Panel>
    )
  },
}

/** 用 `render` 接入编辑器：把 `editProps` 传给 `Vector3Input`、`ColorField`、`CurvePicker`，标签、错误和保存仍由 PropertyField 处理。 */
export const CustomEditors: Story = {
  render: function Render() {
    const [hosts] = useState(() => ({
      position: createMockPropertyAccess<Vector3>({
        target: { objectId: 'cube', propertyId: 'position' },
        descriptor: { kind: 'vector3', id: 'position', label: 'Position' },
        value: { x: 1, y: 2, z: 3 },
      }),
      color: createMockPropertyAccess<ColorValue>({
        target: { objectId: 'cube', propertyId: 'color' },
        descriptor: { kind: 'color', id: 'color', label: 'Color' },
        value: blue,
      }),
      falloff: createMockPropertyAccess<CurveValue>({
        target: { objectId: 'cube', propertyId: 'falloff' },
        descriptor: { kind: 'curve', id: 'falloff', label: 'Falloff' },
        value: easeCurve,
      }),
    }))
    return (
      <Panel width={360}>
        <Column>
          <PropertyField
            access={hosts.position}
            render={(field) => (
              <Vector3Input {...field.editProps} label="Position" size={field.density === 'regular' ? 'md' : 'sm'} />
            )}
          />
          <PropertyField access={hosts.color} render={(field) => <ColorField {...field.editProps} label="Color" />} />
          <PropertyField
            access={hosts.falloff}
            render={(field) => <CurvePicker {...field.editProps} label="Falloff" />}
          />
        </Column>
      </Panel>
    )
  },
}

/** 保存延迟、拒绝和外部更新：观察快照、编辑结果和撤销记录。 */
export const BehaviorSaveLifecycle: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [cube] = useState(createCube)
    const [results, setResults] = useState<string[]>([])
    const snapshot = useSnapshot(cube.distance)
    const record = (result: EditResult<unknown>) =>
      setResults((items) => [...items.slice(-7), `${result.status} → ${JSON.stringify(result.value)}`])
    return (
      <Column width={420}>
        <Row>
          <Button size="sm" variant="outline" onClick={() => cube.distance.setDelay(800)}>
            Slow save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => cube.distance.rejectNext('Distance was rejected by the host.')}>
            Reject next
          </Button>
          <Button size="sm" variant="outline" onClick={() => cube.distance.externalUpdate(42)}>
            External update
          </Button>
          <Button size="sm" variant="subtle" onClick={() => cube.distance.reset()}>
            Reset
          </Button>
        </Row>
        <Panel>
          <Column>
            <PropertyField access={cube.distance} onEditResult={record} />
            <PropertyField access={cube.name} onEditResult={record} />
          </Column>
        </Panel>
        <StateView
          value={{
            value: snapshot.value,
            revision: snapshot.revision,
            edit: snapshot.edit,
            error: snapshot.error,
            history: snapshot.historyCount,
            results,
          }}
        />
      </Column>
    )
  },
}
