import type { NumericCancelReason, NumericCommitReason, NumericEditSource } from '../numeric/types'
import type { CurveValue } from '../../values/curve'

export type CurveEditSource = NumericEditSource | 'point' | 'handle' | 'preset' | 'mode'
export type CurveCommitReason = NumericCommitReason | 'point' | 'handle' | 'preset' | 'mode'
export type CurveCancelReason = NumericCancelReason
export interface CurveEditCallbacks<T = CurveValue> {
  onEditStart?: (source: CurveEditSource) => boolean | void
  onValueCommit?: (value: T, reason: CurveCommitReason) => void | Promise<void>
  onEditCancel?: (reason: CurveCancelReason) => void
}
