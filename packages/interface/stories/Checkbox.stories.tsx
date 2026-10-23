import { useId, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox, type CheckboxState } from '../src/widgets/choices/Checkbox'
import { PropertyRow, PropertyLabel, PropertyControl } from '../src/layout/PropertyRow'
import { ContractFrame, StatePanel, contractStyles } from './support/ContractFrame'

function CheckboxOverview() {
  const id = useId()
  const [checked, setChecked] = useState(false)
  return (
    <ContractFrame
      title="切换布尔选项"
      description="点击 Visible 标签或聚焦后按 Space 切换布尔值。onCheckedChange 返回新值，本例回写 checked，并在下方显示当前值。"
      onReset={() => setChecked(false)}>
      <PropertyRow>
        <PropertyLabel htmlFor={id}>Visible</PropertyLabel>
        <PropertyControl association="control">
          <Checkbox id={id} checked={checked} onCheckedChange={setChecked} />
        </PropertyControl>
      </PropertyRow>
      <StatePanel label="Value" value={checked} />
    </ContractFrame>
  )
}

function MixedCheckbox() {
  const [checked, setChecked] = useState<CheckboxState>('indeterminate')
  return (
    <ContractFrame
      title="显示多个对象的混合值"
      description="当多个对象的值不一致时，checked=`indeterminate` 显示短横线。首次激活请求 true；应用接受并回写后，后续操作在 true 与 false 之间切换。"
      onReset={() => setChecked('indeterminate')}>
      <Checkbox label="Enabled on selected objects" checked={checked} onCheckedChange={setChecked} />
      <StatePanel label="Value" value={checked} />
    </ContractFrame>
  )
}

function CheckboxModes() {
  const [requests, setRequests] = useState<boolean[]>([])
  return (
    <ContractFrame
      title="查看、禁用与应用拒绝修改"
      description="readOnly 允许聚焦查看，disabled 将控件从键盘焦点顺序中移除。Rejected by parent 会记录 onCheckedChange，却保留传入的 checked，适合观察应用拒绝修改时的显示。"
      onReset={() => setRequests([])}>
      <div className={contractStyles.stack}>
        <Checkbox
          label="Read only"
          defaultChecked
          readOnly
          onCheckedChange={(next) => setRequests((current) => [...current, next])}
        />
        <Checkbox label="Disabled" defaultChecked disabled />
        <Checkbox
          label="Rejected by parent"
          checked={false}
          onCheckedChange={(next) => setRequests((current) => [...current, next])}
        />
      </div>
      <StatePanel label="Requested values" value={requests} />
    </ContractFrame>
  )
}

function CheckboxUncontrolled() {
  const [reset, setReset] = useState(0)
  const [latest, setLatest] = useState<boolean | null>(null)
  return (
    <ContractFrame
      title="自行保存状态的不同尺寸"
      description="三个尺寸的实例各自保存选中状态，onCheckedChange 记录最近一次请求。提供 label 时组件会建立标签关联；Reset 重新创建实例并恢复初始值。"
      onReset={() => {
        setReset((current) => current + 1)
        setLatest(null)
      }}>
      <div key={reset} className={contractStyles.row}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Checkbox key={size} size={size} label={size} defaultChecked onCheckedChange={setLatest} />
        ))}
      </div>
      <StatePanel label="Last boolean request" value={latest} />
    </ContractFrame>
  )
}

export default {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Checkbox 用于开关一个布尔选项，也能表示多个对象的值不一致。checked 接受 true、false 或 indeterminate，onCheckedChange 返回用户请求的布尔值。受控使用时由应用回写 checked；readOnly 保留查看和聚焦能力，disabled 表示整个控件暂不可用。',
      },
    },
  },
  title: 'Widgets/Choices/Checkbox',
} satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <CheckboxOverview /> }
export const Mixed: Story = { render: () => <MixedCheckbox /> }
export const ReadOnlyDisabledRejected: Story = { render: () => <CheckboxModes /> }
export const UncontrolledSizes: Story = { render: () => <CheckboxUncontrolled /> }
