import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../src/widgets/buttons'
import { Checkbox } from '../src/widgets/choices/Checkbox'
import { ColorRamp } from '../src/templates/color/ColorRamp'
import { ColorRampPicker } from '../src/templates/color/ColorRampPicker'
import type { ColorRampValue } from '../src/values/color-ramp'
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
  StoryNote,
} from './support/StoryPage'

const initialRamp: ColorRampValue = {
  interpolation: 'linear',
  stops: [
    { id: 'red', position: 0, color: { space: 'srgb', r: 1, g: 0.1, b: 0.05, a: 1 } },
    { id: 'blue', position: 0.5, color: { space: 'srgb', r: 0.1, g: 0.2, b: 1, a: 1 } },
    { id: 'green', position: 1, color: { space: 'srgb', r: 0.1, g: 1, b: 0.25, a: 0.6 } },
  ],
}
const constantRamp: ColorRampValue = { ...initialRamp, interpolation: 'constant' }
const cancelReasons = ['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only']
const emptyRamp: ColorRampValue = { interpolation: 'linear', stops: [] }

function RampDemo({
  empty = false,
  readOnly = false,
  disabled = false,
  narrow = false,
}: {
  empty?: boolean
  readOnly?: boolean
  disabled?: boolean
  narrow?: boolean
}) {
  const [value, setValue] = useState<ColorRampValue>(empty ? emptyRamp : initialRamp)
  const [selected, setSelected] = useState<string | null>(empty ? null : 'blue')
  const [revision, setRevision] = useState(0)
  const [reject, setReject] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value)
  const record = (event: string) => setEvents((current) => [...current.slice(-8), event])
  const locked = readOnly || disabled
  return (
    <StoryCard
      title={
        readOnly ? 'Read only' : disabled ? 'Disabled' : empty ? 'Empty' : narrow ? 'Narrow 280px' : 'Controlled ramp'
      }
      description={
        empty
          ? '没有停靠点时仍可看到轨道；先在空轨道上添加一个颜色点。'
          : readOnly
            ? '可以查看和选择停靠点，但不能修改位置、颜色或结构。'
            : disabled
              ? '整个编辑器禁用；保留当前值供读取。'
              : '拖动、键盘、添加/删除停靠点和切换插值都通过同一份 value 回传。'
      }>
      <div className={css({ width: '100%', maxWidth: narrow ? '280px' : '360px', minWidth: 0 })}>
        <ColorRamp
          value={value}
          activeStopId={selected}
          onActiveStopIdChange={(id) => {
            setSelected(id)
            record(`select:${id ?? 'none'}`)
          }}
          readOnly={readOnly}
          disabled={disabled}
          resetKey={revision}
          onEditStart={(source) => {
            start.current = value
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            setValue(next)
            record('preview')
          }}
          onValueCommit={async (next, reason) => {
            record(`commit:${reason}`)
            await new Promise((resolve) => setTimeout(resolve, 220))
            if (reject) {
              setReject(false)
              setValue(start.current)
              throw new Error('渐变未保存：请重试，或关闭 Reject next commit。')
            }
            setValue(next)
          }}
          onEditCancel={(reason) => {
            record(`cancel:${reason}`)
            if (cancelReasons.includes(reason)) setValue(start.current)
          }}
        />
      </div>
      {!locked && (
        <>
          <StoryRow>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const next = { ...value, stops: [...value.stops].reverse() }
                setValue(next)
                setRevision((current) => current + 1)
                record('reverse source order')
              }}>
              Reverse source order
            </Button>
            <Checkbox checked={reject} onCheckedChange={setReject} label="Reject next commit" />
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                const next = empty ? emptyRamp : initialRamp
                start.current = next
                setValue(next)
                setSelected(empty ? null : 'blue')
                setRevision((current) => current + 1)
                setReject(false)
                setEvents([])
              }}>
              Reset
            </Button>
          </StoryRow>
          <StoryState label="Ramp state" value={{ value, selected, revision, reject, events }} />
        </>
      )}
    </StoryCard>
  )
}

function Variants() {
  return (
    <StoryGrid>
      <StoryCard title="Linear" description="颜色在相邻停靠点之间连续插值。">
        <ColorRamp defaultValue={initialRamp} aria-label="Linear color ramp" />
      </StoryCard>
      <StoryCard title="Constant" description="停靠点之间保持前一个颜色，适合色阶或分段材质。">
        <ColorRamp defaultValue={constantRamp} aria-label="Constant color ramp" />
      </StoryCard>
    </StoryGrid>
  )
}

