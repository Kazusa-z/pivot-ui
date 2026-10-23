import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SegmentControl } from '../src/widgets/choices/SegmentControl'
import type { ChoiceOption, ChoiceValue } from '../src/values'
import { ContractFrame, StatePanel, contractStyles } from './support/ContractFrame'

const options = [
  { key: 'local', label: 'Local', value: 'local' },
  { key: 'world', label: 'World', value: 'world' },
  { key: 'normal', label: 'Normal', value: 'normal', disabled: true, disabledReason: 'Select a mesh first' },
] satisfies readonly ChoiceOption<string>[]

function SegmentOverview() {
  const [value, setValue] = useState<string | null>('local')
  return (
    <ContractFrame
      title="Segment control"
      description="互斥选项使用 radiogroup/radio。箭头移动并选择，Home/End 到边界；已选项不会再次点击取消。"
      onReset={() => setValue('local')}>
      <SegmentControl aria-label="Coordinate system" options={options} value={value} onValueChange={setValue} />
      <StatePanel label="Value" value={value} />
    </ContractFrame>
  )
}

function SegmentTypedValues() {
  const [value, setValue] = useState<ChoiceValue | null>(null)
  const typedOptions: readonly ChoiceOption[] = [
    { key: 'padded', label: 'String 001', value: '001' },
    { key: 'text', label: 'String 1', value: '1' },
    { key: 'number', label: 'Number 1', value: 1 },
    { key: 'empty', label: 'Empty string', value: '' },
  ]
  return (
    <ContractFrame
      title="Typed option identity"
      description="key 负责身份，value 保持原始 string/number；null 是未选择，空字符串是合法选项值。"
      onReset={() => setValue(null)}>
      <SegmentControl
        aria-label="Typed value"
        options={typedOptions}
        value={value}
        onValueChange={setValue}
        variant="solid"
      />
      <StatePanel label="Value and type" value={{ value, type: value === null ? 'empty' : typeof value }} />
    </ContractFrame>
  )
}

function SegmentModes() {
  const [requests, setRequests] = useState<string[]>([])
  return (
    <ContractFrame
      title="Read only, disabled and rejected"
      description="只读组允许键盘浏览但不修改选中项；受控组不会在父级拒绝请求后漂移。"
      onReset={() => setRequests([])}>
      <div className={contractStyles.stack}>
        <SegmentControl
          aria-label="Read only coordinates"
          options={options}
          defaultValue="local"
          readOnly
          onValueChange={(next) => setRequests((current) => [...current, next])}
        />
        <SegmentControl aria-label="Disabled coordinates" options={options} defaultValue="world" disabled />
        <SegmentControl
          aria-label="Rejected coordinates"
          options={options}
          value="local"
          onValueChange={(next) => setRequests((current) => [...current, next])}
        />
      </div>
      <StatePanel label="Requested values" value={requests} />
    </ContractFrame>
  )
}

function SegmentLayout() {
  const [reset, setReset] = useState(0)
  return (
    <ContractFrame
      title="Empty and vertical"
      description="空 options 渲染空组；非受控竖排、不同尺寸与窄布局保持完整 radio 语义。"
      onReset={() => setReset((current) => current + 1)}>
      <div key={reset} className={contractStyles.stack}>
        <SegmentControl aria-label="Empty" options={[]} />
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <SegmentControl
            key={size}
            aria-label={`${size} coordinates`}
            options={options}
            size={size}
            defaultValue="local"
          />
        ))}
        <SegmentControl
          aria-label="Vertical coordinates"
          options={options}
          defaultValue="world"
          orientation="vertical"
          css={{ maxWidth: '180px' }}
        />
      </div>
    </ContractFrame>
  )
}

export default { title: 'Widgets/Choices/SegmentControl' } satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <SegmentOverview /> }
export const TypedValues: Story = { render: () => <SegmentTypedValues /> }
export const ReadOnlyDisabledRejected: Story = { render: () => <SegmentModes /> }
export const EmptyUncontrolledLayout: Story = { render: () => <SegmentLayout /> }
