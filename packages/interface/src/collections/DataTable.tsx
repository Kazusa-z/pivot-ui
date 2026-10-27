import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { createCollection, type CollectionKey } from '../values/collection'
import { Checkbox } from '../controls/choices/Checkbox'
import { Button } from '../controls/buttons/Button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableProps,
} from './Table'

export interface DataTableColumn<T> {
  /** 列的唯一标识。 */
  key: CollectionKey
  /** 表头内容。 */
  header: ReactNode
  /** 渲染这一列的单元格。 */
  cell: (row: T) => ReactNode
  /** 列宽。 */
  width?: CSSProperties['width']
  align?: 'start' | 'center' | 'end'
  /** 这一列的单元格作为行标题（`<th scope="row">`），通常是名称列。 */
  rowHeader?: boolean
}
export interface DataTableAction<T> {
  key: CollectionKey
  /** 操作按钮的文字，可以按行生成，例如 "Delete Metal"。 */
  label: string | ((row: T) => string)
  /** 点击时调用。 */
  onAction: (row: T) => void
  disabled?: boolean | ((row: T) => boolean)
}
export interface DataTableSelection {
  /** 选中的行（受控）。筛选或分页后不在当前结果里的 key 会保留。 */
  selectedKeys: readonly CollectionKey[]
  onSelectedKeysChange?: (keys: CollectionKey[]) => void
}
export interface DataTableProps<T> extends Omit<TableProps, 'children'> {
  /** 行高：`compact` 24（默认）、`regular` 32。 */
  density?: 'compact' | 'regular'
  /** 行数据；排序、筛选、分页由应用完成后再传入。 */
  rows: readonly T[]
  /** 返回每行的稳定 key，重新排序时保持选中和焦点。 */
  rowKey: (row: T) => CollectionKey
  /** 列定义。 */
  columns: readonly DataTableColumn<T>[]
  /** 表格标题，也是表格的无障碍名称。 */
  caption?: ReactNode
  /** 没有行时显示的内容。 */
  emptyState?: ReactNode
  /** 每行末尾的操作按钮。 */
  actions?: readonly DataTableAction<T>[]
  /** 操作列的表头文字。 */
  actionsLabel?: string
  /** 提供后显示勾选列，支持全选。 */
  selection?: DataTableSelection
  /** 勾选列表头复选框的无障碍名称。 */
  selectionLabel?: string
  /** 行的名称，用于勾选框和操作按钮的无障碍名称。 */
  getRowLabel?: (row: T) => string
  /** 禁用勾选列和操作按钮；自定义单元格里的控件需要自己处理禁用。 */
  disabled?: boolean
  /** 锁定的行：仍然显示，但不能勾选和操作。 */
  isRowDisabled?: (row: T) => boolean
}
const keyString = (key: CollectionKey) => `${typeof key}:${String(key)}`
const controls =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]:not(:disabled)'

