import { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'
import { FormItem, type FormItemProps } from './'
import { Input } from '@pivot-ui/editor'
import { StoryFrame } from '../../../stories/StoryFrame'

export default {
  title: 'FormItem/FormItem',
  component: FormItem,
} as Meta<typeof FormItem>

function FormItemExample(args: FormItemProps) {
  const [value, setValue] = useState('Object')
  return (
    <StoryFrame value={value} onReset={() => setValue('Object')}>
      <FormItem label="name" {...args} association="control">
        {(controlProps) => (
          <Input
            {...controlProps}
            value={value}
            disabled={args.disabled}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        )}
      </FormItem>
    </StoryFrame>
  )
}

export const Overview: StoryFn<typeof FormItem> = (args) => <FormItemExample {...args} />

const initialFields = { first: 'First', second: 'Second', third: 'Third' }

function FragmentFieldsExample() {
  const [values, setValues] = useState(initialFields)
  return (
    <StoryFrame value={values} onReset={() => setValues(initialFields)}>
      <FormItem label="Coordinates" association="group" fieldColumn={2}>
        <>
          <Input
            id="fragment-first-field"
            aria-label="First coordinate"
            size="sm"
            value={values.first}
            onChange={(event) => setValues({ ...values, first: event.currentTarget.value })}
          />
          <>
            <Input
              aria-label="Second coordinate"
              size="sm"
              value={values.second}
              onChange={(event) => setValues({ ...values, second: event.currentTarget.value })}
            />
          </>
        </>
      </FormItem>
      <FormItem label="Another field" association="control">
        {(controlProps) => (
          <Input
            {...controlProps}
            value={values.third}
            onChange={(event) => setValues({ ...values, third: event.currentTarget.value })}
          />
        )}
      </FormItem>
    </StoryFrame>
  )
}

export const FragmentFields: StoryFn<typeof FormItem> = () => <FragmentFieldsExample />
