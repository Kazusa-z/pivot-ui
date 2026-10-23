import { forwardRef } from 'react'
import { Select as SingleSelect, type SelectProps as SingleSelectProps } from './SingleSelect'
import { Combobox, type ComboboxProps } from './Combobox'
import { LegacySelectItem, type LegacySelectItemProps } from './legacy-options'

export type SelectProps = SingleSelectProps | ComboboxProps
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(props, ref) {
  return (props as ComboboxProps).multiple ? (
    <Combobox {...(props as ComboboxProps)} ref={ref} />
  ) : (
    <SingleSelect {...(props as SingleSelectProps)} ref={ref} />
  )
})
export type SelectItemProps = LegacySelectItemProps
export const SelectItem = LegacySelectItem
