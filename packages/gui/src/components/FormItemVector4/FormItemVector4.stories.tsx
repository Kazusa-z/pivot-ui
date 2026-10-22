import { useEffect, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemVector4, type FormItemVector4Props, type Vector4 } from '.'
import { StoryFrame } from '../../../stories/StoryFrame'

const initialValue: Vector4 = { x: 0.1, y: 0.2, z: 0.3, w: 1 }

export default {
  title: 'FormItem/FormItemVector4',
  component: FormItemVector4,
  args: { label: 'Vector', value: initialValue, step: 0.1, dragStep: 0.1 },
} satisfies Meta<typeof FormItemVector4>

function Vector4Example(args: FormItemVector4Props) {
  const startingValue = args.value ?? args.defaultValue ?? initialValue
  const [value, setValue] = useState(startingValue)
  useEffect(() => setValue(startingValue), [startingValue])

  return (
    <StoryFrame value={value} onReset={() => setValue({ ...startingValue })}>
      <FormItemVector4
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

export const Overview: StoryFn<typeof FormItemVector4> = (args) => <Vector4Example {...args} />

export const Range: StoryFn<typeof FormItemVector4> = (args) => <Vector4Example {...args} />
Range.args = { min: 0, max: 1, step: 0.05, dragStep: 0.05 }

export const CustomLabels: StoryFn<typeof FormItemVector4> = (args) => <Vector4Example {...args} />
CustomLabels.args = {
  label: 'Insets',
  value: { x: 4, y: 8, z: 4, w: 8 },
  slotMapping: { x: 'L', y: 'T', z: 'R', w: 'B' },
}

export const Disabled: StoryFn<typeof FormItemVector4> = (args) => <Vector4Example {...args} />
Disabled.args = { disabled: true }
