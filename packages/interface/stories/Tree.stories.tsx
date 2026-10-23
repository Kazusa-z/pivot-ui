import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconFile, IconFolder, IconTrash } from '@tabler/icons-react'
import { TreeRoot, TreeItemContent, TreeItemIcon, type TreeDropRequest } from '../src/widgets/collections/tree'
import { createTreeCollection } from '../src/values/tree'
import type { CollectionKey } from '../src/values/collection'
import { DragDropProvider, useDragDropState } from '../src/interaction/drag-drop'
import { ActionButton } from '../src/widgets/buttons/ActionButton'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'

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
      { id: 'long', name: 'A very long document name that must remain readable in a narrow tree using an ellipsis' },
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

function TreeExample({
  multiple = false,
  freeze = false,
  dynamic = false,
  asyncRename = false,
  dnd = false,
  disabled = false,
  readOnly = false,
}: {
  multiple?: boolean
  freeze?: boolean
  dynamic?: boolean
  asyncRename?: boolean
  dnd?: boolean
  disabled?: boolean
  readOnly?: boolean
}) {
  const [items, setItems] = useState(initial)
  const [selected, setSelected] = useState<readonly CollectionKey[]>(['notes'])
  const [expanded, setExpanded] = useState<readonly CollectionKey[]>(['documents'])
  const [focused, setFocused] = useState<CollectionKey | null>('notes')
  const [events, setEvents] = useState<string[]>([])
  const [reject, setReject] = useState(asyncRename)
  const [revision, setRevision] = useState(0)
  const version = useRef(revision)
  version.current = revision
  const collection = useMemo(() => createTreeCollection(items, options), [items])
  const record = (event: string) => setEvents((old) => [...old.slice(-11), event])
  return (
    <ContractFrame
      title={
        dnd
          ? '移动树中的条目'
          : asyncRename
            ? '重命名与失败重试'
            : dynamic
              ? '增删条目后的焦点位置'
              : freeze
                ? '由应用决定是否接受选择'
                : multiple
                  ? '选择多个条目'
                  : '浏览、展开与选择树节点'
      }
      description={
        dnd
          ? '拖动行标签可请求移动条目：目标上、下区域表示插到前面或后面，中间表示移入文件夹。onDrop 把目标和位置交给应用更新数据；Escape 取消，模型会阻止移入自身或后代。上方移动按钮提供同样可用键盘完成的操作。'
          : asyncRename
            ? '按 F2 或双击标签进入重命名，Enter 或失焦提交，Escape 取消。onRename 可返回 Promise；此例在 300ms 后拒绝首次请求，开启 Allow rename 后可保留草稿重试。Reset 更新版本，应用据此忽略此前请求的结果。'
            : '方向键浏览项目，Right/Left 用于展开、收起或在父子项之间移动；Space 选择，多选模式下可切换选中。Home/End 和文字搜索可快速定位，行内操作使用独立 Tab 入口。应用分别通过选择、展开和焦点回调保存状态。'
      }
      onReset={() => {
        setItems(initial)
        setSelected(['notes'])
        setExpanded(['documents'])
        setFocused('notes')
        setEvents([])
        setReject(asyncRename)
        setRevision((n) => n + 1)
      }}>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setExpanded(['documents', 'reference'])}>Expand all</ControlButton>
        <ControlButton onClick={() => setExpanded([])}>Collapse all</ControlButton>
        {dynamic && (
          <>
            <ControlButton
              onClick={() => setItems((old) => [...old, { id: `added-${revision}`, name: `Added ${revision}` }])}
              disabled={collection.has(`added-${revision}`)}>
              Add item
            </ControlButton>
            <ControlButton
              onClick={() => {
                setItems((old) => remove(old, selected))
                record('remove selected')
              }}>
              Remove selected
            </ControlButton>
            <ControlButton onClick={() => setItems([])}>Clear</ControlButton>
          </>
        )}
        {asyncRename && (
          <ControlButton onClick={() => setReject((value) => !value)}>
            {reject ? 'Allow rename' : 'Reject rename'}
          </ControlButton>
        )}
        {dnd && (
          <>
            <ControlButton
              disabled={!selected.length || selected.includes('archive')}
              onClick={() => {
                setItems((old) => move(old, { keys: selected, targetKey: 'archive', position: 'inside' }))
                setExpanded((old) => [...new Set([...old, 'archive'])])
                record('move selected into Archive')
              }}>
              Move selected to Archive
            </ControlButton>
            <ControlButton
              disabled={!selected.length || selected.includes('documents')}
              onClick={() => {
                setItems((old) => move(old, { keys: selected, targetKey: 'documents', position: 'before' }))
                record('move selected to top')
              }}>
              Move selected to top
            </ControlButton>
          </>
        )}
      </div>
      <TreeRoot
        collection={collection}
        aria-label="Documents tree"
        selectionMode={multiple ? 'multiple' : 'single'}
        selectedKeys={selected}
        expandedKeys={expanded}
        focusedKey={focused}
        onSelectedKeysChange={(keys) => {
          record(`selection ${JSON.stringify(keys)}`)
          if (!freeze) setSelected(keys)
        }}
        onExpandedKeysChange={setExpanded}
        onFocusedKeyChange={setFocused}
        disabled={disabled}
        readOnly={readOnly}
        dragDrop={
          dnd
            ? {
                type: 'story/tree-items',
                resetKey: revision,
                canDrop: ({ targetKey, position }) => position !== 'inside' || !!collection.get(targetKey)?.children,
                onDrop: (request) => {
                  setItems((old) => move(old, request))
                  record(`drop ${JSON.stringify(request)}`)
                },
                onDragEnd: (result) =>
                  record(`drag ${result.status}${result.status === 'cancelled' ? `:${result.reason}` : ''}`),
              }
            : undefined
        }
        renderItem={(node) => (
          <TreeItemContent
            label={node.item.name}
            renameResetKey={revision}
            onRename={async (name) => {
              const requestedVersion = version.current
              record(`rename request ${String(node.key)}:${name}`)
              if (asyncRename) await new Promise((done) => setTimeout(done, 300))
              if (version.current !== requestedVersion) return
              if (reject) throw Error('Rename rejected. Allow rename and retry Enter.')
              setItems((old) => rename(old, node.key, name))
              record(`rename accepted ${String(node.key)}`)
            }}
            startSlot={
              <TreeItemIcon>{node.item.children ? <IconFolder size={14} /> : <IconFile size={14} />}</TreeItemIcon>
            }
            actions={
              dynamic && (
                <ActionButton
                  aria-label={`Delete ${node.item.name}`}
                  size="xs"
                  variant="subtle"
                  disabled={disabled || readOnly || node.disabled}
                  onClick={() => setItems((old) => remove(old, [node.key]))}>
                  <IconTrash size={12} />
                </ActionButton>
              )
            }
          />
        )}
        css={{ width: '100%', maxWidth: '360px' }}
      />
      {dnd && <DragState />}
      <StatePanel label="Tree state" value={{ selected, expanded, focused, keys: collection.keys, events }} />
    </ContractFrame>
  )
}
function DragState() {
  const state = useDragDropState()
  return <StatePanel label="Shared drag state" value={state} />
}
function DragExample() {
  return (
    <DragDropProvider>
      <TreeExample dnd multiple />
    </DragDropProvider>
  )
}
function DefaultExample() {
  const [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const collection = useMemo(() => createTreeCollection(initial, options), [])
  return (
    <ContractFrame
      title="设置树的初始状态"
      description="用 defaultSelectedKeys、defaultExpandedKeys 和 defaultFocusedKey 设置初始状态，之后由 TreeRoot 保存各自变化。方向键浏览只改变焦点，Space 才选择；下方分别记录三类回调。"
      onReset={() => {
        setRevision((n) => n + 1)
        setEvents([])
      }}>
      <TreeRoot
        key={revision}
        collection={collection}
        defaultSelectedKeys={['notes']}
        defaultExpandedKeys={['documents']}
        defaultFocusedKey="notes"
        onSelectedKeysChange={(keys) => setEvents((old) => [...old, `selected ${JSON.stringify(keys)}`])}
        onExpandedKeysChange={(keys) => setEvents((old) => [...old, `expanded ${JSON.stringify(keys)}`])}
        onFocusedKeyChange={(key) => setEvents((old) => [...old, `focus ${String(key)}`])}
      />
      <StatePanel label="Events" value={events} />
    </ContractFrame>
  )
}
function IdentityExample() {
  const [selected, setSelected] = useState<readonly CollectionKey[]>([])
  const collection = useMemo(
    () =>
      createTreeCollection(
        [
          { id: 1, name: 'Number 1' },
          { id: '1', name: 'String 1' },
          { id: '001', name: 'String 001' },
        ],
        options
      ),
    []
  )
  return (
    <ContractFrame
      title="用稳定标识区分节点"
      description="数字 1、字符串 1 和字符串 001 是三个独立的 key，选择回调保留其类型。为每个条目提供唯一的非空字符串或有限数字；createTreeCollection 会在重复或无效标识进入模型时报告错误。"
      onReset={() => setSelected([])}>
      <TreeRoot
        collection={collection}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
      />
      <StatePanel label="Selected identities" value={selected.map((key) => ({ type: typeof key, key }))} />
    </ContractFrame>
  )
}
const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Tree',
  parameters: {
    docs: {
      description: {
        component:
          'Tree 用于展示文件目录、场景层级等可展开的树形数据。createTreeCollection 根据稳定 key 和子项关系建立模型，TreeRoot 分别管理选择、展开与焦点；对应回调把请求交给应用。重命名和拖放由应用更新原始数据，键盘浏览与选择分开，行内操作保留自己的焦点入口。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <TreeExample /> }
export const DefaultState: Story = { render: () => <DefaultExample /> }
export const MultipleSelection: Story = { render: () => <TreeExample multiple /> }
export const ControlledSelection: Story = { render: () => <TreeExample freeze /> }
export const DynamicCollection: Story = { render: () => <TreeExample dynamic /> }
export const AsyncRename: Story = { render: () => <TreeExample asyncRename /> }
export const DragAndDrop: Story = { render: () => <DragExample /> }
export const TypedIdentity: Story = { render: () => <IdentityExample /> }
export const Availability: Story = {
  render: () => (
    <>
      <TreeExample disabled />
      <TreeExample readOnly />
    </>
  ),
}
