import type { NumericCancelReason, NumericCommitReason, NumericEditSource } from '../numeric/types'
import type { ColorValue } from '../../values/color'

export type ColorEditSource = NumericEditSource | 'hex' | 'capability'
export type ColorCommitReason = NumericCommitReason | 'capability'
export type ColorCancelReason = NumericCancelReason
export interface ColorEditCallbacks<T = ColorValue> {
  /** 开始编辑时调用（拖动、输入、粘贴、取色）；返回 `false` 拒绝这次编辑。 */
  onEditStart?: (source: ColorEditSource) => boolean | void
  /** 提交最终值；返回 Promise 时失败会恢复并显示错误。 */
  onValueCommit?: (value: T, reason: ColorCommitReason) => void | Promise<void>
  /** 编辑被取消，应用恢复编辑前的值。 */
  onEditCancel?: (reason: ColorCancelReason) => void
}
