import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '../src/layout/Separator'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import { StoryPage, StorySection, StoryCard, StoryRow, StoryCode } from './support/StoryPage'

const verticalRow = css({ height: '36px' })

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Separator 用于相邻内容之间的水平或垂直分隔。orientation 决定方向；decorative 表示线条仅用于视觉，decorative={false} 会提供 separator 语义。垂直分隔线需要外层给出可用高度。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Display/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Display"
      title="Separator"
      summary="用一条线分隔相邻内容。装饰性分隔使用 decorative，语义性分隔提供 separator role；垂直分隔需要明确的容器高度。">
      <StorySection title="Horizontal" description="默认方向；用于分隔上下内容块。">
        <StoryCard>
          <Text size="sm">Before the horizontal separator</Text>
          <Separator decorative={false} />
          <Text size="sm">After the horizontal separator</Text>
        </StoryCard>
      </StorySection>

      <StorySection title="Vertical" description="垂直分隔需要外层提供高度；适合工具栏或行内信息。">
        <StoryCard>
          <StoryRow className={verticalRow}>
            <Text size="sm">Left</Text>
            <Separator orientation="vertical" decorative={false} />
            <Text size="sm">Right</Text>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection title="Decorative" description="仅用于视觉分组时隐藏语义，避免读屏器重复播报。">
        <StoryCard>
          <StoryRow>
            <Text size="sm">Mesh</Text>
            <Separator orientation="vertical" decorative />
            <Text size="sm" tone="muted">
              12 vertices
            </Text>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryCode
          label="tsx"
          code={`<Separator />
<Separator orientation="vertical" decorative />
<Separator decorative={false} />`}
        />
      </StorySection>
    </StoryPage>
  ),
}
