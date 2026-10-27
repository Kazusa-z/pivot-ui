/** Hard limits constrain values. Soft limits only constrain pointer/step editing. */
export interface NumericConstraints {
  /** 硬下限：输入和拖动都不能低于它。 */
  readonly min?: number
  /** 硬上限。 */
  readonly max?: number
  /** 常用范围下限：拖动和滑块停在这里，但仍可输入到 `min`。 */
  readonly softMin?: number
  /** 常用范围上限：拖动和滑块停在这里，但仍可输入到 `max`。 */
  readonly softMax?: number
  /** 方向键和步进按钮的步长。 */
  readonly step?: number
  /** 拖动时每像素的变化量。 */
  readonly dragStep?: number
  /** 存储值保留的小数位数。 */
  readonly precision?: number
}

export interface ResolvedNumericConstraints {
  readonly min: number
  readonly max: number
  readonly softMin: number
  readonly softMax: number
  readonly step: number
  readonly dragStep: number
  readonly precision: number
}

export function normalizeNumericConstraints(constraints: NumericConstraints = {}): ResolvedNumericConstraints {
  const finite = (value: number | undefined, fallback: number) =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback
  const min = finite(constraints.min, -Infinity)
  const max = Math.max(min, finite(constraints.max, Infinity))
  const softMin = Math.min(max, Math.max(min, finite(constraints.softMin, min)))
  const softMax = Math.min(max, Math.max(softMin, finite(constraints.softMax, max)))
  const positive = (value: number | undefined, fallback: number) =>
    typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
  const step = positive(constraints.step, 1)
  const dragStep = positive(constraints.dragStep, 0.1)
  const decimalPlaces = (value: number) => {
    const [mantissa, exponent = '0'] = String(value).split('e')
    return Math.max(0, (mantissa.split('.')[1]?.length ?? 0) - Number(exponent))
  }
  const automaticPrecision = Math.max(12, decimalPlaces(step), decimalPlaces(dragStep))
  return {
    min,
    max,
    softMin,
    softMax,
    step,
    dragStep,
    precision: Math.max(0, Math.min(15, Math.trunc(finite(constraints.precision, automaticPrecision)))),
  }
}

export function roundNumeric(value: number, precision = 12): number {
  if (!Number.isFinite(value)) return 0
  const digits = Math.max(0, Math.min(15, Math.trunc(Number.isFinite(precision) ? precision : 12)))
  const shift = (number: number, exponent: number) => {
    const [mantissa, power = '0'] = String(number).split('e')
    return Number(`${mantissa}e${Number(power) + exponent}`)
  }
  const shifted = shift(Math.abs(value), digits)
  const rounded = Number.isFinite(shifted) ? Math.sign(value) * shift(Math.round(shifted), -digits) : value
  return Object.is(rounded, -0) ? 0 : rounded
}

export function normalizeNumericValue(
  value: number,
  constraints: NumericConstraints = {},
  range: 'hard' | 'soft' = 'hard',
  origin?: number
): number {
  const rules = normalizeNumericConstraints(constraints)
  const start =
    typeof origin === 'number' && Number.isFinite(origin) ? Math.min(rules.max, Math.max(rules.min, origin)) : undefined
  const min = range === 'soft' ? Math.min(rules.softMin, start ?? rules.softMin) : rules.min
  const max = range === 'soft' ? Math.max(rules.softMax, start ?? rules.softMax) : rules.max
  const finite = Number.isFinite(value) ? value : 0
  return Math.min(max, Math.max(min, roundNumeric(Math.min(max, Math.max(min, finite)), rules.precision)))
}

export type NumericDraft =
  { readonly status: 'valid'; readonly value: number } | { readonly status: 'incomplete' | 'invalid' }

export function parseNumericDraft(text: string): NumericDraft {
  const value = text.trim()
  if (/^[+-]?(?:\.?|\d+\.?\d*[eE][+-]?)$/.test(value) || value === '') return { status: 'incomplete' }
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) return { status: 'invalid' }
  const number = Number(value)
  return Number.isFinite(number) ? { status: 'valid', value: number } : { status: 'invalid' }
}

export function stepNumericValue(
  value: number,
  direction: 1 | -1,
  constraints: NumericConstraints = {},
  multiplier = 1
): number {
  const rules = normalizeNumericConstraints(constraints)
  const scale = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1
  const sum = normalizeNumericValue(value, constraints) + direction * rules.step * scale
  const finite = Number.isFinite(sum) ? sum : Math.sign(sum) * Number.MAX_VALUE
  return normalizeNumericValue(finite, constraints, 'soft', value)
}

/** Quantizes a slider value on the min-anchored step grid, then applies shared precision and hard limits. */
export function snapNumericValue(value: number, constraints: NumericConstraints = {}): number {
  const rules = normalizeNumericConstraints(constraints)
  const bounded = normalizeNumericValue(value, constraints)
  const anchor = Number.isFinite(rules.min) ? rules.min : 0
  const scaled = (bounded - anchor) / rules.step
  if (!Number.isFinite(scaled)) return bounded
  const snapped = anchor + Math.round(scaled) * rules.step
  return normalizeNumericValue(Number.isFinite(snapped) ? snapped : bounded, constraints)
}
