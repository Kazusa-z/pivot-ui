import { useId, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CollectionEditor } from '../src/collections/CollectionEditor'
import type { CollectionKey } from '../src/values/collection'
import { DragDropProvider } from '../src/interaction/drag-drop'
import { PropertyRow, PropertyLabel, PropertyControl } from '../src/layout/PropertyRow'
import { NumberInput } from '../src/controls/inputs/NumberInput'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { Button } from '../src/controls/buttons/Button'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryField,
  StoryCode,
  StoryProps,
  StoryState,
  StoryKeyboard,
  StoryNote,
} from './support/StoryPage'

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

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'CollectionEditor 用于编辑带稳定标识的条目列表，例如图层、材质槽或规则集合。它提供展开、选择、重命名、增删和排序入口，条目内容由 renderItem 组合。应用在 onAdd、onDelete、onRename、onReorder 中更新 items，并分别保存选择与展开状态。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Templates/CollectionEditor',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const itemClass = css({ display: 'grid', gap: 'var(--space-1)' })

function DensityExample() {
  return (
    <StoryGrid>
      <StoryField label="Compact · 24">
        <StoryCard>
          <CollectionEditor
            label="Compact layers"
            items={initialLayers}
            getKey={(item: Layer) => item.id}
            getLabel={(item: Layer) => item.name}
            density="compact"
            selectionMode="none"
          />
        </StoryCard>
      </StoryField>
      <StoryField label="Regular · 32">
        <StoryCard>
          <CollectionEditor
            label="Regular layers"
            items={initialLayers}
            getKey={(item: Layer) => item.id}
            getLabel={(item: Layer) => item.name}
            density="regular"
            selectionMode="none"
          />
        </StoryCard>
      </StoryField>
    </StoryGrid>
  )
}

