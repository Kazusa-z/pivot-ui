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
      title="可以取消的单选工具"
      description="单选工具组适合一次启用一个可取消的工具。点击当前按钮会请求 null；方向键移动焦点，Space/Enter 改变选择，onValueChange 将请求交给应用保存。"
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
      title="组合多个独立开关"
      description="多选工具组适合组合多个开关。value 和 defaultValue 使用数组，每个按钮可独立启用或取消；onValueChange 返回完整选择，保留数字与字符串的原始类型。"
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
      title="查看、禁用与应用拒绝修改"
      description="readOnly 允许键盘查看，disabled 将不可用按钮从焦点导航中移除。固定 value 的示例记录请求并继续显示原值，应用接受修改时再回写单选值或多选数组。"
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
      title="自定义按钮内容与竖向排列"
      description="需要自定义图标或内容时，可组合 ToggleGroupRoot 与 ToggleGroupItem，并使用稳定字符串 value 标识每个项目。多选的 defaultValue 使用数组；竖排工具组同样支持键盘聚焦与激活。"
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

export default {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ToggleGroup 用于一组可以独立按下或取消的工具按钮。单选模式的 value 为一个值或 null，多选模式始终使用数组；onValueChange 返回用户请求的新选择。方向键移动焦点，Enter 或 Space 激活按钮；应用回写 value 后显示更新，选项的 key 与原始 value 分开维护。',
      },
    },
  },
  title: 'Widgets/Choices/ToggleGroup',
} satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <SingleToggle /> }
export const MultipleTypedValues: Story = { render: () => <MultipleToggle /> }
export const ReadOnlyDisabledRejected: Story = { render: () => <ToggleModes /> }
export const CompositionEmptyUncontrolled: Story = { render: () => <ToggleComposition /> }
