import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ToggleGroup } from '../src/controls/choices/ToggleGroup'
import { Checkbox } from '../src/controls/choices/Checkbox'
import type { ChoiceOption } from '../src/values'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const tools: readonly ChoiceOption<string>[] = [
  { key: 'move', label: 'Move', value: 'move' },
  { key: 'rotate', label: 'Rotate', value: 'rotate' },
  { key: 'scale', label: 'Scale', value: 'scale' },
  { key: 'locked', label: 'Locked', value: 'locked', disabled: true, disabledReason: 'The object is locked' },
]
const overlays: readonly ChoiceOption<string>[] = [
  { key: 'grid', label: 'Grid', value: 'grid' },
  { key: 'gizmos', label: 'Gizmos', value: 'gizmos' },
  { key: 'stats', label: 'Stats', value: 'stats' },
]

const meta = {
  title: 'Controls/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '一组可以按下的按钮：`single` 最多选一个且可以取消，`multiple` 每个按钮独立开关。',
    use: ['当前工具（移动 / 旋转 / 缩放），再次点击可取消', '视口叠加层开关（网格、Gizmos、统计信息），可以同时开多个'],
    avoid: [
      '必须且只能选一个 → 用 `SegmentControl`',
      '开关一个属性 → 用 `Checkbox`',
      '只有图标的工具栏 → 用 `IconButtonGroup` + `IconButton active`',
    ],
    related: ['`SegmentControl`：总有一个选中', '`IconButtonGroup`：图标工具组'],
    notes: ['`type="single"` 时 `value` 是单个值或 `null`；`type="multiple"` 时 `value` 和 `onValueChange` 都是数组'],
    keyboard: [
      ['← / →', '在按钮间移动焦点'],
      ['Enter / Space', '按下或抬起'],
    ],
  }),
  args: { type: 'single', 'aria-label': 'Transform tool', options: tools, defaultValue: 'move' },
} satisfies Meta<typeof ToggleGroup<string>>
export default meta
type Story = StoryObj<typeof meta>

/** `single`：再次点击当前项会取消选中。 */
export const Basic: Story = {}

/** `multiple`：每个按钮独立开关，`value` 是数组。 */
export const Multiple: Story = {
  render: function Render() {
    const [value, setValue] = useState<readonly string[]>(['grid', 'gizmos'])
    return (
      <ToggleGroup
        type="multiple"
        aria-label="Viewport overlays"
        options={overlays}
        value={value}
        onValueChange={setValue}
      />
    )
  },
}

/** `solid`（默认）用强调色填充按下的按钮；`subtle` 用抬起的中性底，适合大量并排出现。 */
export const Variants: Story = {
  render: (args) => (
    <Column>
      {(['solid', 'subtle'] as const).map((variant) => (
        <Item key={variant} label={variant}>
          <ToggleGroup {...args} variant={variant} />
        </Item>
      ))}
    </Column>
  ),
}

/** `sm` 24 用于工具栏，`md` 32 / `lg` 36 用于表单。 */
export const Sizes: Story = {
  render: (args) => (
    <Column>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ sm: 24, md: 32, lg: 36 }[size]}px`}>
          <ToggleGroup {...args} size={size} />
        </Item>
      ))}
    </Column>
  ),
}

/** 只读可以浏览但不修改；禁用跳过整组。 */
export const States: Story = {
  render: (args) => (
    <Row>
      <Item label="readOnly">
        <ToggleGroup {...args} readOnly />
      </Item>
      <Item label="disabled">
        <ToggleGroup {...args} disabled />
      </Item>
    </Row>
  ),
}

/** 受控请求：勾选 Reject 后请求被记录但不被接受。 */
export const BehaviorControlledRequests: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState<readonly string[]>(['grid'])
    const [reject, setReject] = useState(false)
    const [requests, setRequests] = useState<string[]>([])
    return (
      <Column>
        <ToggleGroup
          type="multiple"
          aria-label="Requests"
          options={overlays}
          value={value}
          onValueChange={(next) => {
            setRequests((items) => [...items.slice(-5), JSON.stringify(next)])
            if (!reject) setValue(next)
          }}
        />
        <Checkbox label="Reject requests" checked={reject} onCheckedChange={setReject} />
        <StateView value={{ value, requests }} />
      </Column>
    )
  },
}
