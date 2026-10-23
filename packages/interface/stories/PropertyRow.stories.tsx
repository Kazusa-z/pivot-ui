import { useId, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PropertyRow, PropertyLabel, PropertyControl, PropertyDescription } from '../src/layout/PropertyRow'
import { Button } from '../src/widgets/buttons'
import { css } from '../styled-system/css'
import { ContractFrame, StatePanel, contractStyles } from './support/ContractFrame'

const inputClass = css({
  minWidth: 0,
  width: '100%',
  height: '24px',
  padding: '0 6px',
  borderRadius: '4px',
  border: '1px solid var(--colors-border)',
  background: 'var(--colors-surface)',
  color: 'var(--colors-text)',
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)' },
})

function SingleControlExample() {
  const id = useId()
  const [value, setValue] = useState('Object')
  const [disabled, setDisabled] = useState(false)
  const [help, setHelp] = useState(true)
  return (
    <ContractFrame
      title="标签关联单个输入"
      description="点击 Name 会聚焦与 htmlFor 对应的输入框。帮助文字显示在行下方，并通过 aria-describedby 关联；组合时由应用把 id 和描述属性传给真实输入控件。"
      onReset={() => {
        setValue('Object')
        setDisabled(false)
        setHelp(true)
      }}>
      <div className={contractStyles.row}>
        <label>
          <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.currentTarget.checked)} /> Disabled
        </label>
        <label>
          <input type="checkbox" checked={help} onChange={(e) => setHelp(e.currentTarget.checked)} /> Show description
        </label>
      </div>
      <PropertyRow>
        <PropertyLabel htmlFor={id}>Name</PropertyLabel>
        <PropertyControl association="control">
          <input
            id={id}
            className={inputClass}
            aria-describedby={help ? `${id}-help` : undefined}
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        </PropertyControl>
        {help && <PropertyDescription id={`${id}-help`}>输入便于识别的显示名称。</PropertyDescription>}
      </PropertyRow>
      <StatePanel label="State" value={{ value, disabled, help }} />
    </ContractFrame>
  )
}

function ControlGroupExample() {
  const id = useId()
  const [coordinates, setCoordinates] = useState({ x: '10', y: '20' })
  const [locked, setLocked] = useState(false)
  return (
    <ContractFrame
      title="为多个输入提供组名"
      description="Coordinates 为坐标组提供共享名称，X 和 Y 分别说明每个输入的含义。标签旁的锁定按钮是独立操作，拥有自己的名称与回调。"
      onReset={() => {
        setCoordinates({ x: '10', y: '20' })
        setLocked(false)
      }}>
      <PropertyRow>
        <PropertyLabel
          id={`${id}-label`}
          endSlot={
            <Button
              size="xs"
              aria-label="Toggle coordinate lock"
              aria-pressed={locked}
              onClick={() => setLocked(!locked)}>
              {locked ? '🔒' : '🔓'}
            </Button>
          }>
          Coordinates
        </PropertyLabel>
        <PropertyControl
          association="group"
          labelledBy={`${id}-label`}
          aria-describedby={`${id}-help`}
          css={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          {(['x', 'y'] as const).map((axis) => (
            <label key={axis}>
              {axis.toUpperCase()}
              <input
                className={inputClass}
                value={coordinates[axis]}
                readOnly={locked}
                onChange={(e) => setCoordinates({ ...coordinates, [axis]: e.currentTarget.value })}
              />
            </label>
          ))}
        </PropertyControl>
        <PropertyDescription id={`${id}-help`}>每个坐标输入都有独立的名称。</PropertyDescription>
      </PropertyRow>
      <StatePanel label="State" value={{ coordinates, locked }} />
    </ContractFrame>
  )
}

function NarrowExample() {
  const id = useId()
  const [column, setColumn] = useState(false)
  const [value, setValue] = useState('Long value')
  return (
    <ContractFrame
      title="窄属性行与长说明"
      description="在 200px 容器中，标签和说明随宽度换行；可切换为标签位于控件上方的布局。全宽操作行使用 withoutLabel，并为按钮本身提供清晰名称。"
      onReset={() => {
        setColumn(false)
        setValue('Long value')
      }}>
      <label>
        <input type="checkbox" checked={column} onChange={(e) => setColumn(e.currentTarget.checked)} /> Stack label
        above control
      </label>
      <div style={{ width: 200, maxWidth: '100%' }}>
        <PropertyRow direction={column ? 'column' : 'row'}>
          <PropertyLabel htmlFor={id}>A long property label without truncation</PropertyLabel>
          <PropertyControl association="control">
            <input
              id={id}
              className={inputClass}
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
              aria-describedby={`${id}-help`}
            />
          </PropertyControl>
          <PropertyDescription id={`${id}-help`}>Averylongunbrokendescriptionmuststayinsidetherow.</PropertyDescription>
        </PropertyRow>
        <PropertyRow withoutLabel>
          <PropertyControl association="none">
            <Button css={{ width: '100%' }}>Full width action</Button>
          </PropertyControl>
        </PropertyRow>
      </div>
      <StatePanel label="State" value={{ direction: column ? 'column' : 'row', value }} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'PropertyRow 用于把标签、控件和说明排列成属性行。单个输入框用 PropertyLabel 的 htmlFor 关联真实控件 id；多个控件用 PropertyControl 的 group 关联共享标签，并给每个控件单独命名。输入值和回调继续由应用传给控件，帮助文字通过 aria-describedby 与对应控件关联。',
      },
    },
  },
  title: 'Layout/PropertyRow',
  component: PropertyRow,
} satisfies Meta<typeof PropertyRow>
export default meta
type Story = StoryObj<typeof meta>
export const SingleControl: Story = { render: () => <SingleControlExample /> }
export const ControlGroup: Story = { render: () => <ControlGroupExample /> }
export const NarrowAndUnlabelled: Story = { render: () => <NarrowExample /> }
