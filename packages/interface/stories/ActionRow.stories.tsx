import { useId, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PropertyRow, PropertyLabel, PropertyControl } from '../src/layout/PropertyRow'
import { Button } from '../src/widgets/buttons'
import { Flex } from '../src/layout/Flex'
import { Input } from '../src/widgets/inputs/Input'
import { Text } from '../src/foundation/typography'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryCode,
  StoryState,
  StoryProps,
} from './support/StoryPage'

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '动作行把刷新预览、打开工具等操作放进属性面板的一行。用 PropertyRow/PropertyLabel/PropertyControl 提供对齐和组名称，多个 Button 用 association="group" 共享标签，每个按钮保留自己的操作名称。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Layout/ActionRow',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function ActionRowExample() {
  const id = useId()
  const [count, setCount] = useState(0)
  return (
    <StoryCard title="Preview actions" description="组名来自 PropertyLabel；按钮分别说明动作。">
      <PropertyRow>
        <PropertyLabel id={id}>Preview</PropertyLabel>
        <PropertyControl association="group" labelledBy={id}>
          <Flex gap="sm" wrap="wrap">
            <Button onClick={() => setCount((value) => value + 1)}>Refresh preview</Button>
            <Button disabled>Open renderer</Button>
          </Flex>
        </PropertyControl>
      </PropertyRow>
      <StoryState label="Actions" value={{ refreshCount: count }} open />
    </StoryCard>
  )
}

function MixedRowExample() {
  const inputId = useId()
  const actionId = useId()
  const [name, setName] = useState('Cube')
  const [saved, setSaved] = useState(0)
  return (
    <StoryCard title="Input + actions" description="同一行可以放一个可编辑值和一组操作；标签和控件通过 id 关联。">
      <PropertyRow>
        <PropertyLabel htmlFor={inputId}>Name</PropertyLabel>
        <PropertyControl association="control">
          <Input id={inputId} value={name} onValueChange={setName} size="sm" />
        </PropertyControl>
      </PropertyRow>
      <PropertyRow>
        <PropertyLabel id={actionId}>Actions</PropertyLabel>
        <PropertyControl association="group" labelledBy={actionId}>
          <StoryRow>
            <Button size="sm" variant="outline" onClick={() => setSaved((value) => value + 1)}>
              Save
            </Button>
            <Button size="sm" variant="subtle" onClick={() => setName('Cube')}>
              Reset name
            </Button>
          </StoryRow>
        </PropertyControl>
      </PropertyRow>
      <Text size="sm" tone="muted">
        当前名称：{name}
      </Text>
      <StoryState label="Row state" value={{ name, saved }} />
    </StoryCard>
  )
}

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Layout"
      title="ActionRow"
      summary="不是独立组件，而是 PropertyRow + 一组 Button 的组合模式。它让操作与属性面板其他行对齐，并保持可访问名称。"
      meta={
        <>
          <span>PropertyRow</span>
          <span>·</span>
          <span>group label</span>
          <span>·</span>
          <span>actions</span>
        </>
      }>
      <StorySection title="Actions">
        <ActionRowExample />
      </StorySection>

      <StorySection title="Mixed row" description="输入和操作可以分成两行；组内按钮共享组名，但各自保留操作名。">
        <MixedRowExample />
      </StorySection>

      <StorySection title="Alignment" description="标签列与属性行共用同一套 grid；多个动作使用 gap token 排列。">
        <StoryCard>
          <PropertyRow>
            <PropertyLabel id="align-description">Transform</PropertyLabel>
            <PropertyControl association="group" labelledBy="align-description">
              <Flex gap="xs" wrap="wrap">
                <Button size="xs" variant="outline">
                  Reset
                </Button>
                <Button size="xs" variant="outline">
                  Copy
                </Button>
                <Button size="xs" variant="outline">
                  Paste
                </Button>
              </Flex>
            </PropertyControl>
          </PropertyRow>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const id = useId()

<PropertyRow>
  <PropertyLabel id={id}>Preview</PropertyLabel>
  <PropertyControl association="group" labelledBy={id}>
    <Flex gap="sm">
      <Button>Refresh preview</Button>
      <Button disabled>Open renderer</Button>
    </Flex>
  </PropertyControl>
</PropertyRow>`}
          />
          <StoryProps
            rows={[
              { name: 'PropertyRow', type: 'layout', description: '标签/控件网格；移动端自动收窄。' },
              { name: 'PropertyLabel', type: 'ReactNode', description: '组名或控件标签；用 id 关联。' },
              {
                name: 'PropertyControl association',
                type: "'group' | 'control' | 'none'",
                defaultValue: "'group'",
                description: '组名称关联或单个控件。',
              },
              { name: 'PropertyControl labelledBy', type: 'string', description: 'association="group" 时的标签 id。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
