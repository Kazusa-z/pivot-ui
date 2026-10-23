import React, { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'

import { Flex } from '../Flex'
import { Button } from '../Button'

import { Popover } from './'

export default {
  title: 'Overlay/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {
    forceRender: {
      control: 'boolean',
      description: 'Preserve state while closed; suspend content effects and focus/scroll layers.',
    },
    side: {
      type: {
        name: 'enum',
        value: ['top', 'right', 'bottom', 'left'],
      },
    },
    align: {
      type: {
        name: 'enum',
        value: ['start', 'center', 'end'],
      },
    },
    sideOffset: {
      type: 'number',
      defaultValue: 8,
    },
  },
} as Meta<typeof Popover>

function PopoverContent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Popover content</p>
      <Button onClick={() => setCount((value) => value + 1)}>Count {count}</Button>
    </div>
  )
}

export const Overview: StoryFn<typeof Popover> = (args) => {
  return (
    <Flex gap="md">
      <Popover {...args} trigger={<Button size="sm">Click to show the Popover</Button>}>
        <PopoverContent />
      </Popover>
    </Flex>
  )
}
