import { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'

import { Slider, type SliderProps } from './'
import { Flex } from '../Flex'
import { Button } from '..'

export default {
  title: 'Inputs/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    size: {
      options: ['default', 'xs'],
      mapping: {
        default: undefined,
        xs: 'xs',
      },
      control: { type: 'inline-radio' },
    },
    defaultValue: {
      description: 'The default value of the slider. Use this if you want an uncontrolled component.',
    },
    step: {
      description:
        "The step size for each thumb movement. This defines the granularity of the slider's value increments.",
      table: {
        defaultValue: { summary: '1' },
      },
    },
    startSlot: {
      control: false,
    },
    endSlot: {
      control: false,
    },
  },
  args: {
    defaultValue: [30],
    step: 1,
    showRuler: false,
    max: 100,
  },
} satisfies Meta<typeof Slider>

export const Overview: StoryFn<typeof Slider> = (args) => {
  return (
    <Flex css={{ width: '300px' }}>
      <Slider {...args} />
    </Flex>
  )
}

export const MultiValue: StoryFn<typeof Slider> = (args) => {
  return (
    <Flex css={{ width: '300px' }}>
      <Slider {...args} defaultValue={[30, 60]} />
    </Flex>
  )
}

export const Uncontrolled: StoryFn<typeof Slider> = (args) => {
  return (
    <Flex css={{ width: '300px' }}>
      <Slider {...args} />
    </Flex>
  )
}

function ControlledSliderExample(args: SliderProps) {
  const [value, setValue] = useState([30])
  return (
    <Flex css={{ width: '300px' }} gap="sm">
      <Button onClick={() => setValue([50])}>Set to 50</Button>
      <Slider {...args} defaultValue={undefined} value={value} onValueChange={setValue} />
    </Flex>
  )
}

export const Controlled: StoryFn<typeof Slider> = (args) => <ControlledSliderExample {...args} />

export const Sizes: StoryFn<typeof Slider> = (args) => {
  return (
    <Flex css={{ width: '300px' }} direction="column" gap="sm">
      <Slider {...args} size="xs" />
      <Slider {...args} size={undefined} />
    </Flex>
  )
}
