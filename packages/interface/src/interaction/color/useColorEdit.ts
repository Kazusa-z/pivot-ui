import { useValueEdit, type ValueEditOptions } from '../value/useValueEdit'
import type { ColorCommitReason, ColorEditSource } from './types'

export type ColorEditOptions<T, Source = ColorEditSource, Reason = ColorCommitReason> = ValueEditOptions<
  T,
  Source,
  Reason
>

/** Color-specific defaults over the shared composed-value editing lifecycle. */
export function useColorEdit<T, Source = ColorEditSource, Reason = ColorCommitReason>(
  options: ColorEditOptions<T, Source, Reason>
) {
  return useValueEdit(options)
}
