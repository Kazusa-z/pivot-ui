import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Badge, Tag } from '../src/widgets/display/Badge'
import { Button } from '../src/widgets/buttons'
import { Text } from '../src/foundation/typography'
import { StoryPage, StorySection, StoryCard, StoryRow, StoryGrid, StoryState, StoryCode } from './support/StoryPage'

const colors = ['gray', 'green', 'red', 'blue', 'orange', 'amber', 'gold', 'violet'] as const
const initialTags = ['Mesh', 'Material', 'Texture']

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Badge 展示状态、数量或分类，Tag 额外提供移除入口。颜色、尺寸和外形影响展示；Tag 的 onRemove 通知应用，应用接受后更新数组，标签才会消失。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Widgets/Display/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>
export default meta
type Story = StoryObj<typeof meta>

function BadgeExample() {
  const [tags, setTags] = useState(initialTags)
  const [requests, setRequests] = useState(0)
  return (
    <StoryPage
      eyebrow="Widgets / Display"
      title="Badge & Tag"
      summary="用短文字和颜色标记状态或分类。Badge 只展示；Tag 提供可移除入口，移除结果由应用决定。"
      meta={
        <>
          <span>8 colors</span>
          <span>·</span>
          <span>solid / surface</span>
          <span>·</span>
          <span>pill</span>
        </>
      }
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setTags(initialTags)
            setRequests(0)
          }}>
          Reset
        </Button>
      }>
      <StorySection
        title="Colors"
        description="solid 是实心 tint，surface 增加 1px 边框；orange/gold/violet 属于分类色，不表示状态。">
        {(['solid', 'surface'] as const).map((variant) => (
          <StoryRow key={variant}>
            <Text size="xs" tone="muted" css={{ width: '56px' }}>
              {variant}
            </Text>
            {colors.map((color) => (
              <Badge key={color} color={color} variant={variant}>
                {color}
              </Badge>
            ))}
          </StoryRow>
        ))}
      </StorySection>

      <StorySection title="Sizes and shapes" description="xs 用于密集的元信息；pill 适合筛选标签；code 使用等宽字体。">
        <StoryCard>
          <StoryRow>
            <Badge size="xs">XS</Badge>
            <Badge pill color="blue">
              Pill
            </Badge>
            <Badge code color="violet">
              Code
            </Badge>
            <Badge active>Active</Badge>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="Tags"
        description="移除按钮使用 onRemove；应用更新数组后标签消失。禁用 Tag 仍保留内容，但不可移除。">
        <StoryCard>
          <StoryRow>
            {tags.map((tag) => (
              <Tag
                key={tag}
                color="blue"
                pill
                onRemove={() => {
                  setRequests((value) => value + 1)
                  setTags((items) => items.filter((item) => item !== tag))
                }}>
                {tag}
              </Tag>
            ))}
            <Tag onRemove={() => setRequests((value) => value + 1)}>Keep me</Tag>
            <Tag disabled onRemove={() => setRequests((value) => value + 1)}>
              Disabled tag
            </Tag>
          </StoryRow>
        </StoryCard>
        <StoryState label="Parent-owned tags" value={{ tags, removeRequests: requests }} open />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Badge color="green">Ready</Badge>
<Badge color="blue" variant="surface" pill>Selected</Badge>
<Tag color="blue" onRemove={() => remove(tag.id)}>
  {tag.label}
</Tag>`}
          />
          <StoryCard title="Rules">
            <Text size="sm" tone="muted">
              用颜色表达状态时优先使用 green / red / blue / amber；分类用 orange / gold /
              violet。不要只靠颜色传达含义，文字本身要能读懂。
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <BadgeExample /> }
