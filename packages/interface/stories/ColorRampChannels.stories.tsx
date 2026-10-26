import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../src/widgets/buttons'
import { Checkbox } from '../src/widgets/choices/Checkbox'
import { ColorRampChannels } from '../src/templates/color/ColorRampChannels'
import { ColorRampPicker } from '../src/templates/color/ColorRampPicker'
import type { ColorRampChannelsValue } from '../src/values/color-ramp'
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

const channels: ColorRampChannelsValue = {
  color: {
    interpolation: 'linear',
    stops: [
      { id: 'warm', position: 0, color: { space: 'linear', r: 1.6, g: 0.1, b: 0.05, a: 1 } },
      { id: 'cool', position: 1, color: { space: 'linear', r: 0.05, g: 0.2, b: 1.2, a: 1 } },
    ],
  },
  alpha: [
    { id: 'fade-in', position: 0, alpha: 0 },
    { id: 'solid', position: 0.5, alpha: 1 },
    { id: 'fade-out', position: 1, alpha: 0 },
  ],
}
const emptyAlpha: ColorRampChannelsValue = { ...channels, alpha: [] }
const cancelReasons = ['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only']

function ChannelsDemo({
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
  const [value, setValue] = useState<ColorRampChannelsValue>(empty ? emptyAlpha : channels)
  const [colorStop, setColorStop] = useState<string | null>('warm')
  const [alphaStop, setAlphaStop] = useState<string | null>(empty ? null : 'solid')
  const [revision, setRevision] = useState(0)
  const [reject, setReject] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value)
  const record = (event: string) => setEvents((current) => [...current.slice(-8), event])
  const locked = readOnly || disabled
  return (
    <StoryCard
      title={
        readOnly
          ? 'Read only'
          : disabled
            ? 'Disabled'
            : empty
              ? 'Empty alpha'
              : narrow
                ? 'Narrow 280px'
                : 'Color + alpha'
      }
      description={
        empty
          ? '空透明度轨按 1 处理；添加 alpha stop 后，最终透明度由颜色 alpha 与轨道相乘。'
          : readOnly
            ? '两条轨道都可查看和选择，但不会发出修改。'
            : disabled
              ? '整体禁用；保留当前双轨数据。'
              : '颜色轨和透明度轨分别选点；任一修改都回传完整双轨数据。'
      }>
      <div className={css({ width: '100%', maxWidth: narrow ? '280px' : '380px', minWidth: 0 })}>
        <ColorRampChannels
          value={value}
          hdr
          activeStopId={colorStop}
          onActiveStopIdChange={(id) => {
            setColorStop(id)
            record(`color:${id ?? 'none'}`)
          }}
          activeAlphaStopId={alphaStop}
          onActiveAlphaStopIdChange={(id) => {
            setAlphaStop(id)
            record(`alpha:${id ?? 'none'}`)
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
              throw new Error('双轨渐变未保存：请重试。')
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
                const next = { ...value, alpha: [...value.alpha].reverse() }
                setValue(next)
                setRevision((current) => current + 1)
                record('reverse alpha order')
              }}>
              Reverse alpha stops
            </Button>
            <Checkbox checked={reject} onCheckedChange={setReject} label="Reject next commit" />
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                const next = empty ? emptyAlpha : channels
                start.current = next
                setValue(next)
                setColorStop('warm')
                setAlphaStop(empty ? null : 'solid')
                setRevision((current) => current + 1)
                setReject(false)
                setEvents([])
              }}>
              Reset
            </Button>
          </StoryRow>
          <StoryState label="Channels state" value={{ value, colorStop, alphaStop, revision, reject, events }} />
        </>
      )}
    </StoryCard>
  )
}

function ChannelsPickerDemo() {
  const [value, setValue] = useState(channels)
  const [revision, setRevision] = useState(0)
  return (
    <StoryCard title='ColorRampPicker variant="channels"' description="紧凑入口打开双轨编辑器；按钮宽度可放进属性行。">
      <div className={css({ width: '240px', maxWidth: '100%' })}>
        <ColorRampPicker
          variant="channels"
          value={value}
          onValueChange={setValue}
          resetKey={revision}
          label="Edit particle ramp"
        />
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
          'ColorRampChannels 把颜色轨与透明度轨分开编辑，适合粒子、发光或遮罩渐变。value 包含 color 和 alpha 两组停靠点；选择停靠点不会修改属性。最终透明度是颜色自身 alpha 与 alpha 轨采样值的乘积，空 alpha 轨按 1 处理。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Color/ColorRampChannels',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Color"
      title="ColorRampChannels"
      summary="颜色与透明度各自拥有停靠点。两条轨道共享一次编辑会话，但保留独立的当前选择。"
      meta={
        <>
          <span>color + alpha tracks</span>
          <span>·</span>
          <span>HDR</span>
          <span>·</span>
          <span>product alpha</span>
        </>
      }>
      <StorySection title="Variants" description="标准双轨与空透明度轨；空轨按 1 处理，可随时添加 alpha stop。">
        <StoryGrid>
          <ChannelsDemo />
          <ChannelsDemo empty />
        </StoryGrid>
      </StorySection>

      <StorySection title="States" description="只读、禁用和窄布局保留同一条轨道结构。">
        <StoryGrid>
          <ChannelsDemo readOnly />
          <ChannelsDemo disabled />
          <ChannelsDemo narrow />
        </StoryGrid>
      </StorySection>

      <StorySection title="Picker" description="ColorRampPicker 的 channels 变体复用同一个编辑器。">
        <ChannelsPickerDemo />
      </StorySection>

      <StorySection title="Density and sizing">
        <StoryNote>
          ColorRampChannels 没有 density 变体：内部 Select、Button、InputNumber 使用 24px 紧凑档，分隔线和 6px
          圆角来自语义 token。280px 宽度下两条轨道仍可操作，操作按钮会换行。
        </StoryNote>
      </StorySection>

      <StorySection title="Keyboard and accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在颜色停靠点、Alpha 停靠点、Select、Add/Delete 和数值输入之间移动。' },
            { keys: ['←', '→'], action: '移动聚焦的停靠点；Shift 为 0.1，Ctrl/Cmd 为 0.001。' },
            { keys: ['Home', 'End'], action: '把停靠点移到 0 或 1。' },
            { keys: ['Delete', 'Backspace'], action: '删除聚焦的颜色或 Alpha 停靠点。' },
            { keys: 'Escape', action: '取消当前编辑，恢复编辑前的双轨值。' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<ColorRampChannels
  value={value}
  hdr
  activeStopId={colorStop}
  activeAlphaStopId={alphaStop}
  onValueChange={setValue}
  onValueCommit={saveValue}
  onEditCancel={restoreValue}
/>`}
          />
          <StoryProps
            rows={[
              {
                name: 'value / defaultValue',
                type: 'ColorRampChannelsValue',
                description: 'color 色轨 + alpha 透明度轨。',
              },
              { name: 'activeStopId', type: 'string | null', description: '当前颜色停靠点。' },
              { name: 'activeAlphaStopId', type: 'string | null', description: '当前透明度停靠点。' },
              { name: 'hdr', type: 'boolean', defaultValue: 'false', description: '允许颜色通道大于 1。' },
              {
                name: 'disabled / readOnly',
                type: 'boolean',
                defaultValue: 'false',
                description: '禁用或只读；选择仍然可用。',
              },
              { name: 'onValueChange', type: '(value) => void', description: '返回完整双轨数据供预览。' },
              {
                name: 'onValueCommit',
                type: '(value, reason) => void | Promise<void>',
                description: '一次完整编辑；可异步保存并抛错。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
