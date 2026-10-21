import React, { useState } from 'react'
import { Meta, StoryFn, StoryObj } from '@storybook/react'
import { IconVideo, IconApps, IconCircleCheckFilled, IconDownload } from '@tabler/icons-react'

import { Flex } from '../Flex'

import { ActionButton, ActionButtonGroup as PrimitiveActionButtonGroup } from './'

/**
 * `<ActionButton />` is an icon-only button. It accepts standard HTML button attributes plus the `size`, `variant` and `fancy` props.
 */
const meta: Meta<typeof ActionButton> = {
  title: 'Inputs/ActionButton',
  tags: ['autodocs'],
  parameters: {
    controls: {
      exclude: ['startSlot', 'endSlot', 'css', 'children'],
    },
  },
  args: {
    children: <IconApps />,
    variant: 'soft',
    size: 'md',
    fancy: false,
    disabled: false,
    corner: false,
  },
  argTypes: {
    size: {
      type: {
        name: 'enum',
        value: ['xs', 'sm', 'md', 'lg'],
      },
    },
    variant: {
      type: {
        name: 'enum',
        value: ['outline', 'soft', 'subtle', 'ghost'],
      },
      control: {
        type: 'inline-radio',
      },
    },
    active: {
      type: {
        name: 'boolean',
      },
    },
    fancy: {
      description: 'Add active effect to the button.',
      type: {
        name: 'boolean',
      },
    },
    corner: {
      description:
        'Use `corner` when the ActionButton acts as a trigger, such as opening a menu or dialog, to display a corner indicator.',
      type: {
        name: 'boolean',
      },
    },
  },
  component: ActionButton,
}

export default meta
type Story = StoryObj<typeof ActionButton>

export const Overview: Story = {}

export const Sizes: StoryFn<typeof ActionButton> = (args) => {
  return (
    <Flex gap="sm" align="v">
      <ActionButton {...args} size="xs">
        <IconApps />
      </ActionButton>
      <ActionButton {...args} size="sm">
        <IconApps />
      </ActionButton>
      <ActionButton {...args} size="md">
        <IconApps />
      </ActionButton>
      <ActionButton {...args} size="lg">
        <IconApps />
      </ActionButton>
    </Flex>
  )
}

/**
 * Use the `async: () => Promise<unknown>` prop when the button triggers asynchronous work. The component then manages the pending and loading states.
 */
export const WithAsyncFunction: StoryFn = (args) => {
  const [done, setDone] = useState(false)
  async function upload() {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setDone(true)
  }
  return (
    <Flex gap="sm" align="v" style={{ fontSize: '12px' }}>
      <ActionButton {...args} async={upload}>
        {done ? <IconCircleCheckFilled /> : <IconDownload />}
      </ActionButton>
      Download Files
    </Flex>
  )
}

/**
 * `<ActionButtonGroup />` is a styled wrapper component to group multiple ActionButton components. This component could handle `radius` prop correctly so that you can set multi ActionButton Component in a group.
 *
 * Use the `direction` prop to lay the group out horizontally or vertically.
 */
export const ActionButtonGroup: StoryFn = (args) => {
  const { direction, ...rest } = args
  return (
    <PrimitiveActionButtonGroup direction={direction}>
      <ActionButton {...rest}>
        <IconVideo />
      </ActionButton>
      <ActionButton {...rest}>
        <IconVideo />
      </ActionButton>
    </PrimitiveActionButtonGroup>
  )
}

ActionButtonGroup.args = {
  direction: 'horizontal',
}

ActionButtonGroup.argTypes = {
  direction: {
    type: {
      name: 'enum',
      value: ['vertical', 'horizontal'],
    },
  },
}
