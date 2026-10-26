import type { Meta, StoryObj } from '@storybook/react'
import { SectionDivider } from '../src/layout/SectionDivider'
import { Title, Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import { StoryPage, StorySection, StoryCard, StoryGrid, StoryCode, StoryProps } from './support/StoryPage'

const narrow = css({ width: '220px', maxWidth: '100%' })
const panel = css({ display: 'grid', gap: 'var(--space-3)', width: '280px', maxWidth: '100%' })

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'SectionDivider 在内容组之间放一条带文字的分隔线。children 决定标题内容；需要文档标题语义时放入 Title，并按页面层级选择 as。长标题在可用宽度内换行。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Layout/SectionDivider',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Layout"
      title="SectionDivider"
      summary="带文字的分组分隔线。两侧线条提供视觉分组，文字本身决定标题语义；它不是可折叠区域。"
      meta={
        <>
          <span>12px label</span>
          <span>·</span>
          <span>wraps in narrow panels</span>
        </>
      }>
      <StorySection title="Basic" description="标题通过 as 选择文档层级；两侧线条只是视觉分组。">
        <StoryCard>
          <div className={narrow}>
            <SectionDivider>
              <Title as="h2" size={1}>
                Lighting
              </Title>
            </SectionDivider>
            <Text size="sm" tone="muted">
              标题通过 as 选择文档层级，两侧线条用于视觉分组。
            </Text>
          </div>
        </StoryCard>
      </StorySection>

      <StorySection title="In a panel" description="在属性面板中分隔相关字段组；分组线跟随可用宽度。">
        <StoryCard>
          <div className={panel}>
            <Text size="sm">Surface properties</Text>
            <SectionDivider>Material</SectionDivider>
            <Text size="sm" tone="muted">
              Base color, roughness, metallic.
            </Text>
            <SectionDivider>Emission</SectionDivider>
            <Text size="sm" tone="muted">
              Color and strength.
            </Text>
          </div>
        </StoryCard>
      </StorySection>

      <StorySection title="Long label" description="窄侧栏中的长标题在可用宽度内换行，不撑宽容器。">
        <StoryCard>
          <div className={narrow}>
            <SectionDivider>较长的分组标题会在窄侧栏的可用宽度内换行</SectionDivider>
          </div>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<SectionDivider>
  <Title as="h2" size={1}>Lighting</Title>
</SectionDivider>

<SectionDivider>Material</SectionDivider>`}
          />
          <StoryProps
            rows={[
              { name: 'children', type: 'ReactNode', description: '分隔线中的标题内容；可用 Title 提供语义。' },
              { name: 'css', type: 'SystemStyleObject', description: '局部宽度或颜色覆盖。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
