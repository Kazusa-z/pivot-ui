import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from 'react'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import type { CollectionKey } from '../../values/collection'
import { canMoveTreeItems, type TreeCollection, type TreeNode, type TreeDropPosition } from '../../values/tree'
import type { DragResult } from '../../values/drag-drop'
import { useDragSource, useDropTarget } from '../../interaction/drag-drop'
import { useTextEdit, type TextEditCommitReason } from '../../controls/inputs/useTextEdit'
import { Input } from '../../controls/inputs/Input'

export type TreeSelectionMode = 'none' | 'single' | 'multiple'
export type TreeDensity = 'compact' | 'regular'
export interface TreeDragData {
  readonly treeId: string
  readonly keys: readonly CollectionKey[]
}
export interface TreeDropRequest {
  readonly keys: readonly CollectionKey[]
  readonly targetKey: CollectionKey
  readonly position: TreeDropPosition
}
export interface TreeDragDropOptions {
  /** 拖放数据类型，只有相同 type 的树之间可以互相拖放。 */
  type: string
  resetKey?: unknown
  /** 判断某个放置位置是否允许，用于显示禁止状态。 */
  canDrop?: (request: TreeDropRequest) => boolean
  /** 放下时调用；应用移动数据并更新 `collection`，返回 `false` 表示拒绝。 */
  onDrop: (request: TreeDropRequest) => boolean | void
  /** 拖动结束（放下或取消）时调用。 */
  onDragEnd?: (result: DragResult<TreeDragData>) => void
}
export interface TreeItemState {
  readonly selected: boolean
  readonly expanded: boolean
  readonly focused: boolean
  readonly disabled: boolean
  readonly level: number
  readonly density: TreeDensity
}
export interface TreeRootProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  /** 树数据，用 `createTreeCollection(nodes)` 创建；数据变化时重新创建。 */
  collection: TreeCollection<T>
  /** `single` 单选（默认）、`multiple` 多选（Shift 范围、Ctrl / ⌘ 追加）、`none` 只浏览。 */
  selectionMode?: TreeSelectionMode
  /** 行高：`compact` 24（默认）、`regular` 32。 */
  density?: TreeDensity
  /** 选中的节点 key（受控）。 */
  selectedKeys?: readonly CollectionKey[]
  /** 非受控时初始选中的节点。 */
  defaultSelectedKeys?: readonly CollectionKey[]
  /** 选择变化请求。 */
  onSelectedKeysChange?: (keys: readonly CollectionKey[]) => void
  /** 展开的节点 key（受控）。 */
  expandedKeys?: readonly CollectionKey[]
  /** 非受控时初始展开的节点。 */
  defaultExpandedKeys?: readonly CollectionKey[]
  /** 展开变化请求。 */
  onExpandedKeysChange?: (keys: readonly CollectionKey[]) => void
  /** 键盘焦点所在的节点（受控）。 */
  focusedKey?: CollectionKey | null
  /** 非受控时初始的焦点节点。 */
  defaultFocusedKey?: CollectionKey | null
  /** 焦点节点变化时调用。 */
  onFocusedKeyChange?: (key: CollectionKey | null) => void
  /** 按 Enter 激活节点时调用，例如打开资源。 */
  onActivate?: (key: CollectionKey) => void
  /** 禁用整棵树。 */
  disabled?: boolean
  /** 只读：不能选择、改名或移动，但仍可展开浏览。 */
  readOnly?: boolean
  /** 启用树节点拖放。外层包裹 DragDropProvider，应用在移动回调中更新树数据。 */
  dragDrop?: TreeDragDropOptions
  /** 自定义节点结构（`TreeItem` 等部件）；通常用 `renderItem` 即可。 */
  children?: ReactNode
  /** 渲染每个节点的内容，通常返回 `TreeItemContent`。 */
  renderItem?: (node: TreeNode<T>, state: TreeItemState) => ReactNode
  /** 树为空时显示的内容。 */
  emptyContent?: ReactNode
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}
interface TreeContextValue {
  collection: TreeCollection<unknown>
  selected: readonly CollectionKey[]
  expanded: readonly CollectionKey[]
  visible: readonly CollectionKey[]
  focusable: readonly CollectionKey[]
  focused: CollectionKey | null
  disabled: boolean
  readOnly: boolean
  mode: TreeSelectionMode
  density: TreeDensity
  id: string
  dragDrop?: TreeDragDropOptions
  typeahead: { text: string; time: number }
  elements: Map<CollectionKey, HTMLDivElement>
  renamers: Map<CollectionKey, () => void>
  select(key: CollectionKey, toggle?: boolean, range?: boolean): void
  expand(key: CollectionKey): void
  focus(key: CollectionKey): void
  activate(key: CollectionKey): void
  selectAll(): void
}
const TreeContext = createContext<TreeContextValue | null>(null)
const ItemContext = createContext<CollectionKey | null>(null)
function useTree() {
  const tree = useContext(TreeContext)
  if (!tree) throw new Error('Tree parts must be placed inside TreeRoot.')
  return tree
}
function useItem() {
  const tree = useTree()
  const key = useContext(ItemContext)
  if (key === null) throw new Error('This Tree part must be placed inside TreeItem.')
  return { tree, key, node: tree.collection.getNode(key)! }
}
const sameKeys = (a: readonly CollectionKey[], b: readonly CollectionKey[]) =>
  a.length === b.length && a.every((key, index) => key === b[index])
