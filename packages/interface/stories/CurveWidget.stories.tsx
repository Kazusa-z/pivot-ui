import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../src/widgets/buttons'
import { CurveWidget } from '../src/widgets/curve/CurveWidget'
import {
  copyCurveValue,
  sampleCurve,
  type CurvePointId,
  type CurveValue,
  type CurveViewport,
} from '../src/values/curve'
import {
  StoryCode,
  StoryCard,
  StoryGrid,
  StoryKeyboard,
  StoryNote,
  StoryPage,
  StoryProps,
  StoryRow,
  StorySection,
  StoryState,
} from './support/StoryPage'

const linear: CurveValue = {
  interpolation: 'linear',
  points: [
    { id: 'start', x: 0, y: 0 },
    { id: 'middle', x: 0.5, y: 0.7 },
    { id: 'end', x: 1, y: 1 },
  ],
}
const bezier: CurveValue = {
  interpolation: 'bezier',
  points: [
    { id: 'start', x: 0, y: 0, outHandle: { x: 0.15, y: 0.8 } },
    { id: 'middle', x: 0.5, y: 0.5, inHandle: { x: 0.35, y: 0.2 }, outHandle: { x: 0.65, y: 1 } },
    { id: 'end', x: 1, y: 0.8, inHandle: { x: 0.85, y: 0.5 } },
  ],
}
const initialViewport: CurveViewport = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }

function StaticCurve({ value, label, height }: { value: CurveValue; label: string; height: number }) {
  return (
    <CurveWidget
      value={value}
      label={label}
      height={height}
      readOnly
      showInterpolationSelector={false}
      xLabel="X"
      yLabel="Y"
    />
  )
}

function ControlledCurve() {
  const [value, setValue] = useState<CurveValue>(bezier)
  const [selection, setSelection] = useState<readonly CurvePointId[]>(['middle'])
  const [viewport, setViewport] = useState<CurveViewport>(initialViewport)
  const [resetKey, setResetKey] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef<CurveValue>(bezier)
  const record = (event: string) => setEvents((items) => [...items.slice(-15), event])
  const reset = () => {
    setValue(bezier)
    setSelection(['middle'])
    setViewport(initialViewport)
    setResetKey((current) => current + 1)
    setEvents([])
  }
  return (
    <StoryCard
      title="Controlled curve"
      description="value、selectedPointIds 和 viewport 都由宿主保存；拖动时先接收预览，onValueCommit 再表示一次完整编辑。">
      <CurveWidget
        value={value}
        label="Response curve"
        selectedPointIds={selection}
        onSelectedPointIdsChange={(ids) => {
          setSelection(ids)
          record('selection')
        }}
        viewport={viewport}
        onViewportChange={(next) => {
          setViewport(next)
          record('viewport')
        }}
        resetKey={resetKey}
        showAnimation
        height={320}
        onEditStart={(source) => {
          start.current = copyCurveValue(value)
          record(`begin:${source}`)
        }}
        onValueChange={(next) => {
          setValue(next)
          record('preview')
        }}
        onValueCommit={(_next, reason) => record(`commit:${reason}`)}
        onEditCancel={(reason) => {
          record(`cancel:${reason}`)
          if (['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only'].includes(reason))
            setValue(start.current)
        }}
      />
      <StoryRow>
        <Button size="sm" variant="outline" onClick={reset}>
          Reset curve
        </Button>
        <Button size="sm" variant="outline" onClick={() => setSelection(['middle'])}>
          Select middle
        </Button>
        <Button size="sm" variant="outline" onClick={() => setViewport(initialViewport)}>
          Reset view
        </Button>
      </StoryRow>
      <StoryState
        label="Curve state"
        value={{ value, selection, viewport, sampleAt025: sampleCurve(value, 0.25), events }}
      />
    </StoryCard>
  )
}

function RejectingCurve() {
  const [value, setValue] = useState<CurveValue>(linear)
  const [willReject, setWillReject] = useState(true)
  const [events, setEvents] = useState<string[]>([])
  const rejectNext = useRef(true)
  const start = useRef<CurveValue>(linear)
  const record = (event: string) => setEvents((items) => [...items.slice(-8), event])
  return (
    <StoryCard
      title="Commit rejection"
      description="保存失败时保留编辑内容并显示错误；Retry 会重新提交。下一次提交默认会被拒绝，方便重复观察错误状态。">
      <CurveWidget
        value={value}
        label="Rejecting curve"
        height={180}
        onEditStart={(source) => {
          start.current = copyCurveValue(value)
          record(`begin:${source}`)
        }}
        onValueChange={(next) => {
          setValue(next)
          record('preview')
        }}
        onValueCommit={async () => {
          if (rejectNext.current) {
            rejectNext.current = false
            setWillReject(false)
            await new Promise((resolve) => setTimeout(resolve, 250))
            record('rejected')
            throw new Error('Curve save failed. Retry to accept.')
          }
          record('accepted')
        }}
        onEditCancel={(reason) => {
          record(`cancel:${reason}`)
          if (['escape', 'pointer-cancel', 'window-blur'].includes(reason)) setValue(start.current)
        }}
      />
      <StoryRow>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            rejectNext.current = true
            setWillReject(true)
            record('next commit rejects')
          }}>
          Reject next commit
        </Button>
        <span style={{ color: 'var(--colors-textMuted)', fontSize: 'var(--fontSizes-control)' }}>
          {willReject ? 'Next commit rejects' : 'Next commit accepts'}
        </span>
      </StoryRow>
      <StoryState label="Commit events" value={events} />
    </StoryCard>
  )
}

