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
  // 列定义通过运行时变量传入，避免 Panda 把数据字段 columns 当成同名样式属性提取。
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
      title="带稳定标识的行操作"
      description="DataTable 适合带行操作的数据展示。rowKey 区分数字 1 与字符串 1；重排行时草稿和焦点跟随对应行，删除聚焦行后焦点移到邻近操作。应用在选择和删除回调中更新数据，并通过行的禁用设置锁定操作。"
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
      title="空结果与选择请求"
      description="应用可以只记录选择请求并保留 selectedKeys，表格仍按传入状态显示。分页或过滤时，列表外的选中 key 会继续保留；应用在需要清空全部选择时显式更新该数组。"
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
      title="组合原生表格结构"
      description="需要自定义布局时，可直接组合 Table 的表头、正文和汇总部件。应用负责遍历数据，并为表格提供 caption、为行列标题设置 scope；排序、选择或分页按具体业务另行组合。"
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
export default {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Table 提供原生表格部件，适合自定义表头、正文和汇总；DataTable 根据 columns 与行数据生成表格，并可加入选择、删除等行操作。应用提供稳定 rowKey，并在回调中更新数据和选择状态。排序、过滤和分页由应用处理后传回结果，空态通过 emptyState 呈现。',
      },
    },
  },
  title: 'Widgets/Collections/Table',
} satisfies Meta
type Story = StoryObj
export const DataRows: Story = { render: () => <RowsExample /> }
export const EmptyDisabledRejected: Story = { render: () => <TableModes /> }
export const Structure: Story = { render: () => <StructureExample /> }
