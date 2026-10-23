import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { GradientSlider as Gradient, ParticleSlider as Channels, HDRSlider as HDR } from './'
import type { GradientColor, ParticleColor, HDRColor } from '../ColorPicker'

export default {
  title: 'Inputs/ColorSlider',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Legacy adapters for ColorRamp, ColorRampChannels and HDRColorInput. Stable IDs are returned with every stop. Use the unified package for new work.',
      },
    },
  },
} satisfies Meta
const gradient: GradientColor = [
  { id: 'first', position: 0, value: { r: 255, g: 80, b: 40, a: 1 } },
  { id: 'second', position: 1, value: { r: 40, g: 100, b: 255, a: 1 } },
]
function Example({ kind }: { kind: 'gradient' | 'channels' | 'hdr' }) {
  const [colors, setColors] = useState(gradient)
  const [channels, setChannels] = useState<ParticleColor>({
    color: gradient,
    alpha: [
      { id: 'alpha-start', position: 0, value: { r: 255, g: 255, b: 255, a: 0.25 } },
      { id: 'alpha-end', position: 1, value: { r: 255, g: 255, b: 255, a: 1 } },
    ],
  })
  const [hdr, setHDR] = useState<HDRColor>({ r: 255, g: 100, b: 50, a: 1, intensity: 2 })
  const [writes, setWrites] = useState(0)
  return (
    <div style={{ width: 'min(560px, 100%)', display: 'grid', gap: 12 }}>
      {kind === 'gradient' ? (
        <Gradient
          colors={colors}
          onChange={(next) => {
            setColors(next)
            setWrites((v) => v + 1)
          }}
        />
      ) : kind === 'channels' ? (
        <Channels
          colors={channels}
          onChange={(next) => {
            setChannels(next)
            setWrites((v) => v + 1)
          }}
        />
      ) : (
        <HDR
          HDRColor={hdr}
          onChange={(next) => {
            setHDR(next)
            setWrites((v) => v + 1)
          }}
        />
      )}
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {JSON.stringify(
          { writes, value: kind === 'gradient' ? colors : kind === 'channels' ? channels : hdr },
          null,
          2
        )}
      </pre>
    </div>
  )
}
export const Overview: StoryFn = () => <Example kind="gradient" />
export const GradientSlider: StoryFn = () => <Example kind="gradient" />
export const ParticleSlider: StoryFn = () => <Example kind="channels" />
export const HDRSlider: StoryFn = () => <Example kind="hdr" />
