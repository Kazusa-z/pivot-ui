import { useEffect, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemVector2, type FormItemVector2Props, type Vector2 } from '.'
import { StoryFrame } from '../../../stories/StoryFrame'

const initialValue: Vector2 = { x: 10, y: 20 }

export default {
  title: 'FormItem/FormItemVector2',
  component: FormItemVector2,
  args: { label: 'Position', value: initialValue },
} satisfies Meta<typeof FormItemVector2>

function Vector2Example(args: FormItemVector2Props) {
  const startingValue = args.value ?? args.defaultValue ?? initialValue
  const [value, setValue] = useState(startingValue)
  useEffect(() => setValue(startingValue), [startingValue])

  return (
    <StoryFrame value={value} onReset={() => setValue({ ...startingValue })}>
      <FormItemVector2
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

export const Overview: StoryFn<typeof FormItemVector2> = (args) => <Vector2Example {...args} />

export const Range: StoryFn<typeof FormItemVector2> = (args) => <Vector2Example {...args} />
Range.args = { label: 'Offset', value: { x: 1, y: 2 }, min: -5, max: 5 }

export const CustomLabels: StoryFn<typeof FormItemVector2> = (args) => <Vector2Example {...args} />
CustomLabels.args = { label: 'Texture offset', slotMapping: { x: 'U', y: 'V' } }

export const Disabled: StoryFn<typeof FormItemVector2> = (args) => <Vector2Example {...args} />
Disabled.args = { disabled: true }
