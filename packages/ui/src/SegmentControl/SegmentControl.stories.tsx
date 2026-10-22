import React, { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'

import { Flex } from '../Flex'
import { Button } from '../Button'

import { SegmentControl, SegmentControlItem } from './'

export default {
  title: 'Inputs/SegmentControl',
  tags: ['autodocs'],
  argTypes: {
    size: {
      type: {
        name: 'enum',
        value: ['sm', 'md'],
      },
    },
    variant: {
      type: {
        name: 'enum',
        value: ['subtle', 'solid'],
      },
    },
  },
  args: {
    size: 'sm',
    variant: 'subtle',
  },
} as Meta<typeof SegmentControl>

/**
 * `<SegmentControl />` groups `<SegmentControlItem />` items for switching between mutually exclusive states.
 *
 * The component is built on `@radix-ui/react-radio-group` and supports controlled and uncontrolled usage.
 */
export const Overview: StoryFn<typeof SegmentControl> = (args) => {
  return (
    <Flex gap="md" css={{ width: '400px' }}>
      <SegmentControl defaultValue="enable" {...args}>
        <SegmentControlItem value="enable">Enable</SegmentControlItem>
        <SegmentControlItem value="idle">Idle</SegmentControlItem>
        <SegmentControlItem value="disable">Disable</SegmentControlItem>
      </SegmentControl>
    </Flex>
  )
}

export const Sizes: StoryFn<typeof SegmentControl> = (args) => {
  return (
    <Flex direction="column" gap="sm" css={{ width: '400px' }}>
      <SegmentControl defaultValue="enable" {...args} size="sm">
        <SegmentControlItem value="enable">Enable</SegmentControlItem>
        <SegmentControlItem value="idle">Idle</SegmentControlItem>
        <SegmentControlItem value="disable">Disable</SegmentControlItem>
      </SegmentControl>
      <SegmentControl defaultValue="enable" {...args} size="md">
        <SegmentControlItem value="enable">Enable</SegmentControlItem>
        <SegmentControlItem value="idle">Idle</SegmentControlItem>
        <SegmentControlItem value="disable">Disable</SegmentControlItem>
      </SegmentControl>
    </Flex>
  )
}

export const Variants: StoryFn<typeof SegmentControl> = (args) => {
  return (
    <Flex direction="column" gap="sm" css={{ width: '400px' }}>
      <SegmentControl defaultValue="enable" {...args} variant="subtle">
        <SegmentControlItem value="enable">Enable</SegmentControlItem>
        <SegmentControlItem value="idle">Idle</SegmentControlItem>
        <SegmentControlItem value="disable">Disable</SegmentControlItem>
      </SegmentControl>
      <SegmentControl defaultValue="enable" {...args} variant="solid">
        <SegmentControlItem value="enable">Enable</SegmentControlItem>
        <SegmentControlItem value="idle">Idle</SegmentControlItem>
        <SegmentControlItem value="disable">Disable</SegmentControlItem>
      </SegmentControl>
    </Flex>
  )
}

export const Disabled: StoryFn<typeof SegmentControl> = (args) => {
  return (
    <Flex direction="column" gap="sm" css={{ width: '400px' }}>
      <SegmentControl defaultValue="idle" {...args}>
        <SegmentControlItem value="enable">Enable</SegmentControlItem>
        <SegmentControlItem value="idle">Idle</SegmentControlItem>
        <SegmentControlItem value="disable" disabled>
          Disable
        </SegmentControlItem>
      </SegmentControl>
      <SegmentControl defaultValue="idle" {...args} variant="solid">
        <SegmentControlItem value="enable">Enable</SegmentControlItem>
        <SegmentControlItem value="idle">Idle</SegmentControlItem>
        <SegmentControlItem value="disable" disabled>
          Disable
        </SegmentControlItem>
      </SegmentControl>
    </Flex>
  )
}

export const Uncontrolled: StoryFn<typeof SegmentControl> = (args) => {
  return (
    <Flex gap="md">
      <SegmentControl defaultValue="enable" {...args}>
        <SegmentControlItem value="enable">Enable</SegmentControlItem>
        <SegmentControlItem value="idle">Idle</SegmentControlItem>
        <SegmentControlItem value="disable">Disable</SegmentControlItem>
      </SegmentControl>
    </Flex>
  )
}

export const Controlled: StoryFn<typeof SegmentControl> = (args) => {
  const [value, setValue] = useState('enable')
  return (
    <Flex gap="md">
      <Button onClick={() => setValue('enable')}>Enable</Button>
      <SegmentControl value={value} onValueChange={setValue} {...args}>
        <SegmentControlItem value="enable">Enable</SegmentControlItem>
        <SegmentControlItem value="idle">Idle</SegmentControlItem>
        <SegmentControlItem value="disable">Disable</SegmentControlItem>
      </SegmentControl>
    </Flex>
  )
}

export const Narrow: StoryFn<typeof SegmentControl> = (args) => (
  <div style={{ width: 200 }}>
    <SegmentControl defaultValue="label1" {...args}>
      <SegmentControlItem value="label1">label12222</SegmentControlItem>
      <SegmentControlItem value="label2">label2</SegmentControlItem>
      <SegmentControlItem value="label3">label3</SegmentControlItem>
      <SegmentControlItem value="label4">label4</SegmentControlItem>
    </SegmentControl>
  </div>
)
