import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColorWidget } from '../src/widgets/color/ColorWidget'
import { ColorInput } from '../src/templates/color/ColorInput'
import { ColorPicker } from '../src/templates/color/ColorPicker'
import { HDRColorInput } from '../src/templates/color/HDRColorInput'
import { convertColorSpace, type ColorSpace, type ColorValue } from '../src/values/color'
import type { ColorCapabilities } from '../src/contracts/color'
import type { ColorControlProps } from '../src/widgets/color/types'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'
import { css } from '../styled-system/css'

type Example = 'inline' | 'hsv' | 'linear' | 'compact' | 'picker' | 'hdr' | 'availability' | 'async' | 'frozen'
const blue: ColorValue = { space: 'srgb', r: 0.15, g: 0.45, b: 0.85, a: 0.75 }
const green: ColorValue = { space: 'srgb', r: 0.1, g: 0.8, b: 0.3, a: 1 }

function ColorExample({ kind = 'inline' }: { kind?: Example }) {
  const initial = useMemo(
    () =>
      kind === 'linear'
        ? convertColorSpace(blue, 'linear')
        : kind === 'hdr'
          ? { space: 'linear' as const, r: 4, g: 1, b: 0.25, a: 0.75 }
          : blue,
    [kind]
  )
  const [value, setValue] = useState(initial)
  const [space, setSpace] = useState<ColorSpace>(kind === 'linear' ? 'linear' : 'srgb')
  const [revision, setRevision] = useState(0)
  const revisionRef = useRef(revision)
  revisionRef.current = revision
  const [events, setEvents] = useState<string[]>([])
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const rejectNext = useRef(false)
  const start = useRef(initial)
  const clipboard = useRef('#FF880080')
  const record = (entry: string) => setEvents((old) => [...old.slice(-19), entry])
  const capabilities = useMemo<ColorCapabilities | undefined>(
    () =>
      kind === 'availability'
        ? undefined
        : {
            clipboard: {
              readText: async () => clipboard.current,
              writeText: async (text) => {
                clipboard.current = text
              },
            },
            eyeDropper: {
              pick: async () => {
                if (kind === 'async') await new Promise((resolve) => setTimeout(resolve, 900))
                return green
              },
            },
          },
    [kind]
  )
  const common: ColorControlProps = {
    value,
    hdr: kind === 'hdr',
    resetKey: revision,
    disabled,
    readOnly,
    capabilities,
    displaySpace: space,
    onDisplaySpaceChange: (next) => {
      setSpace(next)
      record(`display:${next} (no value change)`)
    },
    onEditStart: (source) => {
      start.current = value
      record(`begin:${source}`)
    },
    onValueChange: (next) => {
      record(`preview:${next.r.toFixed(3)},${next.g.toFixed(3)},${next.b.toFixed(3)},${next.a.toFixed(3)}`)
      if (kind !== 'frozen') setValue(next)
    },
    onValueCommit: async (next, reason) => {
      const currentRevision = revisionRef.current
      record(`commit:${reason}`)
      if (kind === 'async') await new Promise((resolve) => setTimeout(resolve, 650))
      if (currentRevision !== revisionRef.current) {
        record('应用忽略较早的保存结果')
        return
      }
      if (rejectNext.current) {
        rejectNext.current = false
        setValue(start.current)
        record('rejected')
        throw new Error('颜色未保存，请按 Enter 重试或继续修改。')
      }
      if (kind !== 'frozen') setValue(next)
      record('accepted')
    },
    onEditCancel: (reason) => {
      record(`cancel:${reason}`)
      if (kind !== 'frozen' && ['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason))
        setValue(start.current)
    },
  }
  const { hdr: _hdr, ...hdrCommon } = common
  return (
    <ContractFrame
      title={`单色编辑 · ${kind}`}
      description={
        kind === 'hdr'
          ? '调整 Peak RGB，观察 RGB 三个通道按比例变亮或变暗，以及下方数值如何保留大于 1 的亮度。屏幕预览和 HEX 显示的是可显示范围内的颜色；把颜色设为纯黑后再提高亮度，可以看到中性灰色的起始效果。'
          : kind === 'async'
            ? '试试取色或修改一个颜色通道，体验等待保存的过程。点击 Reject next commit 后再编辑，会看到错误提示并可按 Enter 重试。下方事件记录展示每次编辑；应用可在 onValueCommit 返回 Promise 来接入自己的保存操作。'
            : kind === 'frozen'
              ? '拖动取色区域或输入 RGB，比较事件记录与保持原色的预览。这个示例让应用保留原值，用来展示受控组件的接法：在 onValueChange 中更新 value 后，颜色就会跟随编辑。'
              : '拖动饱和度/明度区域或色相滑块调整颜色，也可用键盘编辑 RGB、HSV 和 HEX。HEX 始终按 sRGB 解释；显示空间切换只改变查看方式，value.space 仍由应用决定。'
      }
      onReset={() => {
        revisionRef.current++
        setRevision(revisionRef.current)
        setValue(initial)
        setEvents([])
        setDisabled(false)
        setReadOnly(false)
        rejectNext.current = false
        setSpace(kind === 'linear' ? 'linear' : 'srgb')
      }}>
      <div
        className={css({
          width: '100%',
          maxWidth: kind === 'compact' || kind === 'hdr' ? '520px' : '320px',
          minWidth: 0,
        })}>
        {kind === 'compact' ? (
          <ColorInput {...common} label="Tint" />
        ) : kind === 'picker' ? (
          <ColorPicker {...common} label="Tint" />
        ) : kind === 'hdr' ? (
          <HDRColorInput {...hdrCommon} label="Emission" />
        ) : (
          <ColorWidget {...common} label="Tint" defaultModel={kind === 'hsv' ? 'hsv' : 'rgb'} />
        )}
      </div>
      <div className={contractStyles.row}>
        <ControlButton
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            revisionRef.current++
            setRevision(revisionRef.current)
            setValue(convertColorSpace(green, value.space))
            record('external green/new revision')
          }}>
          External update
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setDisabled((old) => !old)}>
          Toggle disabled
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setReadOnly((old) => !old)}>
          Toggle read-only
        </ControlButton>
        {kind === 'async' && (
          <ControlButton
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              rejectNext.current = true
              record('next commit will reject')
            }}>
            Reject next commit
          </ControlButton>
        )}
      </div>
      <StatePanel label="当前颜色与显示状态" value={{ value, displaySpace: space, revision, disabled, readOnly }} />
      <StatePanel label="编辑事件" value={events} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Color',
  component: ColorWidget,
  args: { value: blue },
  parameters: {
    docs: {
      description: {
        component:
          '这组组件用于编辑单个颜色：ColorWidget 提供完整颜色面板，ColorPicker 放在弹层中，ColorInput 组合紧凑输入，HDRColorInput 额外提供亮度倍率输入。\n\n颜色值包含 space、r、g、b、a。普通 RGB 与 alpha 使用 0 到 1，启用 hdr 后 RGB 可大于 1。onValueChange 用于实时预览，onValueCommit 用于保存一次编辑；受控用法中，应用通过 onEditCancel 恢复编辑前的值。\n\nHEX 输入始终使用 sRGB，显示空间切换不会改变存储空间。剪贴板与屏幕取色通过 capabilities 注入；未提供的方法对应操作不可用。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ColorWidget>
export default meta
type Story = StoryObj<typeof meta>
export const Inline: Story = { render: () => <ColorExample /> }
export const HSV: Story = { render: () => <ColorExample kind="hsv" /> }
export const LinearDisplay: Story = { render: () => <ColorExample kind="linear" /> }
export const CompactInput: Story = { render: () => <ColorExample kind="compact" /> }
export const PopoverPicker: Story = { render: () => <ColorExample kind="picker" /> }
export const HDR: Story = { render: () => <ColorExample kind="hdr" /> }
export const MissingCapabilities: Story = { render: () => <ColorExample kind="availability" /> }
export const AsyncCapabilities: Story = { render: () => <ColorExample kind="async" /> }
export const FrozenControlled: Story = { render: () => <ColorExample kind="frozen" /> }
