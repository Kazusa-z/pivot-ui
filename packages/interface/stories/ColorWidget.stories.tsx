import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../src/widgets/buttons'
import { Checkbox } from '../src/widgets/choices/Checkbox'
import { ColorWidget } from '../src/widgets/color/ColorWidget'
import { ColorInput } from '../src/templates/color/ColorInput'
import { ColorPicker } from '../src/templates/color/ColorPicker'
import { HDRColorInput } from '../src/templates/color/HDRColorInput'
import { convertColorSpace, type ColorSpace, type ColorValue } from '../src/values/color'
import type { ColorCapabilities } from '../src/contracts/color'
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

const blue: ColorValue = { space: 'srgb', r: 0.15, g: 0.45, b: 0.85, a: 0.75 }
const green: ColorValue = { space: 'srgb', r: 0.1, g: 0.8, b: 0.3, a: 1 }
const cancelReasons = ['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only']

type DemoKind = 'inline' | 'hsv' | 'compact' | 'picker'

function ColorDemo({ kind, label, controls = false }: { kind: DemoKind; label: string; controls?: boolean }) {
  const [value, setValue] = useState(blue)
  const [space, setSpace] = useState<ColorSpace>('srgb')
  const [revision, setRevision] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [reject, setReject] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(blue)
  const clipboard = useRef('#FF880080')
  const capabilities = useMemo<ColorCapabilities>(
    () => ({
      clipboard: {
        readText: async () => clipboard.current,
        writeText: async (text) => {
          clipboard.current = text
        },
      },
      eyeDropper: { pick: async () => green },
    }),
    []
  )
  const record = (event: string) => setEvents((current) => [...current.slice(-8), event])
  const common = {
    value,
    displaySpace: space,
    onDisplaySpaceChange: (next: ColorSpace) => {
      setSpace(next)
      record(`display:${next}`)
    },
    disabled,
    readOnly,
    capabilities,
    onEditStart: (source: string) => {
      start.current = value
      record(`begin:${source}`)
    },
    onValueChange: (next: ColorValue) => {
      setValue(next)
      record('preview')
    },
    onValueCommit: async (next: ColorValue, reason: string) => {
      record(`commit:${reason}`)
      await new Promise((resolve) => setTimeout(resolve, 220))
      if (reject) {
        setReject(false)
        setValue(start.current)
        throw new Error('颜色未保存：请调整后重试。')
      }
      setValue(next)
    },
    onEditCancel: (reason: string) => {
      record(`cancel:${reason}`)
      if (cancelReasons.includes(reason)) setValue(start.current)
    },
  }
  return (
    <StoryCard title={label}>
      <div className={css({ width: '100%', maxWidth: '320px', minWidth: 0 })}>
        {kind === 'compact' ? (
          <ColorInput {...common} label={label} />
        ) : kind === 'picker' ? (
          <ColorPicker {...common} label={label} />
        ) : (
          <ColorWidget {...common} label={label} defaultModel={kind === 'hsv' ? 'hsv' : 'rgb'} />
        )}
      </div>
      {controls && (
        <>
          <StoryRow align="start">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const next = convertColorSpace(green, value.space)
                start.current = next
                setValue(next)
                setRevision((current) => current + 1)
                record('external update')
              }}>
              External update
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDisabled((current) => !current)}>
              {disabled ? 'Enable' : 'Disable'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setReadOnly((current) => !current)}>
              {readOnly ? 'Editable' : 'Read only'}
            </Button>
            <Checkbox checked={reject} onCheckedChange={setReject} label="Reject next commit" />
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                start.current = blue
                setValue(blue)
                setSpace('srgb')
                setRevision((current) => current + 1)
                setDisabled(false)
                setReadOnly(false)
                setReject(false)
                setEvents([])
              }}>
              Reset
            </Button>
          </StoryRow>
          <StoryState
            label="Color state"
            value={{ value, displaySpace: space, revision, disabled, readOnly, reject, events }}
          />
        </>
      )}
    </StoryCard>
  )
}

