import React, { cloneElement, forwardRef, ReactNode } from 'react'
import { styled } from '../../../styled-system/jsx'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Label } from './Label'
import { nanoid } from 'nanoid'

const StyledField = styled('div', {
  base: {
    display: 'grid',
    columnGap: '4px',
    gridColumn: '2 / -1',
    alignItems: 'flex-start',
  },
  variants: {
    withoutLabel: { true: { gridColumn: '1 / -1' } },
    column: {
      1: { gridTemplateColumns: '1fr' },
      2: { gridTemplateColumns: 'repeat(2, 1fr)' },
      3: { gridTemplateColumns: 'repeat(3, 1fr)' },
      4: { gridTemplateColumns: 'repeat(4, 1fr)' },
      color: { gridTemplateColumns: '24px 1fr 52px' },
      number: { gridTemplateColumns: 'minmax(0, 8fr) repeat(2, 1fr)' },
      asset: { gridTemplateColumns: 'minmax(0, 8fr) 24px 24px', alignItems: 'center' },
      assetPreview: { gridTemplateColumns: 'minmax(0, 1fr)', alignItems: 'center' },
    },
  },
})

const StyledFormItem = styled('div', {
  base: {
    display: 'grid',
    width: '100%',
    padding: '2px',
    gridTemplateColumns: 'minmax(0px, 1.3fr) repeat(3, minmax(0px, 1fr))',
    gridTemplateRows: 'auto',
    columnGap: '4px',
    alignItems: 'center',
  },
  variants: {
    withoutLabel: { true: { gridTemplateColumns: '1fr' } },
    direction: {
      column: { display: 'flex', flexDirection: 'column', alignItems: 'normal', gap: '4px' },
      row: {},
    },
  },
})

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

export interface FormItemProps<T = any> extends BaseFormItemProps<T> {
  children?: React.ReactNode
  css?: SystemStyleObject
  labelCss?: SystemStyleObject
  fieldCss?: SystemStyleObject
  size?: 'sm' | 'md'
  fieldColumn?: 1 | 2 | 3 | 4 | 'color' | 'number' | 'asset' | 'assetPreview'
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

const FormItem = forwardRef<HTMLDivElement, FormItemProps>(function FormItem(props, forwardedRef) {
  const {
    label: propLabel,
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
    ...rest
  } = props

  const name = propLabel

  const labelId = `${(name ?? '').replace(/\s/g, '-')}-${nanoid()}`
  const withoutLabel = !propLabel

  const decorateChildren = React.Children.toArray(children).map((child) => {
    if (React.isValidElement<{ id?: string; size?: 'sm' | 'md'; label?: string }>(child)) {
      return cloneElement(child, {
        id: labelId,
        size,
        label: name,
        // ...controlledProp,
      })
    }
    return null
  })

  return (
    <StyledFormItem ref={forwardedRef} direction={direction} withoutLabel={withoutLabel} css={css} {...rest}>
      {!withoutLabel && (
        <Label
          info={info}
          htmlFor={labelId}
          label={name ?? ''}
          css={labelCss}
          startSlot={formStartSlot}
          endSlot={formEndSlot}
        />
      )}
      <StyledField column={fieldColumn} withoutLabel={withoutLabel} css={fieldCss}>
        {decorateChildren}
      </StyledField>
    </StyledFormItem>
  )
})

export { FormItem }
