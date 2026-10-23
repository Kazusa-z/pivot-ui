import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type RefCallback,
} from 'react'
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconEdit,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { createCollection, type CollectionKey } from '../../values/collection'
import { Section } from '../../layout/Section'
import { ActionButton } from '../../widgets/buttons/ActionButton'
import { Button } from '../../widgets/buttons/Button'
import { Input } from '../../widgets/inputs/Input'
import { useTextEdit } from '../../widgets/inputs/useTextEdit'
import { useDragSource, useDropTarget } from '../../interaction/drag-drop'

export interface CollectionItemContext {
  readonly key: CollectionKey
  readonly index: number
  readonly expanded: boolean
  readonly selected: boolean
  readonly disabled: boolean
  readonly readOnly: boolean
}
export interface CollectionReorder {
  readonly key: CollectionKey
  readonly fromIndex: number
  readonly toIndex: number
}
export interface CollectionTemplateProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  items: readonly T[]
  getKey: (item: T) => CollectionKey
  getLabel: (item: T) => string
  renderItem?: (item: T, context: CollectionItemContext) => ReactNode
  expandedKeys?: readonly CollectionKey[]
  defaultExpandedKeys?: readonly CollectionKey[]
  onExpandedKeysChange?: (keys: readonly CollectionKey[]) => void
  selectedKeys?: readonly CollectionKey[]
  defaultSelectedKeys?: readonly CollectionKey[]
  onSelectedKeysChange?: (keys: readonly CollectionKey[]) => void
  selectionMode?: 'none' | 'single' | 'multiple'
  /** Resolve after the owner has accepted the addition. Returning its key makes the focus target explicit. */
  onAdd?: () => CollectionKey | void | Promise<CollectionKey | void>
  onDelete?: (item: T, key: CollectionKey) => void | Promise<void>
  onRename?: (item: T, name: string, key: CollectionKey) => void | Promise<void>
  /** Requests a new item order. Dragging requires an ancestor DragDropProvider; buttons are always available. */
  onReorder?: (items: readonly T[], change: CollectionReorder) => void | Promise<void>
  canDelete?: (item: T, key: CollectionKey) => boolean
  canRename?: (item: T, key: CollectionKey) => boolean
  label?: string
  addLabel?: string
  emptyContent?: ReactNode
  disabled?: boolean
  readOnly?: boolean
  resetKey?: unknown
  css?: SystemStyleObject
}
type Operation = { kind: 'add' | 'delete' | 'rename' | 'reorder'; key?: CollectionKey; epoch: object }
type DragItem = { scope: object; key: CollectionKey }
const dragType = 'pivot-collection-item'
const keyId = (key: CollectionKey) => `${typeof key}:${key}`
const unique = (keys: readonly CollectionKey[]) => [...new Set(keys)]
const actionClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',
  flexWrap: 'wrap',
  gap: '2px',
  minWidth: 0,
})
const errorClass = css({ color: 'var(--colors-dangerText)', fontSize: '12px', overflowWrap: 'anywhere' })

