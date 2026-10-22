import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormItemSelect, type FormItemSelectProps } from './'
import { StoryFrame } from '../../../stories/StoryFrame'

function SelectExample(args: FormItemSelectProps<string | number>) {
  const initialValue = args.value ?? 'perspective'
  const [value, setValue] = useState(initialValue)

  return (
    <StoryFrame value={value} onReset={() => setValue(initialValue)}>
      <FormItemSelect {...args} value={value} onChange={setValue} />
    </StoryFrame>
  )
}

const meta = {
  title: 'FormItem/FormItemSelect',
  component: FormItemSelect,
  args: {
    label: 'Projection',
    placeholder: 'Choose a projection',
    options: [
      { value: 'perspective', label: 'Perspective' },
      { value: 'orthographic', label: 'Orthographic' },
      { value: 'panoramic', label: 'Panoramic' },
    ],
  },
  render: (args) => <SelectExample {...args} />,
} satisfies Meta<typeof FormItemSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
export const Empty: Story = { args: { value: '' } }
export const Disabled: Story = { args: { disabled: true } }
export const NumericValues: Story = {
  args: {
    label: 'Quality',
    value: 0,
    options: [
      { value: 0, label: 'Draft' },
      { value: 1, label: 'Standard' },
      { value: 2, label: 'High' },
    ],
  },
}
