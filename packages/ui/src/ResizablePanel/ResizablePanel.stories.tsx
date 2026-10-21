import type { Meta, StoryFn } from '@storybook/react'
import { ResizablePanel } from './'

export default {
  title: 'Container/ResizablePanel',
  component: ResizablePanel,
} as Meta

export const Overview: StoryFn<typeof ResizablePanel> = () => (
  <div style={{ width: 320 }}>
    <ResizablePanel direction="horizontal" handlerPosition="right" variant="solid" range={{ min: 160, max: 360 }}>
      <div
        style={{
          width: '100%',
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--colors-border)',
          borderRadius: 6,
          background: 'var(--colors-surface)',
        }}>
        Drag the right edge
      </div>
    </ResizablePanel>
  </div>
)
