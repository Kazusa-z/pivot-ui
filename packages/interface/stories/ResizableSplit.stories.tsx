import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ResizableSplit, type ResizeCancelReason } from '../src/layout/ResizableSplit'
import { Button } from '../src/controls/buttons'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { Text } from '../src/foundation/typography'
import { Title } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryCode,
  StoryState,
  StoryKeyboard,
  StoryProps,
} from './support/StoryPage'

const pane = css({
  padding: 'var(--space-4)',
  height: '100%',
  boxSizing: 'border-box',
  background: 'var(--colors-panelBg)',
  overflow: 'auto',
  overflowWrap: 'anywhere',
})
const frame = css({
  width: '100%',
  maxWidth: '680px',
  height: '260px',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-controlMd)',
  boxSizing: 'border-box',
  overflow: 'hidden',
})

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ResizableSplit 让用户调整相邻面板或单个区域的宽度/高度。分隔条支持指针拖动、方向键和 Home/End，尺寸以 CSS px 表示；size 受控，onSizeChange/onSizeCommit 把请求交给应用保存。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Layout/ResizableSplit',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function SplitPlayground() {
  const [size, setSize] = useState(220)
  const [accept, setAccept] = useState(true)
  const [disabled, setDisabled] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const [mounted, setMounted] = useState(true)
  const [rtl, setRtl] = useState(false)
  const [requests, setRequests] = useState<number[]>([])
  const [commits, setCommits] = useState<number[]>([])
  const [cancellations, setCancellations] = useState<ResizeCancelReason[]>([])
  return (
    <StoryCard
      title="Horizontal split"
      description="拖动分隔条实时请求尺寸；取消 Accept requests 后，应用拒绝写入，显示保持旧值。">
      <StoryRow>
        <Checkbox checked={accept} onCheckedChange={setAccept} label="Accept requests" size="sm" />
        <Checkbox checked={disabled} onCheckedChange={setDisabled} label="Disabled" size="sm" />
        <Checkbox checked={narrow} onCheckedChange={setNarrow} label="Narrow container" size="sm" />
        <Checkbox checked={rtl} onCheckedChange={setRtl} label="RTL" size="sm" />
        <Button size="sm" variant="outline" onClick={() => setSize(180)}>
          External size: 180
        </Button>
        <Button size="sm" variant="outline" onClick={() => setMounted((value) => !value)}>
          {mounted ? 'Unmount split' : 'Mount split'}
        </Button>
      </StoryRow>
      <div style={{ width: narrow ? 180 : '100%', maxWidth: 680 }}>
        <div className={frame}>
          {mounted && (
            <ResizableSplit
              primary={
                <div className={pane}>
                  <Title as="h3" size={2}>
                    Primary pane
                  </Title>
                  <Text size="sm" tone="muted">
                    较长内容会按主区域的可用宽度换行。
                  </Text>
                </div>
              }
              primaryProps={{ 'aria-label': 'Primary pane' }}
              secondaryProps={{ 'aria-label': 'Secondary pane' }}
              orientation="horizontal"
              dir={rtl ? 'rtl' : 'ltr'}
              size={size}
              minSize={120}
              maxSize={420}
              minSecondarySize={80}
              disabled={disabled}
              separatorLabel="Resize primary pane"
              onSizeChange={(next) => {
                setRequests((previous) => [...previous.slice(-7), next])
                if (accept) setSize(next)
              }}
              onSizeCommit={(next) => setCommits((previous) => [...previous.slice(-7), next])}
              onResizeCancel={(reason) => setCancellations((previous) => [...previous.slice(-7), reason])}>
              <div className={pane}>
                <Title as="h3" size={2}>
                  Secondary pane
                </Title>
                <Text size="sm" tone="muted">
                  这个区域占用调整后剩余的空间。
                </Text>
              </div>
            </ResizableSplit>
          )}
        </div>
      </div>
      <StoryState label="Resize requests and parent state" value={{ size, accept, requests, commits, cancellations }} />
    </StoryCard>
  )
}

