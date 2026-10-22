import { fn } from 'storybook/test'
import { Button, type ButtonProps } from '.'
import { Meta, StoryFn, StoryObj } from '@storybook/react'
import { Flex } from '../Flex'
import { IconCircleCheckFilled, IconComponents, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

const meta = {
  title: 'Inputs/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    controls: {
      exclude: ['startSlot', 'endSlot', 'css'],
    },
  },
  argTypes: {
    children: {
      control: 'text',
    },
    size: {
      type: {
        name: 'enum',
        value: ['xs', 'sm', 'md', 'lg'],
      },
    },
    critical: {
      control: 'boolean',
    },
    positive: {
      control: 'boolean',
    },
    variant: {
      type: {
        name: 'enum',
        value: ['solid', 'outline', 'soft', 'subtle', 'inverted'],
      },
      control: {
        type: 'radio',
      },
    },
  },
  args: {
    children: 'Pivot Button',
    size: 'sm',
    variant: 'soft',
    onClick: fn(),
    critical: false,
    positive: false,
  },
} satisfies Meta<typeof Button>

export default meta

export const Overview: StoryFn = (args) => {
  return <Button {...args} />
}

export const Sizes: StoryFn = (args) => {
  return (
    <Flex gap="sm" align="v" wrap>
      <Button {...args} size="xs">
        XS 24
      </Button>
      <Button {...args} size="sm">
        SM 28
      </Button>
      <Button {...args} size="md">
        MD 32
      </Button>
      <Button {...args} size="lg">
        LG 36
      </Button>
    </Flex>
  )
}

/**
 * `<Button />` provides neutral, emphasized and utility variants for editor actions.
 */
export const Variants: StoryFn = (args) => {
  return (
    <Flex gap="xs">
      <Button {...args} variant="solid">
        Solid
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="soft">
        Soft
      </Button>
      <Button {...args} variant="subtle">
        Subtle
      </Button>
      <Button {...args} variant="inverted">
        Inverted
      </Button>
    </Flex>
  )
}

/** Add icons or extra actions with the `startSlot` and `endSlot` props. */
export const WithSlot: StoryFn = (args) => {
  return (
    <Flex gap="sm">
      <Button {...args} startSlot={<IconComponents size="15px" strokeWidth={1.5} />} variant="outline">
        Add Component
      </Button>
      <Button {...args} startSlot={<IconTrash size="15px" strokeWidth={1.5} />} variant="solid" critical>
        Delete
      </Button>
    </Flex>
  )
}

/**
 * Use the `async: () => Promise<unknown>` prop when the button triggers asynchronous work. The component then manages the pending and loading states.
 */
function AsyncButtonExample(args: ButtonProps) {
  const [done, setDone] = useState(false)
  async function upload() {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setDone(true)
  }
  return (
    <Button {...args} startSlot={done && <IconCircleCheckFilled size="14px" />} critical variant="solid" async={upload}>
      {done ? 'Uploaded' : 'Upload File'}
    </Button>
  )
}

export const WithAsyncFunction: StoryFn<typeof Button> = (args) => <AsyncButtonExample {...args} />
