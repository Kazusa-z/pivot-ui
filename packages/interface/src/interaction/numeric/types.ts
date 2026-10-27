import type { EditCancelReason } from '../../contracts/property'

export type NumericEditSource = 'text' | 'drag' | 'step' | 'slider'
export type NumericCommitReason = 'enter' | 'blur' | 'pointer-up' | 'step'
export type NumericCancelReason = EditCancelReason

export interface NumericEditCallbacks<T> {
  /** 开始一次编辑（输入、拖动、步进或滑块）；返回 `false` 拒绝。 */
  onEditStart?: (source: NumericEditSource) => boolean | void
  /** 编辑完成（Enter、失焦、松开指针、步进）时提交最终值；返回 Promise 时失败会保留草稿并显示错误。 */
  onValueCommit?: (value: T, reason: NumericCommitReason) => void | Promise<void>
  /** 编辑取消时接收原因，应用可据此恢复显示值。已提交的保存继续由应用处理，需要撤销时调用应用的撤销操作。 */
  onEditCancel?: (reason: NumericCancelReason) => void
}
