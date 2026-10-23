import type { EditCancelReason } from '../../contracts/property'

export type NumericEditSource = 'text' | 'drag' | 'step' | 'slider'
export type NumericCommitReason = 'enter' | 'blur' | 'pointer-up' | 'step'
export type NumericCancelReason = EditCancelReason

export interface NumericEditCallbacks<T> {
  onEditStart?: (source: NumericEditSource) => boolean | void
  onValueCommit?: (value: T, reason: NumericCommitReason) => void | Promise<void>
  /** 编辑取消时接收原因，应用可据此恢复显示值。已提交的保存继续由应用处理，需要撤销时调用应用的撤销操作。 */
  onEditCancel?: (reason: NumericCancelReason) => void
}
