import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { CurvePreset } from '../src/contracts/curve'
import { NumericDistributionTemplate } from '../src/templates/curve/NumericDistributionTemplate'
import { copyCurveValue, type CurveValue, type CurveViewport } from '../src/values/curve'
import {
  copyNumericDistributionValue,
  type NumericDistributionCache,
  type NumericDistributionMode,
  type NumericDistributionValue,
} from '../src/values/numeric-distribution'
import { Button } from '../src/widgets/buttons/Button'
import { Checkbox } from '../src/widgets/choices/Checkbox'
import { SegmentControl } from '../src/widgets/choices/SegmentControl'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryField,
  StoryGrid,
  StoryCode,
  StoryProps,
  StoryState,
  StoryKeyboard,
} from './support/StoryPage'

const distributionWidth = css({ width: 'min(460px, 100%)', minWidth: 0 })
const curve: CurveValue = {
  interpolation: 'bezier',
  points: [
    { id: 'start', x: 0, y: 2, outHandle: { x: 0.35, y: 2 } },
    { id: 'end', x: 1, y: 5, inHandle: { x: 0.65, y: 5 } },
  ],
}
const linear: CurveValue = {
  interpolation: 'linear',
  points: [
    { id: 'a', x: 0, y: 0 },
    { id: 'b', x: 1, y: 10 },
  ],
}
const presets: readonly CurvePreset[] = [
  { id: 'ease', label: 'Ease 2 to 5', value: curve },
  { id: 'linear', label: 'Linear 0 to 10', value: linear },
]
const initialView: CurveViewport = { xMin: 0, xMax: 1, yMin: 0, yMax: 10 }
const userCancellation = new Set(['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only'])
const makeValue = (mode: NumericDistributionMode): NumericDistributionValue =>
  mode === 'constant'
    ? { mode, value: 2 }
    : mode === 'two-constant'
      ? { mode, values: [2, 5] }
      : mode === 'curve'
        ? { mode, curve: copyCurveValue(curve) }
        : { mode, curves: [copyCurveValue(curve), copyCurveValue(linear)] }

function ModeDemo({ mode, title, description }: { mode: NumericDistributionMode; title: string; description: string }) {
  const [value, setValue] = useState(() => makeValue(mode))
  const [viewport, setViewport] = useState(initialView)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value)
  const record = (event: string) => setEvents((list) => [...list.slice(-7), event])
  return (
    <StoryCard title={title} description={description}>
      <div className={distributionWidth}>
        <NumericDistributionTemplate
          value={value}
          label={`${title} distribution`}
          curveViewport={viewport}
          onCurveViewportChange={setViewport}
          curvePresets={presets}
          onEditStart={(source) => {
            start.current = copyNumericDistributionValue(value)
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            setValue(next)
            record(`preview:${next.mode}`)
          }}
          onValueCommit={(next, reason) => {
            setValue(next)
            record(`commit:${reason}:${next.mode}`)
          }}
          onEditCancel={(reason) => {
            if (userCancellation.has(reason)) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
      </div>
      <StoryState label={`${title} state`} value={{ mode: value.mode, value, events }} />
    </StoryCard>
  )
}

type Availability = 'editable' | 'readonly' | 'disabled'
const availabilityOptions = [
  { key: 'editable', value: 'editable', label: 'Editable' },
  { key: 'readonly', value: 'readonly', label: 'Read only' },
  { key: 'disabled', value: 'disabled', label: 'Disabled' },
] as const

function ControlledDemo() {
  const [value, setValue] = useState<NumericDistributionValue>(() => makeValue('constant'))
  const [cache, setCache] = useState<NumericDistributionCache>({})
  const [availability, setAvailability] = useState<Availability>('editable')
  const [refuse, setRefuse] = useState(false)
  const [rejectNext, setRejectNext] = useState(false)
  const [pending, setPending] = useState(false)
  const [revision, setRevision] = useState(0)
  const [viewport, setViewport] = useState(initialView)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value)
  const record = (event: string) => setEvents((list) => [...list.slice(-9), event])
  const loadConstant = (next: number) => {
    const value: NumericDistributionValue = { mode: 'constant', value: next }
    start.current = value
    setValue(value)
    setRevision((current) => current + 1)
    record(`external:${next}`)
  }
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)', minWidth: 0 })}>
      <StoryRow align="start">
        <StoryField label="Availability">
          <SegmentControl
            size="sm"
            options={availabilityOptions}
            value={availability}
            onValueChange={(next) => setAvailability(next as Availability)}
            aria-label="Distribution availability"
          />
        </StoryField>
        <StoryField label="Controlled behavior">
          <Checkbox checked={refuse} onCheckedChange={(checked) => setRefuse(checked === true)} label="Refuse values" />
          <Checkbox
            checked={rejectNext}
            onCheckedChange={(checked) => setRejectNext(checked === true)}
            label="Reject next commit"
          />
        </StoryField>
      </StoryRow>
      <div className={distributionWidth}>
        <NumericDistributionTemplate
          value={value}
          cache={cache}
          onCacheChange={setCache}
          resetKey={revision}
          disabled={availability === 'disabled'}
          readOnly={availability === 'readonly'}
          label="Controlled distribution"
          curveViewport={viewport}
          onCurveViewportChange={setViewport}
          curvePresets={presets}
          onEditStart={(source) => {
            start.current = copyNumericDistributionValue(value)
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            record(`preview:${next.mode}`)
            if (!refuse) setValue(next)
          }}
          onValueCommit={async (next, reason) => {
            record(`request:${reason}:${next.mode}`)
            if (rejectNext) {
              setRejectNext(false)
              setPending(true)
              await new Promise((resolve) => setTimeout(resolve, 350))
              setPending(false)
              setValue(start.current)
              record('rejected')
              throw new Error('修改未保存，请继续修改或重试。')
            }
            if (!refuse) {
              setValue(next)
              record('accepted')
            } else {
              record('application kept original value')
            }
          }}
          onEditCancel={(reason) => {
            if (userCancellation.has(reason) && !refuse) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
      </div>
      <StoryRow>
        <Button size="sm" variant="outline" onClick={() => loadConstant(8)}>
          Load constant 8
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setValue(makeValue('constant'))
            setCache({})
            setAvailability('editable')
            setRefuse(false)
            setRejectNext(false)
            setRevision((current) => current + 1)
            setEvents([])
          }}>
          Reset
        </Button>
      </StoryRow>
      <StoryState
        label="Controlled distribution"
        value={{ value, cache, availability, refuse, rejectNext, pending, viewport, events }}
      />
    </div>
  )
}

