import { useCallback } from 'react'
import { Textarea } from '@pivot-ui/editor'
import { FormItem, extractFormItemProps } from '../FormItem'
import { BaseFormItemProps } from '../FormItem/FormItem'

export interface FormItemTextareaProps extends BaseFormItemProps<string> {}

export function FormItemTextarea(props: FormItemTextareaProps) {
  const { value, defaultValue, onChange, disabled } = props

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange && onChange(e.target.value)
    },
    [onChange]
  )

  return (
    <FormItem {...extractFormItemProps(props)} association="control">
      {(controlProps) => (
        <Textarea
          {...controlProps}
          value={value}
          onChange={handleOnChange}
          defaultValue={defaultValue}
          disabled={disabled}
          variant="soft"
        />
      )}
    </FormItem>
  )
}
