import { useEffect, useState, type ComponentProps } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemCascadeSlider } from '..'
import { StoryFrame } from '../../../stories/StoryFrame'

const initialValue = [20, 30, 50]

export default {
  title: 'FormItem/FormItemCascadeSlider',
  component: FormItemCascadeSlider,
  args: { label: 'Cascade splits', value: initialValue, max: 100, step: 1, unit: '%' },
} satisfies Meta<typeof FormItemCascadeSlider>

function CascadeSliderExample(args: ComponentProps<typeof FormItemCascadeSlider>) {
  const startingValue = args.value ?? args.defaultValue ?? initialValue
  const [value, setValue] = useState(startingValue)
  useEffect(() => setValue(startingValue), [startingValue])

  return (
    <StoryFrame value={value} onReset={() => setValue([...startingValue])}>
      <FormItemCascadeSlider
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

export const Overview: StoryFn<typeof FormItemCascadeSlider> = (args) => <CascadeSliderExample {...args} />

export const TwoSegments: StoryFn<typeof FormItemCascadeSlider> = (args) => <CascadeSliderExample {...args} />
TwoSegments.args = { label: 'Near / far', value: [35, 65] }

export const CustomUnits: StoryFn<typeof FormItemCascadeSlider> = (args) => <CascadeSliderExample {...args} />
CustomUnits.args = { label: 'Split distances', value: [10, 30, 60], unit: ' m' }
