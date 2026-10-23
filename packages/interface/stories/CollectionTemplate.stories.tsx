import { useId, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CollectionTemplate } from '../src/templates/collections/CollectionTemplate'
import type { CollectionKey } from '../src/values/collection'
import { DragDropProvider } from '../src/interaction/drag-drop'
import { PropertyRow, PropertyLabel, PropertyControl } from '../src/layout/PropertyRow'
import { InputNumber } from '../src/widgets/inputs/InputNumber'
import { Checkbox } from '../src/widgets/choices/Checkbox'
import { Button } from '../src/widgets/buttons/Button'
import { css } from '../styled-system/css'

interface Layer {
  id: CollectionKey
  name: string
  weight: number
  enabled: boolean
}
const initial: readonly Layer[] = [
  { id: 1, name: 'Base layer', weight: 1, enabled: true },
  { id: '1', name: 'Detail layer', weight: 0.5, enabled: true },
  { id: 3, name: 'Highlights', weight: 0.2, enabled: false },
]
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'CollectionTemplate 用于编辑带稳定标识的条目列表，例如图层、材质槽或规则集合。它提供展开、选择、重命名、增删和排序入口，条目内容由 renderItem 组合。应用在 onAdd、onDelete、onRename、onReorder 中更新 items，并分别保存选择与展开状态；异步失败可通过 Promise rejection 显示错误并保留重试入口。',
      },
    },
  },
  title: 'Templates/CollectionTemplate',
  component: CollectionTemplate<Layer>,
  tags: ['autodocs'],
  args: { items: initial, getKey: (item: Layer) => item.id, getLabel: (item: Layer) => item.name },
} satisfies Meta<typeof CollectionTemplate<Layer>>
export default meta
type Story = StoryObj<typeof meta>
const frameClass = css({ display: 'grid', gap: '12px', width: 'min(520px, 100%)', minWidth: 0 })
const toolbarClass = css({ display: 'flex', flexWrap: 'wrap', gap: '6px' })
const outputClass = css({
  margin: 0,
  fontSize: '11px',
  maxHeight: '230px',
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
})

