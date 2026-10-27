import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { IconWorld } from '@tabler/icons-react'
import { Select } from '../src/controls/choices/Select'
import { Checkbox } from '../src/controls/choices/Checkbox'
import type { ChoiceOption, ChoiceValue } from '../src/values'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const blendModes: readonly ChoiceOption<string>[] = [
  { key: 'opaque', label: 'Opaque', value: 'opaque' },
  { key: 'cutout', label: 'Cutout', value: 'cutout' },
  { key: 'transparent', label: 'Transparent', value: 'transparent' },
  {
    key: 'additive',
    label: 'Additive',
    value: 'additive',
    disabled: true,
    disabledReason: 'Requires the HDR pipeline',
  },
]

const meta = {
  title: 'Controls/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '从一组固定选项中选择一个值。',
    use: ['枚举类属性：混合模式、坐标空间、插值方式', '选项不多（大约 15 个以内）、不需要搜索'],
    avoid: [
      '选项很多或需要搜索、多选 → 用 `Combobox`',
      '2–4 个选项且希望一眼看到全部 → 用 `SegmentControl`',
      '开关 → 用 `Checkbox`',
    ],
    related: ['`Combobox`：可搜索、可多选', '`SegmentControl`：选项平铺显示'],
    notes: [
      '`value` 可以是字符串、数字或布尔值，`onValueChange` 原样返回选项的 `value`；`key` 只用于识别选项',
      '禁用的选项保留在列表里，并通过 `disabledReason` 说明原因',
    ],
    keyboard: [
      ['Enter / Space / ↓', '打开列表'],
      ['↑ / ↓', '移动高亮'],
      ['Enter', '选择高亮项'],
      ['Escape', '关闭列表'],
    ],
  }),
  args: { 'aria-label': 'Blend mode', options: blendModes, value: 'opaque', onValueChange: fn() },
} satisfies Meta<typeof Select<string>>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <Column width={200}>
        <Select
          {...args}
          value={value}
          onValueChange={(next) => {
            args.onValueChange?.(next)
            setValue(next)
          }}
        />
      </Column>
    )
  },
}

/** `soft` 默认，适合面板；`outline` 适合独立字段；`subtle` 无底色，适合工具栏。 */
export const Variants: Story = {
  render: (args) => (
    <Row>
      {(['soft', 'outline', 'subtle'] as const).map((variant) => (
        <Item key={variant} label={variant}>
          <Select {...args} variant={variant} css={{ width: '160px' }} />
        </Item>
      ))}
    </Row>
  ),
}

/** `xs` 20 / `sm` 24 用于面板和工具栏，`md` 32 用于表单；列表项高度随之变化。 */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {(['xs', 'sm', 'md'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ xs: 20, sm: 24, md: 32 }[size]}px`}>
          <Select {...args} size={size} />
        </Item>
      ))}
    </Row>
  ),
}

/** 未选择时显示 `placeholder`；只读可以展开查看但不能修改；`startSlot` 放图标。 */
export const States: Story = {
  render: (args) => (
    <Row>
      <Item label="placeholder">
        <Select {...args} value={null} placeholder="Choose a mode" css={{ width: '160px' }} />
      </Item>
      <Item label="startSlot">
        <Select {...args} startSlot={<IconWorld />} css={{ width: '160px' }} />
      </Item>
      <Item label="readOnly">
        <Select {...args} readOnly css={{ width: '160px' }} />
      </Item>
      <Item label="disabled">
        <Select {...args} disabled css={{ width: '160px' }} />
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

/** 受控值由应用决定：勾选 Reject 后，选择请求被记录但不被接受，显示保持原值。也用于检查 1 / "1" / "" 等值保持原始类型。 */
export const BehaviorControlledRequests: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<ChoiceValue | null>('001')
    const [reject, setReject] = useState(false)
    const [requests, setRequests] = useState<string[]>([])
    return (
      <Column width={260}>
        <Select
          aria-label="Typed value"
          options={typedOptions}
          value={value}
          onValueChange={(next) => {
            setRequests((items) => [...items.slice(-5), `${typeof next}: ${JSON.stringify(next)}`])
            if (!reject) setValue(next)
          }}
        />
        <Checkbox label="Reject requests" checked={reject} onCheckedChange={(checked) => setReject(checked === true)} />
        <StateView value={{ value, valueType: typeof value, requests }} />
      </Column>
    )
  },
}
