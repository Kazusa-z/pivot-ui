import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea, ScrollAreaRoot, ScrollAreaViewport } from '../src/widgets/display/ScrollArea'
import { Button } from '../src/widgets/buttons'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import { StoryPage, StorySection, StoryCard, StoryRow, StoryGrid, StoryCode, StoryState } from './support/StoryPage'

const frame = css({
  width: 'min(340px, 100%)',
  height: '220px',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-control)',
  overflow: 'hidden',
})
const row = css({
  padding: 'var(--space-3)',
  borderBottom: '1px solid var(--colors-border)',
  overflowWrap: 'anywhere',
  fontSize: 'var(--fontSizes-control)',
})
const horizontalFrame = css({ width: '100%', height: '160px' })
const wideContent = css({ display: 'flex', gap: 'var(--space-3)', width: '880px', padding: 'var(--space-4)' })
const cardContent = css({
  minWidth: '120px',
  padding: 'var(--space-3)',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-control)',
  backgroundColor: 'var(--colors-surface)',
})

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ScrollArea 用于在有限空间里浏览长内容，支持横向、纵向和双向滚动。Root 管理尺寸和滚动条，Viewport 承载实际内容；onScroll 和 scrollTo ref 放在 Viewport。固定区域设置明确尺寸，随内容增长的区域使用 sizing="content" 并提供 maxHeight。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Display/ScrollArea',
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>
export default meta
type Story = StoryObj<typeof meta>

function VerticalExample() {
  const rootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [count, setCount] = useState(12)
  return (
    <StoryCard title="Vertical" description="Viewport 的 ref 和 scroll 事件用于读取位置、调用 scrollTo。">
      <StoryRow>
        <Button size="sm" variant="outline" onClick={() => viewportRef.current?.scrollTo({ top: 0 })}>
          Scroll to top
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight })}>
          Scroll to bottom
        </Button>
        <Button size="sm" variant="outline" onClick={() => setCount((value) => (value === 12 ? 2 : 12))}>
          Toggle content
        </Button>
      </StoryRow>
      <ScrollAreaRoot ref={rootRef} className={frame} scrollbars="vertical" type="always" shadows>
        <ScrollAreaViewport
          ref={viewportRef}
          aria-label="Scrollable rows"
          onScroll={(event) => setOffset(Math.round(event.currentTarget.scrollTop))}>
          {Array.from({ length: count }, (_, index) => (
            <div key={index} className={row}>
              Row {index + 1}: editable properties and contextual details
            </div>
          ))}
        </ScrollAreaViewport>
      </ScrollAreaRoot>
      <Text size="sm" tone="muted">
        Scroll top: {offset}px
      </Text>
      <StoryState label="Scroll state" value={{ offset }} />
    </StoryCard>
  )
}

function ScrollExample() {
  const [long, setLong] = useState(false)
  return (
    <StoryPage
      eyebrow="Display"
      title="ScrollArea"
      summary="在有限高度的面板里滚动长内容。Root 管尺寸，Viewport 管滚动；固定面板用 fill，随内容增长的面板用 content + maxHeight。"
      meta={
        <>
          <span>vertical</span>
          <span>·</span>
          <span>horizontal</span>
          <span>·</span>
          <span>both axes</span>
        </>
      }>
      <StorySection title="Vertical" description="固定高度，滚动条按需出现；阴影提示还有内容。">
        <VerticalExample />
      </StorySection>

      <StorySection title="Horizontal" description="内容保持自身宽度，Viewport 使用 intrinsic 布局。">
        <StoryCard>
          <ScrollArea
            className={horizontalFrame}
            scrollbars="horizontal"
            type="always"
            shadows
            viewportProps={{ 'aria-label': 'Horizontal strip', contentLayout: 'intrinsic' }}>
            <div className={wideContent}>
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className={cardContent}>
                  <Text size="sm">Card {index + 1}</Text>
                </div>
              ))}
            </div>
          </ScrollArea>
        </StoryCard>
      </StorySection>

      <StorySection title="Both axes" description="二维内容；track variant 显示明确轨道。">
        <StoryCard>
          <ScrollArea
            className={frame}
            scrollbars="both"
            type="always"
            scrollbarVariant="track"
            shadows
            viewportProps={{ 'aria-label': 'Two dimensional content', contentLayout: 'intrinsic' }}>
            <div className={css({ width: '720px' })}>
              {Array.from({ length: 12 }, (_, index) => (
                <div key={index} className={row}>
                  Wide row {index + 1}: column A — column B — column C — column D — column E
                </div>
              ))}
            </div>
          </ScrollArea>
        </StoryCard>
      </StorySection>

      <StorySection title="Content height" description="内容较少时随内容增高，超过 maxHeight 后开始滚动。">
        <StoryCard>
          <StoryRow>
            <Button size="sm" variant="outline" onClick={() => setLong((value) => !value)}>
              Toggle long content
            </Button>
          </StoryRow>
          <ScrollArea
            sizing="content"
            scrollbars="vertical"
            type="auto"
            shadows
            css={{ maxHeight: '180px', border: '1px solid var(--colors-border)', borderRadius: 'var(--radii-control)' }}
            viewportProps={{ 'aria-label': 'Content sized scroll area' }}>
            {Array.from({ length: long ? 10 : 2 }, (_, index) => (
              <div key={index} className={row}>
                Content row {index + 1}
              </div>
            ))}
          </ScrollArea>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const viewport = useRef<HTMLDivElement>(null)

<ScrollArea
  sizing="fill"
  viewportRef={viewport}
  viewportProps={{ onScroll: handleScroll }}>
  {rows}
</ScrollArea>`}
          />
          <StoryCard title="Sizing">
            <Text size="sm" tone="muted">
              固定面板用 fill，需要父容器有明确高度；内容面板用 content + maxHeight。滚动条策略由 type 和 scrollbars
              控制。
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <ScrollExample /> }