const keyToken = (key: CollectionKey) => `${typeof key}:${String(key)}`
function itemState(tree: TreeContextValue, node: TreeNode<unknown>): TreeItemState {
  return {
    selected: tree.selected.includes(node.key),
    expanded: tree.expanded.includes(node.key),
    focused: tree.focused === node.key,
    disabled: tree.disabled || node.disabled,
    level: node.level,
    density: tree.density,
  }
}

export const TreeRoot = forwardRef(function TreeRoot<T>(
  {
    collection,
    selectionMode = 'single',
    density = 'compact',
    selectedKeys,
    defaultSelectedKeys = [],
    onSelectedKeysChange,
    expandedKeys,
    defaultExpandedKeys = [],
    onExpandedKeysChange,
    focusedKey,
    defaultFocusedKey = null,
    onFocusedKeyChange,
    onActivate,
    disabled = false,
    readOnly = false,
    dragDrop,
    renderItem,
    children,
    emptyContent = 'No items',
    css: cssProp,
    className,
    ...props
  }: TreeRootProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const root = useRef<HTMLDivElement>(null)
  const elements = useRef(new Map<CollectionKey, HTMLDivElement>())
  const renamers = useRef(new Map<CollectionKey, () => void>())
  const id = useId()
  const typeahead = useRef({ text: '', time: 0 })
  const [internalSelected, setSelected] = useState(defaultSelectedKeys)
  const [internalExpanded, setExpanded] = useState(defaultExpandedKeys)
  const [internalFocused, setFocused] = useState(defaultFocusedKey)
  const rawSelected = selectedKeys ?? internalSelected
  const selected = [...new Set(rawSelected)]
    .filter((key) => collection.has(key))
    .slice(0, selectionMode === 'none' ? 0 : selectionMode === 'single' ? 1 : undefined)
  const rawExpanded = expandedKeys ?? internalExpanded
  const expanded = [...new Set(rawExpanded)].filter((key) => !!collection.getNode(key)?.childrenKeys.length)
  const visible = collection.getVisibleKeys(expanded)
  const focusable = disabled ? [] : visible.filter((key) => !collection.getNode(key)!.disabled)
  const requestedFocus = focusedKey === undefined ? internalFocused : focusedKey
  const previousVisible = useRef(focusable)
  const focusCorrection = useRef<{ requested: CollectionKey | null; resolved: CollectionKey | null } | null>(null)
  let focused = requestedFocus !== null && focusable.includes(requestedFocus) ? requestedFocus : null
  if (focused === null && requestedFocus !== null) {
    let node = collection.getNode(requestedFocus)
    while (node?.parentKey != null) {
      if (focusable.includes(node.parentKey)) {
        focused = node.parentKey
        break
      }
      node = collection.getNode(node.parentKey)
    }
  }
  if (
    focused === null &&
    focusCorrection.current?.requested === requestedFocus &&
    focusCorrection.current.resolved !== null &&
    focusable.includes(focusCorrection.current.resolved)
  )
    focused = focusCorrection.current.resolved
  if (focused === null)
    focused =
      focusable[Math.max(0, Math.min(previousVisible.current.indexOf(requestedFocus!), focusable.length - 1))] ?? null
  const focusRequested = useRef<CollectionKey | null>(null)
  const hadFocus = useRef(false)
  const anchor = useRef<CollectionKey | null>(null)
  const latest = useRef({ onSelectedKeysChange, onExpandedKeysChange, onFocusedKeyChange })
  latest.current = { onSelectedKeysChange, onExpandedKeysChange, onFocusedKeyChange }
  const selectionSignature = JSON.stringify(rawSelected.map(keyToken))
  const expansionSignature = JSON.stringify(rawExpanded.map(keyToken))
  const selectedSignature = JSON.stringify(selected.map(keyToken))
  const expandedSignature = JSON.stringify(expanded.map(keyToken))
  const correctedSelection = useRef<string | null>(null)
  const correctedExpansion = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (!sameKeys(rawSelected, selected)) {
      if (selectedKeys === undefined) setSelected(selected)
      const correction = `${selectionSignature}>${selectedSignature}`
      if (correctedSelection.current !== correction) {
        correctedSelection.current = correction
        latest.current.onSelectedKeysChange?.(selected)
      }
    } else correctedSelection.current = null
    if (!sameKeys(rawExpanded, expanded)) {
      if (expandedKeys === undefined) setExpanded(expanded)
      const correction = `${expansionSignature}>${expandedSignature}`
      if (correctedExpansion.current !== correction) {
        correctedExpansion.current = correction
        latest.current.onExpandedKeysChange?.(expanded)
      }
    } else correctedExpansion.current = null
  }, [selectionSignature, expansionSignature, selectedSignature, expandedSignature])
  useLayoutEffect(() => {
    if (requestedFocus !== focused) {
      if (focusedKey === undefined) setFocused(focused)
      if (focusCorrection.current?.requested !== requestedFocus || focusCorrection.current.resolved !== focused) {
        focusCorrection.current = { requested: requestedFocus, resolved: focused }
        latest.current.onFocusedKeyChange?.(focused)
      }
    } else focusCorrection.current = null
    previousVisible.current = focusable
    const element = focused === null ? root.current : elements.current.get(focused)
    const active = root.current?.ownerDocument.activeElement
    if (
      element &&
      ((focusRequested.current !== null && focusRequested.current === focused) ||
        (hadFocus.current &&
          (!active ||
            !root.current?.contains(active) ||
            (active === root.current && focused !== null) ||
            (active.getAttribute('role') === 'treeitem' && active !== element))))
    ) {
      focusRequested.current = null
      element.focus()
    }
  }, [collection, focused, requestedFocus, focusedKey, expansionSignature, disabled])
  const updateSelection = (next: readonly CollectionKey[]) => {
    if (sameKeys(next, selected)) return
    if (selectedKeys === undefined) setSelected(next)
    onSelectedKeysChange?.(next)
  }
  const tree: TreeContextValue = {
    collection,
    selected,
    expanded,
    visible,
    focusable,
    focused,
    disabled,
    readOnly,
    mode: selectionMode,
    density,
    id,
    dragDrop,
    typeahead: typeahead.current,
    elements: elements.current,
    renamers: renamers.current,
    focus(key) {
      if (!focusable.includes(key)) return
      focusRequested.current = key
      if (key === focused) {
        elements.current.get(key)?.focus()
        focusRequested.current = null
      }
      if (focusedKey === undefined) setFocused(key)
      if (key !== focused) onFocusedKeyChange?.(key)
    },
    select(key, toggle = false, range = false) {
      if (disabled || readOnly || selectionMode === 'none' || collection.getNode(key)?.disabled) return
      let next: readonly CollectionKey[] = [key]
      if (selectionMode === 'multiple') {
        const rangeStart = anchor.current !== null && focusable.includes(anchor.current) ? anchor.current : focused
        if (range && rangeStart !== null && focusable.includes(rangeStart)) {
          anchor.current = rangeStart
          const a = focusable.indexOf(rangeStart),
            b = focusable.indexOf(key)
          next = focusable.slice(Math.min(a, b), Math.max(a, b) + 1)
        } else if (toggle) next = selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key]
      }
      if (!range) anchor.current = key
      updateSelection(next)
    },
    expand(key) {
      if (disabled || collection.getNode(key)?.disabled || !collection.getNode(key)?.childrenKeys.length) return
      const next = expanded.includes(key) ? expanded.filter((item) => item !== key) : [...expanded, key]
      if (expandedKeys === undefined) setExpanded(next)
      onExpandedKeysChange?.(next)
    },
    activate: (key) => {
      if (!disabled && !collection.getNode(key)?.disabled) onActivate?.(key)
    },
    selectAll: () => {
      if (!disabled && !readOnly && selectionMode === 'multiple') updateSelection(focusable)
    },
  }
  const render = (keys: readonly CollectionKey[]): ReactNode =>
    keys.map((key) => {
      const node = collection.getNode(key)!
      return (
        <TreeItem key={keyToken(key)} itemKey={key}>
          {renderItem?.(node, itemState(tree, node)) ?? <TreeItemContent label={node.textValue} />}
          {!!node.childrenKeys.length && <TreeGroup>{render(node.childrenKeys)}</TreeGroup>}
        </TreeItem>
      )
    })
  return (
    <TreeContext.Provider value={tree}>
      <div
        {...props}
        ref={(node) => {
          root.current = node
          if (typeof ref === 'function') return ref(node)
          if (ref) ref.current = node
        }}
        role="tree"
        aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : 'Tree')}
        aria-multiselectable={selectionMode === 'multiple' || undefined}
        aria-disabled={disabled || undefined}
        data-density={density}
        tabIndex={focused === null && !disabled ? 0 : -1}
        className={cx(
          css(
            {
              minWidth: 0,
              color: 'var(--colors-text)',
              fontSize: 'var(--tree-font-size, var(--fontSizes-control))',
              outline: 'none',
              '--tree-row-height': 'var(--sizes-controlSm)',
              '--tree-font-size': 'var(--fontSizes-control)',
              '&[data-density=regular]': {
                '--tree-row-height': 'var(--sizes-controlMd)',
                '--tree-font-size': 'var(--fontSizes-controlLarge)',
              },
              '&:focus-visible': { outline: '2px solid var(--colors-focusRing)' },
            },
            cssProp
          ),
          className
        )}
        onFocusCapture={(event) => {
          hadFocus.current = true
          props.onFocusCapture?.(event)
        }}
        onBlurCapture={(event) => {
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) hadFocus.current = false
          props.onBlurCapture?.(event)
        }}>
        {collection.size ? (
          (children ?? render(collection.rootKeys))
        ) : (
          <div
            role="presentation"
            className={css({
              padding: 'var(--space-3)',
              color: 'var(--colors-textMuted)',
              fontSize: 'var(--tree-font-size, var(--fontSizes-control))',
            })}>
            {emptyContent}
          </div>
        )}
      </div>
    </TreeContext.Provider>
  )
}) as <T>(props: TreeRootProps<T> & RefAttributes<HTMLDivElement>) => ReactElement

