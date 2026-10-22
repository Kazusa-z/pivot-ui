import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormItemTextarea, type FormItemTextareaProps } from './'
import { StoryFrame } from '../../../stories/StoryFrame'

function TextareaExample(args: FormItemTextareaProps) {
  const initialValue = args.value ?? 'A reusable scene object.\nEdit this description to update the value below.'
  const [value, setValue] = useState(initialValue)

  return (
    <StoryFrame value={value} onReset={() => setValue(initialValue)}>
      <FormItemTextarea {...args} value={value} onChange={setValue} />
    </StoryFrame>
  )
}

const meta = {
  title: 'FormItem/FormItemTextarea',
  component: FormItemTextarea,
  args: { label: 'Description' },
  render: (args) => <TextareaExample {...args} />,
} satisfies Meta<typeof FormItemTextarea>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
export const Empty: Story = { args: { value: '' } }
export const Disabled: Story = { args: { disabled: true } }
