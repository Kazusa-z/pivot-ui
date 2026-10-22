import { useEffect, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemSlider, type FormItemSliderProps } from '.'
import { StoryFrame } from '../../../stories/StoryFrame'

export default {
  title: 'FormItem/FormItemSlider',
  component: FormItemSlider,
  args: { label: 'Intensity', value: 40, min: 0, max: 100, step: 1, dragStep: 1 },
} satisfies Meta<typeof FormItemSlider>

function SliderExample(args: FormItemSliderProps) {
  const startingValue = args.value ?? args.defaultValue ?? 40
  const [value, setValue] = useState(startingValue)
  useEffect(() => setValue(startingValue), [startingValue])

  return (
    <StoryFrame value={value} onReset={() => setValue(startingValue)}>
      <FormItemSlider
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

export const Overview: StoryFn<typeof FormItemSlider> = (args) => <SliderExample {...args} />

export const UnitInterval: StoryFn<typeof FormItemSlider> = (args) => <SliderExample {...args} />
UnitInterval.args = { label: 'Opacity', value: 0.35, min: 0, max: 1, step: 0.01, dragStep: 0.01 }

export const Disabled: StoryFn<typeof FormItemSlider> = (args) => <SliderExample {...args} />
Disabled.args = { disabled: true }
