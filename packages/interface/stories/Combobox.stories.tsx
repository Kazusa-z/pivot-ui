import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { Combobox, type SingleComboboxProps } from '../src/controls/choices/Combobox'
import { Checkbox } from '../src/controls/choices/Checkbox'
import type { ChoiceOption, ChoiceValue } from '../src/values'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const layers: readonly ChoiceOption<string>[] = [
  'Default',
  'TransparentFX',
  'Ignore Raycast',
  'Water',
  'UI',
  'Player',
  'Enemies',
  'Projectiles',
  'Environment',
  'Props',
  'Triggers',
  'PostProcessing',
].map((label) => ({ key: label, label, value: label }))
const tags: readonly ChoiceOption<string>[] = [
  ...['Static', 'Navigation', 'Occluder', 'Occludee', 'Reflection Probe'].map((label) => ({
    key: label,
    label,
    value: label,
  })),
  {
    key: 'lightmap',
    label: 'Contribute GI',
    value: 'gi',
    disabled: true,
    disabledReason: 'Lightmapping is disabled for this scene',
  },
]

// Single-selection props shared by the gallery stories.
const single = {
  'aria-label': 'Layer',
  options: layers,
  value: 'Player',
  searchable: true,
} satisfies SingleComboboxProps<string>

const meta = {
  title: 'Controls/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '可搜索的下拉选择，支持单选和多选（`multiple`）。',
    use: [
      '选项较多、需要按名称查找：图层、标签、材质名',
      '多选：`multiple` 模式下 `value` 和 `onValueChange` 始终是数组',
    ],
    avoid: ['少量固定选项 → 用 `Select`', '引用一个资源（带缩略图、预览）→ 用 `AssetField`'],
    related: ['`Select`：无搜索、单选', '`ToggleGroup`：少量选项的多选平铺'],
    notes: [
      '单选时 `value` 是单个值或 `null`；`multiple` 时 `value`、`defaultValue` 和 `onValueChange` 都是数组',
      '搜索词只影响过滤，不改变已选值；需要远程搜索时在 `onSearch` 里更新 `options`',
    ],
    keyboard: [
      ['Enter / ↓', '打开浮层'],
      ['输入文字', '过滤选项'],
      ['↑ / ↓ + Enter', '选择高亮项'],
      ['Escape', '关闭浮层'],
    ],
  }),
  args: { 'aria-label': 'Layer', options: layers, searchable: true, onValueChange: fn() },
} satisfies Meta<typeof Combobox>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<string | null>('Player')
    return (
      <Column width={220}>
        <Combobox
          {...(args as SingleComboboxProps)}
          options={layers}
          value={value}
          onValueChange={(next) => setValue(next as string | null)}
        />
      </Column>
    )
  },
}

/** 多选时触发器显示已选标签，`showSelectAll` 一次选择所有可用项，禁用项保留并说明原因。 */
export const Multiple: Story = {
  render: function Render() {
    const [value, setValue] = useState<readonly string[]>(['Static', 'Navigation'])
    return (
      <Column width={280}>
        <Combobox aria-label="Tags" multiple options={tags} value={value} onValueChange={setValue} showSelectAll />
      </Column>
    )
  },
}

/** 与 `Select` 相同的三档高度。 */
export const Sizes: Story = {
  render: () => (
    <Row>
      {(['xs', 'sm', 'md'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ xs: 20, sm: 24, md: 32 }[size]}px`}>
          <Combobox {...single} size={size} css={{ width: '180px' }} />
        </Item>
      ))}
    </Row>
  ),
}

/** 未选择、空列表、只读和禁用。 */
export const States: Story = {
  render: () => (
    <Row>
      <Item label="placeholder">
        <Combobox {...single} value={null} placeholder="Choose a layer" css={{ width: '180px' }} />
      </Item>
      <Item label="no options">
        <Combobox {...single} options={[]} value={null} emptyText="No layers" css={{ width: '180px' }} />
      </Item>
      <Item label="readOnly">
        <Combobox {...single} readOnly css={{ width: '180px' }} />
      </Item>
      <Item label="disabled">
        <Combobox {...single} disabled css={{ width: '180px' }} />
      </Item>
    </Row>
  ),
}

const typedOptions: readonly ChoiceOption[] = [
  { key: 'string-leading', label: 'String "001"', value: '001' },
  { key: 'number-one', label: 'Number 1', value: 1 },
  { key: 'string-one', label: 'String "1"', value: '1' },
  { key: 'empty-string', label: 'Empty string', value: '' },
]

/** 多选的受控请求：勾选 Reject 后请求被记录但不被接受；值保持原始类型。 */
export const BehaviorControlledRequests: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<readonly ChoiceValue[]>(['001', 1])
    const [reject, setReject] = useState(false)
    const [requests, setRequests] = useState<string[]>([])
    return (
      <Column width={300}>
        <Combobox
          aria-label="Typed values"
          multiple
          showSelectAll
          options={typedOptions}
          value={value}
          onValueChange={(next) => {
            setRequests((items) => [...items.slice(-5), JSON.stringify(next)])
            if (!reject) setValue(next)
          }}
        />
        <Checkbox label="Reject requests" checked={reject} onCheckedChange={(checked) => setReject(checked === true)} />
        <StateView value={{ value, requests }} />
      </Column>
    )
  },
}
