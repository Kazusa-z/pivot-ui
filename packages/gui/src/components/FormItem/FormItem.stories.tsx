import { useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'
import { FormItem } from './'
import { Button, Flex, Input } from '@pivot-ui/editor'

export default {
  component: FormItem,
} as Meta<typeof FormItem>

export const Overview: StoryFn<typeof FormItem> = (args) => {
  const [val, setVal] = useState(0)
  return (
    <Flex gap="md">
      <FormItem label="position">
        <Button>hello</Button>
      </FormItem>
    </Flex>
  )
}

export const FragmentFields: StoryFn<typeof FormItem> = () => {
  const [value, setValue] = useState('First')
  return (
    <Flex direction="column" gap="md" css={{ width: '300px' }}>
      <FormItem label="Coordinates" fieldColumn={2}>
        <>
          <Input id="fragment-first-field" value={value} onChange={(event) => setValue(event.currentTarget.value)} />
          <>
            <Input defaultValue="Second" />
          </>
        </>
      </FormItem>
      <FormItem label="Another field">
        <Input defaultValue="Third" />
      </FormItem>
    </Flex>
  )
}
