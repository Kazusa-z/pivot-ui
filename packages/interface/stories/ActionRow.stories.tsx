import { useId, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PropertyRow, PropertyLabel, PropertyControl } from '../src/layout/PropertyRow'
import { Button } from '../src/widgets/buttons'
import { Flex } from '../src/layout/Flex'
import { ContractFrame, StatePanel } from './support/ContractFrame'

function ActionRowExample() {
  const id = useId()
  const [count, setCount] = useState(0)
  return (
    <ContractFrame
      title="Application actions"
      description="动作行只接收操作回调，不声明字符串字段值。多个动作通过显式名称关联。"
      onReset={() => setCount(0)}>
      <PropertyRow>
        <PropertyLabel id={id}>Preview</PropertyLabel>
        <PropertyControl association="group" labelledBy={id}>
          <Flex gap="sm">
            <Button onClick={() => setCount((value) => value + 1)}>Refresh preview</Button>
            <Button disabled>Open renderer</Button>
          </Flex>
        </PropertyControl>
      </PropertyRow>
      <StatePanel label="Actions" value={{ refreshCount: count }} />
    </ContractFrame>
  )
}

const meta = { title: 'Layout/Action row', component: ActionRowExample } satisfies Meta<typeof ActionRowExample>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = {}
