import React, { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'
import { Panel } from './'
import { Button, Input } from '@pivot-ui/editor'

export default {
  component: Panel,
} as Meta<typeof Panel>

export const Overview: StoryFn<typeof Panel> = (args) => {
  const [val, setVal] = useState(0)
  return (
    <Panel {...args}>
      <Input aria-label="Panel content" defaultValue="Panel Content" />
      <Button onClick={() => setVal((value) => value + 1)}>Add content</Button>
      {Array.from({ length: val }, (_, index) => (
        <Input key={index} aria-label={`Extra field ${index + 1}`} defaultValue={`Field ${index + 1}`} />
      ))}
    </Panel>
  )
}
