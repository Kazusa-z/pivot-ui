import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { SegmentControl } from '../src/controls/choices/SegmentControl'
import { Checkbox } from '../src/controls/choices/Checkbox'
import type { ChoiceOption } from '../src/values'
import { describeComponent } from './support/describe'
import { Column, Item, StateView } from './support/layout'

const spaces: readonly ChoiceOption<string>[] = [
  { key: 'local', label: 'Local', value: 'local' },
  { key: 'world', label: 'World', value: 'world' },
  { key: 'normal', label: 'Normal', value: 'normal', disabled: true, disabledReason: 'Only available for meshes' },
]

const meta = {
  title: 'Controls/SegmentControl',
  component: SegmentControl,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '把 2–4 个互斥选项平铺成一排，始终有且只有一个选中。',
    use: ['坐标空间（Local / World）、视图模式（Grid / List）这类一眼要看到全部选项的切换'],
    avoid: [
      '选项多于 4 个或文字很长 → 用 `Select`',
      '可以都不选、或可以多选 → 用 `ToggleGroup`',
      '布尔开关 → 用 `Checkbox`',
    ],
    related: ['`ToggleGroup`：按钮组，可取消、可多选', '`Select`：下拉，节省空间'],
    keyboard: [
      ['← / →', '在选项间移动并选中'],
      ['Tab', '进入 / 离开整组'],
    ],
  }),
  args: { 'aria-label': 'Coordinate space', options: spaces, value: 'local', onValueChange: fn() },
} satisfies Meta<typeof SegmentControl<string>>
export default meta
type Story = StoryObj<typeof meta>

/** 默认占满容器宽度，每段等宽。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <Column width={280}>
        <SegmentControl
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

/** `subtle`（默认）把选中项从中性轨道上抬起，适合面板里大量出现；`solid` 用强调色填充，用于需要强调当前模式的位置。 */
export const Variants: Story = {
  render: (args) => (
    <Column width={280}>
      {(['subtle', 'solid'] as const).map((variant) => (
        <Item key={variant} label={variant}>
          <SegmentControl {...args} variant={variant} />
        </Item>
      ))}
    </Column>
  ),
}

/** `sm` 24 用于面板，`md` 32 / `lg` 36 用于表单。 */
export const Sizes: Story = {
  render: (args) => (
    <Column width={280}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ sm: 24, md: 32, lg: 36 }[size]}px`}>
          <SegmentControl {...args} size={size} />
        </Item>
      ))}
    </Column>
  ),
}

/** 只读可以用键盘浏览但不修改；禁用跳过整组。 */
export const States: Story = {
  render: (args) => (
    <Column width={280}>
      <Item label="readOnly">
        <SegmentControl {...args} readOnly />
      </Item>
      <Item label="disabled">
        <SegmentControl {...args} disabled />
      </Item>
    </Column>
  ),
}

/** 受控请求：勾选 Reject 后选择请求被记录但不被接受，显示保持原值。 */
export const BehaviorControlledRequests: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState('local')
    const [reject, setReject] = useState(false)
    const [requests, setRequests] = useState<string[]>([])
    return (
      <Column width={280}>
        <SegmentControl
          aria-label="Requests"
          options={spaces}
          value={value}
          onValueChange={(next) => {
            setRequests((items) => [...items.slice(-5), next])
            if (!reject) setValue(next)
          }}
        />
        <Checkbox label="Reject requests" checked={reject} onCheckedChange={setReject} />
        <StateView value={{ value, requests }} />
      </Column>
    )
  },
}
