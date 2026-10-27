import type { Meta, StoryObj } from '@storybook/react'
import { IconArrowsMove, IconRotate, IconMaximize } from '@tabler/icons-react'
import { Tooltip, TooltipProvider } from '../src/overlays'
import { Button, IconButton, IconButtonGroup } from '../src/controls/buttons'
import { KbdGroup } from '../src/display/Kbd'
import { describeComponent } from './support/describe'
import { Row } from './support/layout'

const meta = {
  title: 'Overlays/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '悬停或聚焦时显示的一句简短提示。',
    use: ['图标按钮的名称和快捷键', '截断文字的完整内容'],
    avoid: [
      '必要的信息（用户不悬停就看不到）→ 写在可见文字里',
      '可以点击或输入的内容 → 用 `Popover`',
      '较丰富的预览 → 用 `HoverCard`',
    ],
    related: ['`HoverCard`：悬停预览卡片', '`Popover`：点击打开、可交互'],
    notes: ['应用根部需要一个 `TooltipProvider`，统一延迟时间，并让相邻提示之间快速切换'],
  }),
  decorators: [(Story) => <TooltipProvider delayDuration={300}>{Story()}</TooltipProvider>],
  argTypes: { trigger: { control: false } },
  args: { trigger: <Button variant="outline">Hover or focus</Button>, children: 'Resize the active object' },
} satisfies Meta<typeof Tooltip>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** 工具栏图标按钮：提示显示名称和快捷键，`aria-label` 仍是按钮的无障碍名称。 */
export const ToolbarHints: Story = {
  render: () => (
    <IconButtonGroup aria-label="Transform tools">
      {[
        { label: 'Move', shortcut: 'w', icon: <IconArrowsMove /> },
        { label: 'Rotate', shortcut: 'e', icon: <IconRotate /> },
        { label: 'Scale', shortcut: 'r', icon: <IconMaximize /> },
      ].map(({ label, shortcut, icon }) => (
        <Tooltip
          key={label}
          trigger={<IconButton aria-label={label}>{icon}</IconButton>}
          contentProps={{ side: 'bottom' }}>
          <Row>
            {label} <KbdGroup shortcuts={shortcut} size="xs" />
          </Row>
        </Tooltip>
      ))}
    </IconButtonGroup>
  ),
}

/** `contentProps.side` 控制方向。 */
export const Placement: Story = {
  render: () => (
    <Row>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side} trigger={<Button variant="outline">{side}</Button>} contentProps={{ side }}>
          Tooltip on the {side}
        </Tooltip>
      ))}
    </Row>
  ),
}
