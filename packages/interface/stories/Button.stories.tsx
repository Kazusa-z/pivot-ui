import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { IconDeviceFloppy, IconExternalLink, IconPlus, IconTrash } from '@tabler/icons-react'
import { Button } from '../src/controls/buttons'
import { Kbd } from '../src/display/Kbd'
import { describeComponent } from './support/describe'
import { Item, Row } from './support/layout'

const meta = {
  title: 'Controls/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '带文字的按钮，用来执行一个操作。',
    use: [
      '对话框和表单里的确定、取消、保存',
      '工具栏或面板里需要文字说明的操作，例如"添加对象"',
      '会请求服务器的操作：传入 `async`，等待期间自动显示加载并阻止重复点击',
    ],
    avoid: [
      '只有图标的工具按钮 → 用 `IconButton`',
      '在几个选项之间切换 → 用 `SegmentControl` 或 `ToggleGroup`',
      '跳转到其他页面 → 用 `asChild` 包一个链接，或直接用 `Link`',
    ],
    related: [
      '`IconButton`：只有图标、有 `active` 状态，适合工具栏',
      '`DropdownMenuTrigger`：用 `asChild` 包住 Button，点击后展开菜单',
    ],
    keyboard: [['Enter / Space', '触发按钮']],
  }),
  args: { children: 'Save', onClick: fn() },
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

/** 默认是 soft、24px 的紧凑按钮，适合放在面板和工具栏里。 */
export const Basic: Story = {}

/** 一组操作里只放一个 `solid` 作为主要操作，其余用 `soft` 或 `outline`；`subtle` 用于标题栏等低强调位置。 */
export const Variants: Story = {
  render: (args) => (
    <Row>
      <Button {...args} variant="solid">
        Solid
      </Button>
      <Button {...args} variant="soft">
        Soft
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="subtle">
        Subtle
      </Button>
      <Button {...args} variant="inverted">
        Inverted
      </Button>
    </Row>
  ),
}

/** `critical` 用于删除、覆盖等不可逆操作；`positive` 用于发布、应用等确认操作。可与任意 variant 组合。 */
export const Intent: Story = {
  render: (args) => (
    <Row>
      <Button {...args} critical variant="solid" startSlot={<IconTrash />}>
        Delete
      </Button>
      <Button {...args} critical variant="soft">
        Discard changes
      </Button>
      <Button {...args} positive variant="solid">
        Publish
      </Button>
      <Button {...args} positive variant="outline">
        Apply
      </Button>
    </Row>
  ),
}

/** 紧凑档 `xs` 20 / `sm` 24 用于工具栏和属性面板；常规档 `md` 32 / `lg` 36 用于对话框和表单。 */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Item key={size} label={`${size} · ${{ xs: 20, sm: 24, md: 32, lg: 36 }[size]}px`}>
          <Button {...args} size={size}>
            Button
          </Button>
        </Item>
      ))}
    </Row>
  ),
}

/** `startSlot` 放图标，`endSlot` 放外链标记、快捷键或单位。 */
export const WithSlots: Story = {
  render: (args) => (
    <Row>
      <Button {...args} startSlot={<IconPlus />}>
        Add object
      </Button>
      <Button {...args} variant="outline" endSlot={<IconExternalLink />}>
        Open docs
      </Button>
      <Button {...args} variant="subtle" startSlot={<IconDeviceFloppy />} endSlot={<Kbd>⌘S</Kbd>}>
        Save
      </Button>
    </Row>
  ),
}

/** 禁用时半透明且不可聚焦点击；加载时显示 Spin 并阻止重复点击。传入 `async` 时加载状态自动管理。 */
export const States: Story = {
  render: (args) => (
    <Row>
      <Item label="disabled">
        <Button {...args} disabled>
          Save
        </Button>
      </Item>
      <Item label="loading">
        <Button {...args} loading>
          Save
        </Button>
      </Item>
      <Item label="loading + startSlot">
        <Button {...args} loading startSlot={<IconDeviceFloppy />}>
          Save
        </Button>
      </Item>
      <Item label="async（点击后等待 1.5s）">
        <Button {...args} variant="solid" async={() => new Promise((resolve) => setTimeout(resolve, 1500))}>
          Save
        </Button>
      </Item>
    </Row>
  ),
}
