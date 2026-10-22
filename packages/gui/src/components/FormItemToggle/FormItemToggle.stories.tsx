import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormItemToggle, type FormItemToggleProps } from './'
import { StoryFrame } from '../../../stories/StoryFrame'

function ToggleExample(args: FormItemToggleProps) {
  const initialValue = args.value ?? true
  const [value, setValue] = useState(initialValue)

  return (
    <StoryFrame value={value} onReset={() => setValue(initialValue)}>
      <FormItemToggle {...args} value={value} onChange={setValue} />
    </StoryFrame>
  )
}

const meta = {
  title: 'FormItem/FormItemToggle',
  component: FormItemToggle,
  args: { label: 'Visible' },
  render: (args) => <ToggleExample {...args} />,
} satisfies Meta<typeof FormItemToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
export const Unchecked: Story = { args: { value: false } }
export const Disabled: Story = { args: { disabled: true } }
