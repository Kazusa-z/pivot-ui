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
 * Optional application-owned storage. IDs and duplicate-name policy belong to the host.
 * save creates a preset (or replaces one according to host policy); the returned ID is authoritative.
 * A widget ignores late results after invalidation, but cannot undo a storage operation already sent.
 */
export interface CurvePresetService {
  list(): Promise<readonly CurvePresetSummary[]>
  load(id: string): Promise<CurveValue>
  save?(input: CurvePresetSaveInput): Promise<CurvePresetSummary>
  remove?(id: string): Promise<void>
}
