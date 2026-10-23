import {
  convertColorSpace,
  formatColorHex,
  getColorCss,
  getColorRampCss,
  getColorRampChannelsCss,
  sampleColorRamp,
  sampleAlphaStops,
  type ColorValue,
  type ColorRampValue,
  type ColorRampChannelsValue,
} from '@pivot-ui/react'

/** Legacy byte-range DTOs. New code uses normalized ColorValue with an explicit space. */
export type Color = { r: number; g: number; b: number; a: number }
export type ColorPickerMode = 'constant' | 'gradient' | 'particle' | 'hdr'
export type ColorSpace = 'sRGB' | 'Linear'
export type GradientColor = { id?: string; value: Color; position: number }[]
export type ParticleColor = { color: GradientColor; alpha: GradientColor }
export interface HDRColor extends Color {
  intensity: number
}

export function normalizeColor<T extends Color = Color>(color: T): T {
  return { ...color, r: color.r / 255, g: color.g / 255, b: color.b / 255 }
}
export function denormalizeColor<T extends Color = Color>(color: T): T {
  return { ...color, r: color.r * 255, g: color.g * 255, b: color.b * 255 }
}
export function fromLegacyColor(color: Color, space: ColorSpace = 'sRGB'): ColorValue {
  return { ...normalizeColor(color), space: space === 'Linear' ? 'linear' : 'srgb' }
}
export function toLegacyColor(color: ColorValue): Color {
  return { r: color.r * 255, g: color.g * 255, b: color.b * 255, a: color.a }
}
export function fromLegacyHDR(color: HDRColor, space: ColorSpace = 'sRGB'): ColorValue {
  const base = convertColorSpace(fromLegacyColor(color, space), 'linear')
  return convertColorSpace(
    { ...base, r: base.r * color.intensity, g: base.g * color.intensity, b: base.b * color.intensity },
    space === 'Linear' ? 'linear' : 'srgb'
  )
}
export function toLegacyHDR(color: ColorValue, fallback: HDRColor): HDRColor {
  const linear = convertColorSpace(color, 'linear')
  const intensity = Math.max(linear.r, linear.g, linear.b)
  if (intensity === 0) return { ...fallback, a: color.a, intensity: 0 }
  const base = convertColorSpace(
    { ...linear, r: linear.r / intensity, g: linear.g / intensity, b: linear.b / intensity },
    color.space
  )
  return { ...toLegacyColor(base), intensity }
}
export function fromLegacyRamp(stops: GradientColor, space: ColorSpace = 'sRGB', prefix = 'color'): ColorRampValue {
  return {
    interpolation: 'linear',
    stops: stops.map((stop, index) => ({
      id: stop.id ?? `${prefix}-${index}`,
      position: stop.position,
      color: fromLegacyColor(stop.value, space),
    })),
  }
}
export function toLegacyRamp(value: ColorRampValue): GradientColor {
  return value.stops.map((stop) => ({ id: stop.id, position: stop.position, value: toLegacyColor(stop.color) }))
}
export function fromLegacyChannels(value: ParticleColor, space: ColorSpace = 'sRGB'): ColorRampChannelsValue {
  return {
    color: fromLegacyRamp(
      value.color.map((stop) => ({ ...stop, value: { ...stop.value, a: 1 } })),
      space
    ),
    alpha: value.alpha.map((stop, index) => ({
      id: stop.id ?? `alpha-${index}`,
      position: stop.position,
      alpha: stop.value.a,
    })),
  }
}
export function toLegacyChannels(value: ColorRampChannelsValue): ParticleColor {
  return {
    color: toLegacyRamp(value.color),
    alpha: value.alpha.map((stop) => ({
      id: stop.id,
      position: stop.position,
      value: { r: 255, g: 255, b: 255, a: stop.alpha },
    })),
  }
}
export function toNormalizeHexStr(color: Color) {
  return formatColorHex(fromLegacyColor(color)).slice(1).toLowerCase()
}
export function isEqual(a: Color, b: Color) {
  return !!a && !!b && a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a
}
export function srgbColorToLinear(color: Color, inputIsNormalized = true, outputDenormalize = false): Color {
  const next = convertColorSpace({ ...(inputIsNormalized ? color : normalizeColor(color)), space: 'srgb' }, 'linear')
  const plain = { r: next.r, g: next.g, b: next.b, a: next.a }
  return outputDenormalize ? denormalizeColor(plain) : plain
}
export function linearColorToSRGB(color: Color, inputIsNormalized = true, outputDenormalize = false): Color {
  const next = convertColorSpace({ ...(inputIsNormalized ? color : normalizeColor(color)), space: 'linear' }, 'srgb')
  const plain = { r: next.r, g: next.g, b: next.b, a: next.a }
  return outputDenormalize ? denormalizeColor(plain) : plain
}
export function blendParticleStops(
  colorStops: GradientColor,
  alphaStops: GradientColor
): { colors: Color[]; positions: number[] } {
  const value = fromLegacyChannels({ color: colorStops, alpha: alphaStops })
  const positions = [...new Set([...colorStops, ...alphaStops].map((stop) => stop.position))].sort((a, b) => a - b)
  return {
    positions,
    colors: positions.map((position) => ({
      ...toLegacyColor(sampleColorRamp(value.color, position) ?? { space: 'srgb', r: 1, g: 1, b: 1, a: 1 }),
      a: sampleAlphaStops(value.alpha, position),
    })),
  }
}
export function generateLinearGradient(colors: Color[], positions: number[]) {
  return `linear-gradient(to right, ${colors.map((color, index) => `${getColorCss(fromLegacyColor(color))} ${positions[index] * 100}%`).join(', ')})`
}
export function generateHDR(color: HDRColor) {
  return getColorCss(fromLegacyHDR(color))
}
export function generatePreviewColor(
  mode: ColorPickerMode,
  value: Color | GradientColor | ParticleColor | HDRColor,
  componentColorSpace: ColorSpace = 'sRGB',
  _displayColorSpace?: ColorSpace
): string {
  if (mode === 'constant') return getColorCss(fromLegacyColor(value as Color, componentColorSpace))
  if (mode === 'hdr') return getColorCss(fromLegacyHDR(value as HDRColor, componentColorSpace))
  return mode === 'gradient'
    ? getColorRampCss(fromLegacyRamp(value as GradientColor, componentColorSpace))
    : getColorRampChannelsCss(fromLegacyChannels(value as ParticleColor, componentColorSpace))
}
