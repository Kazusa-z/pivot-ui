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
      title="Explicit single control"
      description="点击 Name 聚焦输入；说明直接呈现并通过 aria-describedby 关联。布局不查找或改写控件。"
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
        {help && <PropertyDescription id={`${id}-help`}>This field accepts a human-readable name.</PropertyDescription>}
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
      title="Explicit control group"
      description="Coordinates 命名整个组；X/Y 保留自己的名称。标签旁的按钮是独立操作，不混入组名称。"
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
        <PropertyDescription id={`${id}-help`}>Each axis has its own control name.</PropertyDescription>
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
      title="Narrow rows and long content"
      description="200px 容器内标签与说明可换行；无标签行显式声明 withoutLabel。"
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

const meta = { title: 'Layout/PropertyRow', component: PropertyRow } satisfies Meta<typeof PropertyRow>
export default meta
type Story = StoryObj<typeof meta>
export const SingleControl: Story = { render: () => <SingleControlExample /> }
export const ControlGroup: Story = { render: () => <ControlGroupExample /> }
export const NarrowAndUnlabelled: Story = { render: () => <NarrowExample /> }
