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
      title="属性行中的操作"
      description="将相关操作放在同一属性行，适合刷新预览或打开工具。点击 Refresh preview 会调用 onClick 并增加计数；Preview 为整组提供名称，按钮各自说明要执行的操作。"
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

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '动作行用于把刷新、打开工具等操作与属性面板的其他行对齐。用 PropertyRow、PropertyLabel 和 PropertyControl 组合一组 Button，点击后在 onClick 中执行应用操作。多个按钮用 association="group" 和 labelledBy 共享组名，每个按钮仍有自己的操作名称。',
      },
    },
  },
  title: 'Layout/Action row',
  component: ActionRowExample,
} satisfies Meta<typeof ActionRowExample>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = {}