/** 按列配置展示数据的表格，支持选中和行操作。应用先对数据排序、分页或加载，再将结果传入 rows。 */
export function DataTable<T>({
  rows,
  rowKey,
  columns,
  caption,
  emptyState = 'No results',
  actions = [],
  actionsLabel = 'Actions',
  selection,
  selectionLabel = 'Select',
  getRowLabel,
  disabled,
  isRowDisabled,
  onFocusCapture,
  ...props
}: DataTableProps<T>) {
  const collection = createCollection(rows, rowKey)
  const columnCollection = createCollection(columns, (column) => column.key)
  const actionCollection = createCollection(actions, (action) => action.key)
  if (columnCollection.size === 0) throw new Error('DataTable requires at least one column.')
  const root = useRef<HTMLTableElement>(null)
  const focused = useRef<{ node: HTMLElement; key: string; index: number; control: number } | null>(null)
  const selected = new Set(selection?.selectedKeys ?? [])
  const available = collection.keys.filter((_, index) => !disabled && !isRowDisabled?.(collection.items[index]))
  const selectedAvailable = available.filter((key) => selected.has(key)).length
  const toggle = (keys: readonly CollectionKey[], checked: boolean) => {
    if (disabled || !selection) return
    const next = new Set(selection.selectedKeys)
    for (const key of keys) {
      if (checked) next.add(key)
      else next.delete(key)
    }
    selection.onSelectedKeysChange?.([...next])
  }
  // Keep a deleted row's keyboard action usable at the next surviving row. Reorders keep the same DOM keys.
  useLayoutEffect(() => {
    const previous = focused.current
    const element = root.current
    if (!element || !previous) return
    const remaining = [...element.querySelectorAll<HTMLTableRowElement>('tbody > tr[data-row-key]')]
    if (previous.node.isConnected) {
      previous.index = remaining.findIndex((row) => row.dataset.rowKey === previous.key)
      return
    }
    if (element.ownerDocument.activeElement !== element.ownerDocument.body) return
    const at = Math.max(0, Math.min(previous.index, remaining.length - 1))
    const order = [...remaining.slice(at), ...remaining.slice(0, at).reverse()]
    const candidates =
      order.map((row) => [...row.querySelectorAll<HTMLElement>(controls)]).find((items) => items.length > 0) ?? []
    const next = candidates[Math.max(0, Math.min(previous.control, candidates.length - 1))]
    focused.current = null
    if (next) next.focus()
    else element.focus()
  })
  return (
    <Table
      {...props}
      ref={root}
      tabIndex={props.tabIndex ?? -1}
      aria-disabled={disabled || undefined}
      onFocusCapture={(event) => {
        onFocusCapture?.(event)
        const target = event.target as HTMLElement
        const row = target.closest<HTMLTableRowElement>('tr[data-row-key]')
        if (row && event.currentTarget.contains(row)) {
          const list = [...event.currentTarget.querySelectorAll('tbody > tr[data-row-key]')]
          focused.current = {
            node: target,
            key: row.dataset.rowKey ?? '',
            index: list.indexOf(row),
            control: [...row.querySelectorAll(controls)].indexOf(target),
          }
        }
      }}>
      {caption != null && <TableCaption>{caption}</TableCaption>}
      <colgroup>
        {selection && <col style={{ width: 36 }} />}
        {columnCollection.items.map((column) => (
          <col key={keyString(column.key)} style={{ width: column.width }} />
        ))}
        {actions.length > 0 && <col />}
      </colgroup>
      <TableHead>
        <TableRow>
          {selection && (
            <TableHeaderCell>
              <Checkbox
                aria-label={`${selectionLabel} all rows`}
                checked={
                  selectedAvailable === 0 ? false : selectedAvailable === available.length ? true : 'indeterminate'
                }
                disabled={disabled || available.length === 0 || !selection.onSelectedKeysChange}
                onCheckedChange={(checked) => toggle(available, checked)}
              />
            </TableHeaderCell>
          )}
          {columnCollection.items.map((column) => (
            <TableHeaderCell key={keyString(column.key)} align={column.align}>
              {column.header}
            </TableHeaderCell>
          ))}
          {actions.length > 0 && <TableHeaderCell>{actionsLabel}</TableHeaderCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {collection.size === 0 ? (
          <TableRow>
            <TableCell colSpan={Math.max(1, columns.length + Number(!!selection) + Number(actions.length > 0))}>
              {emptyState}
            </TableCell>
          </TableRow>
        ) : (
          collection.items.map((row, index) => {
            const key = collection.keys[index]
            const blocked = disabled || isRowDisabled?.(row)
            const label = getRowLabel?.(row) ?? String(key)
            return (
              <TableRow
                key={keyString(key)}
                data-row-key={keyString(key)}
                selected={selected.has(key)}
                aria-disabled={blocked || undefined}>
                {selection && (
                  <TableCell>
                    <Checkbox
                      aria-label={`${selectionLabel} ${label}`}
                      checked={selected.has(key)}
                      disabled={blocked || !selection.onSelectedKeysChange}
                      onCheckedChange={(checked) => toggle([key], checked)}
                    />
                  </TableCell>
                )}
                {columnCollection.items.map((column) =>
                  column.rowHeader ? (
                    <TableHeaderCell key={keyString(column.key)} scope="row" align={column.align}>
                      {column.cell(row)}
                    </TableHeaderCell>
                  ) : (
                    <TableCell key={keyString(column.key)} align={column.align}>
                      {column.cell(row)}
                    </TableCell>
                  )
                )}
                {actions.length > 0 && (
                  <TableCell>
                    {actionCollection.items.map((action) => (
                      <Button
                        key={keyString(action.key)}
                        size="xs"
                        variant="subtle"
                        aria-label={`${typeof action.label === 'function' ? action.label(row) : action.label} ${label}`}
                        disabled={
                          blocked || (typeof action.disabled === 'function' ? action.disabled(row) : action.disabled)
                        }
                        onClick={() => action.onAction(row)}>
                        {typeof action.label === 'function' ? action.label(row) : action.label}
                      </Button>
                    ))}
                  </TableCell>
                )}
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
