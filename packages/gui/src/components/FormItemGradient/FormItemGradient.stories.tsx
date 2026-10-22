import { useEffect, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemGradient, type FormItemGradientProps, type GradientPropertyType } from './'
import { StoryFrame } from '../../../stories/StoryFrame'

const blue = { r: 0.15, g: 0.55, b: 1, a: 1 }
const orange = { r: 1, g: 0.35, b: 0.1, a: 1 }
const gradient = {
  color: [
    { time: 0, value: blue },
    { time: 1, value: orange },
  ],
  alpha: [
    { time: 0, value: 1 },
    { time: 1, value: 0.3 },
  ],
}

const initialValues: FormItemGradientProps['value'] = [
  { type: 'constant', label: 'Constant', value: blue },
  { type: 'gradient', label: 'Gradient', value: gradient },
  { type: 'two-constant', label: 'Two colors', value: [blue, orange] },
  { type: 'two-gradient', label: 'Two gradients', value: [gradient, structuredClone(gradient)] },
]

export default {
  title: 'FormItem/FormItemGradient',
  component: FormItemGradient,
  args: { label: 'Lifetime color', type: 'constant', value: initialValues },
  argTypes: { type: { control: 'select', options: ['constant', 'gradient', 'two-constant', 'two-gradient'] } },
} as Meta<typeof FormItemGradient>

function GradientExample(args: FormItemGradientProps) {
  const initialType = args.type ?? 'constant'
  const initialValue = args.value ?? initialValues
  const [type, setType] = useState<GradientPropertyType>(initialType)
  const [value, setValue] = useState(() => structuredClone(initialValue))
  useEffect(() => setType(initialType), [initialType])
  useEffect(() => setValue(structuredClone(initialValue)), [initialValue])

  return (
    <StoryFrame
      value={{ type, value }}
      onReset={() => {
        setType(initialType)
        setValue(structuredClone(initialValue))
      }}>
      <FormItemGradient
        {...args}
        type={type}
        value={value}
        onValueChange={(nextValue, nextType) => {
          setValue(nextValue)
          setType(nextType)
          args.onValueChange?.(nextValue, nextType)
        }}
      />
    </StoryFrame>
  )
}

export const Overview: StoryFn<typeof FormItemGradient> = (args) => <GradientExample {...args} />
export const Gradient: StoryFn<typeof FormItemGradient> = (args) => <GradientExample {...args} />
Gradient.args = { type: 'gradient' }
export const TwoColors: StoryFn<typeof FormItemGradient> = (args) => <GradientExample {...args} />
TwoColors.args = { type: 'two-constant' }
export const TwoGradients: StoryFn<typeof FormItemGradient> = (args) => <GradientExample {...args} />
TwoGradients.args = { type: 'two-gradient' }
export const HDR: StoryFn<typeof FormItemGradient> = (args) => <GradientExample {...args} />
HDR.args = { hdr: true }
