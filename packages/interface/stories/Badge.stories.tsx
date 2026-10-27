import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Badge, Tag } from '../src/display/Badge'
import { describeComponent } from './support/describe'
import { Item, Row } from './support/layout'

const colors = ['gray', 'blue', 'green', 'amber', 'red', 'violet'] as const

const meta = {
  title: 'Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '短文字标签，标出状态或分类；`Tag` 是可以移除的 Badge。',
    use: ['资源状态：ready、draft、missing', '分类或类型：texture、material', '已选的筛选条件：`Tag` 带移除按钮'],
    avoid: ['长句说明 → 用 `Callout`', '可点击的操作 → 用 `Button`', '快捷键 → 用 `Kbd`'],
    related: ['`Callout`：成段的状态说明', '`Kbd`：快捷键'],
    notes: [
      '状态用 gray / blue / green / amber / red，分类只用 violet；更多分类用文字区分',
      '不要只靠颜色表达含义，文字本身要能读懂',
      '放在实心选中的表格行里时，Badge 会自动切换成半透明白色以保持可读',
    ],
  }),
  args: { children: 'ready', color: 'green' },
} satisfies Meta<typeof Badge>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** 五种状态色和一种分类色。`surface` 加 1px 边框，适合放在有底色的区域。 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      {(['solid', 'surface'] as const).map((variant) => (
        <Item key={variant} label={variant}>
          <Row>
            {colors.map((color) => (
              <Badge key={color} color={color} variant={variant}>
                {color}
              </Badge>
            ))}
          </Row>
        </Item>
      ))}
    </div>
  ),
}

/** `xs` 用于元信息；`pill` 适合筛选；`code` 用等宽字体；`active` 表示当前选中的条件。 */
export const Shapes: Story = {
  render: () => (
    <Row>
      <Badge size="xs">xs</Badge>
      <Badge pill color="blue">
        pill
      </Badge>
      <Badge code color="violet">
        .prefab
      </Badge>
      <Badge active>active</Badge>
    </Row>
  ),
}

/** `Tag` 的移除按钮只发出请求，由应用从列表中删除；禁用的 Tag 仍然显示但不能移除。 */
export const Tags: Story = {
  render: function Render() {
    const [tags, setTags] = useState(['Mesh', 'Material', 'Texture'])
    return (
      <Row>
        {tags.map((tag) => (
          <Tag key={tag} color="blue" onRemove={() => setTags((items) => items.filter((item) => item !== tag))}>
            {tag}
          </Tag>
        ))}
        <Tag disabled onRemove={() => {}}>
          Locked
        </Tag>
      </Row>
    )
  },
}
