import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconFile, IconFolder } from '@tabler/icons-react'
import {
  TreeItemContent,
  TreeItemIcon,
  TreeRoot,
  type TreeDropRequest,
  type TreeRootProps,
} from '../src/collections/tree'
import { createTreeCollection } from '../src/values/tree'
import type { CollectionKey } from '../src/values/collection'
import { DragDropProvider, useDragDropState } from '../src/interaction/drag-drop'
import { Button } from '../src/controls/buttons'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { Item, Panel, Row, StateView } from './support/layout'

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
  return <StateView value={useDragDropState()} />
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
      <Row>
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
      </Row>
      {dnd ? (
        <DragDropProvider>
          {tree}
          <DragState />
        </DragDropProvider>
      ) : (
        tree
      )}
      <StateView value={{ selected, expanded, focused, events, count: collection.size }} />
    </div>
  )
}

const collection = createTreeCollection(initial, options)
const renderEntry = (node: { item: unknown }) => {
  const entry = node.item as Entry
  return <TreeItemContent label={entry.name} startSlot={itemIcon(entry)} />
}

const meta = {
  title: 'Collections/Tree',
  component: TreeRoot,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '可展开的层级列表：场景层级、文件夹、资源分组。支持单选 / 多选、键盘导航、改名和拖放。',
    use: ['场景层级（Hierarchy）', '资源目录、文件夹树', '任何父子结构的数据'],
    avoid: [
      '没有层级的列表 → 用 `DataTable` 或 `AssetItem` 列表',
      '可增删、排序、展开编辑的配置项列表 → 用 `CollectionEditor`',
    ],
    related: ['`DataTable`：表格', '`CollectionEditor`：可编辑的条目列表'],
    notes: [
      '数据用 `createTreeCollection(items, { getKey, getChildren, getTextValue })` 转换；数据变化时重新创建',
      '选择、展开、焦点都可以受控；`renderItem` 返回 `TreeItemContent` 设置图标和改名',
      '拖放需要外层 `DragDropProvider`，在 `dragDrop.onDrop` 里移动数据',
    ],
    keyboard: [
      ['↑ / ↓', '移动焦点'],
      ['→ / ←', '展开 / 收起，或移到父节点'],
      ['Home / End', '第一个 / 最后一个节点'],
      ['Space', '选择（多选模式下切换）'],
      ['Enter', '选择并激活（`onActivate`）'],
      ['F2', '改名（提供了 `onRename` 时）'],
      ['Ctrl / ⌘ + A', '全选（多选模式）'],
      ['输入字母', '跳到以该字母开头的节点'],
    ],
  }),
  args: {
    collection,
    'aria-label': 'Documents',
    defaultExpandedKeys: ['documents'],
    defaultSelectedKeys: ['notes'],
    renderItem: renderEntry,
  },
  argTypes: { collection: { control: false }, renderItem: { control: false } },
} satisfies Meta<typeof TreeRoot>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: (args) => (
    <Panel width={300}>
      <TreeRoot {...(args as TreeRootProps<Entry>)} />
    </Panel>
  ),
}

/** `selectionMode="multiple"`：Shift 选范围，Ctrl / ⌘ 追加。 */
export const MultipleSelection: Story = {
  args: { selectionMode: 'multiple', defaultSelectedKeys: ['notes', 'reference'] },
  render: (args) => (
    <Panel width={300}>
      <TreeRoot {...(args as TreeRootProps<Entry>)} />
    </Panel>
  ),
}

/** `compact` 24px 行用于面板，`regular` 32px 行用于对话框。 */
export const Density: Story = {
  render: (args) => (
    <Row>
      {(['compact', 'regular'] as const).map((density) => (
        <Item key={density} label={density}>
          <Panel width={280}>
            <TreeRoot {...(args as TreeRootProps<Entry>)} density={density} aria-label={`Documents (${density})`} />
          </Panel>
        </Item>
      ))}
    </Row>
  ),
}

/** 提供 `onRename` 后，双击名称或按 F2 改名；Enter 提交，Escape 取消。 */
export const Rename: Story = {
  render: function Render() {
    const [items, setItems] = useState(initial)
    const tree = useMemo(() => createTreeCollection(items, options), [items])
    return (
      <Panel width={300}>
        <TreeRoot
          collection={tree}
          aria-label="Documents"
          defaultExpandedKeys={['documents']}
          renderItem={(node) => (
            <TreeItemContent
              label={node.item.name}
              startSlot={itemIcon(node.item)}
              onRename={(name) => setItems((old) => rename(old, node.key, name))}
            />
          )}
        />
      </Panel>
    )
  },
}

/** 拖动节点到其他节点之前、之后或内部（只有文件夹可以放入）；外层需要 `DragDropProvider`。 */
export const DragAndDrop: Story = {
  render: function Render() {
    const [items, setItems] = useState(initial)
    const tree = useMemo(() => createTreeCollection(items, options), [items])
    return (
      <DragDropProvider>
        <Panel width={300}>
          <TreeRoot
            collection={tree}
            aria-label="Documents"
            selectionMode="multiple"
            defaultExpandedKeys={['documents', 'archive']}
            dragDrop={{
              type: 'story/tree-items',
              canDrop: ({ targetKey, position }) => position !== 'inside' || !!tree.get(targetKey)?.children,
              onDrop: (request) => setItems((old) => move(old, request)),
            }}
            renderItem={renderEntry}
          />
        </Panel>
      </DragDropProvider>
    )
  },
}

/** 全受控：记录选择、展开、焦点、改名和拖放事件；可以拒绝改名请求。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: () => <TreeDemo multiple dnd renameEnabled />,
}

/** 只读和禁用：只读仍可展开浏览。 */
export const BehaviorReadOnlyAndDisabled: Story = {
  tags: ['!autodocs'],
  render: () => (
    <Row>
      <TreeDemo readOnly />
      <TreeDemo disabled />
    </Row>
  ),
}
