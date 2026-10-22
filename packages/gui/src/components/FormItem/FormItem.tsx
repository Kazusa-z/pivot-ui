import React, { cloneElement, forwardRef, ReactNode, useId, useLayoutEffect, useRef, useState } from 'react'
import { styled } from '../../../styled-system/jsx'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Label } from './Label'

const StyledField = styled('div', {
  base: {
    display: 'grid',
    minWidth: 0,
    columnGap: '4px',
    gridColumn: '2 / -1',
    alignItems: 'flex-start',
  },
  variants: {
    withoutLabel: { true: { gridColumn: '1 / -1' } },
    column: {
      1: { gridTemplateColumns: 'minmax(0, 1fr)' },
      2: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
      3: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
      4: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
      color: { gridTemplateColumns: '24px minmax(0, 1fr) 56px' },
      number: { gridTemplateColumns: 'minmax(0, 8fr) repeat(2, 1fr)' },
      asset: { gridTemplateColumns: 'minmax(0, 8fr) 24px 24px', alignItems: 'center' },
      assetPreview: { gridTemplateColumns: 'minmax(0, 1fr)', alignItems: 'center' },
      particle: { gridTemplateColumns: 'minmax(0, 1fr) 32px' },
      particlePair: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr)) 32px' },
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
  fieldColumn?: 1 | 2 | 3 | 4 | 'color' | 'number' | 'asset' | 'assetPreview' | 'particle' | 'particlePair'
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

  const fieldId = useId()
  const labelId = `${fieldId}-label`
  const fieldRef = useRef<HTMLDivElement>(null)
  const [labelTargetId, setLabelTargetId] = useState<string>()
  const withoutLabel = !propLabel

  // Composite controls may put their labelable element below a wrapper or a popover trigger.
  useLayoutEffect(() => {
    const firstControl = fieldRef.current?.querySelector<HTMLElement>(
      'button, input:not([type="hidden"]), select, textarea, meter, output, progress'
    )
    // Groups keep their options' own names instead of relabeling the first radio or accordion trigger.
    const control =
      firstControl?.getAttribute('role') === 'radio' ||
      (firstControl?.hasAttribute('aria-expanded') &&
        firstControl.getAttribute('role') !== 'combobox' &&
        !firstControl.hasAttribute('aria-haspopup'))
        ? undefined
        : firstControl
    if (control && !control.id) control.id = `${fieldId}-control`
    setLabelTargetId(control?.id)
  })

  let childIndex = 0
  const decorateChildren = (nodes: ReactNode): ReactNode =>
    React.Children.map(nodes, (child) => {
      if (!React.isValidElement<{ id?: string; size?: 'sm' | 'md'; label?: string; children?: ReactNode }>(child)) {
        return child
      }
      if (child.type === React.Fragment) {
        return cloneElement(child, {}, decorateChildren(child.props.children))
      }
      const generatedId = `${fieldId}-${childIndex++}`
      const id = child.props.id ?? generatedId
      return cloneElement(child, {
        id,
        ...(typeof child.type === 'string' ? {} : { size: child.props.size ?? size, label: child.props.label ?? name }),
      })
    })

  return (
    <StyledFormItem ref={forwardedRef} direction={direction} withoutLabel={withoutLabel} css={css} {...rest}>
      {!withoutLabel && (
        <Label
          info={info}
          id={labelId}
          htmlFor={labelTargetId}
          label={name ?? ''}
          css={labelCss}
          startSlot={formStartSlot}
          endSlot={formEndSlot}
        />
      )}
      <StyledField
        ref={fieldRef}
        role={withoutLabel ? undefined : 'group'}
        aria-labelledby={withoutLabel ? undefined : labelId}
        column={fieldColumn}
        withoutLabel={withoutLabel}
        css={fieldCss}>
        {decorateChildren(children)}
      </StyledField>
    </StyledFormItem>
  )
})

export { FormItem }
