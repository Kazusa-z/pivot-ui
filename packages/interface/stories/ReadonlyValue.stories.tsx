import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ReadonlyValue } from '../src/widgets/display/ReadonlyValue'
import { ContractFrame, StatePanel } from './support/ContractFrame'

function ReadonlyValueExample() {
  const [value, setValue] = useState('Object_001\nRead-only values preserve line breaks.')
  return (
    <ContractFrame
      title="Read-only presentation"
      description="传入已格式化内容；组件不解析值、不绑定属性，也不创建 live region。文字可选中。"
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

const meta = { title: 'Widgets/ReadonlyValue', component: ReadonlyValue } satisfies Meta<typeof ReadonlyValue>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <ReadonlyValueExample /> }