function RampPickerDemo() {
  const [value, setValue] = useState(initialRamp)
  const [revision, setRevision] = useState(0)
  return (
    <StoryCard title="ColorRampPicker" description="紧凑色带按钮打开弹出编辑器；适合属性面板。">
      <div className={css({ width: '180px', maxWidth: '100%' })}>
        <ColorRampPicker value={value} onValueChange={setValue} resetKey={revision} label="Edit material ramp" />
      </div>
      <Button size="sm" variant="subtle" onClick={() => setRevision((current) => current + 1)}>
        Reset picker
      </Button>
      <StoryState label="Picker value" value={value} />
    </StoryCard>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ColorRamp 编辑随位置变化的颜色渐变，ColorRampPicker 提供紧凑入口和弹出编辑器。每个停靠点有稳定 id、0–1 position 和颜色值；interpolation 控制线性或阶梯过渡。选择停靠点只切换编辑对象，结构、位置和颜色修改通过 onValueChange/onValueCommit 回传。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Color/ColorRamp',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Color"
      title="ColorRamp"
      summary="停靠点、插值和颜色共同组成一条渐变。轨道支持指针拖动、键盘移动、添加/删除，以及同一位置上的多个独立停靠点。"
      meta={
        <>
          <span>0–1 positions</span>
          <span>·</span>
          <span>linear / constant</span>
          <span>·</span>
          <span>stable stop ids</span>
        </>
      }>
      <StorySection title="Variants" description="线性过渡与阶梯过渡共用轨道和停靠点，只改变插值方式。">
        <Variants />
      </StorySection>

      <StorySection title="Behavior" description="选择、移动、添加、删除和切换插值都会回传完整 ramp。">
        <RampDemo />
      </StorySection>

      <StorySection title="States" description="空 ramp、只读、禁用和窄布局仍然保留可读的轨道。">
        <StoryGrid>
          <RampDemo empty />
          <RampDemo readOnly />
          <RampDemo disabled />
          <RampDemo narrow />
        </StoryGrid>
      </StorySection>

      <StorySection title="Picker" description="弹层内使用同一个编辑器；关闭后保留应用接受的值。">
        <RampPickerDemo />
      </StorySection>

      <StorySection title="Density and sizing">
        <StoryNote>
          ColorRamp 没有 density 变体：内部 Select、Button 和 InputNumber 使用 24px 紧凑档，面板圆角 6px。 轨道在 280px
          宽度下仍可操作，但操作按钮会换行；更窄时优先把编辑器放进 Popover 或单独面板。
        </StoryNote>
      </StorySection>

      <StorySection title="Keyboard and accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在停靠点、插值选择、位置输入和颜色按钮之间移动。' },
            { keys: ['←', '→'], action: '移动当前停靠点 0.01；Shift 为 0.1，Ctrl/Cmd 为 0.001。' },
            { keys: ['Home', 'End'], action: '把当前停靠点移到 0 或 1。' },
            { keys: ['Delete', 'Backspace'], action: '删除当前停靠点。' },
            { keys: 'Escape', action: '取消本次拖动或键盘移动，恢复编辑前的 ramp。' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<ColorRamp
  value={ramp}
  activeStopId={selected}
  onActiveStopIdChange={setSelected}
  onValueChange={setRamp}
  onValueCommit={saveRamp}
  onEditCancel={restoreRamp}
/>`}
          />
          <StoryProps
            rows={[
              {
                name: 'value / defaultValue',
                type: 'ColorRampValue',
                description: 'interpolation + stops；受控时由应用保存。',
              },
              { name: 'activeStopId', type: 'string | null', description: '当前编辑的停靠点；只影响选择，不修改值。' },
              {
                name: 'interpolation',
                type: "'linear' | 'constant'",
                defaultValue: "'linear'",
                description: '颜色在停靠点之间的过渡方式。',
              },
              {
                name: 'disabled / readOnly',
                type: 'boolean',
                defaultValue: 'false',
                description: '禁用或只读；仍可选择查看。',
              },
              { name: 'hdr', type: 'boolean', defaultValue: 'false', description: '允许 HDR 颜色值。' },
              { name: 'onValueChange', type: '(value) => void', description: '拖动/编辑过程中的完整预览值。' },
              {
                name: 'onValueCommit',
                type: '(value, reason) => void | Promise<void>',
                description: '一次完整编辑；可异步保存并抛错。',
              },
              { name: 'onEditCancel', type: '(reason) => void', description: '取消时恢复应用认为应显示的值。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
