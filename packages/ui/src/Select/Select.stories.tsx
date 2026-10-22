import React from 'react'
import { Meta, StoryFn } from '@storybook/react'
import { IconApple, IconCherry, IconFilterUp } from '@tabler/icons-react'

import { Flex } from '../Flex'
import { Button } from '../Button'

import { Select, SelectItem } from './'
import type { SelectProps as SingleSelectProps } from './SingleSelect'
import type { ComboboxProps } from './Combobox'

export default {
  title: 'Inputs/Select',
  tags: ['autodocs'],
  component: Select,
  argTypes: {
    size: {
      type: {
        name: 'enum',
        value: ['xs', 'sm', 'md'],
      },
    },
    variant: {
      type: {
        name: 'enum',
        value: ['outline', 'soft', 'subtle'],
      },
    },
  },
  args: {
    size: 'sm',
    variant: 'soft',
  },
} satisfies Meta<typeof Select>

const mock_data = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'grapes', label: 'Grapes' },
  { value: 'pineapple', label: 'Pineapple' },
]

/**
 * The Select component combines `<Select>` and `<SelectItem />` to let users choose one or more options from a list.
 *
 * A part of this component built on top of the `@radix-ui/react-select`
 *
 * The component supports controlled and uncontrolled usage.
 */
export const Overview: StoryFn<SingleSelectProps> = (args) => {
  return (
    <Flex css={{ width: '260px' }} direction="column" gap="sm">
      <Select {...args} defaultValue="apple" placeholder="Select Fruits..." startSlot={<IconFilterUp size="12px" />}>
        {mock_data.map((item, index) => (
          <SelectItem key={index} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
    </Flex>
  )
}

export const Sizes: StoryFn<SingleSelectProps> = (args) => {
  return (
    <Flex css={{ width: '260px' }} direction="column" gap="sm">
      <Select
        {...args}
        size="xs"
        defaultValue="apple"
        placeholder="Select Fruits..."
        startSlot={<IconFilterUp size="10px" />}>
        {mock_data.map((item, index) => (
          <SelectItem key={index} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
      <Select
        {...args}
        size="sm"
        defaultValue="apple"
        placeholder="Select Fruits..."
        startSlot={<IconFilterUp size="12px" />}>
        {mock_data.map((item, index) => (
          <SelectItem key={index} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
      <Select
        {...args}
        size="md"
        defaultValue="apple"
        placeholder="Select Fruits..."
        startSlot={<IconFilterUp size="14px" />}>
        {mock_data.map((item, index) => (
          <SelectItem key={index} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
    </Flex>
  )
}

export const Variants: StoryFn<SingleSelectProps> = (args) => {
  return (
    <Flex css={{ width: '260px' }} direction="column" gap="sm">
      <Select {...args} variant="outline" defaultValue="apple" placeholder="Outline select">
        {mock_data.map((item, index) => (
          <SelectItem key={index} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
      <Select {...args} variant="soft" defaultValue="apple" placeholder="Soft select">
        {mock_data.map((item, index) => (
          <SelectItem key={index} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
      <Select {...args} variant="subtle" defaultValue="apple" placeholder="Subtle select">
        {mock_data.map((item, index) => (
          <SelectItem key={index} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
    </Flex>
  )
}

export const Uncontrolled: StoryFn<typeof Select> = () => {
  return (
    <div>
      <Flex css={{ width: '260px' }} direction="column" gap="sm">
        <Select defaultValue="apple" placeholder="Select Fruits...">
          {mock_data.map((item, index) => (
            <SelectItem key={index} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </Select>
      </Flex>
    </div>
  )
}

export const Controlled: StoryFn<SingleSelectProps> = () => <ControlledSelectExample />

function ControlledSelectExample() {
  const [value, setValue] = React.useState('apple')

  return (
    <div>
      <Flex css={{ width: '260px' }} direction="column" gap="sm">
        <Button onClick={() => setValue('banana')}>Select Banana</Button>
        <Select value={value} onValueChange={setValue} placeholder="Select Fruits...">
          {mock_data.map((item, index) => (
            <SelectItem key={index} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </Select>
      </Flex>
    </div>
  )
}

/**
 * `Select` support both `string` and `number` value types. It will detect the type of the value by default, but we suggest to explicitly define the `valueType` prop for better control.
 */
export const ValueType: StoryFn<SingleSelectProps> = () => <SelectValueTypeExample />

function SelectValueTypeExample() {
  const [value0, setValue0] = React.useState(0)
  const [value1, setValue1] = React.useState('apple')

  return (
    <Flex style={{ width: '300px' }} direction="column" gap="xs">
      <Select placeholder="Select Fruits..." valueType="number" value={value0} onValueChange={setValue0}>
        <SelectItem value={0}>Apple - value 0</SelectItem>
        <SelectItem value={1}>Cherry - value 1</SelectItem>
      </Select>

      <Select placeholder="Select Fruits..." valueType="string" value={value1} onValueChange={setValue1}>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </Select>
    </Flex>
  )
}

export const UncontrolledNumber: StoryFn<typeof Select> = () => {
  return (
    <Flex style={{ width: '300px' }}>
      <Select placeholder="Select Fruits..." defaultValue={0}>
        <SelectItem value={0}>Apple - value 0</SelectItem>
        <SelectItem value={1}>Cherry - value 1</SelectItem>
      </Select>
    </Flex>
  )
}

/**
 * One of the useful feature of the Select component is the ability to define a custom value renderer.
 */
export const CustomValueRenderer: StoryFn<typeof Select> = () => {
  const renderFruit = (value: string | number) => {
    if (String(value) === '0') {
      return (
        <Flex align="v" gap="xs">
          <IconApple size="14px" /> Apple
        </Flex>
      )
    }

    return (
      <Flex align="v" gap="xs">
        <IconCherry size="14px" /> Cherry
      </Flex>
    )
  }

  return (
    <Flex style={{ width: '300px' }}>
      <Select placeholder="Select Fruits..." valueType="number" defaultValue={0} valueRenderer={renderFruit}>
        <SelectItem value={0}>
          <Flex align="v" gap="xs">
            <IconApple size="14px" /> Apple
          </Flex>
        </SelectItem>
        <SelectItem value={1}>
          <Flex align="v" gap="xs">
            <IconCherry size="14px" /> Cherry
          </Flex>
        </SelectItem>
      </Select>
    </Flex>
  )
}

export const Multiple: StoryFn<ComboboxProps> = (args) => {
  return (
    <Flex style={{ width: '300px' }}>
      <Select valueRenderer={(val) => val} defaultValue={['apple']} placeholder="Select Fruits..." {...args} multiple>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </Select>
    </Flex>
  )
}

Multiple.argTypes = {
  searchable: {
    control: {
      type: 'boolean',
    },
  },
  autoClose: {
    control: {
      type: 'boolean',
    },
  },
}

Multiple.args = {
  searchable: false,

  autoClose: false,

  maxDisplayCount: 2,

  maxDisplayText: '已选择{count}项',
}

function MultipleTagRemovalExample() {
  const [value, setValue] = React.useState(['apple', 'banana', 'blueberry'])
  const [lastRequest, setLastRequest] = React.useState<string[] | null>(null)
  const [rejectChanges, setRejectChanges] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)
  return (
    <Flex direction="column" gap="sm" style={{ width: 'min(440px, 100%)' }}>
      <p>Tab 到标签的移除按钮，按 Enter 或 Space 删除。Banana 被禁用；父级拒绝更新时，标签必须保留。</p>
      <Flex gap="sm">
        <label>
          <input type="checkbox" checked={rejectChanges} onChange={(event) => setRejectChanges(event.target.checked)} />{' '}
          Reject changes
        </label>
        <label>
          <input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} /> Disabled
        </label>
        <Button
          onClick={() => {
            setValue(['apple', 'banana', 'blueberry'])
            setLastRequest(null)
            setRejectChanges(false)
            setDisabled(false)
          }}>
          Reset
        </Button>
      </Flex>
      <Select
        multiple
        searchable
        value={value}
        disabled={disabled}
        placeholder="Choose fruits"
        onValueChange={(nextValue) => {
          setLastRequest(nextValue)
          if (!rejectChanges) setValue(nextValue)
        }}>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana" disabled>
          Banana
        </SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </Select>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {JSON.stringify({ value, lastRequest, rejectChanges, disabled }, null, 2)}
      </pre>
    </Flex>
  )
}

export const MultipleTagRemoval: StoryFn<ComboboxProps> = () => <MultipleTagRemovalExample />
