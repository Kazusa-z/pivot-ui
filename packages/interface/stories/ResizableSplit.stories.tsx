import { StrictMode, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ResizableSplit, type ResizeCancelReason } from '../src/layout/ResizableSplit'
import { Button } from '../src/widgets/buttons'
import { css } from '../styled-system/css'
import { ContractFrame, StatePanel, contractStyles } from './support/ContractFrame'

const pane = css({
  padding: '16px',
  height: '100%',
  boxSizing: 'border-box',
  background: 'var(--colors-panelBg)',
  overflow: 'auto',
  overflowWrap: 'anywhere',
})
function Playground({ vertical = false, end = false }: { vertical?: boolean; end?: boolean }) {
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
    <ContractFrame
      title="调整相邻区域的尺寸"
      description="拖动分隔条可实时调整主区域，松开结束本次调整；Escape 或指针取消会请求恢复起始尺寸。键盘方向键调整，Shift 加速，Home/End 到边界。应用接收以 CSS px 表示的尺寸请求并回写 size；取消 Accept requests 后，显示保持应用传入的尺寸。"
      onReset={() => {
        setSize(220)
        setAccept(true)
        setDisabled(false)
        setNarrow(false)
        setMounted(true)
        setRtl(false)
        setRequests([])
        setCommits([])
        setCancellations([])
      }}>
      <div className={contractStyles.row}>
        <label>
          <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} /> Accept requests
        </label>
        <label>
          <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} /> Disabled
        </label>
        <label>
          <input type="checkbox" checked={narrow} onChange={(e) => setNarrow(e.target.checked)} /> Narrow container
        </label>
        <label>
          <input type="checkbox" checked={rtl} onChange={(e) => setRtl(e.target.checked)} /> RTL
        </label>
        <Button onClick={() => setSize(180)}>External size: 180</Button>
        <Button onClick={() => setMounted((v) => !v)}>{mounted ? 'Unmount split' : 'Mount split'}</Button>
      </div>
      <div
        style={{
          width: narrow ? 180 : '100%',
          maxWidth: 680,
          height: vertical ? 420 : 220,
          border: '1px solid var(--colors-border)',
          boxSizing: 'border-box',
        }}>
        {mounted && (
          <ResizableSplit
            primary={
              <div className={pane}>
                <h2>Primary pane</h2>
                <p>较长内容按主区域的可用宽度换行。</p>
              </div>
            }
            primaryProps={{ 'aria-label': 'Primary pane' }}
            secondaryProps={{ 'aria-label': 'Secondary pane' }}
            orientation={vertical ? 'vertical' : 'horizontal'}
            primarySide={end ? 'end' : 'start'}
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
              <h2>Secondary pane</h2>
              <p>这个区域占用调整后剩余的空间。</p>
            </div>
          </ResizableSplit>
        )}
      </div>
      <StatePanel label="Resize requests and parent state" value={{ size, accept, requests, commits, cancellations }} />
    </ContractFrame>
  )
}

function Standalone() {
  const [generation, setGeneration] = useState(0)
  return (
    <ContractFrame
      title="调整独立区域的尺寸"
      description="只需要调整一个面板时，可以省略 secondary。此例用 primaryAsChild 保留原生 section 作为区域根元素，通过分隔条拖动或键盘调整尺寸；ref 可继续指向该元素。"
      onReset={() => setGeneration((v) => v + 1)}>
      <ResizableSplit
        key={generation}
        defaultSize={240}
        minSize={120}
        maxSize={480}
        primaryAsChild
        separatorLabel="Resize standalone region"
        primary={
          <section aria-label="Standalone region" className={pane} style={{ height: 180 }}>
            拖动分隔条，或聚焦分隔条后使用键盘调整区域大小。
          </section>
        }
      />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ResizableSplit 用于让用户调整相邻面板或单个区域的宽度、高度。分隔条支持指针拖动、方向键和 Home/End，尺寸以 CSS px 表示；尺寸请求通过回调交给应用保存。受控 size 决定实际显示，应用同时配置最小、最大尺寸及容器空间，取消手势后按回调恢复相应状态。',
      },
    },
  },
  title: 'Layout/ResizableSplit',
  component: Playground,
  decorators: [
    (Story) => (
      <StrictMode>
        <Story />
      </StrictMode>
    ),
  ],
} satisfies Meta<typeof Playground>
export default meta
type Story = StoryObj<typeof meta>
export const Horizontal: Story = {}
export const Vertical: Story = { args: { vertical: true } }
export const EndSide: Story = { args: { end: true } }
export const StandaloneRegion: Story = { render: () => <Standalone /> }
