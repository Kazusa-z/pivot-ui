import { useEffect, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemParticleCurve, type FormItemParticleCurveProps, type ParticlePropertyType } from './'
import { FormItemParticle } from '..'
import { StoryFrame } from '../../../stories/StoryFrame'

const curve = [
  { x: 0, y: 0 },
  { x: 0.25, y: 0.15 },
  { x: 0.75, y: 0.9 },
  { x: 1, y: 1 },
]
const initialValues: FormItemParticleCurveProps['value'] = [
  { type: 'constant', label: 'Constant', value: 1, min: 0, max: 10, step: 0.1 },
  { type: 'curve', label: 'Curve', value: curve },
  { type: 'two-constant', label: 'Two constants', value: [0.5, 2], min: 0, max: 10, step: 0.1 },
  { type: 'two-curve', label: 'Two curves', value: [curve, structuredClone(curve)] },
]

export default {
  title: 'FormItem/FormItemParticle',
  component: FormItemParticleCurve,
  args: { label: 'Lifetime size', type: 'constant', value: initialValues, yRangeMode: 'positive', yTickScale: 1 },
  argTypes: { type: { control: 'select', options: ['constant', 'curve', 'two-constant', 'two-curve'] } },
  parameters: {
    docs: { description: { component: 'FormItemParticleCurve is also exported as FormItemParticle.' } },
  },
} as Meta<typeof FormItemParticleCurve>

function ParticleExample({ alias = false, ...args }: FormItemParticleCurveProps & { alias?: boolean }) {
  const initialType = args.type ?? 'constant'
  const initialValue = args.value ?? initialValues
  const [type, setType] = useState<ParticlePropertyType>(initialType)
  const [value, setValue] = useState(() => structuredClone(initialValue))
  const [scale, setScale] = useState(args.yTickScale ?? 1)
  useEffect(() => setType(initialType), [initialType])
  useEffect(() => setValue(structuredClone(initialValue)), [initialValue])
  useEffect(() => setScale(args.yTickScale ?? 1), [args.yTickScale])
  const Component = alias ? FormItemParticle : FormItemParticleCurve

  return (
    <StoryFrame
      value={{ component: alias ? 'FormItemParticle' : 'FormItemParticleCurve', type, yTickScale: scale, value }}
      onReset={() => {
        setType(initialType)
        setValue(structuredClone(initialValue))
        setScale(args.yTickScale ?? 1)
      }}>
      <Component
        {...args}
        type={type}
        value={value}
        yTickScale={scale}
        onYTickScaleChange={(nextScale) => {
          setScale(nextScale)
          args.onYTickScaleChange?.(nextScale)
        }}
        onValueChange={(nextValue, nextType) => {
          setValue(nextValue)
          setType(nextType)
          args.onValueChange?.(nextValue, nextType)
        }}
      />
    </StoryFrame>
  )
}

export const Overview: StoryFn<typeof FormItemParticleCurve> = (args) => <ParticleExample {...args} />
export const Curve: StoryFn<typeof FormItemParticleCurve> = (args) => <ParticleExample {...args} />
Curve.args = { type: 'curve' }
export const TwoConstants: StoryFn<typeof FormItemParticleCurve> = (args) => <ParticleExample {...args} />
TwoConstants.args = { type: 'two-constant' }
export const TwoCurves: StoryFn<typeof FormItemParticleCurve> = (args) => <ParticleExample {...args} />
TwoCurves.args = { type: 'two-curve' }
export const FixedMode: StoryFn<typeof FormItemParticleCurve> = (args) => <ParticleExample {...args} />
FixedMode.args = { type: 'curve', hideTypeSelector: true }
export const Linear: StoryFn<typeof FormItemParticleCurve> = (args) => <ParticleExample {...args} />
Linear.args = { type: 'curve', algo: 'linear' }
export const ParticleAlias: StoryFn<typeof FormItemParticleCurve> = (args) => <ParticleExample {...args} alias />
