import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormItemInput, type FormItemInputProps } from './'
import { StoryFrame } from '../../../stories/StoryFrame'

function InputExample(args: FormItemInputProps) {
  const initialValue = args.value ?? 'Main camera'
  const [value, setValue] = useState(initialValue)

  return (
    <StoryFrame value={value} onReset={() => setValue(initialValue)}>
      <FormItemInput {...args} value={value} onChange={setValue} />
    </StoryFrame>
  )
}

const meta = {
  title: 'FormItem/FormItemInput',
  component: FormItemInput,
  args: { label: 'Name', placeholder: 'Enter a name' },
  render: (args) => <InputExample {...args} />,
} satisfies Meta<typeof FormItemInput>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
export const Empty: Story = { args: { value: '' } }
export const Disabled: Story = { args: { disabled: true } }
export const ReadOnly: Story = { args: { readOnly: true } }
