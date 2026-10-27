import { useId, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CollectionEditor, type CollectionEditorProps } from '../src/collections/CollectionEditor'
import type { CollectionKey } from '../src/values/collection'
import { DragDropProvider } from '../src/interaction/drag-drop'
import { PropertyRow, PropertyLabel, PropertyControl } from '../src/layout/PropertyRow'
import { NumberInput } from '../src/controls/inputs/NumberInput'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { Column, Grid, Item, Panel, StateView } from './support/layout'

interface Layer {
  id: CollectionKey
  name: string
  weight: number
  enabled: boolean
}

const initialLayers: readonly Layer[] = [
  { id: 1, name: 'Base layer', weight: 1, enabled: true },
  { id: 2, name: 'Detail layer', weight: 0.5, enabled: true },
  { id: 3, name: 'Highlights', weight: 0.2, enabled: false },
]

const layerKey = (item: Layer) => item.id
const layerLabel = (item: Layer) => item.name
const fieldsClass = css({ display: 'grid', gap: 'var(--space-1)' })

/** Layer list whose items, selection and expansion are owned by the story, like an application would. */
function LayerEditor({
  density = 'compact',
  disabled,
  readOnly,
  onEvent,
}: Pick<CollectionEditorProps<Layer>, 'density' | 'disabled' | 'readOnly'> & { onEvent?: (event: string) => void }) {
  const [items, setItems] = useState<readonly Layer[]>(initialLayers)
  const [expanded, setExpanded] = useState<readonly CollectionKey[]>([1])
  const [selected, setSelected] = useState<readonly CollectionKey[]>([1])
  const nextId = useRef(4)
  const prefix = useId()
  const record = (event: string) => onEvent?.(event)
  const update = (id: CollectionKey, patch: Partial<Layer>) =>
    setItems((value) => value.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  return (
    <DragDropProvider>
      <CollectionEditor<Layer>
        label="Layers"
        items={items}
        getKey={layerKey}
        getLabel={layerLabel}
        expandedKeys={expanded}
        onExpandedKeysChange={(keys) => {
          setExpanded(keys)
          record(`expanded ${JSON.stringify(keys)}`)
        }}
        selectedKeys={selected}
        onSelectedKeysChange={(keys) => {
          setSelected(keys)
          record(`selected ${JSON.stringify(keys)}`)
        }}
        selectionMode="multiple"
        density={density}
        disabled={disabled}
        readOnly={readOnly}
        addLabel="Add layer"
        onAdd={() => {
          const id = nextId.current++
          setItems((value) => [...value, { id, name: `Layer ${id}`, weight: 1, enabled: true }])
          record(`add ${id}`)
          return id
        }}
        onDelete={(item) => {
          setItems((value) => value.filter((entry) => entry.id !== item.id))
          record(`delete ${String(item.id)}`)
        }}
        canDelete={() => items.length > 1}
        onRename={(item, name) => {
          if (!name.trim()) throw new Error('A layer name is required.')
          update(item.id, { name: name.trim() })
          record(`rename ${name.trim()}`)
        }}
        onReorder={(next, change) => {
          setItems(next)
          record(`move ${String(change.key)}: ${change.fromIndex} → ${change.toIndex}`)
        }}
        renderItem={(item, context) => (
          <div className={fieldsClass}>
            <PropertyRow density={density}>
              <PropertyLabel htmlFor={`${prefix}-${String(item.id)}-weight`}>Weight</PropertyLabel>
              <PropertyControl association="control">
                <NumberInput
                  id={`${prefix}-${String(item.id)}-weight`}
                  value={item.weight}
                  min={0}
                  max={1}
                  step={0.1}
                  size={density === 'regular' ? 'md' : 'sm'}
                  disabled={context.disabled}
                  readOnly={context.readOnly}
                  onValueChange={(weight) => update(item.id, { weight })}
                />
              </PropertyControl>
            </PropertyRow>
            <PropertyRow density={density}>
              <PropertyLabel htmlFor={`${prefix}-${String(item.id)}-enabled`}>Enabled</PropertyLabel>
              <PropertyControl association="control">
                <Checkbox
                  id={`${prefix}-${String(item.id)}-enabled`}
                  checked={item.enabled}
                  size={density === 'regular' ? 'md' : 'sm'}
                  disabled={context.disabled}
                  readOnly={context.readOnly}
                  onCheckedChange={(enabled) => update(item.id, { enabled })}
                />
              </PropertyControl>
            </PropertyRow>
          </div>
        )}
      />
    </DragDropProvider>
  )
}

const meta = {
  title: 'Collections/CollectionEditor',
  component: CollectionEditor,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '编辑一组同类条目：展开查看字段、选择、改名、增删和排序，例如图层、材质槽、规则列表。',
    use: ['属性面板里的"可增删的列表"属性', '每个条目有自己的一组字段，需要展开编辑'],
    avoid: ['只读的数据展示 → 用 `DataTable`', '有父子层级的数据 → 用 `TreeRoot`'],
    related: ['`Section`：单个可折叠分组', '`PropertyRow`：条目展开后的字段行'],
    notes: [
      '`getKey` 必须返回稳定 key，否则增删、排序后展开状态、选择和焦点会错位',
      '`onAdd`、`onDelete`、`onRename`、`onReorder` 只是请求，应用更新 `items` 后列表才变化',
      '`onRename` 抛错或 Promise 失败时保留草稿并显示错误',
      '拖动排序需要外层有 `DragDropProvider`；没有时仍可用上移 / 下移按钮',
    ],
    keyboard: [
      ['Tab', '在展开、选择、改名、移动、删除和添加按钮之间移动'],
      ['Enter / Space', '展开或收起、切换选择、执行操作'],
      ['Escape', '取消改名'],
    ],
  }),
  args: { items: initialLayers, getKey: layerKey, getLabel: layerLabel, label: 'Layers', density: 'compact' },
  argTypes: {
    items: { control: false },
    getKey: { control: false },
    getLabel: { control: false },
    renderItem: { control: false },
    emptyContent: { control: false },
  },
} satisfies Meta<typeof CollectionEditor<Layer>>
export default meta
type Story = StoryObj<typeof meta>

