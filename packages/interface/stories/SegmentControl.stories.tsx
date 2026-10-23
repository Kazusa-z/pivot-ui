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
      title="切换互斥模式"
      description="SegmentControl 适合切换互斥模式。方向键移动并选择选项，Home/End 到首尾，onValueChange 返回新值；当前选项保持选中，再次点击仍表示同一选择。"
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
      title="区分选项的原始值"
      description="options 的 key 用于稳定识别项目，value 是应用收到的原始值。数字 1、字符串 1 和空字符串可以分别选择；需要清空选择时由应用把 value 设为 null。"
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
      title="查看、禁用与应用拒绝修改"
      description="readOnly 组可通过键盘浏览，选中状态由应用提供。固定 value 的示例只记录 onValueChange 请求，展示应用保留原值时的结果；disabled 用于整个组暂不可用的情况。"
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
      title="空选项与竖向排列"
      description="比较空选项、不同尺寸和竖排布局。使用 defaultValue 时组件保存选择状态，竖排仍可通过方向键操作；选项加载由应用完成后传入 options。"
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

export default {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'SegmentControl 适合在少量互斥选项之间快速切换，例如坐标系或视图模式。它使用单选组语义，方向键移动并选择选项，onValueChange 返回所选原始值。应用通过 value 接受请求，null 表示未选择；需要再次点击取消或多选时使用 ToggleGroup。',
      },
    },
  },
  title: 'Widgets/Choices/SegmentControl',
} satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <SegmentOverview /> }
export const TypedValues: Story = { render: () => <SegmentTypedValues /> }
export const ReadOnlyDisabledRejected: Story = { render: () => <SegmentModes /> }
export const EmptyUncontrolledLayout: Story = { render: () => <SegmentLayout /> }
