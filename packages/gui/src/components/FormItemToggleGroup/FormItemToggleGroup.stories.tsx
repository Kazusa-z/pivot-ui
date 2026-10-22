import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormItemToggleGroup, type FormItemToggleGroupProps } from './'
import { StoryFrame } from '../../../stories/StoryFrame'

function SingleToggleGroupExample(args: Extract<FormItemToggleGroupProps, { type: 'single' }>) {
  const initialValue = args.value ?? 'move'
  const [value, setValue] = useState(initialValue)

  return (
    <StoryFrame value={value} onReset={() => setValue(initialValue)}>
      <FormItemToggleGroup {...args} value={value} onChange={setValue} />
    </StoryFrame>
  )
}

function MultipleToggleGroupExample(args: Extract<FormItemToggleGroupProps, { type: 'multiple' }>) {
  const initialValue = args.value ?? ['move', 'rotate']
  const [value, setValue] = useState(initialValue)

  return (
    <StoryFrame value={value} onReset={() => setValue(initialValue)}>
      <FormItemToggleGroup {...args} value={value} onChange={setValue} />
    </StoryFrame>
  )
}

function ToggleGroupExample(args: FormItemToggleGroupProps) {
  return args.type === 'multiple' ? <MultipleToggleGroupExample {...args} /> : <SingleToggleGroupExample {...args} />
}

const meta = {
  title: 'FormItem/FormItemToggleGroup',
  component: FormItemToggleGroup,
  args: {
    label: 'Tools',
    type: 'single',
    options: [
      { value: 'move', label: 'Move' },
      { value: 'rotate', label: 'Rotate' },
      { value: 'scale', label: 'Scale' },
    ],
  },
  render: (args) => <ToggleGroupExample {...args} />,
} satisfies Meta<typeof FormItemToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
export const Multiple: Story = { args: { type: 'multiple' } }
export const Empty: Story = { args: { value: '' } }
export const Disabled: Story = { args: { disabled: true } }
