import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Section } from '../src/layout/Section'
import { Button } from '../src/widgets/buttons'
import { ContractFrame, ControlInput, StatePanel, contractStyles } from './support/ContractFrame'

function SectionExample({ fixed = false }: { fixed?: boolean }) {
  const [open, setOpen] = useState(true)
  const [nestedOpen, setNestedOpen] = useState(false)
  const [text, setText] = useState('Caller-owned content')
  const [actions, setActions] = useState(0)
  return (
    <ContractFrame
      title={fixed ? '固定分组与嵌套分组' : '带标题的内容分组'}
      description="Section 适合把相关控件放在同一个有标题的内容区，默认展开。onOpenChange 接收折叠请求，标题操作使用各自回调；collapsible={false} 时内容持续显示。内层分组和表单值分别由应用保存。"
      onReset={() => {
        setOpen(true)
        setNestedOpen(false)
        setText('Caller-owned content')
        setActions(0)
      }}>
      <Section
        title="General section"
        open={fixed ? false : open}
        onOpenChange={setOpen}
        collapsible={!fixed}
        actions={
          <Button size="xs" onClick={() => setActions((count) => count + 1)}>
            Section action
          </Button>
        }>
        <div className={contractStyles.stack}>
          <label>
            Example content <ControlInput value={text} onChange={(event) => setText(event.currentTarget.value)} />
          </label>
          <Section
            title="Nested section"
            headingLevel={4}
            variant="transparent"
            open={nestedOpen}
            onOpenChange={setNestedOpen}>
            <p>内层分组使用独立的展开状态。</p>
          </Section>
        </div>
      </Section>
      <StatePanel label="Section state" value={{ open: fixed || open, nestedOpen, text, actions }} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Layout/Section',
  parameters: {
    docs: {
      description: {
        component:
          'Section 用于给一组内容添加标题、可选折叠和标题操作，适合侧栏或属性面板中的分组。onOpenChange 接收展开请求，actions 放置与折叠独立的按钮。应用保存内容中的数据；嵌套分组分别管理 open，需要常驻内容时设 collapsible={false}。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <SectionExample /> }
export const FixedAndNested: Story = { render: () => <SectionExample fixed /> }