function CollectionExample({
  empty = false,
  async = false,
  external = false,
  availability = false,
  refusal = false,
}: {
  empty?: boolean
  async?: boolean
  external?: boolean
  availability?: boolean
  refusal?: boolean
}) {
  const [items, setItems] = useState<readonly Layer[]>(() => (empty ? [] : structuredClone(initial)))
  const [expanded, setExpanded] = useState<readonly CollectionKey[]>([1])
  const [selected, setSelected] = useState<readonly CollectionKey[]>([1])
  const [mode, setMode] = useState<'editable' | 'readonly' | 'disabled'>('editable')
  const [events, setEvents] = useState<string[]>([])
  const [rejectNext, setRejectNext] = useState(async)
  const [revision, setRevision] = useState(0)
  const generation = useRef(0),
    counter = useRef(4),
    weightStarts = useRef(new Map<CollectionKey, number>())
  const prefix = useId()
  const waitForHost = async () => {
    const started = generation.current
    if (async) await new Promise<void>((resolve) => setTimeout(resolve, 600))
    return started === generation.current
  }
  function reset() {
    generation.current++
    setItems(empty ? [] : structuredClone(initial))
    setExpanded([1])
    setSelected([1])
    setEvents([])
    setRejectNext(async)
    counter.current = 4
    weightStarts.current.clear()
    setRevision((value) => value + 1)
  }
  return (
    <div className={frameClass}>
      <p className={css({ margin: 0, fontSize: '12px', color: 'var(--colors-textMuted)' })}>
        {async
          ? '重命名通过 onRename 交给应用保存。此例等待 600ms 并拒绝首次请求，错误出现后保留草稿，按 Enter 可重试；Reset 更新请求版本，应用据此忽略此前结果。'
          : refusal
            ? '应用记录排序、选择和展开请求，但保持原来的 items、selectedKeys 与 expandedKeys。组件继续显示传入状态，应用接受请求时再回写对应值。'
            : '此列表把数字 key 1 与字符串 key `1` 作为两个条目。展开、选择、重命名、删除和移动各有独立的键盘入口；应用在对应回调中更新条目数据与界面状态。'}
      </p>
      <div className={toolbarClass}>
        <Button size="sm" onClick={reset}>
          Reset
        </Button>
        {async && (
          <Button size="sm" onClick={() => setRejectNext(true)}>
            Reject next rename
          </Button>
        )}
        {external && (
          <>
            <Button size="sm" onClick={() => setItems((value) => [...value].reverse())}>
              Reverse externally
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setExpanded(items.map((item) => item.id))
                setSelected(['1'])
              }}>
              Expand all / select detail
            </Button>
            <Button
              size="sm"
              onClick={() => {
                generation.current++
                setRevision((value) => value + 1)
                setItems((value) => value.map((item) => ({ ...item, name: `${item.name} updated` })))
              }}>
              External revision
            </Button>
          </>
        )}
        {availability &&
          (['editable', 'readonly', 'disabled'] as const).map((next) => (
            <Button key={next} size="sm" aria-pressed={mode === next} onClick={() => setMode(next)}>
              {next}
            </Button>
          ))}
      </div>
      <DragDropProvider>
        <CollectionTemplate
          label="Layers"
          items={items}
          getKey={(item) => item.id}
          getLabel={(item) => item.name}
          expandedKeys={expanded}
          selectedKeys={selected}
          selectionMode="multiple"
          onExpandedKeysChange={(keys) => {
            setEvents((list) => [...list, `expanded:${JSON.stringify(keys)}`])
            if (!refusal) setExpanded(keys)
          }}
          onSelectedKeysChange={(keys) => {
            setEvents((list) => [...list, `selected:${JSON.stringify(keys)}`])
            if (!refusal) setSelected(keys)
          }}
          disabled={mode === 'disabled'}
          readOnly={mode === 'readonly'}
          resetKey={revision}
          addLabel="Add layer"
          onAdd={async () => {
            const id = counter.current++
            if (!(await waitForHost())) return
            setItems((value) => [...value, { id, name: `Layer ${id}`, weight: 1, enabled: true }])
            setEvents((list) => [...list, `add:${id}`])
            return id
          }}
          onDelete={async (item) => {
            if (!(await waitForHost())) return
            setItems((value) => value.filter((entry) => entry.id !== item.id))
            setEvents((list) => [...list, `delete:${typeof item.id}:${item.id}`])
          }}
          onRename={async (item, name) => {
            const reject = rejectNext
            setRejectNext(false)
            if (!(await waitForHost())) return
            if (reject) {
              setEvents((list) => [...list, `rejected:${name}`])
              throw new Error('Name rejected once. Press Enter to retry.')
            }
            if (!name.trim()) throw new Error('A layer name is required.')
            setItems((value) => value.map((entry) => (entry.id === item.id ? { ...entry, name } : entry)))
            setEvents((list) => [...list, `rename:${name}`])
          }}
          onReorder={(next, change) => {
            setEvents((list) => [
              ...list,
              `move:${typeof change.key}:${change.key}:${change.fromIndex}→${change.toIndex}`,
            ])
            if (!refusal) setItems(next)
          }}
          renderItem={(item, context) => (
            <div className={css({ display: 'grid', gap: '6px' })}>
              <PropertyRow>
                <PropertyLabel htmlFor={`${prefix}-${typeof item.id}-${item.id}-weight`}>Weight</PropertyLabel>
                <PropertyControl association="control">
                  <InputNumber
                    id={`${prefix}-${typeof item.id}-${item.id}-weight`}
                    value={item.weight}
                    min={0}
                    max={1}
                    step={0.1}
                    disabled={context.disabled}
                    readOnly={context.readOnly}
                    resetKey={revision}
                    onEditStart={() => {
                      weightStarts.current.set(item.id, item.weight)
                    }}
                    onEditCancel={(reason) => {
                      if (['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only'].includes(reason)) {
                        const weight = weightStarts.current.get(item.id)
                        if (weight !== undefined)
                          setItems((value) =>
                            value.map((entry) => (entry.id === item.id ? { ...entry, weight } : entry))
                          )
                      }
                    }}
                    onValueChange={(weight) =>
                      setItems((value) => value.map((entry) => (entry.id === item.id ? { ...entry, weight } : entry)))
                    }
                  />
                </PropertyControl>
              </PropertyRow>
              <PropertyRow>
                <PropertyLabel htmlFor={`${prefix}-${typeof item.id}-${item.id}-enabled`}>Enabled</PropertyLabel>
                <PropertyControl association="control">
                  <Checkbox
                    id={`${prefix}-${typeof item.id}-${item.id}-enabled`}
                    checked={item.enabled}
                    disabled={context.disabled}
                    readOnly={context.readOnly}
                    onCheckedChange={(enabled) =>
                      setItems((value) => value.map((entry) => (entry.id === item.id ? { ...entry, enabled } : entry)))
                    }
                  />
                </PropertyControl>
              </PropertyRow>
            </div>
          )}
        />
      </DragDropProvider>
      <pre className={outputClass}>{JSON.stringify({ items, expanded, selected, mode, events }, null, 2)}</pre>
    </div>
  )
}
export const Overview: Story = { render: () => <CollectionExample /> }
export const Empty: Story = { render: () => <CollectionExample empty /> }
export const AsyncRename: Story = { render: () => <CollectionExample async /> }
export const ExternalState: Story = { render: () => <CollectionExample external /> }
export const Availability: Story = { render: () => <CollectionExample availability /> }
export const ControlledRefusal: Story = { render: () => <CollectionExample refusal /> }
