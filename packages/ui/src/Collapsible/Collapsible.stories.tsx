import { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'

import { styled } from '../../styled-system/jsx'
import { Flex } from '../Flex'

import { Collapsible, type CollapsibleProps } from './'
import { Button } from '..'

export default {
  title: 'Container/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
} as Meta<typeof Collapsible>

const StyledContent = styled('div', {
  base: { padding: '8px', fontSize: '12px' },
})

export const Overview: StoryFn<typeof Collapsible> = (args) => {
  return (
    <Flex gap="md" style={{ width: '300px' }}>
      <Collapsible title="Section 1" {...args}>
        <StyledContent>Collapsible Content</StyledContent>
      </Collapsible>
    </Flex>
  )
}

function ControlledExample(args: CollapsibleProps) {
  const [open, setOpen] = useState(false)
  return (
    <Flex gap="md" style={{ width: '300px' }}>
      <Button
        onClick={() => {
          setOpen(!open)
        }}>
        toggle
      </Button>
      <Collapsible
        title="Section 1"
        {...args}
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          args.onOpenChange?.(value)
        }}>
        <StyledContent>Collapsible Content</StyledContent>
      </Collapsible>
      <output>Open: {String(open)}</output>
    </Flex>
  )
}

export const Controlled: StoryFn<typeof Collapsible> = (args) => <ControlledExample {...args} />

export const Uncontrolled: StoryFn<typeof Collapsible> = (args) => {
  return (
    <Flex gap="md" style={{ width: '300px' }}>
      <Collapsible title="Section 1" {...args}>
        <StyledContent>Collapsible Content</StyledContent>
      </Collapsible>
    </Flex>
  )
}
