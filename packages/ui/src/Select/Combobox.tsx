import { Combobox as ChoiceCombobox, type ComboboxProps as ChoiceComboboxProps } from '@pivot-ui/react'
import { forwardRef, type ReactNode } from 'react'
import { collectLegacyOptions, LegacySelectItem, type LegacySelectItemProps } from './legacy-options'

type MultipleProps = Extract<ChoiceComboboxProps<string>, { multiple: true }>
export interface ComboboxProps extends Omit<
  MultipleProps,
  'options' | 'multiple' | 'value' | 'defaultValue' | 'onValueChange' | 'renderValue' | 'renderOption'
> {
  multiple?: boolean
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  children?: ReactNode
  valueRenderer?: (value: string) => ReactNode
  noneText?: string
}
export type ComboboxItemProps = LegacySelectItemProps
export const ComboboxItem = LegacySelectItem
export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(function Combobox(
  {
    children,
    multiple: _multiple,
    onValueChange,
    valueRenderer,
    noneText,
    maxDisplayCount,
    autoClose = true,
    ...props
  },
  ref
) {
  const { options, rendered } = collectLegacyOptions(children)
  return (
    <ChoiceCombobox
      {...props}
      ref={ref}
      multiple
      options={options as MultipleProps['options']}
      autoClose={autoClose}
      maxDisplayCount={maxDisplayCount && maxDisplayCount > 0 ? maxDisplayCount : undefined}
      emptyText={noneText}
      onValueChange={(value) => onValueChange?.([...value])}
      renderOption={(option) => valueRenderer?.(option.value) ?? rendered.get(option.key)}
      renderValue={(option) => valueRenderer?.(option.value) ?? rendered.get(option.key)}
    />
  )
})