function HdrDemo() {
  const [value, setValue] = useState<ColorValue>({ space: 'linear', r: 4, g: 1, b: 0.25, a: 0.75 })
  const [events, setEvents] = useState<string[]>([])
  return (
    <StoryCard title="HDRColorInput" description="亮度倍率会按比例缩放 RGB；屏幕预览与 HEX 只显示可显示范围内的颜色。">
      <div className={css({ width: '100%', maxWidth: '420px', minWidth: 0 })}>
        <HDRColorInput
          value={value}
          label="Emission"
          intensityMax={12}
          onValueChange={(next) => {
            setValue(next)
            setEvents((current) => [...current.slice(-5), 'preview'])
          }}
          onValueCommit={(next) => {
            setValue(next)
            setEvents((current) => [...current.slice(-5), 'commit'])
          }}
        />
      </div>
      <StoryState label="HDR state" value={{ value, events }} />
    </StoryCard>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ColorWidget 是内联单色编辑器，ColorPicker 用色块打开浮层，ColorInput 组合紧凑字段，HDRColorInput 额外提供峰值亮度。颜色值包含 space、r、g、b、a；HEX 始终按 sRGB 解释，显示空间只改变查看方式。onValueChange 负责实时预览，onValueCommit 负责一次保存。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Color/ColorWidget',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Color"
      title="ColorWidget"
      summary="单色编辑的四种入口：完整内联面板、HSV 模式、紧凑字段和弹出式取色器。所有入口共享同一套值、提交与取消语义。"
      meta={
        <>
          <span>srgb / linear</span>
          <span>·</span>
          <span>0–1 alpha</span>
          <span>·</span>
          <span>HDR optional</span>
        </>
      }>
      <StorySection title="Variants" description="在完整编辑器、紧凑字段和弹层之间选择；它们都接收同一个 ColorValue。">
        <StoryGrid>
          <ColorDemo kind="inline" label="Inline RGB" />
          <ColorDemo kind="hsv" label="HSV model" />
          <ColorDemo kind="compact" label="Compact input" />
          <ColorDemo kind="picker" label="Popover picker" />
        </StoryGrid>
      </StorySection>

      <StorySection title="HDR" description="启用 HDR 后 RGB 可以大于 1；强度字段按比例缩放三个通道。">
        <HdrDemo />
      </StorySection>

      <StorySection
        title="State and commit"
        description="受控值、异步保存失败、只读和禁用状态都在同一个编辑会话中处理。">
        <ColorDemo kind="inline" label="Controlled color" controls />
      </StorySection>

      <StorySection title="Density and sizing">
        <StoryNote>
          ColorWidget 没有 density 变体：内部 Select、InputNumber 和 Slider 使用 24px 紧凑档，面板圆角为 6px。宽度小于约
          320px 时，模型、显示空间和通道字段会自动换行；不会切换到另一套字号。
        </StoryNote>
      </StorySection>

      <StorySection title="Keyboard and accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在色相滑块、模型/显示空间选择、H/S/V、Alpha、HEX 和能力按钮之间移动。' },
            { keys: ['←', '→'], action: '调整聚焦的色相滑块，或 H/S/V/Alpha 数值。' },
            { keys: 'Enter', action: '提交当前数值或 HEX 编辑；失败时保留错误供修正。' },
            { keys: 'Escape', action: '取消正在进行的拖动、滑杆或数值编辑，恢复编辑前的颜色。' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<ColorWidget
  value={color}
  displaySpace="srgb"
  onValueChange={setColor}
  onValueCommit={saveColor}
  capabilities={{ eyeDropper, clipboard }}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'value', type: 'ColorValue', description: '受控颜色；包含 space、r、g、b、a。' },
              {
                name: 'displaySpace',
                type: "'srgb' | 'linear'",
                defaultValue: 'value.space',
                description: 'RGB 字段的显示编码，不改变 value.space。',
              },
              {
                name: 'defaultModel',
                type: "'rgb' | 'hsv'",
                defaultValue: "'rgb'",
                description: '初始通道模型；切换只影响显示。',
              },
              {
                name: 'hdr',
                type: 'boolean',
                defaultValue: 'false',
                description: '允许 RGB 大于 1，并显示峰值亮度信息。',
              },
              {
                name: 'disabled / readOnly',
                type: 'boolean',
                defaultValue: 'false',
                description: '禁用或保留可读值，编辑请求被拒绝。',
              },
              {
                name: 'capabilities',
                type: 'ColorCapabilities',
                description: '注入剪贴板和屏幕取色；缺失时相应按钮禁用。',
              },
              { name: 'onValueChange', type: '(value) => void', description: '实时预览；不会自动保存。' },
              {
                name: 'onValueCommit',
                type: '(value, reason) => void | Promise<void>',
                description: '一次编辑完成；抛错时保留错误。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
