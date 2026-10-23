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
      title="Resizable split"
      description="尺寸单位为 CSS px。拖动实时请求尺寸，松开结束；Escape/指针取消恢复起始尺寸。方向键调整，Shift 加速，Home/End 到边界。取消 Accept requests 可验证父级拒绝后视觉尺寸保持受控。"
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
                <p>Long content wraps within the available pane width.</p>
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
              <p>This pane consumes the remaining space.</p>
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
      title="Standalone resizable region"
      description="未提供 secondary 时，只调整一个独立区域。primaryAsChild 保留原生 section 与 ref；它与双区域布局共用同一个尺寸与指针内核。"
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
            Drag this region or use its keyboard separator.
          </section>
        }
      />
    </ContractFrame>
  )
}

const meta = {
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
