import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DataTable, type DataTableColumn } from '../src/collections/DataTable'
import { Badge } from '../src/display/Badge'
import { Button } from '../src/controls/buttons'
import type { CollectionKey } from '../src/values/collection'
import { describeComponent } from './support/describe'
import { Column, StateView } from './support/layout'

interface Material {
  id: CollectionKey
  name: string
  kind: 'texture' | 'material'
  users: number
  state: 'ready' | 'draft'
  locked?: boolean
}

const materials: Material[] = [
  { id: 'metal', name: 'Metal', kind: 'texture', users: 3, state: 'ready' },
  { id: 'glass', name: 'Glass', kind: 'material', users: 2, state: 'ready' },
  { id: 'paint', name: 'Paint', kind: 'material', users: 8, state: 'draft', locked: true },
  { id: 'fabric', name: 'Fabric', kind: 'texture', users: 5, state: 'ready' },
]

// Columns are created at runtime so Panda does not read the `columns` prop as a style property.
function useMaterialColumns() {
  return useMemo<readonly DataTableColumn<Material>[]>(
    () => [
      { key: 'name', header: 'Material', rowHeader: true, cell: (row) => row.name },
      {
        key: 'kind',
        header: 'Kind',
        cell: (row) => (
          <Badge size="xs" variant="surface" color={row.kind === 'material' ? 'blue' : 'gray'}>
            {row.kind}
          </Badge>
        ),
      },
      { key: 'users', header: 'Users', align: 'end', cell: (row) => row.users },
      {
        key: 'state',
        header: 'State',
        cell: (row) => (
          <Badge size="xs" variant="surface" color={row.state === 'ready' ? 'green' : 'amber'}>
            {row.state}
          </Badge>
        ),
      },
    ],
    []
  )
}

const meta = {
  title: 'Collections/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '按列定义生成的数据表，可选勾选列和每行的操作按钮。',
    use: ['资源、材质、依赖项等列表数据', '需要批量选择或对单行执行操作'],
    avoid: ['需要合并单元格、汇总行等自定义结构 → 用 `Table` 部件组合', '层级数据 → 用 `TreeRoot`'],
    related: ['`Table`：可自由组合的表格部件', '`Pagination`：配合分页显示'],
    notes: [
      '排序、筛选、分页由应用完成，再把结果传给 `rows`；`rowKey` 返回稳定 key，重新排序时保持选中',
      '`selection` 提供后显示勾选列和全选；`isRowDisabled` 的行仍显示但不能勾选和操作',
      '`actions` 只把当前行传回 `onAction`，修改数据由应用负责',
    ],
  }),
  args: { caption: 'Materials', rows: materials, rowKey: (row: Material) => row.id, columns: [] },
  argTypes: { rows: { control: false }, rowKey: { control: false }, columns: { control: false } },
} satisfies Meta<typeof DataTable<Material>>
export default meta
type Story = StoryObj<typeof meta>

/** 勾选列与选中行：表头复选框会显示部分选中；锁定的行不能勾选。 */
export const Basic: Story = {
  render: function Render(args) {
    const columns = useMaterialColumns()
    const [selectedKeys, setSelectedKeys] = useState<CollectionKey[]>(['metal'])
    return (
      <Column width={560}>
        <DataTable
          caption={args.caption}
          density={args.density}
          rows={materials}
          rowKey={(row) => row.id}
          columns={columns}
          getRowLabel={(row) => row.name}
          isRowDisabled={(row) => !!row.locked}
          selection={{ selectedKeys, onSelectedKeysChange: setSelectedKeys }}
        />
      </Column>
    )
  },
}

/** 每行末尾的操作按钮；DataTable 只回传当前行，删除由应用完成。 */
export const RowActions: Story = {
  render: function Render() {
    const columns = useMaterialColumns()
    const [rows, setRows] = useState(materials)
    return (
      <Column width={560}>
        <DataTable
          caption="Materials"
          rows={rows}
          rowKey={(row) => row.id}
          columns={columns}
          getRowLabel={(row) => row.name}
          isRowDisabled={(row) => !!row.locked}
          actions={[
            {
              key: 'remove',
              label: (row) => `Remove ${row.name}`,
              onAction: (row) => setRows((items) => items.filter((item) => item.id !== row.id)),
            },
          ]}
          actionsLabel="Actions"
        />
      </Column>
    )
  },
}

/** 没有数据时显示 `emptyState`。 */
export const Empty: Story = {
  render: function Render() {
    const columns = useMaterialColumns()
    return (
      <Column width={560}>
        <DataTable
          caption="Materials"
          rows={[]}
          rowKey={(row) => row.id}
          columns={columns}
          emptyState="No materials in this folder."
        />
      </Column>
    )
  },
}

/** 行顺序变化（反转、追加）时，选中跟随 `rowKey` 而不是位置。 */
export const BehaviorStableSelection: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const columns = useMaterialColumns()
    const [rows, setRows] = useState(materials)
    const [selectedKeys, setSelectedKeys] = useState<CollectionKey[]>(['metal'])
    return (
      <Column width={560}>
        <DataTable
          caption="Materials"
          density="regular"
          rows={rows}
          rowKey={(row) => row.id}
          columns={columns}
          getRowLabel={(row) => row.name}
          selection={{ selectedKeys, onSelectedKeysChange: setSelectedKeys }}
        />
        <Button variant="outline" onClick={() => setRows((items) => [...items].reverse())}>
          Reverse rows
        </Button>
        <StateView value={{ order: rows.map((row) => row.id), selectedKeys }} />
      </Column>
    )
  },
}
