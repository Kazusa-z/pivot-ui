import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { Checkbox, type CheckboxState } from '../src/controls/choices/Checkbox'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const meta = {
  title: 'Controls/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '开关一个布尔属性，或在一组项目中选择多个。',
    use: ['布尔属性：Visible、Cast Shadows、Static', '表格和列表的多选（表头用 `indeterminate` 表示部分选中）'],
    avoid: [
      '在互斥选项之间切换 → 用 `SegmentControl`',
      '立即生效的工具开关（按钮外观）→ 用 `ToggleGroup` 或 `IconButton` 的 `active`',
    ],
    related: ['`ToggleGroup`：按钮外观的开关组'],
    notes: ['多个对象的值不一致时传 `checked="indeterminate"`；用户点击后总是得到明确的 `true` / `false`'],
    keyboard: [['Space', '切换']],
  }),
  args: { label: 'Cast shadows', defaultChecked: true, onCheckedChange: fn() },
} satisfies Meta<typeof Checkbox>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** 未勾选、勾选和部分选中。 */
export const CheckedStates: Story = {
  render: (args) => (
    <Row>
      <Checkbox {...args} defaultChecked={false} label="Unchecked" />
      <Checkbox {...args} defaultChecked label="Checked" />
      <Checkbox {...args} checked="indeterminate" label="Mixed" />
    </Row>
  ),
}

/** `sm` 14 用于紧凑面板，`md` 18 和 `lg` 22 用于表单。 */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ sm: 14, md: 18, lg: 22 }[size]}px`}>
          <Checkbox {...args} size={size} />
        </Item>
      ))}
    </Row>
  ),
}

/** 禁用不可交互；只读可以聚焦但点击不会修改。 */
export const States: Story = {
  render: (args) => (
    <Row>
      <Checkbox {...args} disabled label="Disabled" />
      <Checkbox {...args} readOnly label="Read only" />
      <Checkbox {...args} aria-invalid label="Invalid" defaultChecked={false} />
    </Row>
  ),
}

/** 表头复选框根据子项计算 `indeterminate`；点击表头全选或全不选。 */
export const SelectAll: Story = {
  render: function Render() {
    const items = ['Mesh', 'Material', 'Texture']
    const [selected, setSelected] = useState<readonly string[]>(['Mesh'])
    const all: CheckboxState = selected.length === items.length ? true : selected.length ? 'indeterminate' : false
    return (
      <Column>
        <Checkbox label="All assets" checked={all} onCheckedChange={(checked) => setSelected(checked ? items : [])} />
        {items.map((item) => (
          <Checkbox
            key={item}
            label={item}
            css={{ marginLeft: 'var(--space-5)' }}
            checked={selected.includes(item)}
            onCheckedChange={(checked) =>
              setSelected((current) => (checked ? [...current, item] : current.filter((value) => value !== item)))
            }
          />
        ))}
      </Column>
    )
  },
}

/** 受控请求：点击只发出请求，应用决定是否接受；部分选中被点击时请求的是布尔值。 */
export const BehaviorControlledRequests: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [checked, setChecked] = useState<CheckboxState>('indeterminate')
    const [requests, setRequests] = useState<boolean[]>([])
    return (
      <Column>
        <Checkbox
          label="Requests only"
          checked={checked}
          onCheckedChange={(next) => setRequests((items) => [...items.slice(-5), next])}
        />
        <Checkbox label="Accepts requests" checked={checked} onCheckedChange={setChecked} />
        <StateView value={{ checked, requests }} />
      </Column>
    )
  },
}
