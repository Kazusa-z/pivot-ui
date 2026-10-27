import type { Meta, StoryObj } from '@storybook/react'
import { Accordion, AccordionItem } from '../src/layout/disclosure'
import { Text } from '../src/foundation/typography'
import { describeComponent } from './support/describe'
import { Item, Panel, Row } from './support/layout'

const items = [
  { value: 'lighting', title: 'Lighting', body: '环境光、光照贴图和反射探针。' },
  { value: 'post', title: 'Post-processing', body: '色调映射、泛光和景深。' },
  { value: 'physics', title: 'Physics', body: '重力、碰撞层和求解器迭代次数。' },
]

const meta = {
  title: 'Layout/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '一组相连的折叠分组；`type="single"` 时一次只展开一个。',
    use: ['设置页里互相独立、但一次只关心一个的分组', '帮助、FAQ 这类内容较长的折叠列表'],
    avoid: ['属性面板里需要同时展开多个的分组 → 用多个 `Section`'],
    related: ['`Section`：独立的折叠分组'],
    notes: [
      '`type="single"` 一次只展开一个，可配合 `collapsible` 允许全部收起；`type="multiple"` 可以同时展开多个',
      '每个分组是一个 `AccordionItem`，`value` 唯一标识它',
    ],
    keyboard: [
      ['Enter / Space', '展开或收起当前分组'],
      ['↑ / ↓', '在分组标题之间移动'],
      ['Home / End', '跳到第一个 / 最后一个标题'],
    ],
  }),
  args: { type: 'single', collapsible: true, defaultValue: 'lighting' },
} satisfies Meta<typeof Accordion>
export default meta
type Story = StoryObj<typeof meta>

function Items() {
  return items.map((item) => (
    <AccordionItem key={item.value} value={item.value} title={item.title}>
      <Text size="sm" tone="muted">
        {item.body}
      </Text>
    </AccordionItem>
  ))
}

export const Basic: Story = {
  render: (args) => (
    <Panel>
      <Accordion {...args}>
        <Items />
      </Accordion>
    </Panel>
  ),
}

/** `type="multiple"` 可以同时展开多个分组。 */
export const Multiple: Story = {
  render: () => (
    <Panel>
      <Accordion type="multiple" defaultValue={['lighting', 'physics']}>
        <Items />
      </Accordion>
    </Panel>
  ),
}

/** `surface` 带边框的连续卡片（默认）与 `subtle` 面板底色；`sm` 24 / `md` 32 两档标题高度。 */
export const Appearance: Story = {
  render: () => (
    <Row>
      {(
        [
          ['surface', 'sm'],
          ['subtle', 'sm'],
          ['surface', 'md'],
        ] as const
      ).map(([variant, size]) => (
        <Item key={`${variant}-${size}`} label={`${variant} · ${size}`}>
          <Panel width={260}>
            <Accordion type="single" collapsible defaultValue="lighting" variant={variant} size={size}>
              <Items />
            </Accordion>
          </Panel>
        </Item>
      ))}
    </Row>
  ),
}
