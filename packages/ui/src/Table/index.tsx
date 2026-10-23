import { isValidElement, type ReactNode } from 'react'
import { DataTable, type DataTableProps, type CollectionKey } from '@pivot-ui/react'

export interface TableProps<T> extends Omit<DataTableProps<T>, 'rows' | 'rowKey' | 'columns'> {
  columns: readonly {
    title: ReactNode
    dataIndex?: keyof T
    key: string
    render?: (text: unknown, record: T) => ReactNode
    width?: string
  }[]
  rowKey: keyof T | ((row: T) => CollectionKey)
  dataSource: readonly T[]
  /** Legacy row activation is now an explicit keyboard-accessible Open action. */
  onClickRow?: (row: T) => void
}
function legacyCell(value: unknown): ReactNode {
  if (value == null) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || isValidElement(value))
    return value
  return String(value)
}
export function Table<T>({ columns, dataSource, rowKey, onClickRow, actions = [], ...props }: TableProps<T>) {
  return (
    <DataTable<T>
      {...props}
      rows={dataSource}
      rowKey={(row) => {
        const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey]
        if (typeof key !== 'string' && typeof key !== 'number')
          throw new TypeError('Table rowKey must resolve to a string or number.')
        return key
      }}
      columns={columns.map((column) => ({
        key: column.key,
        header: column.title,
        width: column.width,
        cell: (row) => {
          const value = column.dataIndex === undefined ? undefined : row[column.dataIndex]
          return column.render ? column.render(value, row) : legacyCell(value)
        },
      }))}
      actions={onClickRow ? [{ key: 'legacy-open-row', label: 'Open', onAction: onClickRow }, ...actions] : actions}
    />
  )
}
