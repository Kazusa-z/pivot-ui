import { areCurvesEqual, assertCurveValue, copyCurveValue, sampleCurve, type CurveValue } from './curve'

export type NumericDistributionValue =
  | { readonly mode: 'constant'; readonly value: number }
  | { readonly mode: 'curve'; readonly curve: CurveValue }
  | { readonly mode: 'two-constant'; readonly values: readonly [number, number] }
  | { readonly mode: 'two-curve'; readonly curves: readonly [CurveValue, CurveValue] }

export type NumericDistributionMode = NumericDistributionValue['mode']
/** Saved, accepted values of inactive modes. This is not a second active property value. */
export type NumericDistributionCache = {
  readonly [Mode in NumericDistributionMode]?: Extract<NumericDistributionValue, { mode: Mode }>
}
export const numericDistributionModes: readonly NumericDistributionMode[] = Object.freeze([
  'constant',
  'curve',
  'two-constant',
  'two-curve',
])

export function assertNumericDistributionValue(value: unknown): asserts value is NumericDistributionValue {
  if (!value || typeof value !== 'object') throw new TypeError('A numeric distribution must be an object.')
  const number = (candidate: unknown) => {
    if (typeof candidate !== 'number' || !Number.isFinite(candidate))
      throw new TypeError('Numeric distribution constants must be finite numbers.')
  }
  const candidate = value as NumericDistributionValue
  switch (candidate.mode) {
    case 'constant':
      number(candidate.value)
      return
    case 'curve':
      assertCurveValue(candidate.curve)
      return
    case 'two-constant':
      if (!Array.isArray(candidate.values) || candidate.values.length !== 2)
        throw new TypeError('Two-constant distributions require exactly two values.')
      candidate.values.forEach(number)
      return
    case 'two-curve':
      if (!Array.isArray(candidate.curves) || candidate.curves.length !== 2)
        throw new TypeError('Two-curve distributions require exactly two curves.')
      candidate.curves.forEach(assertCurveValue)
      return
    default:
      throw new TypeError('Unknown numeric distribution mode.')
  }
}

/** Deep snapshot without unit scaling, quantization or host DTO conversion. */
export function copyNumericDistributionValue(value: NumericDistributionValue): NumericDistributionValue {
  assertNumericDistributionValue(value)
  switch (value.mode) {
    case 'constant':
      return Object.freeze({ mode: value.mode, value: value.value })
    case 'curve':
      return Object.freeze({ mode: value.mode, curve: copyCurveValue(value.curve) })
    case 'two-constant':
      return Object.freeze({ mode: value.mode, values: Object.freeze([...value.values]) as readonly [number, number] })
    case 'two-curve':
      return Object.freeze({
        mode: value.mode,
        curves: Object.freeze(value.curves.map(copyCurveValue)) as readonly [CurveValue, CurveValue],
      })
  }
}

export function areNumericDistributionsEqual(a: NumericDistributionValue, b: NumericDistributionValue): boolean {
  if (a.mode === 'constant' && b.mode === 'constant') return a.value === b.value
  if (a.mode === 'curve' && b.mode === 'curve') return areCurvesEqual(a.curve, b.curve)
  if (a.mode === 'two-constant' && b.mode === 'two-constant')
    return a.values.every((value, index) => value === b.values[index])
  if (a.mode === 'two-curve' && b.mode === 'two-curve')
    return a.curves.every((curve, index) => areCurvesEqual(curve, b.curves[index]))
  return false
}

export function copyNumericDistributionCache(cache: NumericDistributionCache = {}): NumericDistributionCache {
  const result: Record<string, NumericDistributionValue> = {}
  for (const mode of numericDistributionModes) {
    const value = cache[mode]
    if (value !== undefined) {
      if (value.mode !== mode) throw new TypeError('A numeric distribution cache key must match its value mode.')
      result[mode] = copyNumericDistributionValue(value)
    }
  }
  return Object.freeze(result)
}

export function rememberNumericDistribution(
  cache: NumericDistributionCache,
  value: NumericDistributionValue
): NumericDistributionCache {
  return Object.freeze({ ...copyNumericDistributionCache(cache), [value.mode]: copyNumericDistributionValue(value) })
}

const line = (first: number, second = first): CurveValue => ({
  interpolation: 'linear',
  points: [
    { id: 'start', x: 0, y: first },
    { id: 'end', x: 1, y: second },
  ],
})

/** First visits sample x=0/1 (empty curves use 0); revisits restore the explicitly owned cache. */
export function switchNumericDistributionMode(
  value: NumericDistributionValue,
  mode: NumericDistributionMode,
  cache: NumericDistributionCache = {}
): NumericDistributionValue {
  assertNumericDistributionValue(value)
  if (!numericDistributionModes.includes(mode)) throw new TypeError('Unknown numeric distribution mode.')
  if (mode === value.mode) return copyNumericDistributionValue(value)
  const remembered = copyNumericDistributionCache(cache)[mode]
  if (remembered) return remembered
  const numbers: readonly [number, number] =
    value.mode === 'constant'
      ? [value.value, value.value]
      : value.mode === 'two-constant'
        ? value.values
        : value.mode === 'curve'
          ? [sampleCurve(value.curve, 0) ?? 0, sampleCurve(value.curve, 1) ?? 0]
          : [sampleCurve(value.curves[0], 0) ?? 0, sampleCurve(value.curves[1], 0) ?? 0]
  switch (mode) {
    case 'constant':
      return copyNumericDistributionValue({ mode, value: numbers[0] })
    case 'two-constant':
      return copyNumericDistributionValue({ mode, values: numbers })
    case 'curve':
      return copyNumericDistributionValue({
        mode,
        curve: value.mode === 'two-curve' ? value.curves[0] : line(numbers[0], numbers[1]),
      })
    case 'two-curve':
      return copyNumericDistributionValue({
        mode,
        curves: value.mode === 'curve' ? [value.curve, value.curve] : [line(numbers[0]), line(numbers[1])],
      })
  }
}
