import { useEffect, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemRect, type FormItemRectProps, type Rect } from '.'
import { StoryFrame } from '../../../stories/StoryFrame'

const initialValue: Rect = { x: 10, y: 20, width: 160, height: 90 }

export default {
  title: 'FormItem/FormItemRect',
  component: FormItemRect,
  args: { label: 'Rectangle', value: initialValue },
} satisfies Meta<typeof FormItemRect>

function RectExample(args: FormItemRectProps) {
  const startingValue = args.value ?? args.defaultValue ?? initialValue
  const [value, setValue] = useState(startingValue)
  useEffect(() => setValue(startingValue), [startingValue])

  return (
    <StoryFrame value={value} onReset={() => setValue({ ...startingValue })}>
      <FormItemRect
        {...args}
        value={value}
        onChange={(nextValue, axis) => {
          setValue(nextValue)
          args.onChange?.(nextValue, axis)
        }}
      />
    </StoryFrame>
  )
}

export const Overview: StoryFn<typeof FormItemRect> = (args) => <RectExample {...args} />

export const Range: StoryFn<typeof FormItemRect> = (args) => <RectExample {...args} />
Range.args = { min: 0, max: 200 }

export const Disabled: StoryFn<typeof FormItemRect> = (args) => <RectExample {...args} />
Disabled.args = { disabled: true }
