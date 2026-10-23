import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ToggleGroup, ToggleGroupRoot, ToggleGroupItem } from '../src/widgets/choices/ToggleGroup'
import type { ChoiceOption, ChoiceValue } from '../src/values'
import { ContractFrame, StatePanel, contractStyles } from './support/ContractFrame'

const options = [
  { key: 'translate', label: 'Move', value: 'move' },
  { key: 'rotate', label: 'Rotate', value: 'rotate' },
  { key: 'scale', label: 'Scale', value: 'scale' },
  { key: 'locked', label: 'Locked', value: 'locked', disabled: true, disabledReason: 'This action is unavailable' },
] satisfies readonly ChoiceOption<string>[]

function SingleToggle() {
  const [value, setValue] = useState<string | null>('move')
  return (
    <ContractFrame
      title="Single toggle group"
      description="toolbar 内的 button 使用 aria-pressed。点击当前按钮取消为 null；箭头只移动焦点，Space/Enter 才修改值。"
      onReset={() => setValue('move')}>
      <ToggleGroup aria-label="Tool" type="single" options={options} value={value} onValueChange={setValue} />
      <StatePanel label="Value" value={value} />
    </ContractFrame>
  )
}

function MultipleToggle() {
  const [value, setValue] = useState<ChoiceValue[]>(['001', 1])
  const typedOptions: readonly ChoiceOption[] = [
    { key: 'padded', label: 'String 001', value: '001' },
    { key: 'string', label: 'String 1', value: '1' },
    { key: 'number', label: 'Number 1', value: 1 },
    { key: 'empty', label: 'Empty string', value: '' },
  ]
  return (
    <ContractFrame
      title="Multiple toggle group"
      description="多选 value/defaultValue 始终为数组；数字和字符串保持类型身份，每个按钮可独立取消。"
      onReset={() => setValue(['001', 1])}>
      <ToggleGroup
        aria-label="Values"
        type="multiple"
        options={typedOptions}
        value={value}
        onValueChange={setValue}
        variant="subtle"
      />
      <StatePanel label="Typed values" value={value.map((item) => ({ value: item, type: typeof item }))} />
    </ContractFrame>
  )
}

function ToggleModes() {
  const [requests, setRequests] = useState<(string | null)[]>([])
  return (
    <ContractFrame
      title="Read only, disabled and rejected"
      description="只读按钮仍可通过键盘访问；disabled 跳过焦点。父级拒绝单选/多选请求时视图保持原值。"
      onReset={() => setRequests([])}>
      <div className={contractStyles.stack}>
        <ToggleGroup
          aria-label="Read only tools"
          type="multiple"
          options={options}
          defaultValue={['move']}
          readOnly
          onValueChange={(next) => setRequests((current) => [...current, ...next])}
        />
        <ToggleGroup aria-label="Disabled tools" type="single" options={options} defaultValue="rotate" disabled />
        <ToggleGroup
          aria-label="Rejected tool"
          type="single"
          options={options}
          value="move"
          onValueChange={(next) => setRequests((current) => [...current, next])}
        />
        <ToggleGroup
          aria-label="Rejected tools"
          type="multiple"
          options={options}
          value={['move']}
          onValueChange={(next) => setRequests((current) => [...current, ...next])}
        />
      </div>
      <StatePanel label="Requested values" value={requests} />
    </ContractFrame>
  )
}

function ToggleComposition() {
  const [reset, setReset] = useState(0)
  return (
    <ContractFrame
      title="Composition and empty groups"
      description="Root/Item 用稳定字符串 key 支持图标和 Fragment 组合。非受控多选使用数组 defaultValue。"
      onReset={() => setReset((current) => current + 1)}>
      <div key={reset} className={contractStyles.stack}>
        <ToggleGroup aria-label="Empty toggles" type="multiple" options={[]} defaultValue={[]} />
        <ToggleGroupRoot aria-label="Axis visibility" type="multiple" defaultValue={['x', 'z']} size="lg">
          <>
            <ToggleGroupItem value="x" aria-label="X axis">
              X
            </ToggleGroupItem>
            <ToggleGroupItem value="y" aria-label="Y axis">
              Y
            </ToggleGroupItem>
          </>
          <ToggleGroupItem value="z" aria-label="Z axis">
            Z
          </ToggleGroupItem>
        </ToggleGroupRoot>
        <ToggleGroup
          aria-label="Vertical tools"
          type="single"
          options={options}
          defaultValue="move"
          orientation="vertical"
          size="md"
        />
      </div>
    </ContractFrame>
  )
}

export default { title: 'Widgets/Choices/ToggleGroup' } satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <SingleToggle /> }
export const MultipleTypedValues: Story = { render: () => <MultipleToggle /> }
export const ReadOnlyDisabledRejected: Story = { render: () => <ToggleModes /> }
export const CompositionEmptyUncontrolled: Story = { render: () => <ToggleComposition /> }
