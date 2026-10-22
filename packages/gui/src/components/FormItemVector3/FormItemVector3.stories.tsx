import { useEffect, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemVector3, type FormItemVector3Props, type Vector3 } from '.'
import { StoryFrame } from '../../../stories/StoryFrame'

const initialValue: Vector3 = { x: 1, y: 2, z: 3 }

export default {
  title: 'FormItem/FormItemVector3',
  component: FormItemVector3,
  args: { label: 'Position', value: initialValue },
} satisfies Meta<typeof FormItemVector3>

function Vector3Example(args: FormItemVector3Props) {
  const startingValue = args.value ?? args.defaultValue ?? initialValue
  const [value, setValue] = useState(startingValue)
  useEffect(() => setValue(startingValue), [startingValue])

  return (
    <StoryFrame value={value} onReset={() => setValue({ ...startingValue })}>
      <FormItemVector3
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

export const Overview: StoryFn<typeof FormItemVector3> = (args) => <Vector3Example {...args} />

export const Constrained: StoryFn<typeof FormItemVector3> = (args) => <Vector3Example {...args} />
Constrained.args = { label: 'Scale', value: { x: 1, y: 2, z: 3 }, constrainable: true }
Constrained.parameters = {
  docs: {
    description: { story: 'Enable the link button beside Scale, then drag any axis to preserve the 1:2:3 ratio.' },
  },
}

export const Range: StoryFn<typeof FormItemVector3> = (args) => <Vector3Example {...args} />
Range.args = { min: -10, max: 10 }

export const Disabled: StoryFn<typeof FormItemVector3> = (args) => <Vector3Example {...args} />
Disabled.args = { disabled: true }
