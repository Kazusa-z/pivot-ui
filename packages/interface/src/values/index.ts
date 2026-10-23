export type PropertyValue = string | number | boolean
export type ChoiceValue = string | number

export interface ChoiceOption<T extends ChoiceValue = ChoiceValue> {
  readonly key: string
  readonly label: string
  readonly value: T
  readonly disabled?: boolean
  readonly disabledReason?: string
}

export type { NumericConstraints } from './numeric'
export {
  normalizeNumericConstraints,
  normalizeNumericValue,
  parseNumericDraft,
  roundNumeric,
  stepNumericValue,
  snapNumericValue,
} from './numeric'
export type { ResolvedNumericConstraints, NumericDraft } from './numeric'
export {
  getDistributionTotal,
  validateDistribution,
  distributionToBoundaries,
  boundariesToDistribution,
  moveDistributionBoundary,
} from './distribution'
export type { DistributionConstraints } from './distribution'
export type { Vector2, Vector3, Vector4, Rect } from './geometry'
export {
  assertNumericTuple,
  vector2ToTuple,
  vector3ToTuple,
  vector4ToTuple,
  rectToTuple,
  tupleToVector2,
  tupleToVector3,
  tupleToVector4,
  tupleToRect,
} from './geometry'
export { getProportionalAxisRange, applyProportionalChange } from './proportion'
export type { ProportionalRange, ProportionalChange } from './proportion'
export { formatShortcut } from './shortcut'
export type { ShortcutInput, ShortcutLetterCase, ShortcutGesture, ShortcutToken } from './shortcut'