const keyboardRows = [
  { keys: ['Tab'], action: '在工具栏、曲线点和控制柄之间移动焦点。' },
  { keys: ['←', '→', '↑', '↓'], action: '按 xStep / yStep 移动选中的点或控制柄。' },
  { keys: ['Shift', '←'], action: '以 10× 步长移动。' },
  { keys: ['Ctrl', '←'], action: '以 0.1× 步长移动；macOS 也支持 ⌘。' },
  { keys: ['Space', 'Enter'], action: '选中当前获得焦点的曲线点。' },
  { keys: ['Delete', 'Backspace'], action: '删除选中的曲线点。' },
  { keys: ['Escape'], action: '取消当前编辑并恢复宿主保存的值。' },
  { keys: 'Double-click', action: '在图表空白处新增一个曲线点。' },
  { keys: ['Wheel', 'Alt', 'Drag'], action: '滚轮缩放；按住 Alt 或中键拖动平移视图。' },
]

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'CurveWidget 直接编辑 linear 折线或 bezier 曲线。value 保存带稳定 ID 的点与控制柄，selection 和 viewport 可分别受控；onValueChange 返回预览，onValueCommit 表示一次完整编辑。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Curve/CurveWidget',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Curve"
      title="CurveWidget"
      summary="直接编辑二维曲线的完整控件：点、贝塞尔控制柄、插值模式、选中、视口和保存反馈都在同一块画布内。适合需要持续观察曲线形状的编辑器。"
      meta={
        <>
          <span>Controlled value</span>
          <span>·</span>
          <span>Selection + viewport</span>
          <span>·</span>
          <span>Async commit</span>
        </>
      }>
      <StorySection
        title="Interpolation and height"
        description="Linear 预览高 180px，bezier 预览高 280px。height 只控制图表高度，工具行仍使用 24px 控件；两者不是密度变体。">
        <StoryGrid>
          <StoryCard title="Linear · 180px" description="折线连接相邻点，适合分段或线性映射。">
            <StaticCurve value={linear} label="Linear curve" height={180} />
          </StoryCard>
          <StoryCard title="Bezier · 280px" description="选中点后显示进入/离开控制柄，可编辑连续曲线。">
            <StaticCurve value={bezier} label="Bezier curve" height={280} />
          </StoryCard>
        </StoryGrid>
        <StoryNote>
          CurveWidget 没有 density 属性；`height`
          是唯一的尺寸开关。增加高度只扩大绘图区，不会改变工具行和坐标输入的高度。
        </StoryNote>
      </StorySection>

      <StorySection
        title="Behavior"
        description="拖动点或控制柄修改曲线；双击空白处加点，Delete 删除选中点。选择、视口和曲线值分别受控。">
        <ControlledCurve />
      </StorySection>

      <StorySection
        title="States"
        description="禁用、只读和保存失败是三种不同状态：禁用阻止交互，只读允许查看，失败保留编辑并要求重试。">
        <StoryGrid>
          <StoryCard title="Disabled" description="不可选择、编辑或查看控制柄；整块控件降低不透明度。">
            <CurveWidget value={linear} label="Disabled curve" height={180} disabled />
          </StoryCard>
          <StoryCard title="Read only" description="可以选中点、查看控制柄和调整视图，但不能修改曲线。">
            <CurveWidget value={bezier} label="Read-only curve" height={180} readOnly />
          </StoryCard>
          <RejectingCurve />
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="曲线点、控制柄和工具按钮都有可聚焦路径；编辑中的 Escape 会回滚到编辑前的值。">
        <StoryKeyboard rows={keyboardRows} />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const [value, setValue] = useState(initialCurve)
const [selected, setSelected] = useState(['middle'])
const [viewport, setViewport] = useState({ xMin: 0, xMax: 1, yMin: 0, yMax: 1 })

<CurveWidget
  value={value}
  onValueChange={setValue}
  onValueCommit={saveCurve}
  selectedPointIds={selected}
  onSelectedPointIdsChange={setSelected}
  viewport={viewport}
  onViewportChange={setViewport}
  height={320}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'value', type: 'CurveValue', description: '受控曲线值；点 ID 必须稳定。' },
              { name: 'onValueChange', type: '(value: CurveValue) => void', description: '拖动过程中的预览值。' },
              {
                name: 'onValueCommit',
                type: '(value, reason) => void | Promise<void>',
                description: '一次编辑完成；返回 Promise 时可显示保存错误。',
              },
              {
                name: 'selectedPointIds',
                type: 'readonly CurvePointId[]',
                description: '受控选中点；省略时内部维护。',
              },
              { name: 'viewport', type: 'CurveViewport', description: '可见坐标范围；可独立受控。' },
              { name: 'height', type: 'number', defaultValue: '260', description: '图表高度，至少 100。' },
              {
                name: 'disabled / readOnly',
                type: 'boolean',
                defaultValue: 'false',
                description: '禁用全部交互，或只允许查看与选择。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
