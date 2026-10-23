import React, { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'

import { styled } from '../../styled-system/jsx'

import { Flex } from './'

const Item = styled(Flex, {
  base: {
    boxShadow: 'inset 0 0 0 1px var(--colors-border)',
    backgroundColor: 'var(--colors-blueA3)',
    borderRadius: '6px',
    width: '48px',
    height: '48px',
    fontFamily: 'var(--fonts-mono)',
    color: 'var(--colors-gray11)',
    '&:nth-child(odd)': { height: '64px' },
  },
})

export default {
  title: 'Container/Flex',
  component: Flex,
  argTypes: {
    gap: {
      type: {
        name: 'enum',
        value: ['none', 'xs', 'sm', 'md', 'lg'],
      },
    },
    align: {
      type: {
        name: 'enum',
        value: ['both', 'v', 'h', 'start', 'center', 'end', 'stretch', 'baseline'],
      },
    },
    justifyContent: {
      type: {
        name: 'enum',
        value: ['center', 'between', 'around', 'end'],
      },
    },
    direction: {
      type: {
        name: 'enum',
        value: ['column', 'row', 'row-reverse', 'column-reverse'],
      },
      defaultValue: 'row',
    },
  },
  args: {
    gap: 'sm',
    direction: 'row',
  },
} as Meta<typeof Flex>

export const Overview: StoryFn<typeof Flex> = (args) => {
  return (
    <Flex {...args}>
      {[...Array(8)].map((_, i) => (
        <Item key={i} align="both" />
      ))}
    </Flex>
  )
}
