import React, { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'

import { Flex } from '../Flex'

import { EditableText } from '.'

export default {
  title: 'Inputs/EditableText',
  component: EditableText,
} as Meta<typeof EditableText>

function EditableTextExample() {
  const [first, setFirst] = useState('Pam Beesly')
  const [second, setSecond] = useState('Jim Halpert')
  return (
    <Flex gap="md" direction="column">
      <EditableText value={first} onBlur={setFirst} />
      <EditableText value={second} onBlur={setSecond} showIcon />
    </Flex>
  )
}

export const Overview: StoryFn<typeof EditableText> = () => <EditableTextExample />

Overview.argTypes = {
  value: {
    defaultValue: 'inline-name',
  },
}
