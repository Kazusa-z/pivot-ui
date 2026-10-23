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
          ? 'Tree drag and drop'
          : asyncRename
            ? 'Rename lifecycle'
            : dynamic
              ? 'Dynamic collection and focus'
              : freeze
                ? 'Controlled selection refused'
                : multiple
                  ? 'Multiple selection'
                  : 'Tree selection, expansion and focus'
      }
      description={
        dnd
          ? 'Drag row labels. Top/bottom quarters insert before/after; center inserts into a folder. Escape cancels. Self/descendant targets are rejected. The move buttons offer a keyboard-operable equivalent.'
          : asyncRename
            ? 'F2 or double-click the label. Enter/blur commit once, Escape cancels. First submission is rejected after 300ms; allow rename and retry Enter. Reset invalidates old responses.'
            : 'Arrow keys browse without selecting; Right/Left expand or move between parent and child. Space selects (toggles in multiple mode); Home/End and text search work. Actions are separate Tab stops.'
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
      title="Uncontrolled defaults"
      description="Default selection, expansion and focus each belong to TreeRoot. Keyboard focus does not change selection."
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
      title="Typed stable identity"
      description="Number 1, string 1 and string 001 are separate keys. Duplicate keys and nonfinite numbers are rejected at model creation."
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
const meta = { title: 'Widgets/Tree', parameters: { layout: 'fullscreen' } } satisfies Meta
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
