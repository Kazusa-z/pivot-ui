import type { EditCancelReason } from '../../contracts/property'

export type NumericEditSource = 'text' | 'drag' | 'step' | 'slider'
export type NumericCommitReason = 'enter' | 'blur' | 'pointer-up' | 'step'
export type NumericCancelReason = EditCancelReason

export interface NumericEditCallbacks<T> {
  onEditStart?: (source: NumericEditSource) => boolean | void
  onValueCommit?: (value: T, reason: NumericCommitReason) => void | Promise<void>
  /** Pending invalidation cannot send a second terminal callback or retract a submitted operation. */
  onEditCancel?: (reason: NumericCancelReason) => void
}
