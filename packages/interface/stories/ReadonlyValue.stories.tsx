import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ReadonlyValue } from '../src/widgets/display/ReadonlyValue'
import { ContractFrame, StatePanel } from './support/ContractFrame'

function ReadonlyValueExample() {
  const [value, setValue] = useState('Object_001\nRead-only values preserve line breaks.')
  return (
    <ContractFrame
      title="展示只读内容"
      description="ReadonlyValue 适合显示计算结果或只读属性。应用先把数据格式化后传入，文字可以选中复制；空内容使用 emptyText，数字 0 仍会显示。需要播报更新时，由应用添加适当的状态区域。"
      onReset={() => setValue('Object_001\nRead-only values preserve line breaks.')}>
      <label>
        Preview content
        <textarea value={value} onChange={(event) => setValue(event.currentTarget.value)} style={{ width: '100%' }} />
      </label>
      <ReadonlyValue code>{value}</ReadonlyValue>
      <ReadonlyValue aria-label="Empty value" emptyText="No value">
        {null}
      </ReadonlyValue>
      <ReadonlyValue aria-label="Numeric zero">{0}</ReadonlyValue>
      <ReadonlyValue css={{ width: '160px' }}>Averylongreadonlyvaluestayswithintheavailablewidth.</ReadonlyValue>
      <StatePanel label="State" value={{ value }} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ReadonlyValue 用于呈现已经格式化的只读内容，适合摘要、计算结果或不可编辑的属性。空值显示 emptyText，数字 0 仍会正常显示，文字可以选中复制。应用负责格式化原始数据、提供可访问名称，并在需要播报更新时选择合适的状态区域。',
      },
    },
  },
  title: 'Widgets/ReadonlyValue',
  component: ReadonlyValue,
} satisfies Meta<typeof ReadonlyValue>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <ReadonlyValueExample /> }
