import React, { ReactNode } from 'react'

import { styled } from '../../styled-system/jsx'

const Tr = styled('tr', {
  base: { color: 'var(--colors-gray11)' },
})

const Th = styled('th', {
  base: {
    fontWeight: 'unset',
    textAlign: 'start',
    fontSize: '14px',
    padding: '8px',
    borderBottom: '1px solid var(--colors-gray3)',
    userSelect: 'none',
    '&:nth-child(1)': { paddingLeft: '8px' },
  },
  variants: {
    align: {
      start: { textAlign: 'start' },
      center: { textAlign: 'center' },
      end: { textAlign: 'end' },
    },
    border: {
      solid: { borderBottom: '1px solid var(--colors-gray3)' },
      dashed: { borderBottom: '1px dashed var(--colors-gray8)' },
    },
  },
  defaultVariants: { align: 'start', border: 'solid' },
})

const Td = styled('td', {
  base: {
    paddingTop: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--colors-gray3)',
    fontSize: '14px',
    padding: '8px',
    verticalAlign: 'middle',
    userSelect: 'none',
  },
  variants: {
    align: {
      start: { textAlign: 'start' },
      center: { textAlign: 'center' },
      end: { textAlign: 'end' },
    },
    border: {
      solid: { borderBottom: '1px solid var(--colors-gray3)' },
      dashed: { borderBottom: '1px dashed var(--colors-gray8)' },
    },
  },
  defaultVariants: { align: 'start', border: 'solid' },
})

const Thead = styled('thead', {
  base: {
    '& th': { fontSize: '12px', color: 'var(--colors-gray9)' },
    '& td': { fontSize: '12px', color: 'var(--colors-gray9)' },
  },
})

const Tbody = styled('tbody', {
  base: {
    width: '100%',
    '& tr:hover': { backgroundColor: 'var(--colors-gray2)' },
  },
})

const StyledTable = styled('table', {
  base: {
    width: '100%',
    tableLayout: 'fixed',
    borderSpacing: 0,
  },
  variants: {
    compact: {
      true: {
        '& th': {
          padding: '8px 2px',
          '&:nth-child(1)': { paddingLeft: '8px' },
        },
        '& td': {
          padding: '2px',
          fontSize: '12px',
        },
      },
    },
  },
})
export interface TableProps<T> {
  columns: {
    title: string
    dataIndex?: string
    key: string
    render?: (text, record: T) => ReactNode
    width?: string
  }[]
  rowKey: string
  dataSource: T[]
  compact?: boolean
  onClickRow?: (rowData: any) => void
}

export function Table<T = unknown>(props: TableProps<T>) {
  const { columns = [], dataSource = [], rowKey, compact, onClickRow } = props

  return (
    <StyledTable compact={compact}>
      <colgroup>
        {columns.map((column) => {
          return <col key={column.key} span={1} style={{ width: column.width || 'auto' }} />
        })}
      </colgroup>
      <Thead>
        <Tr>
          {columns.map((column) => {
            return <Th key={column.key}>{column.title}</Th>
          })}
        </Tr>
      </Thead>
      <Tbody>
        {dataSource.map((item, i) => {
          const tdList = []
          columns.forEach((c) => {
            if (c.render) {
              tdList.push(<Td key={c.key}>{c.render(item[c.dataIndex], item)}</Td>)
              return
            }
            tdList.push(<Td key={c.key}>{item[c.dataIndex]}</Td>)
          })
          return (
            <Tr
              key={i}
              onClick={(e) => {
                if (onClickRow) {
                  e.stopPropagation()
                  onClickRow(item)
                }
              }}>
              {tdList}
            </Tr>
          )
        })}
      </Tbody>
    </StyledTable>
  )
}
