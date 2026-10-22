export type PropertyValue = string | number | boolean
export type ChoiceValue = string | number

export interface ChoiceOption<T extends ChoiceValue = ChoiceValue> {
  readonly key: string
  readonly label: string
  readonly value: T
  readonly disabled?: boolean
  readonly disabledReason?: string
}

/** Hard limits constrain committed values; soft limits only describe the editing UI. */
export interface NumericConstraints {
  readonly min?: number
  readonly max?: number
  readonly softMin?: number
  readonly softMax?: number
  readonly step?: number
  readonly dragStep?: number
  readonly precision?: number
}
export { formatShortcut } from './shortcut'
export type { ShortcutInput, ShortcutLetterCase, ShortcutGesture, ShortcutToken } from './shortcut'
