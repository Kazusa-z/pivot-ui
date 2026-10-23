import { areColorsEqual, assertColorValue, mixColors, type ColorOptions, type ColorValue } from './color'

export interface ColorRampStop {
  readonly id: string
  readonly position: number
  readonly color: ColorValue
}
export interface AlphaStop {
  readonly id: string
  readonly position: number
  readonly alpha: number
}
export type ColorRampInterpolation = 'linear' | 'constant'
export interface ColorRampValue {
  readonly stops: readonly ColorRampStop[]
  readonly interpolation: ColorRampInterpolation
}
export interface ColorRampChannelsValue {
  readonly color: ColorRampValue
  readonly alpha: readonly AlphaStop[]
}

function assertPosition(position: unknown): asserts position is number {
  if (typeof position !== 'number' || !Number.isFinite(position) || position < 0 || position > 1)
    throw new RangeError('Ramp positions must be finite and between 0 and 1.')
}
function assertStops(stops: unknown): asserts stops is readonly { readonly id: string; readonly position: number }[] {
  if (!Array.isArray(stops)) throw new TypeError('Ramp stops must be an array.')
  const ids = new Set<string>()
  for (const stop of stops) {
    if (!stop || typeof stop !== 'object' || typeof stop.id !== 'string' || !stop.id.trim() || ids.has(stop.id))
      throw new TypeError('Ramp stop IDs must be nonempty and unique within their track.')
    ids.add(stop.id)
    assertPosition(stop.position)
  }
}
export function assertColorRampValue(value: unknown, options: ColorOptions = {}): asserts value is ColorRampValue {
  if (!value || typeof value !== 'object') throw new TypeError('A color ramp must be an object.')
  const ramp = value as Partial<ColorRampValue>
  if (ramp.interpolation !== 'linear' && ramp.interpolation !== 'constant')
    throw new TypeError('Ramp interpolation must be linear or constant.')
  assertStops(ramp.stops)
  let space: ColorValue['space'] | undefined
  for (const stop of ramp.stops) {
    assertColorValue(stop.color, options)
    if (space !== undefined && space !== stop.color.space)
      throw new TypeError('All colors in a ramp must share the same explicit color space.')
    space = stop.color.space
  }
}
export function assertAlphaStops(stops: unknown): asserts stops is readonly AlphaStop[] {
  assertStops(stops)
  for (const stop of stops) assertPosition((stop as AlphaStop).alpha)
}
export function assertColorRampChannelsValue(
  value: unknown,
  options: ColorOptions = {}
): asserts value is ColorRampChannelsValue {
  if (!value || typeof value !== 'object') throw new TypeError('A channels ramp must be an object.')
  const ramp = value as Partial<ColorRampChannelsValue>
  assertColorRampValue(ramp.color, options)
  assertAlphaStops(ramp.alpha)
}
export function cloneColorRampValue(value: ColorRampValue): ColorRampValue {
  assertColorRampValue(value, { hdr: true })
  return Object.freeze({
    interpolation: value.interpolation,
    stops: Object.freeze(
      value.stops.map((stop) => Object.freeze({ ...stop, color: Object.freeze({ ...stop.color }) }))
    ),
  })
}
export function cloneColorRampChannelsValue(value: ColorRampChannelsValue): ColorRampChannelsValue {
  assertColorRampChannelsValue(value, { hdr: true })
  return Object.freeze({
    color: cloneColorRampValue(value.color),
    alpha: Object.freeze(value.alpha.map((stop) => Object.freeze({ ...stop }))),
  })
}
/** Stable sorting preserves source order at coincident positions. IDs never depend on position. */
export function sortRampStops<T extends { readonly position: number }>(stops: readonly T[]): T[] {
  return [...stops].sort((a, b) => a.position - b.position)
}
function sampleStops<T extends { readonly position: number }>(
  stops: readonly T[],
  position: number
): readonly [T, T, number] | null {
  if (!Number.isFinite(position)) throw new RangeError('Sample position must be finite.')
  const sorted = sortRampStops(stops)
  if (!sorted.length) return null
  const point = Math.max(0, Math.min(1, position))
  // The last coincident stop owns the exact boundary, including the first position.
  let left = sorted[0]
  if (point < left.position) return [left, left, 0]
  for (let index = 1; index < sorted.length; index++) {
    const right = sorted[index]
    if (point < right.position) return [left, right, (point - left.position) / (right.position - left.position)]
    left = right
  }
  return [left, left, 0]
}
export function sampleColorRamp(value: ColorRampValue, position: number): ColorValue | null {
  assertColorRampValue(value, { hdr: true })
  const pair = sampleStops(value.stops, position)
  if (!pair) return null
  const [left, right, amount] = pair
  return value.interpolation === 'constant'
    ? Object.freeze({ ...left.color })
    : mixColors(left.color, right.color, amount, left.color.space)
}
export function sampleAlphaStops(
  stops: readonly AlphaStop[],
  position: number,
  interpolation: ColorRampInterpolation = 'linear'
): number {
  assertAlphaStops(stops)
  if (interpolation !== 'linear' && interpolation !== 'constant')
    throw new TypeError('Ramp interpolation must be linear or constant.')
  const pair = sampleStops(stops, position)
  if (!pair) return 1
  const [left, right, amount] = pair
  return interpolation === 'constant' ? left.alpha : left.alpha * (1 - amount) + right.alpha * amount
}
export function sampleColorRampChannels(value: ColorRampChannelsValue, position: number): ColorValue | null {
  assertColorRampChannelsValue(value, { hdr: true })
  const color = sampleColorRamp(value.color, position)
  return (
    color &&
    Object.freeze({ ...color, a: color.a * sampleAlphaStops(value.alpha, position, value.color.interpolation) })
  )
}
export function areColorRampsEqual(a: ColorRampValue, b: ColorRampValue): boolean {
  return (
    a.interpolation === b.interpolation &&
    a.stops.length === b.stops.length &&
    a.stops.every((stop, index) => {
      const other = b.stops[index]
      return stop.id === other.id && stop.position === other.position && areColorsEqual(stop.color, other.color)
    })
  )
}
export function areColorRampChannelsEqual(a: ColorRampChannelsValue, b: ColorRampChannelsValue): boolean {
  return (
    areColorRampsEqual(a.color, b.color) &&
    a.alpha.length === b.alpha.length &&
    a.alpha.every((stop, index) => {
      const other = b.alpha[index]
      return stop.id === other.id && stop.position === other.position && stop.alpha === other.alpha
    })
  )
}
