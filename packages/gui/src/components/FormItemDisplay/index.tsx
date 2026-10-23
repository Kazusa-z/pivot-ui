import { ImagePreview, ReadonlyValue } from '@pivot-ui/react'
import { FormItem, extractFormItemProps } from '../FormItem'
import { BaseFormItemProps } from '../FormItem/FormItem'

export interface FormItemDisplayProps extends Omit<BaseFormItemProps<string>, 'onChange'> {
  displayType?: 'text' | 'image'
}

export function FormItemDisplay(props: FormItemDisplayProps) {
  const { label, value, displayType = 'text' } = props
  return (
    <FormItem {...extractFormItemProps(props)}>
      {displayType === 'text' ? (
        <ReadonlyValue code>{value}</ReadonlyValue>
      ) : (
        <ImagePreview src={value} alt={label ?? ''} css={{ height: 'auto' }} />
      )}
    </FormItem>
  )
}

export function PureFormItemDisplay({ inspectorConfig }) {
  return <FormItemDisplay {...inspectorConfig} />
}
