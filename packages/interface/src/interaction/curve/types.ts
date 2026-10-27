import type { NumericCancelReason, NumericCommitReason, NumericEditSource } from '../numeric/types'
import type { CurveValue } from '../../values/curve'

export type CurveEditSource = NumericEditSource | 'point' | 'handle' | 'preset' | 'mode'
export type CurveCommitReason = NumericCommitReason | 'point' | 'handle' | 'preset' | 'mode'
export type CurveCancelReason = NumericCancelReason
export interface CurveEditCallbacks<T = CurveValue> {
  /** 开始编辑时调用（拖动点或手柄、键盘、增删点、应用预设）；返回 `false` 拒绝这次编辑。 */
  onEditStart?: (source: CurveEditSource) => boolean | void
  /** 提交最终值；返回 Promise 时失败会恢复并显示错误。 */
  onValueCommit?: (value: T, reason: CurveCommitReason) => void | Promise<void>
  /** 编辑被取消，应用恢复编辑前的值。 */
  onEditCancel?: (reason: CurveCancelReason) => void
}
