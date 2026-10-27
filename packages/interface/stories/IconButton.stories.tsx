import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import {
  IconArrowsMove,
  IconDots,
  IconEye,
  IconLock,
  IconMaximize,
  IconPlus,
  IconRotate,
  IconTrash,
} from '@tabler/icons-react'
import { IconButton, IconButtonGroup } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Item, Row } from './support/layout'

const meta = {
  title: 'Controls/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '只有图标的方形按钮，用于工具栏和面板里的常用操作；`IconButtonGroup` 把相关按钮拼成一组。',
    use: [
      '工具栏操作：添加、删除、显示 / 隐藏、锁定',
      '互斥的工具切换（移动 / 旋转 / 缩放）：用 `active` 标出当前工具',
      'Section 标题栏、表格行末尾的小操作',
    ],
    avoid: ['含义不容易从图标看出的操作 → 用带文字的 `Button`', '多选开关组 → 用 `ToggleGroup`，它负责选中状态和键盘'],
    related: ['`Button`：带文字', '`ToggleGroup`：一组可选中的按钮，自带单选 / 多选语义'],
    notes: ['必须提供 `aria-label`，它也是唯一的文字说明；需要悬停提示时用 `Tooltip` 包住'],
    keyboard: [['Enter / Space', '触发按钮']],
  }),
  args: { 'aria-label': 'Add', children: <IconPlus />, onClick: fn() },
} satisfies Meta<typeof IconButton>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** `soft` 默认；`outline` 带边框；`subtle` 悬停才显示底色，适合标题栏；`ghost` 始终无底色。 */
export const Variants: Story = {
  render: (args) => (
    <Row>
      {(['soft', 'outline', 'subtle', 'ghost'] as const).map((variant) => (
        <Item key={variant} label={variant}>
          <IconButton {...args} variant={variant} />
        </Item>
      ))}
    </Row>
  ),
}

/** 与 `Button` 相同的四档高度。 */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ xs: 20, sm: 24, md: 32, lg: 36 }[size]}px`}>
          <IconButton {...args} size={size} />
        </Item>
      ))}
    </Row>
  ),
}

/** `active` 表示当前选中的工具；`corner` 提示还有展开菜单；禁用与加载同 `Button`。 */
export const States: Story = {
  render: (args) => (
    <Row>
      <Item label="active">
        <IconButton {...args} active aria-label="Move tool">
          <IconArrowsMove />
        </IconButton>
      </Item>
      <Item label="corner">
        <IconButton {...args} corner aria-label="More options">
          <IconDots />
        </IconButton>
      </Item>
      <Item label="disabled">
        <IconButton {...args} disabled aria-label="Delete">
          <IconTrash />
        </IconButton>
      </Item>
      <Item label="loading">
        <IconButton {...args} loading />
      </Item>
    </Row>
  ),
}

/** 一组互斥的工具：组的 `size` 与按钮一致，外侧圆角才能对齐。 */
export const ToolGroup: Story = {
  render: function Render() {
    const [tool, setTool] = useState('move')
    const tools = [
      { key: 'move', label: 'Move', icon: <IconArrowsMove /> },
      { key: 'rotate', label: 'Rotate', icon: <IconRotate /> },
      { key: 'scale', label: 'Scale', icon: <IconMaximize /> },
    ]
    return (
      <Row>
        {(['horizontal', 'vertical'] as const).map((direction) => (
          <IconButtonGroup
            key={direction}
            direction={direction}
            size="sm"
            aria-label={`Transform tools (${direction})`}>
            {tools.map(({ key, label, icon }) => (
              <IconButton key={key} aria-label={label} active={tool === key} onClick={() => setTool(key)}>
                {icon}
              </IconButton>
            ))}
          </IconButtonGroup>
        ))}
      </Row>
    )
  },
}

/** 标题栏里的低强调操作使用 `subtle`。 */
export const InToolbar: Story = {
  render: () => (
    <Row>
      <IconButton variant="subtle" aria-label="Show">
        <IconEye />
      </IconButton>
      <IconButton variant="subtle" aria-label="Lock">
        <IconLock />
      </IconButton>
      <IconButton variant="subtle" aria-label="Delete">
        <IconTrash />
      </IconButton>
    </Row>
  ),
}
