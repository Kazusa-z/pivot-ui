import { getColorCss } from './color-preview'
import {
  sampleColorRamp,
  sampleColorAlphaRamp,
  type ColorAlphaRampValue,
  type ColorRampValue,
} from '../../values/color-ramp'
import type { ColorValue } from '../../values/color'

function preview(positions: readonly number[], sample: (position: number) => ColorValue | null): string {
  const points = [...new Set([0, 1, ...positions, ...Array.from({ length: 63 }, (_, index) => (index + 1) / 64)])].sort(
    (a, b) => a - b
  )
  const stops = points.flatMap((position) => {
    const color = sample(position)
    if (!color) return []
    const current = `${getColorCss(color)} ${position * 100}%`
    if (!positions.includes(position) || position === 0) return [current]
    // Coincident and constant stops retain an exact hard edge; sampling also
    // previews linear-space and HDR interpolation before display-only clipping.
    const before = sample(Math.max(0, position - Number.EPSILON))
    return before ? [`${getColorCss(before)} ${position * 100}%`, current] : [current]
  })
  return stops.length ? `linear-gradient(90deg, ${stops.join(', ')})` : 'none'
}
export function getColorRampCss(value: ColorRampValue): string {
  return preview(
    value.stops.map((stop) => stop.position),
    (position) => sampleColorRamp(value, position)
  )
}
export function getColorAlphaRampCss(value: ColorAlphaRampValue): string {
  return preview(
    [...value.color.stops.map((stop) => stop.position), ...value.alpha.map((stop) => stop.position)],
    (position) => sampleColorAlphaRamp(value, position)
  )
}
