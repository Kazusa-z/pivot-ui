import type { Meta, StoryObj } from '@storybook/react'
import { css } from '../styled-system/css'
import { Text, Bold, Link, Title, type TextSize } from '../src/foundation/typography'
import { StoryPage, StorySection, StoryRow, StoryCard, StoryGrid, StoryCode, StoryProps } from './support/StoryPage'

const textSizes: TextSize[] = ['xs', 'sm', 'md', 'lg', 'xl', 5]

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Text、Title、Bold 和 Link 提供统一的字体、字号与文字颜色。as 决定 HTML 语义，size 决定视觉尺寸；标题按文档层级选择标签，链接提供真实 href。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Foundation/Typography',
  component: Text,
} satisfies Meta<typeof Text>
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Foundation"
      title="Typography"
      summary="正文、标题、强调和链接使用同一套字阶。组件只负责视觉层级；文档结构仍由 as 选择正确的 HTML 元素。"
      meta={
        <>
          <span>11 / 12 / 14 / 16 / 18 / 24</span>
          <span>·</span>
          <span>system font stack</span>
        </>
      }>
      <StorySection
        title="Text"
        description="正文可以组合强调、链接、次要说明、错误说明、代码和删除线。尺寸默认继承，按场景显式选择。">
        <StoryCard>
          <Text>
            正文可以组合普通说明、
            <Bold>需要读者注意的强调文字</Bold>，以及指向页面其他位置的{' '}
            <Link href="#typography-destination">可跳转链接</Link>。
          </Text>
          <Text tone="muted">次要说明文字使用 muted tone。</Text>
          <Text tone="strong">重点文字使用 strong tone。</Text>
          <Text tone="danger">错误说明使用 danger tone。</Text>
          <Text as="code" monospace selectable>
            object.position.x = 2
          </Text>
          <Text as="del">使用删除线语义的文字</Text>
          <Text truncate title="这段长内容截断显示，完整文字可通过 title 查看" css={{ maxWidth: '220px' }}>
            这段长内容截断显示，完整文字可通过 title 查看
          </Text>
          <Text id="typography-destination" tone="muted">
            Link destination
          </Text>
        </StoryCard>
      </StorySection>

      <StorySection title="Sizes" description="Text 提供从 micro 到 display 的字号；数值 5 对应 display。">
        <StoryCard>
          <StoryRow align="start">
            {textSizes.map((size) => (
              <div key={String(size)} className={css({ display: 'grid', gap: 'var(--space-1)', minWidth: '120px' })}>
                <Text size="xs" tone="muted">
                  size {String(size)}
                </Text>
                <Text size={size}>Preview text</Text>
              </div>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="Headings"
        description="Title 默认渲染 h2；使用 as 建立正确的文档结构，不要用视觉字号代替语义。">
        <StoryCard>
          <Title as="h1" size={1}>
            一级标题，视觉尺寸 1
          </Title>
          <Title as="h2" size={2}>
            二级标题，视觉尺寸 2
          </Title>
          <Title as="h3" size={3}>
            三级标题，视觉尺寸 3
          </Title>
          <Title as="h4" size={4}>
            四级标题，视觉尺寸 4
          </Title>
          <Title as="h5" size={5}>
            五级标题，视觉尺寸 5
          </Title>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage" description="保持排版组件轻量：视觉样式由 size/tone/weight 控制，行为由外层组合。">
        <StoryGrid>
          <div id="typography-usage">
            <StoryCode
              label="tsx"
              code={`<Title as="h2" size={3}>Object settings</Title>
<Text size="md">Edit the selected object.</Text>
<Text as="p" size="sm" tone="muted">Changes are saved automatically.</Text>
<Link href="/docs">Open documentation</Link>`}
            />
          </div>
          <StoryProps
            rows={[
              { name: 'as', type: "'p' | 'span' | ...", defaultValue: "'p'", description: 'HTML 语义。' },
              { name: 'size', type: 'TextSize', defaultValue: 'inherit', description: '视觉字号，不改变语义。' },
              {
                name: 'tone',
                type: 'default | muted | strong | danger',
                defaultValue: 'default',
                description: '文字颜色角色。',
              },
              {
                name: 'weight',
                type: 'light | normal | medium | semi | bold',
                defaultValue: 'normal',
                description: '字重。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
