import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormItemSegmentControl, type FormItemSegmentControlProps } from './'
import { StoryFrame } from '../../../stories/StoryFrame'

function SegmentControlExample(args: FormItemSegmentControlProps) {
  const initialValue = args.value ?? 'local'
  const [value, setValue] = useState(initialValue)

  return (
    <StoryFrame value={value} onReset={() => setValue(initialValue)}>
      <FormItemSegmentControl {...args} value={value} onChange={setValue} />
    </StoryFrame>
  )
}

const meta = {
  title: 'FormItem/FormItemSegmentControl',
  component: FormItemSegmentControl,
  args: {
    label: 'Space',
    options: [
      { value: 'local', label: 'Local' },
      { value: 'world', label: 'World' },
      { value: 'view', label: 'View' },
    ],
  },
  render: (args) => <SegmentControlExample {...args} />,
} satisfies Meta<typeof FormItemSegmentControl>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
export const Solid: Story = { args: { variant: 'solid' } }
export const Empty: Story = { args: { value: '' } }
export const Disabled: Story = { args: { disabled: true } }
export const DisabledOption: Story = {
  args: {
    options: [
      { value: 'local', label: 'Local' },
      { value: 'world', label: 'World' },
      { value: 'view', label: 'View', disabled: true },
    ],
  },
}
export const NumericValues: Story = {
  args: {
    label: 'Quality',
    value: 1,
    options: [
      { value: 0, label: 'Draft' },
      { value: 1, label: 'Standard' },
      { value: 2, label: 'High' },
    ],
  },
}
