import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormItemButton } from '..'
import { StoryFrame } from '../../../stories/StoryFrame'

function ButtonExample(args: ComponentProps<typeof FormItemButton>) {
  const [clicks, setClicks] = useState(0)

  return (
    <StoryFrame value={{ clicks }} onReset={() => setClicks(0)}>
      <FormItemButton {...args} onClick={() => setClicks((count) => count + 1)} />
    </StoryFrame>
  )
}

const meta = {
  title: 'FormItem/FormItemButton',
  component: FormItemButton,
  args: { label: 'Action', children: 'Create object' },
  render: (args) => <ButtonExample {...args} />,
} satisfies Meta<typeof FormItemButton>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
export const Disabled: Story = { args: { disabled: true } }
