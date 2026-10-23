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
      title="Checkbox"
      description="属性行显式关联标签与原生按钮；点击标签或按 Space 修改布尔值。"
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
      title="Mixed selection"
      description="混合值展示短横线和 aria-checked=mixed。首次激活请求 true，之后可切换为 false。"
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
      title="Read only, disabled and rejected"
      description="Read only 保留焦点但不发写入请求；disabled 不接收焦点。受控父级可以拒绝请求，显示保持原值。"
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
      title="Uncontrolled sizes"
      description="三个实例独立保存值；默认 id 自动关联内部 label。Reset 重建非受控实例。"
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

export default { title: 'Widgets/Choices/Checkbox' } satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <CheckboxOverview /> }
export const Mixed: Story = { render: () => <MixedCheckbox /> }
export const ReadOnlyDisabledRejected: Story = { render: () => <CheckboxModes /> }
export const UncontrolledSizes: Story = { render: () => <CheckboxUncontrolled /> }
