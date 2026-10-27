import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconDots, IconRestore } from '@tabler/icons-react'
import { Section } from '../src/layout/disclosure'
import { PropertyControl, PropertyLabel, PropertyRow } from '../src/layout/PropertyRow'
import { IconButton } from '../src/controls/buttons'
import { NumberInput } from '../src/controls/inputs/NumberInput'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { describeComponent } from './support/describe'
import { Column, Item, Panel, Row, StateView } from './support/layout'

function TransformFields() {
  return (
    <Column>
      {['X', 'Y', 'Z'].map((axis) => (
        <PropertyRow key={axis}>
          <PropertyLabel htmlFor={`position-${axis}`}>Position {axis}</PropertyLabel>
          <PropertyControl association="control">
            <NumberInput id={`position-${axis}`} defaultValue={0} endSlot="m" />
          </PropertyControl>
        </PropertyRow>
      ))}
    </Column>
  )
}

const meta = {
  title: 'Layout/Section',
  component: Section,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '带标题的分组，默认展开，点击标题折叠；属性面板的基本组织单位。',
    use: ['属性面板里的 Transform、Material、Lighting 等分组', '需要固定展开的分组：`collapsible={false}`'],
    avoid: [
      '一组互相关联、通常一次只展开一个的分组 → 用 `Accordion`',
      '只是视觉上的分隔 → 用 `SectionDivider` 或 `Separator`',
    ],
    related: ['`Accordion`：一组联动的折叠分组', '`SectionDivider`：带文字的分隔线'],
    notes: [
      '标题栏里的按钮放 `actions`，点击它们不会折叠分组',
      '`defaultOpen={false}` 默认收起；`open` / `onOpenChange` 受控展开状态',
    ],
    keyboard: [['Enter / Space', '在标题上展开或收起']],
  }),
  args: { title: 'Transform', children: <TransformFields /> },
  argTypes: { children: { control: false }, actions: { control: false } },
} satisfies Meta<typeof Section>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: (args) => (
    <Panel>
      <Section {...args} />
    </Panel>
  ),
}

/** 标题栏右侧的 `actions` 适合放 `subtle` 的图标按钮。 */
export const WithActions: Story = {
  args: {
    actions: (
      <Row>
        <IconButton variant="subtle" size="xs" aria-label="Reset transform">
          <IconRestore />
        </IconButton>
        <IconButton variant="subtle" size="xs" aria-label="More options">
          <IconDots />
        </IconButton>
      </Row>
    ),
  },
  render: (args) => (
    <Panel>
      <Section {...args} />
    </Panel>
  ),
}

/** `subtle` 面板底色（默认）、`surface` 带边框卡片、`transparent` 无底色。 */
export const Variants: Story = {
  render: () => (
    <Row>
      {(['subtle', 'surface', 'transparent'] as const).map((variant) => (
        <Item key={variant} label={variant}>
          <Panel width={260}>
            <Section title="Shadows" variant={variant}>
              <Checkbox label="Cast shadows" defaultChecked />
            </Section>
          </Panel>
        </Item>
      ))}
    </Row>
  ),
}

/** `sm` 24 用于面板，`md` 32 用于表单和对话框。 */
export const Sizes: Story = {
  render: () => (
    <Row>
      {(['sm', 'md'] as const).map((size) => (
        <Item key={size} label={size}>
          <Panel width={260}>
            <Section title="Rendering" size={size}>
              <Checkbox label="Receive shadows" defaultChecked size={size === 'md' ? 'md' : 'sm'} />
            </Section>
          </Panel>
        </Item>
      ))}
    </Row>
  ),
}

/** 默认收起、固定展开、禁用，以及只有箭头可点击（`triggerMode="icon"`）。 */
export const States: Story = {
  render: () => (
    <Panel width={300}>
      <Column>
        <Section title="Collapsed by default" defaultOpen={false}>
          <Checkbox label="Static" />
        </Section>
        <Section title="Always open" collapsible={false}>
          <Checkbox label="Static" />
        </Section>
        <Section title="Disabled" disabled>
          <Checkbox label="Static" />
        </Section>
        <Section title="Icon trigger" triggerMode="icon" triggerLabel="Toggle icon trigger section">
          <Checkbox label="Static" />
        </Section>
      </Column>
    </Panel>
  ),
}

/** 嵌套分组各自保存展开状态；受控时由应用决定是否接受展开请求。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [open, setOpen] = useState(true)
    const [nested, setNested] = useState(false)
    return (
      <Panel width={320}>
        <Section title="Outer" open={open} onOpenChange={setOpen}>
          <Section title="Nested" open={nested} onOpenChange={setNested} variant="transparent">
            <Checkbox label="Option" />
          </Section>
        </Section>
        <StateView value={{ open, nested }} />
      </Panel>
    )
  },
}
