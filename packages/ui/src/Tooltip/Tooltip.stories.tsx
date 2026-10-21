import type { Meta, StoryFn } from '@storybook/react'
import { Button } from '../Button'
import { Tooltip } from './Tooltip'

export default {
  title: 'Overlay/Tooltip',
  component: Tooltip,
} as Meta<typeof Tooltip>

export const Overview: StoryFn<typeof Tooltip> = () => (
  <Tooltip content="Tooltip content">
    <Button size="sm">Hover me</Button>
  </Tooltip>
)
