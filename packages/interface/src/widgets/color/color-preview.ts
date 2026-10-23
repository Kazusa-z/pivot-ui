import { getDisplayColor, type ColorValue } from '../../values/color'

/** CSS is a clipped sRGB preview, never a second authoritative color value. */
export function getColorCss(value: ColorValue): string {
  const color = getDisplayColor(value)
  return `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${color.a})`
}
