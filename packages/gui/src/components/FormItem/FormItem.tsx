import { forwardRef, useId, type ReactNode } from 'react'
import { PropertyRow, PropertyControl, PropertyDescription } from '@pivot-ui/react'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Label } from './Label'

export interface BaseFormItemProps<V> {
  label?: string
  info?: ReactNode
  disabled?: boolean
  value?: V
  defaultValue?: V
  onChange?: (value: V) => void
  formEndSlot?: ReactNode
  formStartSlot?: ReactNode
  direction?: 'column' | 'row'
}

export interface FormItemRangeProps extends BaseFormItemProps<number> {
  min?: number
  max?: number
  step?: number
  dragStep?: number
}

export interface FormItemSelectableProps<T> extends BaseFormItemProps<T> {
  options: { value: T; label: ReactNode }[]
}

export interface FormItemControlProps {
  id: string
  'aria-describedby'?: string
  size: 'sm' | 'md'
}

export function mergeFormItemDescriptionIds(...ids: (string | undefined)[]): string | undefined {
  return [...new Set(ids.flatMap((id) => id?.split(/\s+/).filter(Boolean) ?? []))].join(' ') || undefined
}

export interface FormItemProps<T = any> extends BaseFormItemProps<T> {
  children?: ReactNode | ((controlProps: FormItemControlProps) => ReactNode)
  css?: SystemStyleObject
  labelCss?: SystemStyleObject
  fieldCss?: SystemStyleObject
  size?: 'sm' | 'md'
  fieldColumn?: 1 | 2 | 3 | 4
  /** Explicit single-control identity; composite fields use the default named group. */
  association?: 'control' | 'group' | 'none'
  controlId?: string
}

export function extractFormItemProps<T>(props: Record<any, any>): FormItemProps<T> {
  return {
    label: props.label,
    info: props.info,
    disabled: props.disabled,
    css: props.css,
    labelCss: props.labelCss,
    fieldCss: props.fieldCss,
    size: props.size,
    direction: props.direction,
    fieldColumn: props.fieldColumn,
    formEndSlot: props.formEndSlot,
    formStartSlot: props.formStartSlot,
  }
}

/** Transitional composition only; all row and association semantics live in PropertyRow's parts. */
const FormItem = forwardRef<HTMLDivElement, FormItemProps>(function FormItem(
  {
    label,
    fieldColumn,
    children,
    labelCss,
    info,
    formStartSlot,
    formEndSlot,
    fieldCss,
    css,
    size = 'sm',
    direction = 'row',
    association = 'group',
    controlId: suppliedControlId,
  },
  forwardedRef
) {
  const instanceId = useId()
  const controlId = suppliedControlId ?? `${instanceId}-control`
  const labelId = `${instanceId}-label`
  const descriptionId = info != null ? `${instanceId}-description` : undefined
  const associationProps =
    association === 'group' && label
      ? ({ association: 'group', labelledBy: labelId } as const)
      : ({ association: association === 'control' ? 'control' : 'none' } as const)

  return (
    <PropertyRow ref={forwardedRef} direction={direction} withoutLabel={!label} css={css}>
      {label && (
        <Label
          id={labelId}
          htmlFor={association === 'control' ? controlId : undefined}
          label={label}
          css={labelCss}
          startSlot={formStartSlot}
          endSlot={formEndSlot}
        />
      )}
      <PropertyControl
        {...associationProps}
        aria-describedby={association === 'group' ? descriptionId : undefined}
        columns={fieldColumn}
        css={fieldCss}>
        {typeof children === 'function'
          ? children({ id: controlId, 'aria-describedby': descriptionId, size })
          : children}
      </PropertyControl>
      {info != null && <PropertyDescription id={descriptionId}>{info}</PropertyDescription>}
    </PropertyRow>
  )
})

export { FormItem }