export interface TreeItemProps extends HTMLAttributes<HTMLDivElement> {
  itemKey: CollectionKey
  css?: SystemStyleObject
}
export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(function TreeItem(
  { itemKey, css: cssProp, className, ...props },
  ref
) {
  const tree = useTree()
  const node = tree.collection.getNode(itemKey)
  if (!node) throw new Error(`Unknown TreeItem key: ${keyToken(itemKey)}`)
  if (!tree.visible.includes(itemKey)) return null
  const state = itemState(tree, node)
  return (
    <ItemContext.Provider value={itemKey}>
      <div
        {...props}
        ref={(element) => {
          if (element) tree.elements.set(itemKey, element)
          else tree.elements.delete(itemKey)
          if (typeof ref === 'function') return ref(element)
          if (ref) ref.current = element
        }}
        role="treeitem"
        tabIndex={state.focused && !state.disabled ? 0 : -1}
        aria-label={props['aria-label'] ?? node.textValue}
        aria-selected={tree.mode === 'none' ? undefined : state.selected}
        aria-expanded={node.childrenKeys.length ? state.expanded : undefined}
        aria-disabled={state.disabled || undefined}
        aria-level={node.level}
        aria-posinset={node.position}
        aria-setsize={node.setSize}
        data-state={state.selected ? 'selected' : 'unselected'}
        data-tree-key={keyToken(itemKey)}
        className={cx(
          css(
            {
              position: 'relative',
              minWidth: 0,
              outline: 'none',
              '&:focus-visible > [data-tree-content]': {
                outline: '2px solid var(--colors-focusRing)',
                outlineOffset: '-2px',
              },
            },
            cssProp
          ),
          className
        )}
        onFocus={(event) => {
          props.onFocus?.(event)
          if (event.target === event.currentTarget && !state.disabled && tree.focused !== itemKey) tree.focus(itemKey)
        }}
        onKeyDown={(event) => {
          props.onKeyDown?.(event)
          if (event.defaultPrevented || event.target !== event.currentTarget || state.disabled) return
          const index = tree.focusable.indexOf(itemKey)
          let next: CollectionKey | undefined
          switch (event.key) {
            case 'ArrowDown':
              next = tree.focusable[index + 1]
              break
            case 'ArrowUp':
              next = tree.focusable[index - 1]
              break
            case 'Home':
              next = tree.focusable[0]
              break
            case 'End':
              next = tree.focusable[tree.focusable.length - 1]
              break
            case 'ArrowRight':
              if (!state.expanded) tree.expand(itemKey)
              else next = node.childrenKeys.find((key) => tree.focusable.includes(key))
              break
            case 'ArrowLeft':
              if (state.expanded) tree.expand(itemKey)
              else if (node.parentKey !== null) next = node.parentKey
              break
            case ' ':
              tree.select(itemKey, tree.mode === 'multiple', event.shiftKey)
              break
            case 'Enter':
              tree.select(itemKey, event.ctrlKey || event.metaKey, event.shiftKey)
              tree.activate(itemKey)
              break
            case 'F2':
              if (!tree.readOnly) tree.renamers.get(itemKey)?.()
              break
            default: {
              if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') tree.selectAll()
              else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                const now = Date.now()
                const previous = tree.typeahead
                const text =
                  now - previous.time < 700
                    ? previous.text + event.key.toLocaleLowerCase()
                    : event.key.toLocaleLowerCase()
                tree.typeahead.text = text
                tree.typeahead.time = now
                const search = text.split('').every((letter) => letter === text[0]) ? text[0] : text
                const ordered = [...tree.focusable.slice(index + 1), ...tree.focusable.slice(0, index + 1)]
                next = ordered.find((key) =>
                  tree.collection.getNode(key)!.textValue.toLocaleLowerCase().startsWith(search)
                )
              } else return
            }
          }
          event.preventDefault()
          event.stopPropagation()
          if (next !== undefined) {
            tree.focus(next)
            if (event.shiftKey && tree.mode === 'multiple' && (event.key === 'ArrowDown' || event.key === 'ArrowUp'))
              tree.select(next, false, true)
          }
        }}
      />
    </ItemContext.Provider>
  )
})

