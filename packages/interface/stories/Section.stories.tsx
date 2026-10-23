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
      title={fixed ? 'Fixed and nested sections' : 'General layout section'}
      description="Section 只组合标题、折叠与内容，默认展开，不绑定字段数据。标题操作不触发折叠；固定分组没有假禁用的折叠按钮。"
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
            <p>Nested content has an independent expanded state.</p>
          </Section>
        </div>
      </Section>
      <StatePanel label="Section state" value={{ open: fixed || open, nestedOpen, text, actions }} />
    </ContractFrame>
  )
}

const meta = { title: 'Layout/Section', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <SectionExample /> }
export const FixedAndNested: Story = { render: () => <SectionExample fixed /> }