function StaticSplit({ vertical = false, end = false }: { vertical?: boolean; end?: boolean }) {
  return (
    <StoryCard
      title={vertical ? 'Vertical' : end ? 'Primary at end' : 'Horizontal'}
      description={
        vertical
          ? '上下分区，分隔条在顶部/底部之间。'
          : end
            ? 'primarySide="end" 把主区域放到右侧或下方。'
            : '左右分区。'
      }>
      <div
        className={css({
          width: '100%',
          maxWidth: '680px',
          height: vertical ? '320px' : '200px',
          border: '1px solid var(--colors-border)',
          borderRadius: 'var(--radii-controlMd)',
          overflow: 'hidden',
        })}>
        <ResizableSplit
          orientation={vertical ? 'vertical' : 'horizontal'}
          primarySide={end ? 'end' : 'start'}
          defaultSize={vertical ? 120 : 220}
          minSize={80}
          maxSize={400}
          separatorLabel={vertical ? 'Resize vertical panes' : 'Resize horizontal panes'}
          primary={
            <div className={pane}>
              <Text size="sm">Primary</Text>
            </div>
          }>
          <div className={pane}>
            <Text size="sm">Secondary</Text>
          </div>
        </ResizableSplit>
      </div>
    </StoryCard>
  )
}

function StandaloneExample() {
  return (
    <StoryCard title="Standalone region" description="省略 secondary；primaryAsChild 保留原生 section 作为区域根元素。">
      <ResizableSplit
        defaultSize={240}
        minSize={120}
        maxSize={480}
        primaryAsChild
        separatorLabel="Resize standalone region"
        primary={
          <section
            aria-label="Standalone region"
            className={pane}
            style={{ height: 180, border: '1px solid var(--colors-border)', borderRadius: 'var(--radii-control)' }}>
            拖动分隔条，或聚焦分隔条后使用键盘调整区域大小。
          </section>
        }
      />
    </StoryCard>
  )
}

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Layout"
      title="ResizableSplit"
      summary="用分隔条调整面板尺寸。组件只发出 CSS px 请求；应用决定接受、保存或撤销，受控 size 决定实际显示。"
      meta={
        <>
          <span>drag</span>
          <span>·</span>
          <span>keyboard</span>
          <span>·</span>
          <span>CSS px</span>
        </>
      }>
      <StorySection title="Playground">
        <SplitPlayground />
      </StorySection>

      <StorySection title="Orientation and primary side" description="同一组件支持左右、上下，以及 primary 在 end 侧。">
        <StoryGrid>
          <StaticSplit />
          <StaticSplit vertical />
          <StaticSplit end />
        </StoryGrid>
      </StorySection>

      <StorySection title="Standalone" description="不需要第二块区域时，只渲染 primary + 分隔条。">
        <StandaloneExample />
      </StorySection>

      <StorySection title="Keyboard" description="分隔条是一个可聚焦的 separator；方向键、Shift、Home/End 都可调整。">
        <StoryKeyboard
          rows={[
            { keys: ['ArrowLeft', 'ArrowRight'], action: '横向调整；RTL 时方向反转。' },
            { keys: ['ArrowUp', 'ArrowDown'], action: '纵向调整。' },
            { keys: ['Shift + Arrow'], action: '一次移动 10 倍步长。' },
            { keys: ['Home', 'End'], action: '到最小/最大尺寸。' },
            { keys: 'Escape', action: '取消拖动并恢复起始尺寸。' },
            { keys: 'Tab', action: '聚焦分隔条或离开。' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<ResizableSplit
  size={width}
  minSize={160}
  maxSize={480}
  onSizeChange={setWidth}
  onSizeCommit={saveWidth}
  primary={<Inspector />}>
  <Viewport />
</ResizableSplit>`}
          />
          <StoryProps
            rows={[
              {
                name: 'orientation',
                type: "'horizontal' | 'vertical'",
                defaultValue: "'horizontal'",
                description: '分区方向。',
              },
              {
                name: 'primarySide',
                type: "'start' | 'end'",
                defaultValue: "'start'",
                description: 'primary 在容器的哪一侧。',
              },
              {
                name: 'size / defaultSize',
                type: 'number',
                defaultValue: '240',
                description: '受控尺寸或初始尺寸，单位 CSS px。',
              },
              {
                name: 'minSize / maxSize',
                type: 'number',
                defaultValue: '80 / 960',
                description: 'primary 尺寸范围。',
              },
              { name: 'minSecondarySize', type: 'number', defaultValue: '80', description: '剩余区域的最小尺寸。' },
              {
                name: 'onSizeChange / onSizeCommit',
                type: '(size: number) => void',
                description: '拖动中请求 / 完成提交。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
