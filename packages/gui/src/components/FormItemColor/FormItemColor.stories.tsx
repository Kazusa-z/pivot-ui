import { useEffect, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemColor, type FormItemColorProps } from './'
import { StoryFrame } from '../../../stories/StoryFrame'

const initialColor = { r: 0.2, g: 0.6, b: 1, a: 1 }

export default {
  title: 'FormItem/FormItemColor',
  component: FormItemColor,
  args: { label: 'Color', value: initialColor, colorSpace: 'Linear' },
} as Meta<typeof FormItemColor>

function ColorExample(args: FormItemColorProps) {
  const startingColor = args.value ?? args.defaultValue ?? initialColor
  const [color, setColor] = useState(() => ({ ...startingColor }))
  const [resetKey, setResetKey] = useState(0)
  useEffect(() => setColor({ ...startingColor }), [startingColor])

  return (
    <StoryFrame
      value={{ color, storageColorSpace: args.colorSpace ?? 'Linear' }}
      onReset={() => {
        setColor({ ...startingColor })
        setResetKey((key) => key + 1)
      }}>
      <FormItemColor
        {...args}
        key={resetKey}
        value={color}
        onChange={(nextColor) => {
          setColor(nextColor)
          args.onChange?.(nextColor)
        }}
      />
    </StoryFrame>
  )
}

export const Overview: StoryFn<typeof FormItemColor> = (args) => <ColorExample {...args} />
export const SRGB: StoryFn<typeof FormItemColor> = (args) => <ColorExample {...args} />
SRGB.args = { colorSpace: 'sRGB' }
export const HDR: StoryFn<typeof FormItemColor> = (args) => <ColorExample {...args} />
HDR.args = { mode: 'hdr', value: { r: 4, g: 1.2, b: 0.2, a: 1 } }
export const Transparent: StoryFn<typeof FormItemColor> = (args) => <ColorExample {...args} />
Transparent.args = { value: { ...initialColor, a: 0.35 } }
export const Disabled: StoryFn<typeof FormItemColor> = (args) => <ColorExample {...args} />
Disabled.args = { disabled: true }
