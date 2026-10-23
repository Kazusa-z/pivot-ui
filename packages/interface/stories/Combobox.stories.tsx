import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Combobox } from '../src/widgets/choices/Combobox'
import type { ChoiceOption, ChoiceValue } from '../src/values'
import { css } from '../styled-system/css'

const options: readonly ChoiceOption[] = [
  { key: 'leading', label: 'String 001', value: '001' },
  { key: 'numeric', label: 'Number 1', value: 1 },
  { key: 'string', label: 'String 1', value: '1' },
  { key: 'empty', label: 'Empty string', value: '' },
  { key: 'locked', label: 'Locked choice', value: 'locked', disabled: true, disabledReason: 'Managed by the host' },
  { key: 'long', label: 'A long option label that remains readable in the popup', value: 'long' },
]
const frame = css({ display: 'grid', gap: '12px', width: 'min(360px, 100%)' })
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'Combobox 适合从较多选项中搜索并选择一项或多项。options 提供稳定 key、显示 label 和原始 value，onValueChange 返回选中的值；multiple 模式始终使用数组。搜索文字与选中值分开，应用通过 value 接受选择请求；数字与字符串保持各自类型，单选 null 表示未选择。',
      },
    },
  },
  title: 'Widgets/Choices/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  args: { options, multiple: false },
} satisfies Meta<typeof Combobox>
export default meta
type Story = StoryObj<typeof meta>
function SingleExample() {
  const [value, setValue] = useState<ChoiceValue | null>(null)
  return (
    <div className={frame}>
      <label htmlFor="single-search">Search one option</label>
      <Combobox id="single-search" options={options} value={value} onValueChange={setValue} />
      <button onClick={() => setValue(null)}>Reset</button>
      <pre>{JSON.stringify({ value, type: typeof value }, null, 2)}</pre>
    </div>
  )
}
function MultipleExample() {
  const [value, setValue] = useState<readonly ChoiceValue[]>(['001', 1, 'locked'])
  const [lastRequest, setLastRequest] = useState<readonly ChoiceValue[] | null>(null)
  const [reject, setReject] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  return (
    <div className={frame}>
      <label htmlFor="multiple-search">Search multiple options</label>
      <Combobox
        id="multiple-search"
        multiple
        options={options}
        value={value}
        onValueChange={(next) => {
          setLastRequest(next)
          if (!reject) setValue(next)
        }}
        disabled={disabled}
        readOnly={readOnly}
        showSelectAll
      />
      <label>
        <input type="checkbox" checked={reject} onChange={(event) => setReject(event.target.checked)} /> Reject requests
      </label>
      <label>
        <input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} /> Disabled
      </label>
      <label>
        <input type="checkbox" checked={readOnly} onChange={(event) => setReadOnly(event.target.checked)} /> Readonly
      </label>
      <button
        onClick={() => {
          setValue(['001', 1, 'locked'])
          setLastRequest(null)
          setReject(false)
          setDisabled(false)
          setReadOnly(false)
        }}>
        Reset
      </button>
      <pre>{JSON.stringify({ value, lastRequest }, null, 2)}</pre>
    </div>
  )
}
export const Overview: Story = { render: () => <SingleExample /> }
export const Multiple: Story = { render: () => <MultipleExample /> }
export const EmptyAndUncontrolled: Story = {
  render: () => (
    <div className={frame}>
      <Combobox aria-label="No options" options={[]} />
      <Combobox
        aria-label="Uncontrolled options"
        multiple
        options={options}
        defaultValue={['001', 1]}
        searchable={false}
      />
    </div>
  ),
}
