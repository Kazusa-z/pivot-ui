import { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'

import { Flex } from '../Flex'
import { Button } from '../Button'

import { CascadeSlider, type CascadeSliderProps } from './'

export default {
  title: 'Inputs/CascadeSlider',
  tags: ['autodocs'],
  component: CascadeSlider,
  argTypes: {
    value: {
      control: false,
    },
    defaultValue: {
      control: false,
    },
    onChange: {
      control: false,
    },
    step: {
      table: {
        defaultValue: { summary: '1' },
      },
      control: {
        type: 'number',
      },
    },
    unit: {
      table: {
        defaultValue: { summary: '%' },
      },
    },
  },
} satisfies Meta<typeof CascadeSlider>

export const Overview: StoryFn<typeof CascadeSlider> = (args) => {
  return (
    <Flex css={{ width: '300px' }}>
      <CascadeSlider defaultValue={[20, 50, 100]} {...args} />
    </Flex>
  )
}

export const Uncontrollable: StoryFn<typeof CascadeSlider> = (args) => {
  return (
    <Flex css={{ width: '300px' }}>
      <CascadeSlider {...args} defaultValue={[20, 50, 100]} />
    </Flex>
  )
}

function ControlledCascadeSliderExample(args: CascadeSliderProps) {
  const [value, setValue] = useState([50, 50, 100])

  const handleChange = () => {
    setValue([100, 100, 100])
  }

  return (
    <Flex gap="sm" css={{ width: '300px' }} direction="column">
      <CascadeSlider unit="m" {...args} defaultValue={undefined} value={value} onChange={setValue} />
      <Button size="sm" variant="soft" onClick={handleChange}>
        click
      </Button>
    </Flex>
  )
}

export const Controllable: StoryFn<typeof CascadeSlider> = (args) => <ControlledCascadeSliderExample {...args} />
