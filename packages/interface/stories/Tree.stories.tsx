import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconFile, IconFolder } from '@tabler/icons-react'
import {
  TreeRoot,
  TreeItemContent,
  TreeItemIcon,
  TreeDragPreview,
  TreeInsertionIndicator,
  type TreeDropRequest,
} from '../src/widgets/collections/tree'
import { createTreeCollection } from '../src/values/tree'
import type { CollectionKey } from '../src/values/collection'
import { DragDropProvider, useDragDropState } from '../src/interaction/drag-drop'
import { Button } from '../src/widgets/buttons'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryState,
  StoryCode,
  StoryProps,
  StoryKeyboard,
} from './support/StoryPage'

interface Entry {
  id: CollectionKey
  name: string
  children?: readonly Entry[]
  disabled?: boolean
}

const initial: readonly Entry[] = [
  {
    id: 'documents',
    name: 'Documents',
    children: [
      { id: 'notes', name: 'Notes' },
      { id: 'reference', name: 'Reference', children: [{ id: 'guide', name: 'Guide' }] },
      { id: 'locked', name: 'Unavailable item', disabled: true },
      { id: 'long', name: 'A very long document name that stays readable in a narrow tree' },
    ],
  },
  { id: 'archive', name: 'Archive', children: [] },
  { id: 'readme', name: 'Readme' },
]

const options = {
  getKey: (item: Entry) => item.id,
  getChildren: (item: Entry) => item.children,
  getTextValue: (item: Entry) => item.name,
  isDisabled: (item: Entry) => !!item.disabled,
}

function rename(items: readonly Entry[], key: CollectionKey, name: string): readonly Entry[] {
  return items.map((item) =>
    item.id === key ? { ...item, name } : item.children ? { ...item, children: rename(item.children, key, name) } : item
  )
}

function remove(items: readonly Entry[], keys: readonly CollectionKey[]): readonly Entry[] {
  return items
    .filter((item) => !keys.includes(item.id))
    .map((item) => (item.children ? { ...item, children: remove(item.children, keys) } : item))
}

function move(items: readonly Entry[], request: TreeDropRequest): readonly Entry[] {
  const collection = createTreeCollection(items, options)
  const keys = request.keys.filter((key) => {
    let node = collection.getNode(key)
    while (node?.parentKey != null) {
      if (request.keys.includes(node.parentKey)) return false
      node = collection.getNode(node.parentKey)
    }
    return true
  })
  const moving = keys.map((key) => collection.get(key)!)
  const insert = (list: readonly Entry[]): readonly Entry[] =>
    list.flatMap((item) => {
      if (item.id === request.targetKey) {
        if (request.position === 'inside') return [{ ...item, children: [...(item.children ?? []), ...moving] }]
        return request.position === 'before' ? [...moving, item] : [item, ...moving]
      }
      return [{ ...item, ...(item.children ? { children: insert(item.children) } : {}) }]
    })
  return insert(remove(items, keys))
}

const itemIcon = (entry: Entry) => (
  <TreeItemIcon>{entry.children ? <IconFolder size={14} /> : <IconFile size={14} />}</TreeItemIcon>
)

function StaticTree({
  density = 'compact',
  selectionMode = 'single',
  disabled = false,
  readOnly = false,
}: {
  density?: 'compact' | 'regular'
  selectionMode?: 'none' | 'single' | 'multiple'
  disabled?: boolean
  readOnly?: boolean
}) {
  const collection = useMemo(() => createTreeCollection(initial, options), [])
  return (
    <TreeRoot
      collection={collection}
      density={density}
      selectionMode={selectionMode}
      disabled={disabled}
      readOnly={readOnly}
      defaultSelectedKeys={selectionMode === 'none' ? [] : ['notes']}
      defaultExpandedKeys={['documents']}
      defaultFocusedKey="notes"
      renderItem={(node) => <TreeItemContent label={node.item.name} startSlot={itemIcon(node.item)} />}
      aria-label={`${density} ${selectionMode} tree`}
      css={{ width: '100%', maxWidth: '380px' }}
    />
  )
}

function DragState() {
  const state = useDragDropState()
  return <StoryState label="Shared drag state" value={state} />
}

