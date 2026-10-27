import type { Meta, StoryObj } from '@storybook/react'
import { ReadonlyValue } from '../src/display/ReadonlyValue'
import { PropertyControl, PropertyLabel, PropertyRow } from '../src/layout/PropertyRow'
import { describeComponent } from './support/describe'
import { Column, Item, Panel, Row } from './support/layout'

const meta = {
  title: 'Display/ReadonlyValue',
  component: ReadonlyValue,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '在属性面板里显示一个不能编辑的值：强调色文字，可以选中复制，长内容自动换行。',
    use: ['计算得出或由导入器决定的属性：顶点数、GUID、文件大小', '因为权限或锁定而暂时不能编辑的字段'],
    avoid: ['可以编辑但当前只读的字段 → 给输入控件传 `readOnly`，保留选中和复制', '普通说明文字 → 用 `Text`'],
    related: ['`Input readOnly`：保留输入框的焦点和选择行为'],
  }),
  args: { children: '12,480 vertices' },
} satisfies Meta<typeof ReadonlyValue>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** 在 `PropertyRow` 里与其他字段对齐；`code` 适合标识符，空值显示 `emptyText`，数字 0 照常显示。 */
export const InPropertyRow: Story = {
  render: () => (
    <Panel>
      <Column>
        <PropertyRow>
          <PropertyLabel>Vertices</PropertyLabel>
          <PropertyControl association="none">
            <ReadonlyValue>12,480</ReadonlyValue>
          </PropertyControl>
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel>GUID</PropertyLabel>
          <PropertyControl association="none">
            <ReadonlyValue code>8f2c1d7e4a</ReadonlyValue>
          </PropertyControl>
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel>Lightmap</PropertyLabel>
          <PropertyControl association="none">
            <ReadonlyValue emptyText="Not baked">{null}</ReadonlyValue>
          </PropertyControl>
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel>Errors</PropertyLabel>
          <PropertyControl association="none">
            <ReadonlyValue>{0}</ReadonlyValue>
          </PropertyControl>
        </PropertyRow>
      </Column>
    </Panel>
  ),
}

/** 空值的几种情况。 */
export const EmptyValues: Story = {
  render: () => (
    <Row>
      <Item label="null">
        <ReadonlyValue emptyText="—">{null}</ReadonlyValue>
      </Item>
      <Item label="''">
        <ReadonlyValue emptyText="—">{''}</ReadonlyValue>
      </Item>
      <Item label="0">
        <ReadonlyValue emptyText="—">{0}</ReadonlyValue>
      </Item>
    </Row>
  ),
}
