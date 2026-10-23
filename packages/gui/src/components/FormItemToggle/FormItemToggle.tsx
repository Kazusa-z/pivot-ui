import React from 'react'

import { Checkbox } from '@pivot-ui/editor'
import { FormItem, extractFormItemProps, type BaseFormItemProps } from '../FormItem'

export interface FormItemToggleProps extends BaseFormItemProps<boolean> {
  checkboxLabel?: string | React.ReactNode
  withLabel?: boolean
}

export function FormItemToggle(props: FormItemToggleProps) {
  const { value, disabled, onChange, withLabel = false } = props

  return (
    <FormItem {...extractFormItemProps(props)} association="control">
      {({ size, ...controlProps }) => (
        <Checkbox
          {...controlProps}
          withLabel={withLabel}
          label={props.checkboxLabel}
          checked={!!value}
          disabled={disabled}
          onCheckedChange={onChange}
        />
      )}
    </FormItem>
  )
}
