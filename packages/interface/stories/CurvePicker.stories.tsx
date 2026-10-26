import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { CurvePreset, CurvePresetService } from '../src/contracts/curve'
import { CurvePicker } from '../src/templates/curve/CurvePicker'
import { defaultCurvePresets } from '../src/templates/curve/CurvePresets'
import { copyCurveValue, type CurvePointId, type CurveValue, type CurveViewport } from '../src/values/curve'
import { Button } from '../src/widgets/buttons'
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

const initial: CurveValue = defaultCurvePresets[1].value
const initialViewport: CurveViewport = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
const emptyCurve: CurveValue = { interpolation: 'linear', points: [] }

function useMemoryPresetService() {
  return useMemo<CurvePresetService>(() => {
    const entries = new Map<string, CurvePreset>([
      ['stored-arch', { id: 'stored-arch', label: 'Stored arch', value: defaultCurvePresets[2].value }],
    ])
    let next = 0
    return {
      async list() {
        return [...entries.values()].map(({ id, label }) => ({ id, label }))
      },
      async load(id) {
        const entry = entries.get(id)
        if (!entry) throw new Error('This preset no longer exists. Refresh the list.')
        return copyCurveValue(entry.value)
      },
      async save(input) {
        const id = `stored-${++next}`
        entries.set(id, { id, label: input.label, value: copyCurveValue(input.value) })
        return { id, label: input.label }
      },
      async remove(id) {
        entries.delete(id)
      },
    }
  }, [])
}

function ControlledPicker() {
  const [value, setValue] = useState<CurveValue>(initial)
  const [selection, setSelection] = useState<readonly CurvePointId[]>(['end'])
  const [viewport, setViewport] = useState<CurveViewport>(initialViewport)
  const [open, setOpen] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef<CurveValue>(initial)
  const record = (event: string) => setEvents((items) => [...items.slice(-12), event])
  const reset = () => {
    setValue(initial)
    setSelection(['end'])
    setViewport(initialViewport)
    setOpen(false)
    setResetKey((current) => current + 1)
    setEvents([])
  }
  return (
    <StoryCard title="Preview trigger" description="点击 32px 高的预览按钮打开浮层；曲线、选中点和视口都写回宿主状态。">
      <CurvePicker
        value={value}
        label="Animation curve"
        presets={defaultCurvePresets}
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          record(`open:${next}`)
        }}
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
          if (['escape', 'pointer-cancel', 'window-blur'].includes(reason)) setValue(start.current)
        }}
      />
      <StoryRow>
        <Button size="sm" onClick={() => setOpen(true)}>
          Open picker
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
          Close picker
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      </StoryRow>
      <StoryState label="Picker state" value={{ value, selection, viewport, open, events }} />
    </StoryCard>
  )
}

function StoragePicker() {
  const service = useMemoryPresetService()
  const [value, setValue] = useState<CurveValue>(initial)
  const [open, setOpen] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef<CurveValue>(initial)
  const record = (event: string) => setEvents((items) => [...items.slice(-12), event])
  return (
    <StoryCard
      title="Storage service"
      description="在浮层内保存、应用或删除个人预设；service 只在本次 story 的内存中，刷新页面会重置。">
      <CurvePicker
        value={value}
        label="Stored curve"
        presets={defaultCurvePresets}
        presetService={service}
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          record(`open:${next}`)
        }}
        resetKey={resetKey}
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
          if (['escape', 'pointer-cancel', 'window-blur'].includes(reason)) setValue(start.current)
        }}
      />
      <StoryRow>
        <Button size="sm" onClick={() => setOpen(true)}>
          Open storage picker
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setValue(initial)
            setResetKey((current) => current + 1)
            setOpen(false)
            setEvents([])
          }}>
          Reset
        </Button>
      </StoryRow>
      <StoryState label="Picker events" value={{ value, open, events }} />
    </StoryCard>
  )
}

function StatePicker({ mode }: { mode: 'disabled' | 'readOnly' }) {
  const [open, setOpen] = useState(false)
  return (
    <StoryCard
      title={mode === 'disabled' ? 'Disabled' : 'Read only'}
      description={
        mode === 'disabled'
          ? '触发器不可用，整块控件降低不透明度。'
          : '可以打开并查看曲线，但编辑器不能修改曲线或应用预设。'
      }>
      <CurvePicker
        value={mode === 'disabled' ? initial : defaultCurvePresets[2].value}
        label={mode === 'disabled' ? 'Disabled curve' : 'Read-only curve'}
        open={open}
        onOpenChange={setOpen}
        disabled={mode === 'disabled'}
        readOnly={mode === 'readOnly'}
      />
      <StoryNote>
        {mode === 'disabled' ? 'disabled 同时阻止预览和弹层。' : 'readOnly 仍允许查看和选择点，但不会产生保存请求。'}
      </StoryNote>
    </StoryCard>
  )
}

function EmptyPresets() {
  const [value, setValue] = useState<CurveValue>(emptyCurve)
  const [open, setOpen] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  return (
    <StoryCard title="Empty presets" description="presets=[] 时不显示可选预设；双击画布新增点，从头画出曲线。">
      <CurvePicker
        value={value}
        label="Drawn curve"
        presets={[]}
        open={open}
        onOpenChange={setOpen}
        resetKey={resetKey}
        onValueChange={setValue}
      />
      <StoryRow>
        <Button size="sm" onClick={() => setOpen(true)}>
          Open empty editor
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setValue(emptyCurve)
            setResetKey((current) => current + 1)
          }}>
          Clear points
        </Button>
      </StoryRow>
      <StoryState label="Drawn curve" value={value} />
    </StoryCard>
  )
}

