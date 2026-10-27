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
} from '../src/collections/Table'
import { describeComponent } from './support/describe'
import { Column, Item, Row } from './support/layout'

const passes = [
  { stage: 'Shadows', ms: '1.8' },
  { stage: 'Geometry', ms: '4.2' },
  { stage: 'Lighting', ms: '8.1' },
]

function RenderPasses({ density }: { density?: 'compact' | 'regular' }) {
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
        {passes.map((pass) => (
          <TableRow key={pass.stage}>
            <TableHeaderCell scope="row">{pass.stage}</TableHeaderCell>
            <TableCell align="end">{pass.ms}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableHeaderCell scope="row">Total</TableHeaderCell>
          <TableCell align="end">14.1</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  )
}

const meta = {
  title: 'Collections/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary:
      '可以自由组合的表格部件：`Table`、`TableHead`、`TableBody`、`TableFoot`、`TableRow`、`TableHeaderCell`、`TableCell`、`TableCaption`。',
    use: ['只读的数据表：性能统计、导入报告', '需要合并单元格、汇总行、自定义表头的表格'],
    avoid: ['按列配置、需要勾选和行操作的数据表 → 用 `DataTable`'],
    related: ['`DataTable`：由列定义生成，带选择和行操作'],
    notes: ['数字列用 `align="end"`；每行的名称单元格用 `TableHeaderCell scope="row"`，读屏可以按行读出'],
  }),
  args: { density: 'compact' },
} satisfies Meta<typeof Table>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: (args) => (
    <Column width={360}>
      <RenderPasses density={args.density} />
    </Column>
  ),
}

/** `compact` 24px 行用于面板，`regular` 32px 行用于对话框和文档页。 */
export const Density: Story = {
  render: () => (
    <Row>
      {(['compact', 'regular'] as const).map((density) => (
        <Item key={density} label={density}>
          <Column width={320}>
            <RenderPasses density={density} />
          </Column>
        </Item>
      ))}
    </Row>
  ),
}

/** `TableRow selected` 以强调色标出选中行。 */
export const SelectedRow: Story = {
  render: () => (
    <Column width={360}>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Stage</TableHeaderCell>
            <TableHeaderCell align="end">Milliseconds</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {passes.map((pass) => (
            <TableRow key={pass.stage} selected={pass.stage === 'Lighting'}>
              <TableHeaderCell scope="row">{pass.stage}</TableHeaderCell>
              <TableCell align="end">{pass.ms}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Column>
  ),
}
