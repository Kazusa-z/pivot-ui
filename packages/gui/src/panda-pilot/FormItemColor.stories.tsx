import type { Meta, StoryFn } from '@storybook/react'
import { Flex } from '@pivot-ui/editor'
import { FormItemColor } from '../components/FormItemColor'
import { PandaFormItemColor } from './FormItemColor'

export default {
  title: 'Panda Pilot/FormItemColor',
} as Meta

const color = { r: 1, g: 0, b: 0, a: 1 }

export const Comparison: StoryFn = () => (
  <Flex gap="lg" align="v">
    <div style={{ width: 360 }}>
      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 8 }}>Stitches</div>
      <FormItemColor label="color" defaultValue={color} />
    </div>
    <div style={{ width: 360 }}>
      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 8 }}>Panda</div>
      <PandaFormItemColor label="color" defaultValue={color} />
    </div>
  </Flex>
)
