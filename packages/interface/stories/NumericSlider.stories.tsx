import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NumericSlider } from '../src/templates/numeric/NumericSlider'
import type { NumericCancelReason } from '../src/interaction/numeric/types'
import { Button } from '../src/widgets/buttons/Button'
import { Checkbox } from '../src/widgets/choices/Checkbox'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryCode,
  StoryProps,
  StoryState,
  StoryKeyboard,
} from './support/StoryPage'

const sliderWidth = css({ width: 'min(320px, 100%)', minWidth: 0 })
const rollbackReasons = new Set<NumericCancelReason>([
  'escape',
  'pointer-cancel',
  'window-blur',
  'read-only',
  'disabled',
])

function ExposureDemo() {
  const [value, setValue] = useState(25)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value)
  const record = (event: string) => setEvents((list) => [...list.slice(-9), event])
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)', minWidth: 0 })}>
      <div className={sliderWidth}>
        <NumericSlider
          id="numeric-slider-exposure"
          label="Exposure"
          value={value}
          min={0}
          max={100}
          step={1}
          dragStep={0.1}
          precision={2}
          unit="%"
          onEditStart={(source) => {
            start.current = value
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            setValue(next)
            record(`change:${next}`)
          }}
          onValueCommit={(next, reason) => record(`commit:${next}:${reason}`)}
          onEditCancel={(reason) => {
            if (rollbackReasons.has(reason)) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
      </div>
      <StoryRow>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setValue(25)
            setEvents([])
          }}>
          Reset
        </Button>
      </StoryRow>
      <StoryState label="Exposure" value={{ value, events }} />
    </div>
  )
}

function SoftRangeDemo() {
  const [value, setValue] = useState(150)
  const start = useRef(value)
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)', minWidth: 0 })}>
      <p className={css({ margin: 0, color: 'var(--colors-textMuted)', fontSize: 'var(--fontSizes-control)' })}>
        文本可输入 −200…200；滑块只覆盖 −50…50，适合大范围精确输入和小范围快速拖动。
      </p>
      <div className={sliderWidth}>
        <NumericSlider
          label="Offset"
          value={value}
          min={-200}
          max={200}
          softMin={-50}
          softMax={50}
          step={0.5}
          dragStep={0.1}
          precision={2}
          unit="px"
          onEditStart={() => {
            start.current = value
          }}
          onValueChange={setValue}
          onEditCancel={(reason) => {
            if (rollbackReasons.has(reason)) setValue(start.current)
          }}
        />
      </div>
      <StoryState label="Soft range value" value={{ value, hard: [-200, 200], soft: [-50, 50] }} />
    </div>
  )
}

