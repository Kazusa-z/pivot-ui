import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Select } from '../src/widgets/choices/Select'
import { Dialog } from '../src/widgets/dialogs/Dialog'
import type { ChoiceOption, ChoiceValue } from '../src/values'
import { css } from '../styled-system/css'

const options: readonly ChoiceOption[] = [
  { key: 'string-leading', label: 'String 001', value: '001' },
  { key: 'number-one', label: 'Number 1', value: 1 },
  { key: 'string-one', label: 'String 1', value: '1' },
  { key: 'empty-string', label: 'Empty string', value: '' },
  {
    key: 'locked',
    label: 'Unavailable',
    value: 'locked',
    disabled: true,
    disabledReason: 'Unavailable in this workspace',
  },
]
const frame = css({ display: 'grid', gap: '12px', width: 'min(360px, 100%)' })
const meta = {
  title: 'Widgets/Choices/Select',
  component: Select,
  tags: ['autodocs'],
  args: { options },
} satisfies Meta<typeof Select>
export default meta
type Story = StoryObj<typeof meta>
function SelectExample() {
  const [value, setValue] = useState<ChoiceValue | null>(null)
  const [request, setRequest] = useState<ChoiceValue | null>(null)
  const [reject, setReject] = useState(false)
  return (
    <div className={frame}>
      <label htmlFor="choice-select">Identity-preserving selection</label>
      <Select
        id="choice-select"
        options={options}
        value={value}
        onValueChange={(next) => {
          setRequest(next)
          if (!reject) setValue(next)
        }}
      />
      <label>
        <input type="checkbox" checked={reject} onChange={(event) => setReject(event.target.checked)} /> Reject requests
      </label>
      <button
        onClick={() => {
          setValue(null)
          setRequest(null)
          setReject(false)
        }}>
        Reset
      </button>
      <pre>{JSON.stringify({ value, type: typeof value, lastRequest: request }, null, 2)}</pre>
    </div>
  )
}
export const Overview: Story = { render: () => <SelectExample /> }
export const Availability: Story = {
  render: () => (
    <div className={frame}>
      <Select aria-label="Empty options" options={[]} />
      <Select aria-label="Disabled choice" options={options} defaultValue={1} disabled />
      <Select aria-label="Readonly choice" options={options} defaultValue="001" readOnly />
      <Select aria-label="Uncontrolled choice" options={options} defaultValue="" />
    </div>
  ),
}
export const InDialog: Story = {
  render: () => (
    <Dialog
      trigger={<button>Open choice dialog</button>}
      title="Choose a value"
      description="The selection popup inherits the dialog theme and layer.">
      <Select aria-label="Dialog choice" options={options} defaultValue={1} />
    </Dialog>
  ),
}
