import { useEffect, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemInputNumber, type FormItemInputNumberProps } from '.'
import { StoryFrame } from '../../../stories/StoryFrame'

export default {
  title: 'FormItem/FormItemInputNumber',
  component: FormItemInputNumber,
  args: { label: 'Count', value: 12, step: 1, dragStep: 1 },
} satisfies Meta<typeof FormItemInputNumber>

function InputNumberExample(args: FormItemInputNumberProps) {
  const startingValue = args.value ?? args.defaultValue ?? 12
  const [value, setValue] = useState(startingValue)
  useEffect(() => setValue(startingValue), [startingValue])

  return (
    <StoryFrame value={value} onReset={() => setValue(startingValue)}>
      <FormItemInputNumber
        {...args}
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue)
          args.onChange?.(nextValue)
        }}
      />
    </StoryFrame>
  )
}

export const Overview: StoryFn<typeof FormItemInputNumber> = (args) => <InputNumberExample {...args} />

export const Range: StoryFn<typeof FormItemInputNumber> = (args) => <InputNumberExample {...args} />
Range.args = { label: 'Offset', value: 2, min: -10, max: 10, step: 0.5, dragStep: 0.5 }

export const WithoutButtons: StoryFn<typeof FormItemInputNumber> = (args) => <InputNumberExample {...args} />
WithoutButtons.args = { additionalControl: false }

export const Disabled: StoryFn<typeof FormItemInputNumber> = (args) => <InputNumberExample {...args} />
Disabled.args = { disabled: true }
