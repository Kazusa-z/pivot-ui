import React, { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'

import { styled } from '../../styled-system/jsx'

import { ScrollArea } from './'
import { Flex } from '../'

const Item = styled(Flex, {
  base: {
    boxShadow: 'inset 0 0 0 1px var(--colors-border)',
    backgroundColor: 'var(--colors-blueA3)',
    borderRadius: '6px',
    width: '100%',
    height: '48px',
    fontFamily: 'var(--fonts-mono)',
    color: 'var(--colors-gray11)',
    marginBottom: '8px',
  },
})

const TestContainer = styled('div', {
  base: {
    width: '200px',
    height: '200px',
    padding: '2px',
    backgroundColor: 'var(--colors-gray2)',
    border: '1px solid var(--colors-grayA5)',
    borderRadius: '6px',
  },
})

export default {
  title: 'Container/ScrollArea',
  component: ScrollArea,
} as Meta<typeof ScrollArea>

export const Overview: StoryFn<typeof ScrollArea> = (args) => {
  return (
    <TestContainer>
      <ScrollArea {...args} asContainer>
        {[...Array(8)].map((_, i) => (
          <Item key={i} align="both" />
        ))}
      </ScrollArea>
    </TestContainer>
  )
}