export interface TreeGroupProps extends HTMLAttributes<HTMLDivElement> {
  css?: SystemStyleObject
}
export const TreeGroup = forwardRef<HTMLDivElement, TreeGroupProps>(function TreeGroup(
  { css: cssProp, className, ...props },
  ref
) {
  const { tree, key } = useItem()
  if (!tree.expanded.includes(key)) return null
  return <div {...props} ref={ref} role="group" className={cx(css({ minWidth: 0 }, cssProp), className)} />
})

export interface TreeItemContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label: string
  startSlot?: ReactNode
  actions?: ReactNode
  onRename?: (value: string, reason: TextEditCommitReason) => void | Promise<void>
  /** Invalidate a rename when the host replaces this item with the same label. */
  renameResetKey?: unknown
  css?: SystemStyleObject
}
export const TreeItemContent = forwardRef<HTMLDivElement, TreeItemContentProps>(function TreeItemContent(
  { label, startSlot, actions, onRename, renameResetKey, css: cssProp, className, children, ...props },
  ref
) {
  const { tree, key, node } = useItem()
  const state = itemState(tree, node)
  const editor = useTextEdit({
    value: label,
    resetKey: renameResetKey ?? key,
    disabled: state.disabled,
    readOnly: tree.readOnly || !onRename,
    onCommit: (draft, reason) => onRename?.(draft, reason),
  })
  const input = useRef<HTMLInputElement>(null)
  const restoreFocus = useRef(false)
  const previousPhase = useRef(editor.phase)
  const errorId = useId()
  const begin = useRef(editor.begin)
  begin.current = editor.begin
  useLayoutEffect(() => {
    tree.renamers.set(key, () => begin.current())
    return () => {
      tree.renamers.delete(key)
    }
  }, [tree.renamers, key])
  useLayoutEffect(() => {
    if (editor.phase === 'editing' && previousPhase.current === 'idle') {
      input.current?.focus()
      input.current?.select()
    }
    if (editor.phase === 'idle' && restoreFocus.current) {
      restoreFocus.current = false
      tree.focus(key)
    }
    previousPhase.current = editor.phase
  }, [editor.phase, key, tree])
  return (
    <TreeContentFrame
      {...props}
      ref={ref}
      data-tree-content=""
      data-selected={state.selected || undefined}
      className={cx(
        css(
          {
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            minWidth: 0,
            minHeight: 'var(--tree-row-height, var(--sizes-controlSm))',
            paddingBlock: 'var(--space-0_5)',
            paddingRight: 'var(--space-1)',
            borderRadius: 'var(--radii-control)',
            color: 'var(--colors-text)',
            fontSize: 'var(--tree-font-size, var(--fontSizes-control))',
            '&:hover': { backgroundColor: 'var(--colors-softBgHover)' },
            '&[data-selected]': {
              backgroundColor: 'var(--colors-selectionBg)',
              color: 'var(--colors-selectionText)',
            },
            '&[data-disabled]': { opacity: 0.5 },
            '&[data-dragging]': { opacity: 0.5 },
            '&[data-drop-position=before]': { boxShadow: 'inset 0 2px var(--colors-focusRing)' },
            '&[data-drop-position=after]': { boxShadow: 'inset 0 -2px var(--colors-focusRing)' },
            '&[data-drop-position=inside]': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '-2px' },
          },
          cssProp
        ),
        className
      )}
      style={
        {
          '--tree-level': node.level,
          paddingLeft: 'calc((var(--tree-level) - 1) * var(--space-4) + var(--space-1))',
          ...props.style,
        } as CSSProperties
      }
      data-disabled={state.disabled || undefined}
      onClick={(event) => {
        props.onClick?.(event)
        if (
          event.defaultPrevented ||
          (event.target as HTMLElement).closest('button,input,textarea,a,[data-tree-actions]')
        )
          return
        tree.focus(key)
        tree.select(key, event.ctrlKey || event.metaKey, event.shiftKey)
      }}>
      {node.childrenKeys.length ? (
        <button
          type="button"
          tabIndex={-1}
          disabled={state.disabled}
          aria-label={`${state.expanded ? 'Collapse' : 'Expand'} ${label}`}
          aria-expanded={state.expanded}
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: 'var(--sizes-4_5)',
            height: 'var(--tree-row-height, var(--sizes-controlSm))',
            padding: 0,
            color: 'inherit',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            '&:focus-visible': { outline: '2px solid var(--colors-focusRing)' },
          })}
          onClick={(event) => {
            event.stopPropagation()
            tree.focus(key)
            tree.expand(key)
          }}>
          {state.expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
        </button>
      ) : (
        <span aria-hidden="true" className={css({ width: 'var(--sizes-4_5)', flexShrink: 0 })} />
      )}
      {startSlot}
      <span
        className={css({ flex: 1, minWidth: 0 })}
        onDoubleClick={(event) => {
          if (editor.phase === 'idle' && onRename) {
            event.stopPropagation()
            restoreFocus.current = false
            editor.begin()
          }
        }}>
        {editor.phase === 'idle' ? (
          <span
            title={label}
            className={css({ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>
            {children ?? label}
          </span>
        ) : (
          <Input
            {...editor.inputProps}
            ref={input}
            size={tree.density === 'regular' ? 'md' : 'sm'}
            value={editor.draft}
            aria-label={`Rename ${label}`}
            readOnly={editor.phase === 'pending'}
            aria-invalid={!!editor.error || undefined}
            aria-describedby={editor.error ? errorId : undefined}
            onKeyDown={(event) => {
              event.stopPropagation()
              editor.inputProps.onKeyDown(event)
              if (event.defaultPrevented && (event.key === 'Enter' || event.key === 'Escape'))
                restoreFocus.current = true
            }}
            onBlur={(event) => {
              restoreFocus.current = false
              editor.inputProps.onBlur(event)
            }}
          />
        )}
        {editor.phase === 'pending' && <span role="status">Saving…</span>}
        {editor.error && (
          <span
            id={errorId}
            role="alert"
            className={css({ display: 'block', color: 'var(--colors-dangerText)', overflowWrap: 'anywhere' })}>
            {editor.error}
          </span>
        )}
      </span>
      {actions && (
        <span
          data-tree-actions=""
          className={css({
            display: 'inline-flex',
            flexShrink: 0,
            alignItems: 'center',
            gap: 'var(--space-0_5)',
          })}
          onKeyDown={(event) => event.stopPropagation()}>
          {actions}
        </span>
      )}
    </TreeContentFrame>
  )
})

