import { useId, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Section } from '../src/layout/Section'
import { Button } from '../src/widgets/buttons'
import { Input } from '../src/widgets/inputs/Input'
import { Checkbox } from '../src/widgets/choices/Checkbox'
import { Text } from '../src/foundation/typography'
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
} from './support/StoryPage'

const column = css({ display: 'grid', gap: 'var(--space-3)', minWidth: 0 })
const twoColumns = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
  gap: 'var(--space-4)',
})

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Section 给一组内容添加标题、可选折叠和标题操作，适合侧栏或属性面板。onOpenChange 接收展开请求，actions 放与折叠独立的按钮；collapsible={false} 固定展开，嵌套分组分别管理 open。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Layout/Section',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function BasicExample() {
  const inputId = useId()
  const [open, setOpen] = useState(true)
  const [nestedOpen, setNestedOpen] = useState(false)
  const [text, setText] = useState('Caller-owned content')
  const [actions, setActions] = useState(0)
  return (
    <StoryCard>
      <Section
        title="General section"
        open={open}
        onOpenChange={setOpen}
        variant="surface"
        actions={
          <Button size="xs" variant="subtle" onClick={() => setActions((count) => count + 1)}>
            Section action ({actions})
          </Button>
        }>
        <div className={column}>
          <label className={css({ display: 'grid', gap: 'var(--space-1)' })}>
            <Text size="sm">Example content</Text>
            <Input id={inputId} value={text} onValueChange={setText} />
          </label>
          <Section
            title="Nested section"
            headingLevel={4}
            variant="transparent"
            open={nestedOpen}
            onOpenChange={setNestedOpen}>
            <Text size="sm" tone="muted">
              内层分组使用独立的展开状态。
            </Text>
          </Section>
        </div>
      </Section>
      <StoryState label="Section state" value={{ open, nestedOpen, text, actions }} />
      <Text size="xs" tone="muted">
        标题操作应放在 Section 的 actions 中，避免与折叠点击区域重叠。
      </Text>
    </StoryCard>
  )
}

function SectionPage() {
  const [fixed, setFixed] = useState(false)
  const [disabled, setDisabled] = useState(false)
  return (
    <StoryPage
      eyebrow="Layout"
      title="Section"
      summary="把相关控件放进有标题的区域。紧凑标题 24px，常规 32px；可折叠、固定展开，或只用图标触发。"
      meta={
        <>
          <span>header 24 / 32</span>
          <span>·</span>
          <span>actions</span>
        </>
      }>
      <StorySection title="Basic" description="标题、内容、嵌套分组和标题操作。">
        <Section title="Outer section" variant="surface">
          <div className={column}>
            <Text size="sm">内容由应用组合；展开状态可通过 open/onOpenChange 控制。</Text>
            <Section title="Nested section" headingLevel={4} variant="transparent">
              <Text size="sm" tone="muted">
                嵌套分组拥有独立的展开状态。
              </Text>
            </Section>
          </div>
        </Section>
        <BasicExample />
      </StorySection>

      <StorySection title="Density" description="sm 使用 24px 头部，md 使用 32px 头部；内容字号和 padding 同步。">
        <div className={twoColumns}>
          <Section title="Compact section" size="sm" variant="surface">
            <Text size="sm">紧凑面板中的字段分组。</Text>
          </Section>
          <Section title="Regular section" size="md" variant="surface">
            <Text size="md">对话框或常规表单中的字段分组。</Text>
          </Section>
        </div>
      </StorySection>

      <StorySection title="States" description="固定展开、禁用、图标触发；固定模式不再渲染折叠按钮。">
        <StoryCard>
          <StoryRow>
            <Checkbox size="md" checked={fixed} onCheckedChange={setFixed} label="Fixed expanded" />
            <Checkbox size="md" checked={disabled} onCheckedChange={setDisabled} label="Disabled" />
          </StoryRow>
          <Section
            title={fixed ? 'Fixed section' : 'Collapsible section'}
            collapsible={!fixed}
            disabled={disabled}
            variant="surface"
            actions={
              <Button size="xs" variant="subtle" disabled={disabled}>
                Action
              </Button>
            }>
            <Text size="sm" tone="muted">
              {fixed ? '固定模式持续显示内容。' : '点击标题折叠或展开内容。'}
            </Text>
          </Section>
          <Section title="Icon trigger" triggerMode="icon" triggerLabel="Toggle icon section" variant="transparent">
            <Text size="sm" tone="muted">
              图标触发保留静态标题，适合工具栏式面板。
            </Text>
          </Section>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Section
  title="Object"
  actions={<Button size="xs" variant="subtle">Reset</Button>}
  open={open}
  onOpenChange={setOpen}>
  {fields}
</Section>

<Section title="Advanced" collapsible={false}>…</Section>`}
          />
          <StoryProps
            rows={[
              { name: 'title', type: 'ReactNode', description: '标题内容；也可用 triggerMode="icon" 改为图标触发。' },
              { name: 'size', type: "'sm' | 'md'", defaultValue: "'sm'", description: '24px 或 32px 头部。' },
              {
                name: 'variant',
                type: "'surface' | 'subtle' | 'transparent'",
                defaultValue: "'subtle'",
                description: '面板表面。',
              },
              { name: 'collapsible', type: 'boolean', defaultValue: 'true', description: 'false 时固定展开。' },
              { name: 'actions', type: 'ReactNode', description: '标题旁与折叠独立的操作。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <SectionPage /> }