function CompactDemo() {
  const [value, setValue] = useState<NumericDistributionValue>(() => makeValue('constant'))
  return (
    <div className={distributionWidth}>
      <NumericDistributionTemplate value={value} onValueChange={setValue} label="Compact distribution" />
    </div>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'NumericDistributionTemplate 在单个数值、曲线、两个数值和两条曲线之间切换，适合既允许固定参数又允许随时间变化的输入。value 的 mode 决定内容，cache 保存其他模式已接受的设置；曲线选择和视图变化不会产生属性提交。应用负责保存、拒绝和取消，并通过 resetKey 标识当前对象。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Numeric/NumericDistribution',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Numeric"
      title="NumericDistribution"
      summary="固定值、曲线和双值/双曲线共用一个模式切换入口。切换模式时保留各模式的 cache，编辑提交仍由应用决定接受或拒绝。"
      meta={
        <>
          <span>Constant</span>
          <span>·</span>
          <span>Curve</span>
          <span>·</span>
          <span>Two values</span>
          <span>·</span>
          <span>Two curves</span>
        </>
      }>
      <StorySection
        title="Modes"
        description="四种值形态共享同一个 mode 字段。曲线模式带预设，双曲线模式分别维护两条曲线的视口和编辑。">
        <StoryGrid>
          <ModeDemo mode="constant" title="Constant" description="一个固定数值，适合不随时间变化的参数。" />
          <ModeDemo mode="curve" title="Curve" description="一条曲线，支持控制点和预设。" />
          <ModeDemo mode="two-constant" title="Two constants" description="两个固定值，适合随机范围或上下界。" />
          <ModeDemo mode="two-curve" title="Two curves" description="两条独立曲线，适合范围随另一维度变化。" />
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Control tier"
        description="当前 NumericDistributionTemplate 没有 size/density prop，内部使用 24px 紧凑档的 InputNumber 和 Select。需要 32px 常规表单时，应由外层表单或后续 API 提供，而不是在 story 里伪造。">
        <StoryCard title="Compact controls" description="模式 Select 与数值输入保持同一紧凑档。">
          <CompactDemo />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Controlled states and rejection"
        description="应用可以拒绝预览、拒绝提交或切换只读/禁用；拒绝提交时组件保留错误状态供用户重试。">
        <StoryCard title="Controlled distribution">
          <ControlledDemo />
        </StoryCard>
      </StorySection>

      <StorySection title="Keyboard and accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在模式选择、数值/曲线编辑器和操作按钮之间移动焦点。' },
            { keys: ['↑', '↓', '←', '→'], action: '在数值输入或曲线点上调整值。' },
            { keys: 'Enter', action: '提交当前数值或曲线编辑。' },
            { keys: 'Escape', action: '取消当前编辑并恢复起始值。' },
            { keys: ['Space', 'Enter'], action: '打开模式 Select，或在复选框中切换状态。' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage and props">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<NumericDistributionTemplate
  value={value}
  cache={cache}
  onCacheChange={setCache}
  resetKey={revision}
  curvePresets={presets}
  onValueChange={preview}
  onValueCommit={save}
  onEditCancel={restore}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'value', type: 'NumericDistributionValue', description: '由 mode 区分的受控值。' },
              { name: 'cache', type: 'NumericDistributionCache', description: '其他模式已接受的设置；可受控。' },
              { name: 'onValueChange', type: '(value) => void', description: '预览请求；应用可拒绝。' },
              {
                name: 'onValueCommit',
                type: '(value, reason) => void | Promise<void>',
                description: '提交一次编辑；Promise 拒绝后保留错误。',
              },
              { name: 'curvePresets', type: 'CurvePreset[]', description: '曲线模式的预设列表。' },
              { name: 'disabled / readOnly', type: 'boolean', description: '禁用或只读；不改变模式布局。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