function CollectionExample() {
  const [items, setItems] = useState<readonly Layer[]>(initialLayers)
  const [expanded, setExpanded] = useState<readonly CollectionKey[]>([1])
  const [selected, setSelected] = useState<readonly CollectionKey[]>([1])
  const [density, setDensity] = useState<'compact' | 'regular'>('compact')
  const [mode, setMode] = useState<'editable' | 'readonly' | 'disabled'>('editable')
  const [events, setEvents] = useState<string[]>([])
  const nextId = useRef(4)
  const prefix = useId()
  const update = (id: CollectionKey, patch: Partial<Layer>) =>
    setItems((value) => value.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  const reset = () => {
    setItems(initialLayers)
    setExpanded([1])
    setSelected([1])
    setDensity('compact')
    setMode('editable')
    setEvents([])
    nextId.current = 4
  }
  return (
    <StoryPage
      eyebrow="Templates"
      title="CollectionEditor"
      summary="用一个模板管理可选择、展开、重命名、增删和排序的条目列表。紧凑档 24 / 常规档 32；条目内容由 renderItem 组合。"
      meta={
        <>
          <span>{items.length} layers</span>
          <span>·</span>
          <span>{density}</span>
          <span>·</span>
          <span>{mode}</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      }>
      <StorySection
        title="Density"
        description="同一个列表的紧凑 24 与常规 32；展开入口、行高、输入和操作按钮一起缩放。">
        <DensityExample />
      </StorySection>

      <StorySection
        title="Interactive list"
        description="点击行首图标展开，勾选/选择按钮维护 selectedKeys；重命名、删除和上下移动都通过回调交给应用。">
        <StoryCard>
          <StoryRow>
            <Button
              size="sm"
              variant={density === 'compact' ? 'solid' : 'outline'}
              aria-pressed={density === 'compact'}
              onClick={() => setDensity('compact')}>
              Compact
            </Button>
            <Button
              size="sm"
              variant={density === 'regular' ? 'solid' : 'outline'}
              aria-pressed={density === 'regular'}
              onClick={() => setDensity('regular')}>
              Regular
            </Button>
            {(['editable', 'readonly', 'disabled'] as const).map((next) => (
              <Button
                key={next}
                size="sm"
                variant={mode === next ? 'soft' : 'subtle'}
                aria-pressed={mode === next}
                onClick={() => setMode(next)}>
                {next}
              </Button>
            ))}
            <Button size="sm" variant="subtle" onClick={() => setItems([])}>
              Clear
            </Button>
          </StoryRow>
          <DragDropProvider>
            <CollectionEditor<Layer>
              label="Layers"
              items={items}
              getKey={(item) => item.id}
              getLabel={(item) => item.name}
              expandedKeys={expanded}
              onExpandedKeysChange={(keys) => {
                setExpanded(keys)
                setEvents((current) => [...current, `expanded:${JSON.stringify(keys)}`])
              }}
              selectedKeys={selected}
              onSelectedKeysChange={(keys) => {
                setSelected(keys)
                setEvents((current) => [...current, `selected:${JSON.stringify(keys)}`])
              }}
              selectionMode="multiple"
              density={density}
              disabled={mode === 'disabled'}
              readOnly={mode === 'readonly'}
              addLabel="Add layer"
              onAdd={() => {
                const id = nextId.current++
                setItems((value) => [...value, { id, name: `Layer ${id}`, weight: 1, enabled: true }])
                setEvents((current) => [...current, `add:${id}`])
                return id
              }}
              onDelete={(item) => {
                setItems((value) => value.filter((entry) => entry.id !== item.id))
                setEvents((current) => [...current, `delete:${String(item.id)}`])
              }}
              onRename={(item, name) => {
                if (!name.trim()) throw new Error('A layer name is required.')
                update(item.id, { name: name.trim() })
                setEvents((current) => [...current, `rename:${name.trim()}`])
              }}
              onReorder={(next, change) => {
                setItems(next)
                setEvents((current) => [...current, `move:${String(change.key)}:${change.fromIndex}→${change.toIndex}`])
              }}
              renderItem={(item, context) => (
                <div className={itemClass}>
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
        </StoryCard>
      </StorySection>

      <StorySection
        title="States"
        description="readOnly 保留展开和选择，但阻止修改；disabled 阻止所有请求。空列表仍保留 Add layer。">
        <StoryGrid>
          <StoryCard title="Read only">
            <CollectionEditor
              label="Read only layers"
              items={initialLayers}
              getKey={(item: Layer) => item.id}
              getLabel={(item: Layer) => item.name}
              density="compact"
              readOnly
              selectionMode="single"
              defaultSelectedKeys={[1]}
            />
          </StoryCard>
          <StoryCard title="Disabled">
            <CollectionEditor
              label="Disabled layers"
              items={initialLayers}
              getKey={(item: Layer) => item.id}
              getLabel={(item: Layer) => item.name}
              density="compact"
              disabled
              selectionMode="single"
            />
          </StoryCard>
          <StoryCard title="Empty">
            <CollectionEditor
              label="Empty layers"
              items={[]}
              getKey={(item: Layer) => item.id}
              getLabel={(item: Layer) => item.name}
              density="compact"
              selectionMode="none"
              emptyContent="No layers yet"
            />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="列表有分组名称，展开/选择/重命名/删除/移动都是原生按钮，可用 Tab 和 Enter/Space 操作。">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在展开、选择、重命名、移动、删除和 Add layer 之间移动。' },
            { keys: ['Enter', 'Space'], action: '展开/收起、切换选择或触发操作。' },
            { keys: 'Escape', action: '重命名时取消并恢复原值。' },
            { keys: ['Arrow Up', 'Arrow Down'], action: '通过 Move 按钮调整顺序；拖动手柄需配合 DragDropProvider。' },
          ]}
        />
        <StoryNote>
          给每个条目稳定的 <code>getKey</code>
          ；否则展开、选择和焦点会在增删/排序后错位。重命名失败时组件保留草稿和错误，修正后按 Enter 重试。
        </StoryNote>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<DragDropProvider>
  <CollectionEditor
    items={layers}
    getKey={(item) => item.id}
    getLabel={(item) => item.name}
    density="compact"
    selectionMode="multiple"
    onAdd={addLayer}
    onDelete={deleteLayer}
    onRename={renameLayer}
    onReorder={(next) => setLayers(next)}
    renderItem={(item, context) => <LayerFields item={item} {...context} />}
  />
</DragDropProvider>`}
          />
          <StoryProps
            rows={[
              {
                name: 'items / getKey / getLabel',
                type: 'readonly T[] / (item) => CollectionKey',
                description: '稳定标识与可读名称。',
              },
              {
                name: 'density',
                type: "'compact' | 'regular'",
                defaultValue: "'compact'",
                description: '24 或 32 行高。',
              },
              {
                name: 'onAdd / onDelete / onRename',
                type: 'async callbacks',
                description: '更新 items；rename 可抛错保留草稿。',
              },
              { name: 'onReorder', type: '(next, change) => void', description: '接收排好序的 items。' },
              {
                name: 'expandedKeys / selectedKeys',
                type: 'readonly CollectionKey[]',
                description: '受控展开与选择。',
              },
              {
                name: 'disabled / readOnly',
                type: 'boolean',
                defaultValue: 'false',
                description: '禁用全部请求，或仅阻止修改。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>

      <StoryState label="Collection state" value={{ density, mode, items, expanded, selected, events }} />
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <CollectionExample /> }
