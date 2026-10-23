import type {
  SelectProps as PrimitiveSelectProps,
  SelectContentProps,
  SelectGroupProps as PrimitiveGroupProps,
} from '@radix-ui/react-select'
import { Select as ChoiceSelect, type ChoiceValue } from '@pivot-ui/react'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'
import { IconRightBottomCorner } from '../Icons'
import { collectLegacyOptions, LegacySelectItem, type LegacySelectItemProps } from './legacy-options'

export type SelectItemProps = LegacySelectItemProps
export const SelectItem = LegacySelectItem
export function SelectGroup({
  children,
}: PrimitiveGroupProps & { label: string; divider?: boolean; dividerPosition?: 'top' | 'bottom' }) {
  return <>{children}</>
}
export function SelectLabel({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>
}

export interface SelectProps extends Omit<PrimitiveSelectProps, 'value' | 'defaultValue' | 'onValueChange'> {
  placeholder?: string
  position?: SelectContentProps['position']
  size?: 'xs' | 'sm' | 'md'
  variant?: 'outline' | 'soft' | 'subtle'
  width?: 'initial'
  /** Retained for compatibility; option values now determine their original type. */
  valueType?: 'string' | 'number'
  value?: ChoiceValue
  defaultValue?: ChoiceValue
  valueRenderer?: (value: ChoiceValue, location?: 'item' | 'trigger') => ReactNode
  onValueChange?: (value: any) => void
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  sideOffset?: number
  children?: ReactNode
  arrow?: boolean
  cornerArrow?: boolean
  triggerCss?: SystemStyleObject
  startSlot?: ReactNode
  readOnly?: boolean
}
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    children,
    valueRenderer,
    valueType: _valueType,
    width: _width,
    arrow = true,
    cornerArrow,
    position = 'popper',
    sideOffset = 4,
    triggerCss,
    required,
    ...props
  },
  ref
) {
  const { options, rendered } = collectLegacyOptions(children)
  return (
    <ChoiceSelect
      {...props}
      ref={ref}
      options={options}
      css={triggerCss}
      aria-required={required || undefined}
      indicator={
        !arrow ? null : cornerArrow ? (
          <IconRightBottomCorner className={css({ width: '8px', height: '8px', flexShrink: 0 })} />
        ) : undefined
      }
      contentProps={{ position, sideOffset }}
      renderOption={(option) => valueRenderer?.(option.value, 'item') ?? rendered.get(option.key)}
      renderValue={(option) => valueRenderer?.(option.value, 'trigger') ?? rendered.get(option.key)}
    />
  )
})
