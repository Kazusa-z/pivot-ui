import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../src/widgets/collections/Table'
import { DataTable, type DataTableColumn } from '../src/widgets/collections/DataTable'
import type { CollectionKey } from '../src/values/collection'
import { Input } from '../src/widgets/inputs/Input'
import { ContractFrame, StatePanel, ControlButton, contractStyles } from './support/ContractFrame'

interface Material {
  id: CollectionKey
  name: string
  users: number
  locked?: boolean
}
const initial: Material[] = [
  { id: 1, name: 'Metal', users: 3 },
  { id: '1', name: 'Glass', users: 2 },
  { id: 'paint', name: 'Paint', users: 8, locked: true },
]
function LocalName({ row }: { row: Material }) {
  const [value, setValue] = useState(row.name)
  return (
    <Input
      aria-label={`Name ${row.id} (${typeof row.id})`}
      value={value}
      onValueChange={setValue}
      disabled={row.locked}
    />
  )
}
function useMaterialColumns() {
  // Runtime column metadata is separate from Panda's statically extracted `columns` style prop.
  return useMemo<readonly DataTableColumn<Material>[]>(
    () => [
      { key: 'name', header: 'Material', rowHeader: true, cell: (row) => row.name },
      { key: 'draft', header: 'Local draft', cell: (row) => <LocalName row={row} /> },
      { key: 'users', header: 'Users', align: 'end', cell: (row) => row.users },
    ],
    []
  )
}
function RowsExample() {
  const columns = useMaterialColumns()
  const [rows, setRows] = useState(initial)
  const [selectedKeys, setSelectedKeys] = useState<CollectionKey[]>([])
  const [epoch, setEpoch] = useState(0)
  const nextId = useRef(1)
  return (
    <ContractFrame
      title="Stable data rows"
      description="number 1与string '1'是不同标识。编辑局部草稿后重排，草稿和焦点跟随行；删除聚焦行后焦点移到相邻行操作。锁定行禁用内建选择与删除。"
      onReset={() => {
        setRows(initial)
        setSelectedKeys([])
        setEpoch((next) => next + 1)
        nextId.current = 1
      }}>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setRows((current) => [...current].reverse())}>Reverse rows</ControlButton>
        <ControlButton
          onClick={() => {
            const sequence = nextId.current++
            setRows((current) => [...current, { id: `new-${sequence}`, name: `New material ${sequence}`, users: 0 }])
          }}>
          Add row
        </ControlButton>
      </div>
      <DataTable
        key={epoch}
        caption="Materials"
        rows={rows}
        rowKey={(row) => row.id}
        columns={columns}
        getRowLabel={(row) => row.name}
        isRowDisabled={(row) => !!row.locked}
        selection={{ selectedKeys, onSelectedKeysChange: setSelectedKeys }}
        actions={[
          {
            key: 'delete',
            label: 'Delete',
            onAction: (row) => setRows((current) => current.filter((item) => item.id !== row.id)),
          },
        ]}
      />
      <StatePanel label="Data order and selection" value={{ keys: rows.map((row) => row.id), selectedKeys }} />
    </ContractFrame>
  )
}
function TableModes() {
  const columns = useMaterialColumns()
  const [requests, setRequests] = useState<CollectionKey[][]>([])
  const [compact, setCompact] = useState(false)
  return (
    <ContractFrame
      title="Empty, controlled refusal and disabled"
      description="数据渲染与状态分离；父级可拒绝选择请求。隐藏或过滤的选中key不会被其他行操作静默删除。"
      onReset={() => {
        setRequests([])
        setCompact(false)
      }}>
      <ControlButton onClick={() => setCompact((current) => !current)}>Toggle compact</ControlButton>
      <DataTable
        caption="Controlled refusal"
        rows={initial}
        rowKey={(row) => row.id}
        columns={columns}
        compact={compact}
        selection={{
          selectedKeys: ['not-in-results', 1],
          onSelectedKeysChange: (keys) => setRequests((current) => [...current, keys]),
        }}
      />
      <DataTable
        caption="Disabled actions"
        rows={initial}
        rowKey={(row) => row.id}
        columns={columns.slice(0, 1)}
        disabled
        actions={[{ key: 'open', label: 'Open', onAction: () => {} }]}
      />
      <DataTable
        caption="Empty result"
        rows={[]}
        rowKey={(row: Material) => row.id}
        columns={columns}
        emptyState="No matching materials"
      />
      <StatePanel label="Selection requests" value={requests} />
    </ContractFrame>
  )
}
function StructureExample() {
  const [compact, setCompact] = useState(false)
  return (
    <ContractFrame
      title="Native table parts"
      description="结构组件不读取数据，不创建排序、选择或分页状态；表头scope、caption与汇总由调用者组合。"
      onReset={() => setCompact(false)}>
      <ControlButton onClick={() => setCompact((current) => !current)}>Toggle compact</ControlButton>
      <Table compact={compact}>
        <TableCaption>Render statistics</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Stage</TableHeaderCell>
            <TableHeaderCell align="end">Milliseconds</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableHeaderCell scope="row">Geometry</TableHeaderCell>
            <TableCell align="end">4.2</TableCell>
          </TableRow>
          <TableRow>
            <TableHeaderCell scope="row">Lighting</TableHeaderCell>
            <TableCell align="end">8.1</TableCell>
          </TableRow>
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableHeaderCell scope="row">Total</TableHeaderCell>
            <TableCell align="end">12.3</TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    </ContractFrame>
  )
}
export default { title: 'Widgets/Collections/Table' } satisfies Meta
type Story = StoryObj
export const DataRows: Story = { render: () => <RowsExample /> }
export const EmptyDisabledRejected: Story = { render: () => <TableModes /> }
export const Structure: Story = { render: () => <StructureExample /> }
