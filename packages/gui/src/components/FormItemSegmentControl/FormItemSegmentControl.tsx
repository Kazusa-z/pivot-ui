import React from 'react'

import { FormItem, extractFormItemProps, type BaseFormItemProps } from '../FormItem'
import { SegmentControl, SegmentControlItem } from '@pivot-ui/editor'

export interface FormItemSegmentControlProps extends BaseFormItemProps<any> {
  options: { value: any; label: React.ReactNode; disabled?: boolean }[]
  variant?: 'subtle' | 'solid'
}

export function FormItemSegmentControl(props: FormItemSegmentControlProps) {
  const { value, onChange, defaultValue, disabled, options = [], variant = 'subtle' } = props
  return (
    <FormItem {...extractFormItemProps(props)} fieldColumn={1}>
      <SegmentControl
        size="sm"
        variant={variant}
        disabled={disabled}
        defaultValue={defaultValue}
        value={String(value)}
        onValueChange={(v) => onChange && onChange(isNaN(Number(v)) ? v : Number(v))}>
        {options.map((item) => (
          <SegmentControlItem disabled={disabled || item.disabled} value={String(item.value)} key={item.value}>
            {item.label}
          </SegmentControlItem>
        ))}
      </SegmentControl>
    </FormItem>
  )
}