/** 图层列表：展开后编辑字段，可以改名、增删、上下移动或拖动排序；至少保留一项。 */
export const Basic: Story = {
  render: (args) => (
    <Panel>
      <LayerEditor density={args.density} disabled={args.disabled} readOnly={args.readOnly} />
    </Panel>
  ),
}

/** 紧凑 24 与常规 32；展开按钮、行高和操作按钮一起缩放。 */
export const Density: Story = {
  render: () => (
    <Grid>
      {(['compact', 'regular'] as const).map((density) => (
        <Item key={density} label={density}>
          <CollectionEditor
            label={`${density} layers`}
            items={initialLayers}
            getKey={layerKey}
            getLabel={layerLabel}
            density={density}
            selectionMode="none"
          />
        </Item>
      ))}
    </Grid>
  ),
}

/** `readOnly` 仍可展开和选择，但不能修改；`disabled` 关闭全部操作；空列表显示 `emptyContent`。 */
export const States: Story = {
  render: () => (
    <Grid>
      <Item label="readOnly">
        <CollectionEditor
          label="Read only layers"
          items={initialLayers}
          getKey={layerKey}
          getLabel={layerLabel}
          readOnly
          defaultSelectedKeys={[1]}
          onRename={() => {}}
          onDelete={() => {}}
        />
      </Item>
      <Item label="disabled">
        <CollectionEditor
          label="Disabled layers"
          items={initialLayers}
          getKey={layerKey}
          getLabel={layerLabel}
          disabled
          onRename={() => {}}
          onDelete={() => {}}
        />
      </Item>
      <Item label="空列表">
        <CollectionEditor
          label="Empty layers"
          items={[]}
          getKey={layerKey}
          getLabel={layerLabel}
          emptyContent="No layers yet"
          addLabel="Add layer"
          onAdd={() => {}}
        />
      </Item>
    </Grid>
  ),
}

/** 记录每个请求；把名称清空再提交会被拒绝并保留草稿。 */
export const BehaviorRequests: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [events, setEvents] = useState<string[]>([])
    return (
      <Column width={360}>
        <LayerEditor onEvent={(event) => setEvents((current) => [...current.slice(-9), event])} />
        <StateView value={events} />
      </Column>
    )
  },
}
