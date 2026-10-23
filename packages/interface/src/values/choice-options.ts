import type { ChoiceOption, ChoiceValue } from './index'

export interface ChoiceCollection<T extends ChoiceValue = ChoiceValue> {
  readonly options: readonly ChoiceOption<T>[]
  optionForKey(key: string): ChoiceOption<T> | undefined
  keyForValue(value: T): string | undefined
}

/** Stable UI identities map once to original values; numeric and string values stay distinct. */
export function createChoiceCollection<T extends ChoiceValue>(
  options: readonly ChoiceOption<T>[]
): ChoiceCollection<T> {
  const byKey = new Map<string, ChoiceOption<T>>()
  const byValue = new Map<T, string>()
  const copied = options.map((option) => {
    if (typeof option.key !== 'string' || !option.key || byKey.has(option.key))
      throw new Error('Choice option keys must be nonempty strings and unique.')
    if (typeof option.value !== 'string' && typeof option.value !== 'number')
      throw new Error('Choice values must be strings or numbers.')
    if (typeof option.value === 'number' && !Number.isFinite(option.value))
      throw new Error('Choice numeric values must be finite.')
    if (byValue.has(option.value))
      throw new Error('Choice option values must be unique, including their original type.')
    const copy = Object.freeze({ ...option })
    byKey.set(copy.key, copy)
    byValue.set(copy.value, copy.key)
    return copy
  })
  return Object.freeze({
    options: Object.freeze(copied),
    optionForKey: (key: string) => byKey.get(key),
    keyForValue: (value: T) => byValue.get(value),
  })
}
