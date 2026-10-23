import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CurveWidget } from '../src/widgets/curve/CurveWidget'
import { copyCurveValue, sampleCurve, type CurveValue, type CurveViewport } from '../src/values/curve'
import { css } from '../styled-system/css'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'

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
type Kind = 'linear' | 'bezier' | 'empty' | 'single' | 'bounds' | 'async' | 'frozen' | 'units'
function CurveExample({ kind = 'linear' }: { kind?: Kind }) {
  const initial =
    kind === 'empty'
      ? { interpolation: 'linear' as const, points: [] }
      : kind === 'single'
        ? { interpolation: 'linear' as const, points: [{ id: 'only', x: 0.5, y: 0.5 }] }
        : kind === 'bezier'
          ? bezier
          : linear
  const [value, setValue] = useState<CurveValue>(initial)
  const [selection, setSelection] = useState<readonly string[]>(
    kind === 'empty' ? [] : [initial.points[Math.min(1, initial.points.length - 1)].id]
  )
  const [viewport, setViewport] = useState<CurveViewport>({ xMin: 0, xMax: 1, yMin: 0, yMax: 1 })
  const [revision, setRevision] = useState(0)
  const revisionRef = useRef(revision)
  revisionRef.current = revision
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [narrowBounds, setNarrowBounds] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value),
    rejectNext = useRef(false)
  const record = (event: string) => setEvents((old) => [...old.slice(-19), event])
  return (
    <ContractFrame
      title={`CurveWidget · ${kind}`}
      description={
        kind === 'async'
          ? '拖动曲线点或输入坐标，先看实时预览，再等待 500 ms 完成保存。点击 Reject next commit 后重试一次编辑，可体验错误提示与恢复过程；下方列出编辑事件，接入异步保存时在 onValueCommit 返回 Promise。'
          : kind === 'bounds'
            ? '先在 X/Y 0…1 范围内拖动曲线点，再点击 Toggle narrow bounds 缩小可编辑范围。此时可继续调整中间点的 Y，X 输入会受新范围与相邻点限制。应用可用 bounds 控制后续编辑的范围，已有曲线仍按原数据展示。'
            : kind === 'frozen'
              ? '尝试拖动点或修改坐标，比较下方的修改请求与保持原状的曲线。这个示例由应用保留原值；自己的受控编辑器可在 onValueChange 中更新 value，让曲线跟随操作。'
              : '点击选中一个点，拖动它或控制柄来改变曲线；双击空白处新增点，Delete 删除选中点。也可用方向键微调，Shift 放大步长，Ctrl/⌘ 缩小步长。下方展示曲线数据与 X=0.25 的采样结果，便于观察编辑对曲线的影响。'
      }
      onReset={() => {
        revisionRef.current++
        setRevision(revisionRef.current)
        setValue(initial)
        setSelection(kind === 'empty' ? [] : [initial.points[Math.min(1, initial.points.length - 1)].id])
        setViewport({ xMin: 0, xMax: 1, yMin: 0, yMax: 1 })
        setEvents([])
        setDisabled(false)
        setReadOnly(false)
        setNarrowBounds(false)
        rejectNext.current = false
      }}>
      <div className={css({ width: '100%', maxWidth: '680px', minWidth: 0 })}>
        <CurveWidget
          value={value}
          label="Response curve"
          selectedPointIds={selection}
          onSelectedPointIdsChange={(next) => {
            setSelection(next)
            record('selection only')
          }}
          viewport={viewport}
          onViewportChange={(next) => {
            setViewport(next)
            record('view only')
          }}
          resetKey={revision}
          disabled={disabled}
          readOnly={readOnly}
          showAnimation
          height={280}
          bounds={
            kind === 'bounds'
              ? narrowBounds
                ? { xMin: 1.1, xMax: 1.2, yMin: 0, yMax: 1 }
                : { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
              : undefined
          }
          xLabel={kind === 'units' ? 'Time (ms)' : 'X'}
          yLabel={kind === 'units' ? 'Percent' : 'Y'}
          formatXTick={kind === 'units' ? (number) => String(Math.round(number * 1000)) : undefined}
          formatYTick={kind === 'units' ? (number) => `${Math.round(number * 100)}%` : undefined}
          onEditStart={(source) => {
            start.current = copyCurveValue(value)
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            record('preview')
            if (kind !== 'frozen') setValue(next)
          }}
          onValueCommit={async (_next, reason) => {
            record(`commit:${reason}`)
            const version = revisionRef.current
            if (kind === 'async') await new Promise((resolve) => setTimeout(resolve, 500))
            if (version !== revisionRef.current) {
              record('应用忽略较早的保存结果')
              return
            }
            if (rejectNext.current) {
              rejectNext.current = false
              setValue(start.current)
              record('rejected')
              throw new Error('曲线未保存，请重试或取消编辑。')
            }
            record('accepted')
          }}
          onEditCancel={(reason) => {
            record(`cancel:${reason}`)
            if (
              kind !== 'frozen' &&
              ['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only'].includes(reason)
            )
              setValue(start.current)
          }}
        />
      </div>
      <div className={contractStyles.row}>
        <ControlButton
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            revisionRef.current++
            setRevision(revisionRef.current)
            setValue(bezier)
            setSelection(['middle'])
            record('external/new revision')
          }}>
          External curve
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setReadOnly((old) => !old)}>
          Toggle read-only
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setDisabled((old) => !old)}>
          Toggle disabled
        </ControlButton>
        {kind === 'async' && (
          <ControlButton
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              rejectNext.current = true
              record('next commit rejects')
            }}>
            Reject next commit
          </ControlButton>
        )}
        {kind === 'bounds' && (
          <ControlButton
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => setNarrowBounds((old) => !old)}>
            Toggle narrow bounds
          </ControlButton>
        )}
      </div>
      <StatePanel label="当前曲线与 X=0.25 处的采样值" value={{ value, sample: sampleCurve(value, 0.25) }} />
      <StatePanel label="Independent selection / viewport" value={{ selection, viewport }} />
      <StatePanel label="Events" value={events} />
    </ContractFrame>
  )
}
const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Curve',
  component: CurveWidget,
  args: { value: linear },
  parameters: {
    docs: {
      description: {
        component:
          'CurveWidget 用于直接编辑二维曲线，支持 linear 折线和 bezier 曲线。value 保存带稳定 ID 的点及控制柄；选中点和 viewport 视图范围可以分别受控。\n\n拖动点、控制柄或编辑坐标时，onValueChange 返回预览曲线；onValueCommit 表示一次完整编辑。点选择、平移、缩放、刻度和动画预览只改变查看方式。\n\n应用保存曲线，并在受控取消时恢复编辑前的值。bounds 限制可编辑坐标，viewport 决定可见范围；切换对象或外部版本时更新 resetKey。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CurveWidget>
export default meta
type Story = StoryObj<typeof meta>
export const Linear: Story = { render: () => <CurveExample /> }
export const Bezier: Story = { render: () => <CurveExample kind="bezier" /> }
export const Empty: Story = { render: () => <CurveExample kind="empty" /> }
export const SinglePoint: Story = { render: () => <CurveExample kind="single" /> }
export const EditingBounds: Story = { render: () => <CurveExample kind="bounds" /> }
export const AsyncRejection: Story = { render: () => <CurveExample kind="async" /> }
export const FrozenControlled: Story = { render: () => <CurveExample kind="frozen" /> }
export const DisplayUnits: Story = { render: () => <CurveExample kind="units" /> }
