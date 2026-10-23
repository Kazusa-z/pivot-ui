import type { Meta, StoryObj } from '@storybook/react'
import { css } from '../styled-system/css'
import { Text, Bold, Link, Title, type TextSize } from '../src/foundation/typography'

const stack = css({ display: 'flex', flexDirection: 'column', gap: '12px', width: 'min(480px, 90vw)' })

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Text、Title、Bold 和 Link 用于正文、标题、强调和链接，统一字体、字号与文字颜色。as 决定 HTML 语义，size 决定视觉大小，两者可以分别选择。应用按文档层级选择标题标签，为链接提供 href；截断长文字时可通过 title 或详情区域提供完整内容。',
      },
    },
  },
  title: 'Foundation/Typography',
  component: Text,
} satisfies Meta<typeof Text>
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <section className={stack}>
      <Title as="h1" size={3}>
        Typography
      </Title>
      <Text>
        正文可以组合普通说明、<Bold>需要读者注意的强调文字</Bold>，以及指向页面其他位置的{' '}
        <Link href="#typography-destination">可跳转链接，点击后前往下方目标位置</Link>。
      </Text>
      <Text tone="muted">次要说明文字。</Text>
      <Text tone="strong">重点文字。</Text>
      <Text tone="danger">清晰说明错误原因的文字。</Text>
      <Text as="code" monospace selectable>
        object.position.x = 2
      </Text>
      <Text as="del">使用删除线语义的文字</Text>
      <Text truncate title="这段长内容截断显示，完整文字可通过 title 查看" css={{ maxWidth: '180px' }}>
        这段长内容截断显示，完整文字可通过 title 查看
      </Text>
      <Text id="typography-destination">Link destination</Text>
    </section>
  ),
}

const textSizes: TextSize[] = ['xs', 'sm', 'md', 'lg', 'xl', 5]

export const Sizes: Story = {
  render: () => (
    <section className={stack}>
      {textSizes.map((size) => (
        <Text key={size} size={size}>
          Text size {size}
        </Text>
      ))}
    </section>
  ),
}

export const HeadingSemantics: Story = {
  render: () => (
    <section className={stack}>
      <Title as="h1" size={1}>
        一级标题，视觉尺寸 1
      </Title>
      <Title as="h2" size={4}>
        二级标题，视觉尺寸 4
      </Title>
      <Title as="h3" size={2}>
        三级标题，视觉尺寸 2
      </Title>
      <Text as="span" size={4}>
        较大的 span 仍使用普通文本语义
      </Text>
    </section>
  ),
}
