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
import { Badge } from '../src/widgets/display/Badge'
import { Button } from '../src/widgets/buttons'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryCode,
  StoryProps,
  StoryState,
  StoryKeyboard,
  StoryNote,
} from './support/StoryPage'

interface Material {
  id: CollectionKey
  name: string
  kind: 'texture' | 'mesh' | 'material'
  users: number
  state: 'ready' | 'draft'
  locked?: boolean
}

const initialRows: Material[] = [
  { id: 'metal', name: 'Metal', kind: 'texture', users: 3, state: 'ready' },
  { id: 'glass', name: 'Glass', kind: 'material', users: 2, state: 'ready' },
  { id: 'paint', name: 'Paint', kind: 'material', users: 8, state: 'draft', locked: true },
  { id: 'fabric', name: 'Fabric', kind: 'texture', users: 5, state: 'ready' },
]

const densityLabels = { compact: 'Compact · 24', regular: 'Regular · 32' } as const
const tableWrapClass = css({ width: '100%', minWidth: 0, overflowX: 'auto' })

function RenderTable({ density }: { density: 'compact' | 'regular' }) {
  return (
    <Table density={density}>
      <TableCaption>Render passes</TableCaption>
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
  )
}

function useMaterialColumns() {
  // 列定义通过运行时变量传入，避免 Panda 把数据字段 columns 当成同名样式属性提取。
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

function DensityExample() {
  const columns = useMaterialColumns()
  const [rows, setRows] = useState(initialRows)
  const [selectedKeys, setSelectedKeys] = useState<CollectionKey[]>(['metal'])
  const [density, setDensity] = useState<'compact' | 'regular'>('regular')
  const nextId = useRef(1)
  const reset = () => {
    setRows(initialRows)
    setSelectedKeys(['metal'])
    setDensity('regular')
    nextId.current = 1
  }
  return (
    <>
      <StoryRow>
        {(Object.keys(densityLabels) as (keyof typeof densityLabels)[]).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={density === value ? 'solid' : 'outline'}
            onClick={() => setDensity(value)}>
            {densityLabels[value]}
          </Button>
        ))}
        <Button
          size="sm"
          onClick={() => {
            const n = nextId.current++
            setRows((current) => [
              ...current,
              { id: `new-${n}`, name: `New material ${n}`, kind: 'texture', users: 0, state: 'draft' },
            ])
          }}>
          Add row
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRows((current) => [...current].reverse())}>
          Reverse
        </Button>
        <Button size="sm" variant="subtle" onClick={reset}>
          Reset
        </Button>
      </StoryRow>
      <div className={tableWrapClass}>
        <DataTable
          caption="Materials"
          density={density}
          rows={rows}
          rowKey={(row) => row.id}
          columns={columns}
          getRowLabel={(row) => row.name}
          isRowDisabled={(row) => !!row.locked}
          selection={{ selectedKeys, onSelectedKeysChange: setSelectedKeys }}
        />
      </div>
      <StoryNote>
        `density` 控制行高与 cell padding：compact 为 24 / 2×6，regular 为 32 / 6×8。选中行使用实心
        `selectionBg`，锁定行仍可显示但不可选择。
      </StoryNote>
      <StoryState label="Rows and selection" value={{ density, keys: rows.map((row) => row.id), selectedKeys }} />
    </>
  )
}

function RowActionsExample() {
  const columns = useMaterialColumns()
  const [rows, setRows] = useState(initialRows.slice(0, 3))
  return (
    <>
      <StoryRow>
        <Button size="sm" onClick={() => setRows(initialRows.slice(0, 3))}>
          Restore rows
        </Button>
      </StoryRow>
      <div className={tableWrapClass}>
        <DataTable
          caption="Materials with actions"
          density="compact"
          rows={rows}
          rowKey={(row) => row.id}
          columns={columns.slice(0, 3)}
          getRowLabel={(row) => row.name}
          isRowDisabled={(row) => !!row.locked}
          actions={[
            {
              key: 'remove',
              label: 'Remove',
              onAction: (row) => setRows((current) => current.filter((item) => item.id !== row.id)),
            },
          ]}
        />
      </div>
      <StoryNote>行操作由应用处理；DataTable 只负责把当前行传回 onAction，不自己修改数据。</StoryNote>
    </>
  )
}

