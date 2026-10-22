import React, { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'

import { Flex } from '../Flex'
import { Textarea } from '../Textarea'

import { ColorPicker } from './'
import type { ColorSpace } from './helper'

const argTypes = {
  disabled: {
    control: 'boolean',
  },
  fullsize: {
    control: 'boolean',
  },
}

export default {
  title: 'Inputs/ColorPicker',
  tags: ['autodocs'],
  component: ColorPicker,
  argTypes,
  args: {
    disabled: false,
    fullsize: true,
  },
} as Meta

export const Overview = (args) => {
  const [color, setColor] = useState({ r: 200, g: 150, b: 35, a: 0.5 })
  const [displayColorSpace, setDisplayColorSpace] = useState<ColorSpace>('sRGB')

  function handleOnChange(nextColor) {
    setColor(nextColor)
  }

  return (
    <Flex gap="sm" style={{ width: '300px' }} align="v" justifyContent="center">
      <ColorPicker
        mode="constant"
        value={color}
        onValueChange={handleOnChange}
        colorSpace="sRGB"
        displayColorSpace={displayColorSpace}
        onDisplayColorSpaceChange={setDisplayColorSpace}
        {...args}
      />
      <Textarea value={JSON.stringify({ color, colorSpace: 'sRGB', displayColorSpace }, null, 2)} readOnly />
    </Flex>
  )
}

Overview.argTypes = argTypes

export const GradientMode = (args) => {
  const [color, setColor] = useState([
    { value: { r: 200, g: 150, b: 35, a: 0.5 }, position: 0 },
    { value: { r: 200, g: 150, b: 35, a: 1 }, position: 1 },
  ])

  function handleOnChange(nextColor) {
    setColor(nextColor)
  }

  return (
    <Flex gap="sm" style={{ width: '300px' }} align="v" justifyContent="center">
      <ColorPicker mode="gradient" value={color} onValueChange={handleOnChange} colorSpace="sRGB" {...args} />
      <Textarea value={JSON.stringify(color)} readOnly />
    </Flex>
  )
}

GradientMode.argTypes = argTypes

export const ParticleMode = (args) => {
  const [color, setColor] = useState({
    color: [
      { value: { r: 200, g: 150, b: 35, a: 0.5 }, position: 0 },
      { value: { r: 200, g: 150, b: 35, a: 1 }, position: 1 },
    ],
    alpha: [
      { value: { r: 255, g: 255, b: 255, a: 0.5 }, position: 0 },
      { value: { r: 255, g: 255, b: 255, a: 1 }, position: 1 },
    ],
  })

  function handleOnChange(nextColor) {
    setColor(nextColor)
  }

  return (
    <Flex gap="sm" style={{ width: '300px' }} align="v">
      <Textarea value={JSON.stringify(color)} readOnly />
      <ColorPicker mode="particle" value={color} onValueChange={handleOnChange} colorSpace="sRGB" {...args} />
    </Flex>
  )
}

ParticleMode.argTypes = argTypes

export const HDRMode = (args) => {
  const [color, setColor] = useState({
    r: 200,
    g: 150,
    b: 35,
    a: 0.5,
    intensity: 1,
  })

  function handleOnChange(nextColor) {
    setColor(nextColor)
  }

  return (
    <Flex gap="sm" style={{ width: '300px' }} align="v">
      <Textarea value={JSON.stringify(color)} readOnly />
      <ColorPicker mode="hdr" value={color} onValueChange={handleOnChange} colorSpace="sRGB" {...args} />
    </Flex>
  )
}

HDRMode.argTypes = argTypes

export const ColorSpaceMode = (args) => {
  const [color, setColor] = useState({ r: 200, g: 150, b: 35, a: 0.5 })
  const [displayColorSpace, setDisplayColorSpace] = useState<ColorSpace>('sRGB')

  function handleOnChange(nextColor) {
    setColor(nextColor)
  }

  return (
    <Flex gap="sm" style={{ width: '400px' }} align="v" justifyContent="center">
      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
        ColorSpace Demo - Click the badge to switch between sRGB and Linear
      </div>
      <ColorPicker
        mode="constant"
        value={color}
        onValueChange={handleOnChange}
        colorSpace="sRGB"
        displayColorSpace={displayColorSpace}
        onDisplayColorSpaceChange={setDisplayColorSpace}
        {...args}
      />
      <div style={{ fontSize: '12px', color: '#666' }}>
        Display Color Space: <strong>{displayColorSpace}</strong>
      </div>
      <Textarea
        value={JSON.stringify(
          {
            color,
            colorSpace: 'sRGB',
            displayColorSpace,
            note: 'Values are always stored as sRGB (0-255), but displayed/edited in the selected color space',
          },
          null,
          2
        )}
        readOnly
        rows={8}
      />
    </Flex>
  )
}

ColorSpaceMode.argTypes = argTypes
