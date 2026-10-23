import type { NumericConstraints } from './numeric'
import { assertNumericTuple } from './geometry'
import { normalizeNumericConstraints } from './numeric'

export interface ProportionalRange {
  readonly min: number
  readonly max: number
}
export interface ProportionalChange {
  readonly value: readonly number[]
  readonly status: 'changed' | 'unchanged' | 'blocked'
  readonly ratio: number | null
}
function bounds(constraints: Pick<NumericConstraints, 'min' | 'max'> = {}): ProportionalRange {
  const normalized = normalizeNumericConstraints(constraints)
  const min = Math.max(-Number.MAX_VALUE, normalized.min)
  const max = Math.min(Number.MAX_VALUE, normalized.max)
  return { min, max }
}
function ratioRange(
  start: readonly number[],
  constraints: readonly Pick<NumericConstraints, 'min' | 'max'>[]
): ProportionalRange | null {
  let min = -Number.MAX_VALUE
  let max = Number.MAX_VALUE
  for (let axis = 0; axis < start.length; axis++) {
    const limit = bounds(constraints[axis])
    const base = start[axis]
    if (base === 0) {
      if (limit.min > 0 || limit.max < 0) return null
      continue
    }
    const first = limit.min / base,
      second = limit.max / base
    min = Math.max(min, Math.min(first, second))
    max = Math.min(max, Math.max(first, second))
  }
  return min <= max ? { min, max } : null
}
/** Effective limits of the edited axis that keep every linked axis within its hard bounds. */
export function getProportionalAxisRange(
  start: readonly number[],
  axis: number,
  constraints: readonly Pick<NumericConstraints, 'min' | 'max'>[] = []
): ProportionalRange | null {
  assertNumericTuple(start)
  if (!Number.isInteger(axis) || axis < 0 || axis >= start.length) throw new RangeError('Unknown numeric axis.')
  if (start[axis] === 0) return bounds(constraints[axis])
  const ratio = ratioRange(start, constraints)
  if (!ratio) return null
  const first = ratio.min * start[axis],
    second = ratio.max * start[axis]
  const own = bounds(constraints[axis])
  return { min: Math.max(own.min, Math.min(first, second)), max: Math.min(own.max, Math.max(first, second)) }
}
/**
 * 根据编辑开始时的数值组按比例调整各项，返回调整后的值及状态。
 * 比例受各项上下界共同限制，当前编辑项按输入精度处理。
 * 当前编辑项为零时单独调整该项；范围冲突时返回起始值和 blocked 状态，
 * 应用可提示用户调整范围或关闭比例联动。
 */
export function applyProportionalChange(
  start: readonly number[],
  axis: number,
  requested: number,
  constraints: readonly Pick<NumericConstraints, 'min' | 'max'>[] = []
): ProportionalChange {
  const range = getProportionalAxisRange(start, axis, constraints)
  if (!Number.isFinite(requested)) throw new RangeError('A proportional edit requires a finite number.')
  if (!range) return { value: [...start], status: 'blocked', ratio: null }
  const target = Math.min(range.max, Math.max(range.min, requested))
  const ratio = start[axis] === 0 ? null : target / start[axis]
  const value =
    ratio === null
      ? start.map((component, index) => (index === axis ? target : component))
      : start.map((component) => component * ratio)
  if (value.some((component) => !Number.isFinite(component)))
    return { value: [...start], status: 'blocked', ratio: null }
  return {
    value,
    status: value.every((component, index) => Object.is(component, start[index])) ? 'unchanged' : 'changed',
    ratio,
  }
}
