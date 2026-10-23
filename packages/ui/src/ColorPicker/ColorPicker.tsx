import { forwardRef } from 'react'
import { ColorPicker as SingleColorPicker, ColorRampPicker, type ColorCapabilities } from '@pivot-ui/react'
import {
  fromLegacyColor,
  toLegacyColor,
  fromLegacyHDR,
  toLegacyHDR,
  fromLegacyRamp,
  toLegacyRamp,
  fromLegacyChannels,
  toLegacyChannels,
  type Color,
  type ColorSpace,
  type HDRColor,
  type GradientColor,
  type ParticleColor,
} from './helper'

type LegacyValueProps =
  | { mode: 'constant'; value: Color; defaultValue?: Color; onValueChange: (value: Color) => void }
  | { mode: 'hdr'; value: HDRColor; defaultValue?: HDRColor; onValueChange: (value: HDRColor) => void }
  | {
      mode: 'gradient'
      value: GradientColor
      defaultValue?: GradientColor
      onValueChange: (value: GradientColor) => void
    }
  | {
      mode: 'particle'
      value: ParticleColor
      defaultValue?: ParticleColor
      onValueChange: (value: ParticleColor) => void
    }
export type ColorPickerProps = LegacyValueProps & {
  disabled?: boolean
  readOnly?: boolean
  fullsize?: boolean
  colorSpace?: ColorSpace
  displayColorSpace?: ColorSpace
  onDisplayColorSpaceChange?: (space: ColorSpace) => void
  capabilities?: ColorCapabilities
}

/** Compatibility only: legacy DTO conversion happens once at this package boundary. */
export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(function ColorPicker(props, ref) {
  const { colorSpace = 'sRGB', disabled, readOnly, fullsize, capabilities } = props
  const triggerProps = { style: fullsize ? { width: '100%' } : undefined }
  if (props.mode === 'gradient')
    return (
      <ColorRampPicker
        ref={ref}
        variant="ramp"
        label="Edit gradient"
        capabilities={capabilities}
        value={fromLegacyRamp(props.value, colorSpace)}
        onValueChange={(value) => props.onValueChange(toLegacyRamp(value))}
        disabled={disabled}
        readOnly={readOnly}
        triggerProps={triggerProps}
      />
    )
  if (props.mode === 'particle')
    return (
      <ColorRampPicker
        ref={ref}
        variant="channels"
        label="Edit color and alpha"
        capabilities={capabilities}
        value={fromLegacyChannels(props.value, colorSpace)}
        onValueChange={(value) => props.onValueChange(toLegacyChannels(value))}
        disabled={disabled}
        readOnly={readOnly}
        triggerProps={triggerProps}
      />
    )
  return (
    <SingleColorPicker
      ref={ref}
      label={props.mode === 'hdr' ? 'Edit HDR color' : 'Edit color'}
      value={props.mode === 'hdr' ? fromLegacyHDR(props.value, colorSpace) : fromLegacyColor(props.value, colorSpace)}
      onValueChange={(value) =>
        props.mode === 'hdr'
          ? props.onValueChange(toLegacyHDR(value, props.value))
          : props.onValueChange(toLegacyColor(value))
      }
      hdr={props.mode === 'hdr'}
      disabled={disabled}
      readOnly={readOnly}
      capabilities={capabilities}
      triggerProps={triggerProps}
      displaySpace={
        props.displayColorSpace === undefined ? undefined : props.displayColorSpace === 'Linear' ? 'linear' : 'srgb'
      }
      defaultDisplaySpace={colorSpace === 'Linear' ? 'linear' : 'srgb'}
      onDisplaySpaceChange={(space) => props.onDisplayColorSpaceChange?.(space === 'linear' ? 'Linear' : 'sRGB')}
    />
  )
})
