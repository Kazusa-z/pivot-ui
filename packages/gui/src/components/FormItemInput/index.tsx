import { useCallback } from 'react'

import { FormItem, extractFormItemProps } from '../FormItem'
import { Input, InputProps } from '@pivot-ui/editor'
import { mergeFormItemDescriptionIds, type BaseFormItemProps } from '../FormItem/FormItem'

export interface FormItemInputProps
  extends BaseFormItemProps<string>, Omit<InputProps, 'defaultValue' | 'value' | 'onChange'> {}

export function FormItemInput(props: FormItemInputProps) {
  const { value, defaultValue, onChange, label, info, formEndSlot, formStartSlot, direction, ...rest } = props

  const handleOnChange = useCallback(
    (e) => {
      onChange && onChange(e.target.value)
    },
    [onChange]
  )

  return (
    <FormItem {...extractFormItemProps(props)} association="control" controlId={props.id}>
      {(controlProps) => (
        <Input
          {...controlProps}
          value={value}
          defaultValue={defaultValue}
          onChange={handleOnChange}
          {...rest}
          id={props.id ?? controlProps.id}
          aria-describedby={mergeFormItemDescriptionIds(controlProps['aria-describedby'], rest['aria-describedby'])}
        />
      )}
    </FormItem>
  )
}
