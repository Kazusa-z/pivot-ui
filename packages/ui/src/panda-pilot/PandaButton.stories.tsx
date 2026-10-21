import type { Meta, StoryFn } from '@storybook/react'
import { Button } from '../Button'
import { PandaButton } from './PandaButton'
import './panda.css'

export default {
  title: 'Panda Pilot/Button',
} as Meta

const variants = ['solid', 'outline', 'soft', 'subtle', 'inverted'] as const
const sizes = ['xs', 'sm', 'md', 'lg'] as const

export const Comparison: StoryFn = () => (
  <div style={{ display: 'grid', gap: 24 }}>
    <div>
      <strong>Variants</strong>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        {variants.map((variant) => (
          <div key={variant} style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, opacity: 0.7 }}>{variant}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant={variant}>Stitches</Button>
              <PandaButton variant={variant}>Panda</PandaButton>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <strong>Sizes</strong>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        {sizes.map((size) => (
          <div key={size} style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, opacity: 0.7 }}>{size}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size={size}>Stitches</Button>
              <PandaButton size={size}>Panda</PandaButton>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <strong>States</strong>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <Button disabled>Stitches disabled</Button>
        <PandaButton disabled>Panda disabled</PandaButton>
        <Button round>Stitches round</Button>
        <PandaButton round>Panda round</PandaButton>
      </div>
    </div>
  </div>
)