function TreeDemo({
  density = 'compact',
  multiple = false,
  readOnly = false,
  disabled = false,
  dnd = false,
  renameEnabled = false,
}: {
  density?: 'compact' | 'regular'
  multiple?: boolean
  readOnly?: boolean
  disabled?: boolean
  dnd?: boolean
  renameEnabled?: boolean
}) {
  const [items, setItems] = useState(initial)
  const [selected, setSelected] = useState<readonly CollectionKey[]>(['notes'])
  const [expanded, setExpanded] = useState<readonly CollectionKey[]>(['documents'])
  const [focused, setFocused] = useState<CollectionKey | null>('notes')
  const [events, setEvents] = useState<string[]>([])
  const [allowRename, setAllowRename] = useState(true)
  const collection = useMemo(() => createTreeCollection(items, options), [items])
  const record = (event: string) => setEvents((old) => [...old.slice(-7), event])

  const tree = (
    <TreeRoot
      collection={collection}
      density={density}
      aria-label="Documents tree"
      selectionMode={multiple ? 'multiple' : 'single'}
      selectedKeys={selected}
      expandedKeys={expanded}
      focusedKey={focused}
      disabled={disabled}
      readOnly={readOnly}
      onSelectedKeysChange={(keys) => {
        setSelected(keys)
        record(`selection ${JSON.stringify(keys)}`)
      }}
      onExpandedKeysChange={(keys) => {
        setExpanded(keys)
        record(`expanded ${JSON.stringify(keys)}`)
      }}
      onFocusedKeyChange={(key) => {
        setFocused(key)
        record(`focus ${String(key)}`)
      }}
      dragDrop={
        dnd
          ? {
              type: 'story/tree-items',
              canDrop: ({ targetKey, position }) => position !== 'inside' || !!collection.get(targetKey)?.children,
              onDrop: (request) => {
                setItems((old) => move(old, request))
                record(`drop ${JSON.stringify(request)}`)
              },
              onDragEnd: (result) => record(`drag ${result.status}`),
            }
          : undefined
      }
      renderItem={(node) => (
        <TreeItemContent
          label={node.item.name}
          startSlot={itemIcon(node.item)}
          onRename={
            renameEnabled
              ? async (name) => {
                  if (!allowRename) throw Error('Rename rejected. Allow rename and retry Enter.')
                  setItems((old) => rename(old, node.key, name))
                  record(`rename ${String(node.key)}:${name}`)
                }
              : undefined
          }
        />
      )}
      css={{ width: '100%', maxWidth: '380px' }}
    />
  )

  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)', minWidth: 0 })}>
      <StoryRow>
        <Button size="sm" variant="outline" onClick={() => setExpanded(['documents', 'reference'])}>
          Expand all
        </Button>
        <Button size="sm" variant="outline" onClick={() => setExpanded([])}>
          Collapse all
        </Button>
        {renameEnabled && (
          <Button size="sm" variant="outline" onClick={() => setAllowRename((value) => !value)}>
            {allowRename ? 'Reject rename' : 'Allow rename'}
          </Button>
        )}
        {dnd && (
          <>
            <Button
              size="sm"
              disabled={!selected.length || selected.includes('archive')}
              onClick={() => {
                setItems((old) => move(old, { keys: selected, targetKey: 'archive', position: 'inside' }))
                setExpanded((old) => [...new Set([...old, 'archive'])])
                record('move selected into Archive')
              }}>
              Move to Archive
            </Button>
            <Button
              size="sm"
              disabled={!selected.length || selected.includes('documents')}
              onClick={() => {
                setItems((old) => move(old, { keys: selected, targetKey: 'documents', position: 'before' }))
                record('move selected to top')
              }}>
              Move to top
            </Button>
          </>
        )}
      </StoryRow>
      {dnd ? (
        <DragDropProvider>
          {tree}
          <DragState />
        </DragDropProvider>
      ) : (
        tree
      )}
      <StoryState
        label="Tree state"
        value={{ selected, expanded, focused, events, count: collection.size }}
        open={false}
      />
    </div>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tree 展示可展开的层级数据，TreeRoot 管理选择、展开与焦点，应用通过回调保存状态。重命名和拖放由应用更新数据；拖放使用 6px overlay 预览和 2px 插入线，键盘提供与拖动等价的移动入口。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Collections/Tree',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Collections"
      title="Tree"
      summary="文件目录、场景层级和其他可展开数据使用同一套树。紧凑 24 / 常规 32，选中为实心 selection surface；重命名与拖放只发出请求，数据由应用更新。"
      meta={
        <>
          <span>Compact 24</span>
          <span>·</span>
          <span>Regular 32</span>
          <span>·</span>
          <span>Single / multiple</span>
        </>
      }>
      <StorySection
        title="Browse and select"
        description="方向键移动焦点，Right/Left 展开收起，Space 选择；下方记录选择、展开和焦点回调。">
        <StoryCard>
          <TreeDemo />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Selection modes"
        description="single 只保留一个选中项；multiple 支持 Space 切换和 Shift 范围选择；none 只用于浏览。">
        <StoryGrid>
          <StoryCard title="Single" description="默认模式，选中一个条目。">
            <StaticTree selectionMode="single" />
          </StoryCard>
          <StoryCard title="Multiple" description="多个条目可同时选中。">
            <StaticTree selectionMode="multiple" />
          </StoryCard>
          <StoryCard title="None" description="不显示选择语义，只保留展开与焦点。">
            <StaticTree selectionMode="none" />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Density"
        description="compact 行高 24、字号 12；regular 行高 32、字号 14。重命名输入框跟随同一档位。">
        <StoryGrid>
          <StoryCard title="Compact · 24" description="树、菜单、属性面板。">
            <StaticTree density="compact" />
          </StoryCard>
          <StoryCard title="Regular · 32" description="对话框、常规表单。">
            <StaticTree density="regular" />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Rename"
        description="F2 或双击进入编辑；Enter/失焦提交，Escape 取消。异步提交失败时保留草稿，可修正后重试。">
        <StoryCard>
          <TreeDemo renameEnabled />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Drag and drop"
        description="拖动行标签请求移动；目标上/下边缘插入前后，中间移入文件夹。Escape 取消，移动按钮提供键盘等价操作。">
        <StoryCard>
          <TreeDemo dnd multiple />
        </StoryCard>
        <StoryGrid>
          <StoryCard title="Drag preview" description="surfaceRaised、6px 圆角、overlay shadow。">
            <TreeDragPreview count={2}>
              <TreeItemIcon>
                <IconFolder size={14} />
              </TreeItemIcon>
              Documents
            </TreeDragPreview>
          </StoryCard>
          <StoryCard title="Insertion indicator" description="2px focusRing 线，标记 before/after 位置。">
            <div className={css({ display: 'grid', gap: 'var(--space-2)' })}>
              <TreeInsertionIndicator active />
              <TreeInsertionIndicator />
            </div>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Disabled and read-only"
        description="disabled 整棵树不可聚焦；readOnly 仍可浏览和展开，但不可选择、重命名或移动。">
        <StoryGrid>
          <StoryCard title="Disabled">
            <StaticTree disabled />
          </StoryCard>
          <StoryCard title="Read only">
            <StaticTree readOnly />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Keyboard" description="焦点与选择分离；树本身只保留一个 tab stop。">
        <StoryKeyboard
          rows={[
            { keys: '↑ / ↓', action: '移动焦点' },
            { keys: '→ / ←', action: '展开/收起，或在父子节点间移动' },
            { keys: 'Space', action: '选择当前节点' },
            { keys: 'Enter', action: '选择并激活当前节点' },
            { keys: 'F2', action: '开始重命名' },
            { keys: 'Home / End', action: '跳到第一个/最后一个可聚焦节点' },
            { keys: 'Escape', action: '取消拖动或重命名' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const collection = createTreeCollection(items, {
  getKey: (item) => item.id,
  getChildren: (item) => item.children,
  getTextValue: (item) => item.name,
})

<TreeRoot
  collection={collection}
  density="compact"
  selectionMode="multiple"
  selectedKeys={selected}
  expandedKeys={expanded}
  focusedKey={focused}
  onSelectedKeysChange={setSelected}
  onExpandedKeysChange={setExpanded}
  onFocusedKeyChange={setFocused}
  renderItem={(node) => <TreeItemContent label={node.item.name} />}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'collection', type: 'TreeCollection<T>', description: '稳定的 key、子项与文本值。' },
              {
                name: 'density',
                type: "'compact' | 'regular'",
                defaultValue: "'compact'",
                description: '24 或 32 行高。',
              },
              {
                name: 'selectionMode',
                type: "'none' | 'single' | 'multiple'",
                defaultValue: "'single'",
                description: '选择语义。',
              },
              {
                name: 'selectedKeys / expandedKeys / focusedKey',
                type: 'readonly CollectionKey[] / key',
                description: '受控状态。',
              },
              { name: 'dragDrop', type: 'TreeDragDropOptions', description: '启用移动并提供 canDrop/onDrop。' },
              { name: 'readOnly / disabled', type: 'boolean', description: '只读浏览或完全禁用。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
