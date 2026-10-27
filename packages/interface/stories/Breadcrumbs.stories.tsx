import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs, type BreadcrumbEntry } from '../src/collections/navigation/Breadcrumbs'
import { Button } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const path: readonly BreadcrumbEntry[] = [
  { key: 'assets', label: 'Assets' },
  { key: 'materials', label: 'Materials' },
  { key: 'paint', label: 'Car paint' },
]

const meta = {
  title: 'Collections/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '当前位置的层级路径；上级可以点击返回，最后一级是当前位置。',
    use: ['资源库、文件夹、多层页面中显示"在哪里"', '在浏览器顶部提供快速返回上级的入口'],
    avoid: ['同级页面之间切换 → 用 `SegmentControl` 或标签页', '完整的层级浏览 → 用 `TreeRoot`'],
    related: ['`ResourceBrowser`：资源目录导航', '`Pagination`：同一层结果的分页'],
    notes: [
      '`onNavigate` 只是请求，应用切换位置后再传入新的 `items`',
      '提供 `href` 的级别渲染为链接，由浏览器导航',
      '页面上有多个导航区时，传入不同的 `aria-label`',
    ],
    keyboard: [
      ['Tab', '在可点击的级别之间移动；禁用的级别跳过'],
      ['Enter / Space', '导航到这一级'],
    ],
  }),
  args: { items: path, 'aria-label': 'Asset path' },
  argTypes: { items: { control: false }, separator: { control: false } },
} satisfies Meta<typeof Breadcrumbs>
export default meta
type Story = StoryObj<typeof meta>

/** 点击上级缩短路径；当前位置是文字，带 `aria-current="page"`。 */
export const Basic: Story = {
  render: function Render(args) {
    const [depth, setDepth] = useState(path.length)
    return (
      <Row>
        <Breadcrumbs
          {...args}
          items={path.slice(0, depth)}
          onNavigate={(key) => setDepth(path.findIndex((item) => item.key === key) + 1)}
        />
        {depth < path.length && (
          <Button size="xs" variant="subtle" onClick={() => setDepth(path.length)}>
            Reset
          </Button>
        )}
      </Row>
    )
  },
}

/** `sm` 20（面板默认），`md` 24。 */
export const Sizes: Story = {
  render: () => (
    <Column>
      {(['sm', 'md'] as const).map((size) => (
        <Item key={size} label={size}>
          <Breadcrumbs items={path} size={size} aria-label={`${size} path`} />
        </Item>
      ))}
    </Column>
  ),
}

/** 替换分隔符，或给上级提供 `href` 渲染为链接。 */
export const SeparatorAndLinks: Story = {
  render: () => (
    <Column>
      <Breadcrumbs items={path} separator="›" aria-label="Chevron path" />
      <Breadcrumbs items={path.map((item) => ({ ...item, href: `#${item.key}` }))} aria-label="Linked path" />
    </Column>
  ),
}

/** 整条禁用，或只禁用某一级。 */
export const Disabled: Story = {
  render: () => (
    <Column>
      <Item label="disabled">
        <Breadcrumbs items={path} disabled onNavigate={() => {}} aria-label="Disabled path" />
      </Item>
      <Item label="Materials 禁用">
        <Breadcrumbs
          items={path.map((item) => ({ ...item, disabled: item.key === 'materials' }))}
          onNavigate={() => {}}
          aria-label="Partially disabled path"
        />
      </Item>
    </Column>
  ),
}

/** 应用不接受导航时，路径保持不变；请求被记录下来。 */
export const BehaviorRefusedNavigation: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [requests, setRequests] = useState<string[]>([])
    return (
      <Column width={480}>
        <Breadcrumbs
          items={path}
          onNavigate={(key) => setRequests((current) => [...current, String(key)])}
          aria-label="Refused navigation"
        />
        <Breadcrumbs items={[]} aria-label="Empty path" />
        <StateView value={{ requests }} />
      </Column>
    )
  },
}