function AsyncDemo() {
  const [value, setValue] = useState(10)
  const [authority, setAuthority] = useState(10)
  const [reject, setReject] = useState(false)
  const [pending, setPending] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value)
  const record = (event: string) => setEvents((list) => [...list.slice(-9), event])
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)', minWidth: 0 })}>
      <Checkbox
        checked={reject}
        onCheckedChange={(checked) => setReject(checked === true)}
        label="Reject next commit"
      />
      <div className={sliderWidth}>
        <NumericSlider
          label="Async amount"
          value={value}
          min={0}
          max={100}
          onEditStart={(source) => {
            start.current = value
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            setValue(next)
            record(`change:${next}`)
          }}
          onValueCommit={async (next) => {
            setPending(true)
            record(`request:${next}`)
            await new Promise((resolve) => setTimeout(resolve, 350))
            setPending(false)
            if (reject) {
              setValue(authority)
              record('rejected')
              throw new Error('数值未保存，请继续修改或重试。')
            }
            setAuthority(next)
            setValue(next)
            record('accepted')
          }}
          onEditCancel={(reason) => {
            if (rollbackReasons.has(reason)) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
      </div>
      <StoryState label="Async commit" value={{ value, authority, pending, reject, events }} />
    </div>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'NumericSlider 把数值输入框和滑块连接到同一个值，适合既要快速拖动又要精确输入的参数。输入框负责硬范围内的文本输入，滑块可使用 softMin/softMax 限定拖动范围；两者共享 onValueChange 与 onValueCommit。受控取消由应用恢复编辑前的值，异步提交被拒绝后可继续修改或重试。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Numeric/NumericSlider',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Numeric"
      title="NumericSlider"
      summary="一个数值输入框加一条滑块。紧凑档用于属性面板，常规档用于表单；文本输入和拖动共用同一组提交/取消语义。"
      meta={
        <>
          <span>InputNumber + Slider</span>
          <span>·</span>
          <span>20 / 24 / 32</span>
        </>
      }>
      <StorySection
        title="Number and slider"
        description="输入框显示精确值，滑块提供快速预览。单位只影响显示，不改变保存的数值。">
        <StoryGrid>
          <StoryCard title="Percent with unit" description="step 1，拖动步进 0.1，保留两位小数。">
            <ExposureDemo />
          </StoryCard>
          <StoryCard title="Soft range" description="min/max 是硬边界；softMin/softMax 只限制滑块轨道。">
            <SoftRangeDemo />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Density"
        description="xs 20、sm 24 为紧凑档，md 32 为常规档。NumericSlider 没有 lg/36 尺寸，滑块与输入框始终同档。">
        <StoryGrid>
          {(
            [
              ['xs', '20px', '密集工具条'],
              ['sm', '24px', '属性面板默认'],
              ['md', '32px', '常规表单'],
            ] as const
          ).map(([size, height, usage]) => (
            <StoryCard key={size} title={`${size} · ${height}`} description={usage}>
              <div className={sliderWidth}>
                <NumericSlider label={`${size} amount`} size={size} defaultValue={32} min={0} max={100} unit="%" />
              </div>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="States" description="禁用和只读不改变布局；mixed 只影响输入框的显示，滑块仍需一个数值。">
        <StoryGrid>
          <StoryCard title="Disabled">
            <div className={sliderWidth}>
              <NumericSlider label="Disabled amount" defaultValue={25} disabled />
            </div>
          </StoryCard>
          <StoryCard title="Read only">
            <div className={sliderWidth}>
              <NumericSlider label="Readonly amount" defaultValue={25} readOnly />
            </div>
          </StoryCard>
          <StoryCard title="Mixed">
            <div className={sliderWidth}>
              <NumericSlider label="Mixed amount" defaultValue={0} mixed />
            </div>
          </StoryCard>
          <StoryCard title="Invalid">
            <div className={sliderWidth}>
              <NumericSlider label="Invalid amount" defaultValue={120} min={0} max={100} state="invalid" />
            </div>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Commit and reject"
        description="输入框按 Enter 或失焦提交，Escape 取消；异步提交失败时保留编辑状态并显示应用侧错误。">
        <StoryCard title="Async save" description="切换 Reject next commit 后再次提交，观察值回退和事件记录。">
          <AsyncDemo />
        </StoryCard>
      </StorySection>

      <StorySection title="Keyboard and accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在输入框与滑块之间移动焦点。' },
            { keys: ['↑', '↓'], action: '按 step 微调；按住 Shift 使用更大的步进。' },
            { keys: ['Home', 'End'], action: '把滑块移到软范围两端。' },
            { keys: 'Enter', action: '提交输入框或完成一次滑块调整。' },
            { keys: 'Escape', action: '取消当前编辑并恢复起始值。' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage and props">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<NumericSlider
  label="Exposure"
  value={value}
  min={0}
  max={100}
  step={1}
  dragStep={0.1}
  precision={2}
  unit="%"
  onValueChange={setValue}
  onValueCommit={save}
  onEditCancel={restore}
/>`}
          />
          <StoryProps
            rows={[
              {
                name: 'size',
                type: "'xs' | 'sm' | 'md'",
                defaultValue: "'sm'",
                description: '20/24 紧凑，32 常规；没有 36。',
              },
              { name: 'value', type: 'number', description: '受控值；缺省时使用内部状态。' },
              { name: 'min / max', type: 'number', description: '文本输入允许的硬边界。' },
              { name: 'softMin / softMax', type: 'number', description: '只限制滑块轨道。' },
              { name: 'precision', type: 'number', description: '提交值的小数位数。' },
              {
                name: 'onValueCommit',
                type: '(value, reason) => void | Promise<void>',
                description: '完成一次编辑；Promise 被拒绝时保留编辑。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
