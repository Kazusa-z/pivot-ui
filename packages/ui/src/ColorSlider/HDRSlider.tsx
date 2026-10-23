import { HDRColorInput } from '@pivot-ui/react'
import { fromLegacyHDR, toLegacyHDR, type HDRColor } from '../ColorPicker/helper'

export interface HDRSliderProps {
  /** Legacy multiplier limits now apply to the derived peak RGB channel. */
  min?: number
  max?: number
  step?: number
  HDRColor: HDRColor
  onChange: (color: HDRColor) => void
  disabled?: boolean
  readOnly?: boolean
}
export function HDRSlider({ HDRColor: color, min = 0, max = 10, step = 0.1, onChange, ...props }: HDRSliderProps) {
  return (
    <HDRColorInput
      {...props}
      label="HDR color"
      value={fromLegacyHDR(color)}
      intensityMin={min}
      intensityMax={max}
      intensityStep={step}
      onValueChange={(next) => onChange(toLegacyHDR(next, color))}
    />
  )
}