function RenameAction({
  label,
  disabled,
  readOnly,
  resetKey,
  onRename,
  externalError,
}: {
  label: string
  disabled: boolean
  readOnly: boolean
  resetKey: unknown
  onRename: (name: string) => Promise<void>
  externalError?: string
}) {
  const editor = useTextEdit({
    value: label,
    disabled,
    readOnly,
    resetKey,
    onCommit: (name) => (name === label ? undefined : onRename(name)),
  })
  const input = useRef<HTMLInputElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const restoreFocus = useRef(false)
  const previous = useRef(editor.phase)
  const errorId = useId()
  useLayoutEffect(() => {
    if (editor.phase === 'editing' && previous.current === 'idle') {
      input.current?.focus()
      input.current?.select()
    } else if (editor.phase === 'idle' && restoreFocus.current) {
      restoreFocus.current = false
      trigger.current?.focus()
    }
    previous.current = editor.phase
  }, [editor.phase])
  return (
    <>
      {editor.phase === 'idle' ? (
        <ActionButton
          ref={trigger}
          size="xs"
          variant="subtle"
          aria-label={`Rename ${label}`}
          disabled={disabled || readOnly}
          onClick={() => {
            restoreFocus.current = false
            editor.begin()
          }}>
          <IconEdit size={14} aria-hidden />
        </ActionButton>
      ) : (
        <Input
          {...editor.inputProps}
          ref={input}
          aria-label={`Rename ${label}`}
          value={editor.draft}
          disabled={disabled}
          readOnly={readOnly || editor.phase === 'pending'}
          aria-invalid={editor.error ? true : undefined}
          aria-describedby={editor.error ? (externalError ?? errorId) : undefined}
          aria-errormessage={editor.error ? (externalError ?? errorId) : undefined}
          css={css.raw({ width: '140px', maxWidth: '100%' })}
          onKeyDown={(event) => {
            editor.inputProps.onKeyDown(event)
            if (event.defaultPrevented && ['Enter', 'Escape'].includes(event.key)) restoreFocus.current = true
          }}
          onBlur={(event) => {
            restoreFocus.current = false
            editor.inputProps.onBlur(event)
          }}
        />
      )}
      {editor.phase === 'pending' && <span role="status">Saving…</span>}
      {editor.error && !externalError && (
        <span id={errorId} role="alert" className={errorClass}>
          {editor.error}
        </span>
      )}
    </>
  )
}

function DragRow({
  scope,
  itemKey,
  disabled,
  rowRef,
  onMove,
  children,
}: {
  scope: object
  itemKey: CollectionKey
  disabled: boolean
  rowRef: RefCallback<HTMLLIElement>
  onMove: (source: CollectionKey, target: CollectionKey) => void
  children: (handle: RefCallback<HTMLButtonElement>) => ReactNode
}) {
  const drag = useDragSource<DragItem, HTMLButtonElement>({
    type: dragType,
    data: { scope, key: itemKey },
    disabled,
    resetKey: scope,
    effectAllowed: 'move',
  })
  const drop = useDropTarget<DragItem, HTMLLIElement>({
    accept: [dragType],
    disabled,
    canDrop: ({ data }) => data.scope === scope && data.key !== itemKey,
    onDrop: ({ data }) => {
      if (data.scope !== scope || data.key === itemKey) return false
      onMove(data.key, itemKey)
      return true
    },
  })
  const externalRef = useRef(rowRef)
  externalRef.current = rowRef
  const combinedRef = useCallback(
    (node: HTMLLIElement | null) => {
      externalRef.current(node)
      drop.ref(node)
      drag.previewRef(node)
    },
    [drop.ref, drag.previewRef]
  )
  return (
    <li
      ref={combinedRef}
      tabIndex={-1}
      data-collection-row=""
      data-dragging={drag.isDragging || undefined}
      data-drop-target={(drop.isOver && drop.canDrop) || undefined}
      className={rowClass}>
      {children(drag.ref)}
    </li>
  )
}
const rowClass = css({
  listStyle: 'none',
  minWidth: 0,
  borderRadius: '4px',
  outlineOffset: '2px',
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)' },
  '&[data-dragging]': { opacity: 0.5 },
  '&[data-drop-target]': { outline: '2px solid var(--colors-focusRing)' },
})

