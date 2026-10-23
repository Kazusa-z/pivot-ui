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
        record('stale completion ignored by host')
        return
      }
      if (rejectNext.current) {
        rejectNext.current = false
        setValue(start.current)
        record('rejected')
        throw new Error('Host rejected this color. Retry with Enter or edit again.')
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
      title={`Single color · ${kind}`}
      description={
        kind === 'hdr'
          ? 'RGB is the sole HDR value. Peak RGB is derived in the declared encoding; display/HEX clip only the preview. Pure black has no stored hue, so increasing its peak creates neutral RGB.'
          : kind === 'async'
            ? 'Mock capabilities and commits are delayed. Reject next commit retains an editable draft; Enter retries. External update/Reset/Disable invalidates late capability results.'
            : kind === 'frozen'
              ? 'The host records requests without accepting previews. Numeric/graphical rendering stays authoritative; a submitted text draft returns to the accepted value.'
              : 'Drag the SV plane or Hue slider; RGB/HSV fields provide keyboard editing. HEX is always sRGB. Display encoding is UI state; the stored space never changes.'
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
      <StatePanel
        label="Authoritative color / UI state"
        value={{ value, displaySpace: space, revision, disabled, readOnly }}
      />
      <StatePanel label="Edit events" value={events} />
    </ContractFrame>
  )
}

const meta = {
  title: 'Widgets/Color',
  component: ColorWidget,
  args: { value: blue },
  parameters: { layout: 'fullscreen' },
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