function NarrowPicker() {
  const [value, setValue] = useState<CurveValue>(initial)
  const [open, setOpen] = useState(false)
  return (
    <StoryCard title="Narrow trigger" description="240px 宽的属性栏中，预览按钮会压缩曲线缩略图并保留省略标签。">
      <div style={{ maxWidth: 240 }}>
        <CurvePicker value={value} label="Property curve" open={open} onOpenChange={setOpen} onValueChange={setValue} />
      </div>
      <StoryNote>浮层仍按视口碰撞边界收缩；触发器本身不会溢出容器。</StoryNote>
    </StoryCard>
  )
}

function RejectingPicker() {
  const [value, setValue] = useState<CurveValue>(initial)
  const [open, setOpen] = useState(false)
  const [willReject, setWillReject] = useState(true)
  const [events, setEvents] = useState<string[]>([])
  const rejectNext = useRef(true)
  const start = useRef<CurveValue>(initial)
  const record = (event: string) => setEvents((items) => [...items.slice(-10), event])
  return (
    <StoryCard
      title="Commit rejection"
      description="onValueCommit 抛出错误后，浮层保留编辑内容并显示错误；Retry 会重新提交。">
      <CurvePicker
        value={value}
        label="Rejecting curve"
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          record(`open:${next}`)
        }}
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
          onClick={() => {
            rejectNext.current = true
            setWillReject(true)
            record('next commit rejects')
          }}>
          Reject next commit
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Open picker
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
  { keys: ['Enter', 'Space'], action: '在预览触发器上打开曲线编辑器。' },
  { keys: ['Escape'], action: '取消当前编辑；没有编辑时关闭浮层。' },
  { keys: ['Tab'], action: '在触发器、插值选择、工具栏、曲线点和控制柄之间移动焦点。' },
  { keys: ['←', '→', '↑', '↓'], action: '移动选中的曲线点或控制柄；Shift / Ctrl 调整步长。' },
  { keys: ['Delete', 'Backspace'], action: '删除选中的曲线点。' },
  { keys: ['Space', 'Enter'], action: '选中获得焦点的曲线点。' },
  { keys: 'Double-click', action: '在画布空白处新增点。' },
]

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'CurvePicker 用 32px 曲线预览按钮打开弹出编辑器，适合属性面板。它把 CurveWidget 的编辑能力与预设列表组合在一起，并通过 onValueChange / onValueCommit 把预览和保存结果交给宿主。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Curve/CurvePicker',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Curve"
      title="CurvePicker"
      summary="空间有限时，用曲线缩略图打开完整编辑器。触发器高 32px；浮层内是 24px 工具行和曲线画布，预设与个人存储都在同一弹层内完成。"
      meta={
        <>
          <span>Preview trigger</span>
          <span>·</span>
          <span>Presets</span>
          <span>·</span>
          <span>Async save</span>
        </>
      }>
      <StorySection
        title="Preview and editor"
        description="单击预览打开浮层。曲线、选中点和视口都可由宿主控制；双击画布加点，Delete 删除选中点。">
        <ControlledPicker />
      </StorySection>

      <StorySection
        title="Presets and storage"
        description="默认预设包含 Linear、Ease、Arch、Ease in 和 Smooth step。提供 presetService 后，浮层内可以保存、应用和删除个人预设。">
        <StoragePicker />
        <StoryNote>
          编辑器内的插值 Select 在 Linear 与 Bezier 之间切换；预设只是保存好的 CurveValue，选中后点击 Apply preset
          才会写入当前曲线。
        </StoryNote>
        <StoryNote>
          内部编辑器使用 24px 的 Select、Button 和 InputNumber；触发器固定 32px。CurvePicker 没有独立的 density 属性。
        </StoryNote>
      </StorySection>

      <StorySection title="States" description="禁用、只读、空预设和窄容器是四个不同的边界。">
        <StoryGrid>
          <StatePicker mode="disabled" />
          <StatePicker mode="readOnly" />
          <EmptyPresets />
          <NarrowPicker />
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Commit rejection"
        description="保存失败不会关闭浮层；错误留在编辑器内，Retry 会重新提交同一份草稿。">
        <RejectingPicker />
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="触发器、浮层和内部曲线编辑器共享一套焦点顺序；Escape 先取消编辑，再关闭浮层。">
        <StoryKeyboard rows={keyboardRows} />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const [value, setValue] = useState(initialCurve)

<CurvePicker
  value={value}
  presets={presets}
  onValueChange={setValue}
  onValueCommit={saveCurve}
/>

// With saved presets:
<CurvePicker
  value={value}
  presetService={service}
  onValueChange={setValue}
  onValueCommit={saveCurve}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'value', type: 'CurveValue', description: '当前曲线；触发器缩略图和编辑器都读取它。' },
              { name: 'presets', type: 'readonly CurvePreset[]', description: '本地预设列表；默认使用内置预设。' },
              {
                name: 'presetService',
                type: 'CurvePresetService',
                description: '提供 list/load/save/remove，启用个人预设。',
              },
              { name: 'open / onOpenChange', type: 'boolean / (open) => void', description: '受控弹层开关。' },
              { name: 'onValueCommit', type: '(value, reason) => void | Promise<void>', description: '保存结果。' },
              {
                name: 'disabled / readOnly',
                type: 'boolean',
                defaultValue: 'false',
                description: '禁用触发器，或只允许查看与选择。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
