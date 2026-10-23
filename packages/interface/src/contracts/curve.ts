import type { CurveValue } from '../values/curve'

export interface CurvePresetSummary {
  readonly id: string
  readonly label: string
}
export interface CurvePreset extends CurvePresetSummary {
  readonly value: CurveValue
}
export interface CurvePresetSaveInput {
  readonly label: string
  readonly value: CurveValue
}
/**
 * 为曲线编辑器提供个人预设的列表、加载、保存和删除功能。
 * 应用实现存储方式、预设 ID 和同名处理规则；save 返回保存后的预设名称与 ID。
 * 关闭编辑器会结束当前展示；已发送的保存操作如需撤销，由应用提供相应操作。
 */
export interface CurvePresetService {
  list(): Promise<readonly CurvePresetSummary[]>
  load(id: string): Promise<CurveValue>
  save?(input: CurvePresetSaveInput): Promise<CurvePresetSummary>
  remove?(id: string): Promise<void>
}
