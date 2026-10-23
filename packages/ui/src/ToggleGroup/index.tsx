import { forwardRef } from 'react'
import {
  ToggleGroupRoot,
  ToggleGroupItem as ChoiceItem,
  type ToggleGroupRootProps,
  type ToggleGroupRootSingleProps,
  type ToggleGroupRootMultipleProps,
  type ToggleGroupItemProps as ChoiceItemProps,
} from '@pivot-ui/react'

type LegacyVariant = 'primary' | 'subtle'
export type ToggleGroupSingleProps = Omit<ToggleGroupRootSingleProps, 'variant'> & { variant?: LegacyVariant }
export type ToggleGroupMultipleProps = Omit<ToggleGroupRootMultipleProps, 'variant'> & { variant?: LegacyVariant }
export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  { variant = 'primary', ...props },
  ref
) {
  const mappedVariant: ToggleGroupRootProps['variant'] = variant === 'primary' ? 'solid' : 'subtle'
  return <ToggleGroupRoot {...props} ref={ref} variant={mappedVariant} />
})

export interface ToggleGroupItemProps extends Omit<ChoiceItemProps, 'variant'> {
  variant?: LegacyVariant
  subtle?: boolean
}

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { variant, subtle, ...props },
  ref
) {
  return <ChoiceItem {...props} ref={ref} variant={subtle ? 'subtle' : variant === 'primary' ? 'solid' : variant} />
})