const TreeContentFrame = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TreeContentFrame(props, ref) {
    const { tree } = useItem()
    return tree.dragDrop ? <TreeDndContent {...props} ref={ref} /> : <div {...props} ref={ref} />
  }
)
const TreeDndContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TreeDndContent(props, ref) {
  const { tree, key, node } = useItem()
  const config = tree.dragDrop!
  const disabled = tree.disabled || tree.readOnly || node.disabled
  const [position, setPosition] = useState<TreeDropPosition>('inside')
  const [positionAllowed, setPositionAllowed] = useState(false)
  const positionRef = useRef(position)
  const source = useDragSource<TreeDragData>({
    type: config.type,
    disabled,
    resetKey: config.resetKey ?? tree.collection,
    data: {
      treeId: tree.id,
      keys: tree.selected.includes(key)
        ? tree.selected.filter((item) => !tree.collection.getNode(item)?.disabled)
        : [key],
    },
    onEnd: (result) => config.onDragEnd?.(result),
  })
  const valid = (data: TreeDragData) =>
    !!data && data.treeId === tree.id && Array.isArray(data.keys) && canMoveTreeItems(tree.collection, data.keys, key)
  const request = (data: TreeDragData, next: TreeDropPosition): TreeDropRequest => ({
    keys: data.keys,
    targetKey: key,
    position: next,
  })
  const permits = (data: TreeDragData, next: TreeDropPosition) =>
    valid(data) && config.canDrop?.(request(data, next)) !== false
  const getPosition = (event: DragEvent | null, element: HTMLDivElement | null): TreeDropPosition => {
    if (!event || !element) return positionRef.current
    const rect = element.getBoundingClientRect()
    const ratio = rect.height ? (event.clientY - rect.top) / rect.height : 0.5
    return ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside'
  }
  const target = useDropTarget<TreeDragData>({
    accept: [config.type],
    disabled,
    canDrop: ({ data }) => ['before', 'inside', 'after'].some((next) => permits(data, next as TreeDropPosition)),
    onEnter: ({ data }, { event, element }) => {
      const next = getPosition(event, element)
      positionRef.current = next
      setPosition(next)
      setPositionAllowed(permits(data, next))
    },
    onOver: ({ data }, { event, element }) => {
      const next = getPosition(event, element)
      positionRef.current = next
      setPosition(next)
      setPositionAllowed(permits(data, next))
      if (event?.dataTransfer) event.dataTransfer.dropEffect = permits(data, next) ? 'move' : 'none'
    },
    onDrop: ({ data }, { event, element }) => {
      const next = getPosition(event, element)
      return permits(data, next) ? config.onDrop(request(data, next)) : false
    },
  })
  const mergedRef = useCallback(
    (element: HTMLDivElement | null) => {
      source.ref(element)
      target.ref(element)
      if (typeof ref === 'function') return ref(element)
      if (ref) ref.current = element
    },
    [source.ref, target.ref, ref]
  )
  return (
    <div
      {...props}
      ref={mergedRef}
      data-dragging={source.isDragging || undefined}
      data-drop-position={target.isOver && target.canDrop && positionAllowed ? position : undefined}
    />
  )
})