function TablePage() {
  const columns = useMaterialColumns()
  const [selectedKeys] = useState<CollectionKey[]>(['metal'])
  return (
    <StoryPage
      eyebrow="Collections"
      title="Table"
      summary="Table 提供可组合的原生表格结构，DataTable 在其上根据 columns 和行数据生成表格，并加入受控选择与行操作。排序、过滤和分页由应用处理，再把结果传给 rows。"
      meta={
        <>
          <span>Table</span>
          <span>·</span>
          <span>DataTable</span>
          <span>·</span>
          <span>24 / 32</span>
        </>
      }>
      <StorySection
        title="Structure"
        description="需要自定义表头、跨列或汇总时，直接组合 Table 部件；density 同时控制行高、字号和 cell padding。">
        <StoryGrid>
          {(['compact', 'regular'] as const).map((density) => (
            <StoryCard key={density} title={densityLabels[density]}>
              <div className={tableWrapClass}>
                <RenderTable density={density} />
              </div>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Density and selection"
        description="DataTable 的 density 与 Table 相同；选择状态由 selectedKeys 控制。切换密度或重排行时，rowKey 保持行身份。">
        <StoryCard>
          <DensityExample />
        </StoryCard>
      </StorySection>

      <StorySection title="Row actions" description="行操作适合打开、删除或运行命令；锁定行会同时禁用选择与操作。">
        <StoryCard>
          <RowActionsExample />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Empty and disabled"
        description="空结果通过 emptyState 呈现；disabled 会关闭生成的复选框和操作，但不会隐藏表格结构。">
        <StoryGrid>
          <StoryCard title="Empty result">
            <div className={tableWrapClass}>
              <DataTable
                caption="Search results"
                rows={[]}
                rowKey={(row: Material) => row.id}
                columns={columns}
                emptyState="No matching materials"
              />
            </div>
          </StoryCard>
          <StoryCard title="Disabled table">
            <div className={tableWrapClass}>
              <DataTable
                caption="Read-only snapshot"
                rows={initialRows.slice(0, 2)}
                rowKey={(row) => row.id}
                columns={columns.slice(0, 2)}
                disabled
                actions={[{ key: 'open', label: 'Open', onAction: () => {} }]}
              />
            </div>
          </StoryCard>
          <StoryCard title="Controlled selection">
            <div className={tableWrapClass}>
              <DataTable
                caption="Selection stays controlled"
                rows={initialRows.slice(0, 2)}
                rowKey={(row) => row.id}
                columns={columns.slice(0, 2)}
                selection={{ selectedKeys, onSelectedKeysChange: () => {} }}
              />
            </div>
            <StoryNote>回调被应用拒绝时，selectedKeys 不变，表格继续显示传入状态。</StoryNote>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="DataTable 保留原生表格语义，并用 caption、rowHeader 和可聚焦控件提供上下文。">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '移动到行选择框、名称和行操作。' },
            { keys: 'Space', action: '切换当前复选框；复选框有逐行 aria-label。' },
            { keys: 'Enter', action: '激活当前行操作。' },
            { keys: 'Shift+Tab', action: '沿相反方向移动。' },
          ]}
        />
        <StoryNote>
          列标题使用 scope="col"；配置 rowHeader 的列使用 scope="row"。DataTable
          不内置排序、过滤或分页，这些结果由应用计算后传入。
        </StoryNote>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<DataTable
  density="compact"
  rows={processedRows}
  rowKey={(row) => row.id}
  columns={columns}
  selection={{ selectedKeys, onSelectedKeysChange: setSelectedKeys }}
  actions={[{ key: 'delete', label: 'Delete', onAction: remove }]}
/>`}
          />
          <StoryProps
            rows={[
              {
                name: 'density',
                type: "'compact' | 'regular'",
                defaultValue: "'regular'",
                description: '24 或 32 行高；compact 同时缩小字号和 padding。',
              },
              { name: 'rows', type: 'readonly T[]', description: '已排序、过滤或分页后的行数据。' },
              { name: 'rowKey', type: '(row: T) => CollectionKey', description: '稳定行身份；不要用数组索引。' },
              {
                name: 'columns',
                type: 'readonly DataTableColumn<T>[]',
                description: '至少一列；rowHeader 生成 scope="row"。',
              },
              {
                name: 'selection',
                type: '{ selectedKeys; onSelectedKeysChange }',
                description: '受控选择；缺失 key 会在局部结果更新时保留。',
              },
              {
                name: 'actions',
                type: 'readonly DataTableAction<T>[]',
                description: '行操作；每项通过 onAction 把行传回应用。',
              },
              {
                name: 'emptyState',
                type: 'ReactNode',
                defaultValue: "'No results'",
                description: 'rows 为空时跨列显示。',
              },
              {
                name: 'disabled / isRowDisabled',
                type: 'boolean / (row) => boolean',
                description: '关闭生成控件，或只锁定某一行。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Table 提供可组合的原生表格结构，适合自定义表头、跨列和汇总；DataTable 根据 columns 与行数据生成表格，并提供受控选择和行操作。应用提供稳定 rowKey，并负责排序、过滤、分页和保存结果。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Collections/Table',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { render: () => <TablePage /> }
