import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../src/controls/buttons'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { ColorDistributionEditor } from '../src/editors/color/ColorDistributionEditor'
import {
  copyColorDistributionValue,
  switchColorDistributionMode,
  type ColorDistributionCache,
  type ColorDistributionMode,
  type ColorDistributionValue,
} from '../src/values/color-distribution'
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

const initial: ColorDistributionValue = {
  mode: 'constant',
  color: { space: 'linear', r: 0.15, g: 0.45, b: 0.8, a: 0.7 },
}
const hdrInitial: ColorDistributionValue = {
  mode: 'constant',
  color: { space: 'linear', r: 4, g: 1.5, b: 0.5, a: 1 },
}
const cancelReasons = ['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only']
const modeLabel: Record<ColorDistributionMode, string> = {
  constant: 'Constant',
  gradient: 'Gradient',
  'two-constant': 'Two colors',
  'two-gradient': 'Two gradients',
}

function DistributionDemo({
  mode = 'constant',
  hdr = false,
  readOnly = false,
  disabled = false,
  narrow = false,
}: {
  mode?: ColorDistributionMode
  hdr?: boolean
  readOnly?: boolean
  disabled?: boolean
  narrow?: boolean
}) {
  const makeInitial = (): ColorDistributionValue => (hdr ? hdrInitial : switchColorDistributionMode(initial, mode))
  const [value, setValue] = useState<ColorDistributionValue>(makeInitial)
  const [cache, setCache] = useState<ColorDistributionCache>({})
  const [revision, setRevision] = useState(0)
  const [reject, setReject] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value)
  const record = (event: string) => setEvents((current) => [...current.slice(-8), event])
  const locked = readOnly || disabled
  return (
    <StoryCard
      title={hdr ? 'HDR constant' : modeLabel[mode]}
      description={
        readOnly
          ? '只读模式保留模式和颜色，但拒绝所有修改。'
          : disabled
            ? '整体禁用；值仍可读取。'
            : hdr
              ? 'HDR 颜色允许通道大于 1；预览会裁剪到屏幕范围。'
              : '模式、颜色和渐变都通过同一份 value 回传；cache 保留已切换模式的设置。'
      }>
      <div className={css({ width: '100%', maxWidth: narrow ? '300px' : '480px', minWidth: 0 })}>
        <ColorDistributionEditor
          value={value}
          cache={cache}
          onCacheChange={setCache}
          hdr={hdr}
          readOnly={readOnly}
          disabled={disabled}
          resetKey={revision}
          onEditStart={() => {
            start.current = copyColorDistributionValue(value)
            record('begin')
          }}
          onValueChange={(next) => {
            setValue(next)
            record(`preview:${next.mode}`)
          }}
          onValueCommit={async (next, reason) => {
            record(`commit:${reason}:${next.mode}`)
            await new Promise((resolve) => setTimeout(resolve, 220))
            if (reject) {
              setReject(false)
              setValue(start.current)
              throw new Error('颜色分布未保存：请重试。')
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
            <Checkbox checked={reject} onCheckedChange={setReject} label="Reject next commit" />
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                const next = makeInitial()
                start.current = next
                setValue(next)
                setCache({})
                setRevision((current) => current + 1)
                setReject(false)
                setEvents([])
              }}>
              Reset
            </Button>
          </StoryRow>
          <StoryState label="Distribution state" value={{ value, cache, revision, reject, events }} />
        </>
      )}
    </StoryCard>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ColorDistributionEditor 在单色、渐变、两种颜色和两组渐变之间切换，适合效果参数或随机颜色范围。value.mode 决定当前数据形状；cache 保留已接受过的模式，切换时可以恢复。onValueChange 返回预览，onValueCommit 表示一次保存，应用负责接受、拒绝和取消后的恢复。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Color/ColorDistribution',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Color"
      title="ColorDistribution"
      summary="同一个字段在固定颜色、渐变、两种颜色和两组渐变之间切换。每种模式保留自己的缓存，切换时不会丢失已经接受的内容。"
      meta={
        <>
          <span>4 modes</span>
          <span>·</span>
          <span>cache per mode</span>
          <span>·</span>
          <span>HDR optional</span>
        </>
      }>
      <StorySection title="Variants" description="四种模式共用模式选择、提交和缓存；只有数据形状不同。">
        <StoryGrid>
          <DistributionDemo />
          <DistributionDemo mode="gradient" />
          <DistributionDemo mode="two-constant" />
          <DistributionDemo mode="two-gradient" />
        </StoryGrid>
      </StorySection>

      <StorySection title="States" description="只读、禁用、窄布局和 HDR 仍然保持同一种编辑会话。">
        <StoryGrid>
          <DistributionDemo readOnly />
          <DistributionDemo disabled />
          <DistributionDemo narrow />
          <DistributionDemo hdr />
        </StoryGrid>
      </StorySection>

      <StorySection title="Density and sizing">
        <StoryNote>
          ColorDistributionEditor 没有 density 变体：模式 SegmentControl、ColorField、ColorAlphaRampEditor 都使用 24px
          紧凑控件；两种颜色/渐变的外框为 6px 圆角。300px 以下字段会换行，但不会改变字号档位。
        </StoryNote>
      </StorySection>

      <StorySection title="Keyboard and accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在模式、颜色/渐变、添加/删除和数值字段之间移动。' },
            { keys: ['←', '→'], action: '在模式 SegmentControl 内切换焦点。' },
            { keys: ['Space', 'Enter'], action: '选择聚焦的模式；切换是一次可提交的编辑。' },
            { keys: 'Escape', action: '取消当前颜色、渐变或模式编辑，恢复编辑前的 value。' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<ColorDistributionEditor
  value={value}
  cache={cache}
  onCacheChange={setCache}
  onValueChange={setValue}
  onValueCommit={saveValue}
  onEditCancel={restoreValue}
  resetKey={objectId}
/>`}
          />
          <StoryProps
            rows={[
              {
                name: 'value',
                type: 'ColorDistributionValue',
                description: 'mode 决定 color / colors / ramp / ramps 形状。',
              },
              {
                name: 'cache / defaultCache',
                type: 'ColorDistributionCache',
                description: '按模式保存已接受的值；受控缓存同时传 onCacheChange。',
              },
              { name: 'hdr', type: 'boolean', defaultValue: 'false', description: '允许颜色通道大于 1。' },
              {
                name: 'disabled / readOnly',
                type: 'boolean',
                defaultValue: 'false',
                description: '禁用或只读；值仍可读取。',
              },
              { name: 'resetKey', type: 'unknown', description: '切换对象或外部版本时重置编辑和缓存。' },
              { name: 'onValueChange', type: '(value) => void', description: '预览值；应用可在受控模式下拒绝更新。' },
              {
                name: 'onValueCommit',
                type: '(value, reason) => void | Promise<void>',
                description: '一次保存；可异步并抛错。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
