import type { Meta, StoryObj } from '@storybook/react'
import { Bold, Link, Text, Title, type TextSize } from '../src/foundation/typography'
import { describeComponent } from './support/describe'
import { Column, Item, Row } from './support/layout'

const meta = {
  title: 'Foundation/Typography',
  component: Text,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '正文、标题、强调和链接：`Text`、`Title`、`Bold`、`Link` 共用一套字阶和文字色。',
    use: [
      '界面说明文字、帮助文字、错误说明（`tone`）',
      '面板或页面标题：`Title`，`as` 决定 h1–h6 语义，`size` 决定视觉大小',
      '代码、路径、数值：`monospace`',
    ],
    avoid: ['控件内部的标签文字 → 控件自带字号，不需要再包 `Text`', '状态标签 → 用 `Badge`'],
    related: ['`Kbd`：快捷键', '`ReadonlyValue`：只读的属性值'],
  }),
  args: { children: '编辑选中对象的位置、旋转和缩放。' },
} satisfies Meta<typeof Text>
export default meta
type Story = StoryObj<typeof meta>

/** 不设置 `size` 时继承父元素字号。 */
export const Basic: Story = {}

/** `xs` 11（元信息）/ `sm` 12（紧凑界面）/ `md` 14（常规）/ `lg` 16（小标题）/ `5` 24（页面标题）。 */
export const Sizes: Story = {
  render: (args) => (
    <Column>
      {(['xs', 'sm', 'md', 'lg', 5] as TextSize[]).map((size) => (
        <Item key={String(size)} label={`size ${String(size)}`}>
          <Text {...args} size={size} />
        </Item>
      ))}
    </Column>
  ),
}

/** 次要说明用 `muted`，重点用 `strong`，错误说明用 `danger`。 */
export const Tones: Story = {
  render: () => (
    <Column>
      <Text>默认正文。</Text>
      <Text tone="muted">次要说明，例如字段下方的帮助文字。</Text>
      <Text tone="strong">需要读者注意的重点。</Text>
      <Text tone="danger">名称不能为空。</Text>
    </Column>
  ),
}

/** 正文中组合强调和链接；代码、路径用等宽字体；长内容单行截断并用 title 提供全文。 */
export const Inline: Story = {
  render: () => (
    <Column width={360}>
      <Text>
        修改会应用到 <Bold>所有选中的对象</Bold>，详见 <Link href="#typography">批量编辑说明</Link>。
      </Text>
      <Text as="code" monospace selectable>
        Assets/Materials/Metal.mat
      </Text>
      <Text truncate title="Assets/Environment/Outdoor/Forest/Trees/Pine_LOD0.prefab">
        Assets/Environment/Outdoor/Forest/Trees/Pine_LOD0.prefab
      </Text>
    </Column>
  ),
}

/** `as` 按文档层级选标签，`size` 独立选择视觉大小；不要用字号代替语义。 */
export const Headings: Story = {
  render: () => (
    <Column>
      {([1, 2, 3, 4, 5] as const).map((size) => (
        <Row key={size}>
          <Title as={`h${size}`} size={size}>
            Object settings
          </Title>
          <Text size="xs" tone="muted">
            h{size} · size {size}
          </Text>
        </Row>
      ))}
    </Column>
  ),
}