export interface TreeItemIconProps extends HTMLAttributes<HTMLSpanElement> {
  css?: SystemStyleObject
}
export const TreeItemIcon = forwardRef<HTMLSpanElement, TreeItemIconProps>(function TreeItemIcon(
  { css: cssProp, className, ...props },
  ref
) {
  return (
    <span
      {...props}
      ref={ref}
      aria-hidden={props['aria-label'] ? undefined : true}
      className={cx(
        css({ display: 'inline-flex', alignItems: 'center', flexShrink: 0, color: 'inherit' }, cssProp),
        className
      )}
    />
  )
})
export interface TreeDragPreviewProps extends HTMLAttributes<HTMLDivElement> {
  count?: number
  css?: SystemStyleObject
}
export const TreeDragPreview = forwardRef<HTMLDivElement, TreeDragPreviewProps>(function TreeDragPreview(
  { count = 1, children, css: cssProp, className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx(
        css(
          {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            maxWidth: '300px',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radii-controlMd)',
            border: '1px solid var(--colors-border)',
            color: 'var(--colors-text)',
            backgroundColor: 'var(--colors-surfaceRaised)',
            boxShadow: 'var(--shadows-overlay)',
            fontSize: 'var(--fontSizes-control)',
          },
          cssProp
        ),
        className
      )}>
      {children}
      {count > 1 && <span>({count})</span>}
    </div>
  )
})
export interface TreeInsertionIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean
  css?: SystemStyleObject
}
export const TreeInsertionIndicator = forwardRef<HTMLDivElement, TreeInsertionIndicatorProps>(
  function TreeInsertionIndicator({ active, css: cssProp, className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        aria-hidden="true"
        data-active={active || undefined}
        className={cx(
          css(
            {
              pointerEvents: 'none',
              height: '2px',
              backgroundColor: 'transparent',
              '&[data-active]': { backgroundColor: 'var(--colors-focusRing)' },
            },
            cssProp
          ),
          className
        )}
      />
    )
  }
)
