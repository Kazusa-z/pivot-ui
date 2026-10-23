import type { NumericCancelReason, NumericCommitReason, NumericEditSource } from '../numeric/types'
import type { ColorValue } from '../../values/color'

export type ColorEditSource = NumericEditSource | 'hex' | 'capability'
export type ColorCommitReason = NumericCommitReason | 'capability'
export type ColorCancelReason = NumericCancelReason
export interface ColorEditCallbacks<T = ColorValue> {
  onEditStart?: (source: ColorEditSource) => boolean | void
  onValueCommit?: (value: T, reason: ColorCommitReason) => void | Promise<void>
  onEditCancel?: (reason: ColorCancelReason) => void
}
