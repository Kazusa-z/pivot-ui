import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '../src/controls/inputs'
import { describeComponent } from './support/describe'
import { Column, Item, Row } from './support/layout'

const meta = {
  title: 'Controls/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '单行文本输入框，可以在框内放图标、前缀和单位。',
    use: ['名称、路径、搜索关键字等单行文字', '带单位或前缀的文字输入：`startSlot` / `endSlot`'],
    avoid: [
      '数字 → 用 `NumberInput`，支持拖动、步进和范围',
      '多行文字 → 用 `Textarea`',
      '平时只显示、双击才编辑的名称 → 用 `EditableText`',
      '需要提交 / 取消 / 保存失败处理的属性 → 用 `PropertyField`',
    ],
    related: ['`Textarea`：多行', '`EditableText`：先展示、再编辑', '`Combobox`：可搜索的选项'],
    notes: ['`onValueChange` 直接收到字符串；原生 `onChange` 仍然可用', '没有可见标签时提供 `aria-label`'],
  }),
  args: { 'aria-label': 'Object name', placeholder: 'Object name', onValueChange: fn() },
} satisfies Meta<typeof Input>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** `soft` 默认，适合面板内嵌；`outline` 适合独立字段；`subtle` 无底色，只在聚焦时显示边框。 */
export const Variants: Story = {
  render: (args) => (
    <Column width={240}>
      {(['soft', 'outline', 'subtle'] as const).map((variant) => (
        <Item key={variant} label={variant}>
          <Input {...args} variant={variant} defaultValue="Scene 001" />
        </Item>
      ))}
    </Column>
  ),
}

/** 紧凑档 `xs` 20 / `sm` 24 用于面板，常规档 `md` 32 / `lg` 36 用于表单。 */
export const Sizes: Story = {
  render: (args) => (
    <Column width={240}>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ xs: 20, sm: 24, md: 32, lg: 36 }[size]}px`}>
          <Input {...args} size={size} defaultValue="material.mat" />
        </Item>
      ))}
    </Column>
  ),
}

/** 图标、前缀放 `startSlot`，单位、扩展名放 `endSlot`。 */
export const WithSlots: Story = {
  render: (args) => (
    <Column width={240}>
      <Input {...args} aria-label="Search" placeholder="Search assets" startSlot={<IconSearch />} />
      <Input {...args} aria-label="File name" defaultValue="Scene 001" endSlot=".scene" />
      <Input {...args} aria-label="Width" defaultValue="1920" startSlot="W" endSlot="px" />
    </Column>
  ),
}

/** 校验状态只改变边框和文字色；只读保持正常颜色，可以选中和复制。 */
export const States: Story = {
  render: (args) => (
    <Row>
      <Item label="valid">
        <Input {...args} state="valid" defaultValue="Camera_Main" />
      </Item>
      <Item label="invalid">
        <Input {...args} state="invalid" defaultValue="Camera Main" aria-invalid />
      </Item>
      <Item label="readOnly">
        <Input {...args} readOnly defaultValue="Locked by prefab" />
      </Item>
      <Item label="disabled">
        <Input {...args} disabled defaultValue="Unavailable" />
      </Item>
    </Row>
  ),
}