/** Flat item data with independent expansion, selection and item actions. The caller owns all item mutations. */
export function CollectionTemplate<T>({
  items,
  getKey,
  getLabel,
  renderItem,
  expandedKeys,
  defaultExpandedKeys = [],
  onExpandedKeysChange,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectedKeysChange,
  selectionMode = 'single',
  onAdd,
  onDelete,
  onRename,
  onReorder,
  canDelete,
  canRename,
  label = 'Collection',
  addLabel = 'Add item',
  emptyContent = 'No items',
  disabled = false,
  readOnly = false,
  resetKey,
  css: cssProp,
  className,
  ...props
}: CollectionTemplateProps<T>) {
  const collection = createCollection(items, getKey)
  const [localExpanded, setLocalExpanded] = useState(() => unique(defaultExpandedKeys))
  const [localSelected, setLocalSelected] = useState(() => unique(defaultSelectedKeys))
  const expanded = expandedKeys ?? localExpanded,
    selected = selectedKeys ?? localSelected
  const [pending, setPending] = useState<Operation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const operation = useRef<Operation | null>(null)
  const epoch = useMemo(() => ({}), [resetKey, disabled, readOnly])
  const previousEpoch = useRef(epoch)
  const previousResetKey = useRef(resetKey)
  const mounted = useRef(true)
  const root = useRef<HTMLDivElement>(null),
    addButton = useRef<HTMLButtonElement>(null)
  const rowElements = useRef(new Map<CollectionKey, HTMLLIElement>()),
    selectionButtons = useRef(new Map<CollectionKey, HTMLButtonElement>())
  const focusedKey = useRef<CollectionKey | null>(null)
  const previousKeys = useRef(collection.keys)
  const pendingFocus = useRef<{
    key?: CollectionKey
    previousKeys?: ReadonlySet<CollectionKey>
    select: boolean
  } | null>(null)
  const pendingDelete = useRef<{ key: CollectionKey; index: number } | null>(null)
  const [, refreshFocus] = useState(0)
  const latest = useRef({
    collection,
    expanded,
    selected,
    expandedKeys,
    selectedKeys,
    onExpandedKeysChange,
    onSelectedKeysChange,
    selectionMode,
    disabled,
    readOnly,
    epoch,
  })
  latest.current = {
    collection,
    expanded,
    selected,
    expandedKeys,
    selectedKeys,
    onExpandedKeysChange,
    onSelectedKeysChange,
    selectionMode,
    disabled,
    readOnly,
    epoch,
  }
  const expandedSet = new Set(expanded),
    selectedSet = new Set(selected)
  function setExpanded(next: readonly CollectionKey[]) {
    const current = latest.current
    const keys = unique(next)
    if (current.expandedKeys === undefined) setLocalExpanded(keys)
    current.onExpandedKeysChange?.(keys)
  }
  function setSelected(next: readonly CollectionKey[]) {
    const current = latest.current
    const keys = unique(next)
    if (current.selectedKeys === undefined) setLocalSelected(keys)
    current.onSelectedKeysChange?.(keys)
  }
  function focus(key: CollectionKey | null) {
    if (key === null) (addButton.current ?? root.current)?.focus()
    else (selectionButtons.current.get(key) ?? rowElements.current.get(key))?.focus()
  }
  function requestFocus(key: CollectionKey, select = false) {
    pendingFocus.current = { key, select }
    refreshFocus((value) => value + 1)
  }
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      operation.current = null
      pendingFocus.current = null
      pendingDelete.current = null
    }
  }, [])
  useLayoutEffect(() => {
    if (previousEpoch.current !== epoch) {
      const reset = !Object.is(previousResetKey.current, resetKey)
      previousResetKey.current = resetKey
      previousEpoch.current = epoch
      operation.current = null
      pendingFocus.current = null
      pendingDelete.current = null
      setPending(null)
      setError(null)
      if (reset) {
        if (expandedKeys === undefined) setLocalExpanded(unique(defaultExpandedKeys))
        if (selectedKeys === undefined) setLocalSelected(unique(defaultSelectedKeys))
      }
    }
  }, [epoch])
  useLayoutEffect(() => {
    const current = latest.current
    const deleted = pendingDelete.current
    if (deleted) {
      pendingDelete.current = null
      if (!current.collection.has(deleted.key)) {
        const next = current.collection.keys[Math.min(deleted.index, current.collection.size - 1)]
        if (current.expanded.includes(deleted.key))
          setExpanded(current.expanded.filter((value) => value !== deleted.key))
        if (current.selected.includes(deleted.key))
          setSelected(
            current.selectionMode === 'single' && next !== undefined
              ? [next]
              : current.selected.filter((value) => value !== deleted.key)
          )
        focus(next ?? null)
      }
    }
    const desired = pendingFocus.current
    if (desired) {
      pendingFocus.current = null
      const key = desired.key ?? current.collection.keys.find((value) => !desired.previousKeys?.has(value))
      if (key !== undefined && current.collection.has(key)) {
        focus(key)
        if (desired.select && current.selectionMode !== 'none')
          setSelected(current.selectionMode === 'multiple' ? [...current.selected, key] : [key])
      }
    }
    const oldKeys = previousKeys.current
    const removed = focusedKey.current !== null && !current.collection.has(focusedKey.current)
    if (removed && (root.current?.contains(document.activeElement) || document.activeElement === document.body)) {
      const at = oldKeys.indexOf(focusedKey.current!)
      focus(current.collection.keys[Math.min(Math.max(at, 0), current.collection.size - 1)] ?? null)
    }
    previousKeys.current = current.collection.keys
  })
  function run<R>(
    kind: Operation['kind'],
    key: CollectionKey | undefined,
    action: () => R | Promise<R>,
    accepted?: (result: R) => void
  ): Promise<void> {
    const current = latest.current
    if (current.disabled || current.readOnly || operation.current) return Promise.resolve()
    const active: Operation = { kind, key, epoch: current.epoch }
    operation.current = active
    setPending(active)
    setError(null)
    const isCurrent = () => mounted.current && operation.current === active && latest.current.epoch === active.epoch
    const finish = (cause?: unknown, result?: R) => {
      if (isCurrent()) {
        operation.current = null
        setPending(null)
        if (cause !== undefined) {
          if (kind !== 'rename' && (key === undefined || latest.current.collection.has(key)))
            setError(cause instanceof Error ? cause.message : String(cause))
        } else accepted?.(result as R)
      }
      if (cause !== undefined) throw cause
    }
    try {
      return Promise.resolve(action()).then(
        (result) => finish(undefined, result),
        (cause) => finish(cause ?? new Error('Operation rejected'))
      )
    } catch (cause) {
      return Promise.reject(cause).catch((error) => finish(error ?? new Error('Operation rejected')))
    }
  }
  function move(key: CollectionKey, toIndex: number) {
    const current = latest.current,
      fromIndex = current.collection.indexOf(key)
    if (!onReorder || fromIndex < 0 || toIndex < 0 || toIndex >= current.collection.size || fromIndex === toIndex)
      return
    const next = [...current.collection.items],
      [item] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, item)
    void run(
      'reorder',
      key,
      () => onReorder(next, { key, fromIndex, toIndex }),
      () => requestFocus(key)
    ).catch(() => {})
  }
  return (
    <div
      {...props}
      ref={root}
      tabIndex={props.tabIndex ?? -1}
      role="group"
      aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : label)}
      aria-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      className={cx(
        css({ display: 'grid', gap: '6px', minWidth: 0, width: '100%', color: 'var(--colors-text)' }, cssProp),
        className
      )}>
      <ul className={css({ display: 'grid', gap: '4px', padding: 0, margin: 0, minWidth: 0 })} aria-label={label}>
        {collection.items.map((item, index) => {
          const key = collection.keys[index],
            name = getLabel(item)
          if (typeof name !== 'string') throw new TypeError('Collection labels must be strings.')
          const context: CollectionItemContext = {
            key,
            index,
            expanded: expandedSet.has(key),
            selected: selectedSet.has(key),
            disabled,
            readOnly,
          }
          const mutationsLocked = disabled || readOnly || !!pending
          const rowRef: RefCallback<HTMLLIElement> = (node) => {
            if (node) rowElements.current.set(key, node)
            else rowElements.current.delete(key)
          }
          const content = (dragRef?: RefCallback<HTMLButtonElement>) => (
            <div
              onFocusCapture={() => {
                focusedKey.current = key
              }}>
              <Section
                title={name}
                triggerMode="icon"
                triggerLabel={`${context.expanded ? 'Collapse' : 'Expand'} ${name}`}
                collapsible={!!renderItem}
                open={context.expanded}
                onOpenChange={(open) => {
                  if (!disabled)
                    setExpanded(
                      open
                        ? [...latest.current.expanded, key]
                        : latest.current.expanded.filter((value) => value !== key)
                    )
                }}
                disabled={disabled}
                variant="surface"
                css={css.raw({ '&[data-selected]': { borderColor: 'var(--colors-focusRing)' } })}
                data-selected={context.selected ? '' : undefined}
                actions={
                  <div className={actionClass}>
                    {selectionMode !== 'none' && (
                      <ActionButton
                        ref={(node) => {
                          if (node) selectionButtons.current.set(key, node)
                          else selectionButtons.current.delete(key)
                        }}
                        size="xs"
                        variant="subtle"
                        aria-label={`Select ${name}`}
                        aria-pressed={context.selected}
                        disabled={disabled}
                        onClick={() =>
                          setSelected(
                            selectionMode === 'single'
                              ? [key]
                              : context.selected
                                ? latest.current.selected.filter((value) => value !== key)
                                : [...latest.current.selected, key]
                          )
                        }>
                        <IconCheck size={14} aria-hidden />
                      </ActionButton>
                    )}
                    {onRename && (canRename?.(item, key) ?? true) && (
                      <RenameAction
                        externalError={props['aria-errormessage']}
                        label={name}
                        disabled={disabled}
                        readOnly={readOnly || (!!pending && !(pending.kind === 'rename' && pending.key === key))}
                        resetKey={epoch}
                        onRename={(next) => run('rename', key, () => onRename(item, next, key))}
                      />
                    )}
                    {onReorder && (
                      <>
                        <ActionButton
                          ref={dragRef}
                          size="xs"
                          variant="subtle"
                          aria-label={`Drag ${name}`}
                          disabled={mutationsLocked}>
                          <IconGripVertical size={14} aria-hidden />
                        </ActionButton>
                        <ActionButton
                          size="xs"
                          variant="subtle"
                          aria-label={`Move ${name} up`}
                          disabled={mutationsLocked || index === 0}
                          onClick={() => move(key, index - 1)}>
                          <IconArrowUp size={14} aria-hidden />
                        </ActionButton>
                        <ActionButton
                          size="xs"
                          variant="subtle"
                          aria-label={`Move ${name} down`}
                          disabled={mutationsLocked || index === collection.size - 1}
                          onClick={() => move(key, index + 1)}>
                          <IconArrowDown size={14} aria-hidden />
                        </ActionButton>
                      </>
                    )}
                    {onDelete && (canDelete?.(item, key) ?? true) && (
                      <ActionButton
                        size="xs"
                        variant="subtle"
                        aria-label={`Delete ${name}`}
                        disabled={mutationsLocked}
                        loading={pending?.kind === 'delete' && pending.key === key}
                        onClick={() => {
                          void run(
                            'delete',
                            key,
                            () => onDelete(item, key),
                            () => {
                              pendingDelete.current = { key, index }
                              refreshFocus((value) => value + 1)
                            }
                          ).catch(() => {})
                        }}>
                        <IconTrash size={14} aria-hidden />
                      </ActionButton>
                    )}
                  </div>
                }>
                {renderItem?.(item, context)}
              </Section>
            </div>
          )
          return onReorder ? (
            <DragRow
              key={keyId(key)}
              scope={epoch}
              itemKey={key}
              disabled={mutationsLocked}
              rowRef={rowRef}
              onMove={(source, target) => move(source, latest.current.collection.indexOf(target))}>
              {content}
            </DragRow>
          ) : (
            <li key={keyId(key)} ref={rowRef} tabIndex={-1} data-collection-row="" className={rowClass}>
              {content()}
            </li>
          )
        })}
      </ul>
      {collection.size === 0 && (
        <div className={css({ padding: '12px', color: 'var(--colors-textMuted)', fontSize: '12px' })}>
          {emptyContent}
        </div>
      )}
      {onAdd && (
        <Button
          ref={addButton}
          type="button"
          size="sm"
          fullWidth
          disabled={disabled || readOnly || !!pending}
          loading={pending?.kind === 'add'}
          startSlot={<IconPlus size={14} aria-hidden />}
          onClick={() => {
            const oldKeys = new Set(latest.current.collection.keys)
            void run('add', undefined, onAdd, (added) => {
              pendingFocus.current = {
                key: typeof added === 'string' || typeof added === 'number' ? added : undefined,
                previousKeys: oldKeys,
                select: true,
              }
              refreshFocus((value) => value + 1)
            }).catch(() => {})
          }}>
          {addLabel}
        </Button>
      )}
      {error && !props['aria-errormessage'] && (
        <span role="alert" className={errorClass}>
          {error}
        </span>
      )}
    </div>
  )
}
