import { useId, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@pivot-ui/editor'
import { FormItemDisplay, type FormItemDisplayProps } from './'
import { Input, PropertyRow, PropertyLabel, PropertyControl } from '@pivot-ui/react'
import { StoryFrame } from '../../../stories/StoryFrame'

function TextDisplayExample(args: FormItemDisplayProps) {
  const initialValue = args.value ?? 'Main camera'
  const [value, setValue] = useState(initialValue)
  const id = useId()

  return (
    <StoryFrame value={value} onReset={() => setValue(initialValue)}>
      <PropertyRow>
        <PropertyLabel htmlFor={id}>Source</PropertyLabel>
        <PropertyControl association="control">
          <Input id={id} value={value} onValueChange={setValue} placeholder="Edit the displayed value" />
        </PropertyControl>
      </PropertyRow>
      <FormItemDisplay {...args} value={value} />
    </StoryFrame>
  )
}

const previewColors = ['#4f7cff', '#f59e42']

function ImageDisplayExample(args: FormItemDisplayProps) {
  const [colorIndex, setColorIndex] = useState(0)
  const color = previewColors[colorIndex]
  const value = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="96" viewBox="0 0 160 96"><rect width="160" height="96" rx="8" fill="#20242c"/><circle cx="80" cy="48" r="28" fill="${color}"/></svg>`
  )}`

  return (
    <StoryFrame value={{ displayType: 'image', color }} onReset={() => setColorIndex(0)}>
      <FormItemDisplay {...args} value={value} displayType="image" />
      <Button onClick={() => setColorIndex((index) => (index + 1) % previewColors.length)}>Change preview</Button>
    </StoryFrame>
  )
}

const meta = {
  title: 'FormItem/FormItemDisplay',
  component: FormItemDisplay,
  args: { label: 'Preview' },
  render: (args) => <TextDisplayExample {...args} />,
} satisfies Meta<typeof FormItemDisplay>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
export const Empty: Story = { args: { value: '' } }
export const Image: Story = { render: (args) => <ImageDisplayExample {...args} /> }
