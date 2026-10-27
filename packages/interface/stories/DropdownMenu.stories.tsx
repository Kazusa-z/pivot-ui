import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconCopy, IconDots, IconScissors, IconTrash } from '@tabler/icons-react'
import * as M from '../src/overlays/menus'
import { Button, IconButton } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const meta = {
  title: 'Overlays/DropdownMenu',
  component: M.DropdownMenuRoot,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '点击按钮展开的命令列表，支持图标、快捷键、勾选项、单选组和子菜单。',
    use: ['工具栏的"更多操作"', '对象的操作列表：复制、重命名、删除', '视图选项：勾选项和单选组'],
    avoid: [
      '在目标元素上右键 → 用 `ContextMenu`',
      '选择一个值并显示在按钮上 → 用 `Select`',
      '表单或自由内容 → 用 `Popover`',
    ],
    related: ['`ContextMenu`：右键菜单，使用相同的菜单项', '`Menubar`：应用顶部菜单栏', '`Select`：选值'],
    notes: [
      '由部件组合：`DropdownMenuRoot` → `DropdownMenuTrigger asChild` → `DropdownMenuPortal` → `DropdownMenuContent` → 各种 Item',
      '菜单项支持 `icon`、`shortcuts`（只显示）、`critical`；勾选和单选的值由应用保存',
      '勾选或单选后希望菜单保持打开时，在 `onSelect` 里调用 `event.preventDefault()`',
    ],
    keyboard: [
      ['Enter / Space / ↓', '在触发按钮上打开'],
      ['↑ / ↓', '移动高亮'],
      ['→ / ←', '打开 / 关闭子菜单'],
      ['输入字母', '跳到以该字母开头的项'],
      ['Escape', '关闭'],
    ],
  }),
  args: { size: 'sm' },
} satisfies Meta<typeof M.DropdownMenuRoot>
export default meta
type Story = StoryObj<typeof meta>

/** 一个完整的菜单：分组标题、图标与快捷键、禁用项、分隔线、子菜单和危险操作。 */
export const Basic: Story = {
  render: (args) => (
    <M.DropdownMenuRoot {...args}>
      <M.DropdownMenuTrigger asChild>
        <Button>Edit</Button>
      </M.DropdownMenuTrigger>
      <M.DropdownMenuPortal>
        <M.DropdownMenuContent aria-label="Edit actions" align="start" css={{ minWidth: '220px' }}>
          <M.DropdownMenuLabel>Clipboard</M.DropdownMenuLabel>
          <M.DropdownMenuItem icon={<IconScissors />} shortcuts="ctrl+x">
            Cut
          </M.DropdownMenuItem>
          <M.DropdownMenuItem icon={<IconCopy />} shortcuts="ctrl+c">
            Copy
          </M.DropdownMenuItem>
          <M.DropdownMenuItem disabled shortcuts="ctrl+v">
            Paste
          </M.DropdownMenuItem>
          <M.DropdownMenuSeparator />
          <M.DropdownMenuSub>
            <M.DropdownMenuSubTrigger>Align</M.DropdownMenuSubTrigger>
            <M.DropdownMenuPortal>
              <M.DropdownMenuSubContent>
                <M.DropdownMenuItem>Left</M.DropdownMenuItem>
                <M.DropdownMenuItem>Center</M.DropdownMenuItem>
                <M.DropdownMenuItem>Right</M.DropdownMenuItem>
              </M.DropdownMenuSubContent>
            </M.DropdownMenuPortal>
          </M.DropdownMenuSub>
          <M.DropdownMenuSeparator />
          <M.DropdownMenuItem critical icon={<IconTrash />} shortcuts="delete">
            Delete
          </M.DropdownMenuItem>
        </M.DropdownMenuContent>
      </M.DropdownMenuPortal>
    </M.DropdownMenuRoot>
  ),
}

/** 勾选项和单选组：值由应用保存；`onSelect` 里 `preventDefault()` 让菜单在选择后保持打开。 */
export const CheckAndRadio: Story = {
  render: function Render() {
    const [grid, setGrid] = useState(true)
    const [gizmos, setGizmos] = useState(false)
    const [shading, setShading] = useState('solid')
    const keepOpen = (event: Event) => event.preventDefault()
    return (
      <M.DropdownMenuRoot>
        <M.DropdownMenuTrigger asChild>
          <Button variant="outline">View</Button>
        </M.DropdownMenuTrigger>
        <M.DropdownMenuPortal>
          <M.DropdownMenuContent aria-label="View options" align="start" css={{ minWidth: '200px' }}>
            <M.DropdownMenuCheckboxItem checked={grid} onCheckedChange={setGrid} onSelect={keepOpen}>
              Grid
            </M.DropdownMenuCheckboxItem>
            <M.DropdownMenuCheckboxItem checked={gizmos} onCheckedChange={setGizmos} onSelect={keepOpen}>
              Gizmos
            </M.DropdownMenuCheckboxItem>
            <M.DropdownMenuSeparator />
            <M.DropdownMenuLabel>Shading</M.DropdownMenuLabel>
            <M.DropdownMenuRadioGroup value={shading} onValueChange={setShading}>
              <M.DropdownMenuRadioItem value="solid" onSelect={keepOpen}>
                Solid
              </M.DropdownMenuRadioItem>
              <M.DropdownMenuRadioItem value="wireframe" onSelect={keepOpen}>
                Wireframe
              </M.DropdownMenuRadioItem>
              <M.DropdownMenuRadioItem value="rendered" onSelect={keepOpen}>
                Rendered
              </M.DropdownMenuRadioItem>
            </M.DropdownMenuRadioGroup>
          </M.DropdownMenuContent>
        </M.DropdownMenuPortal>
      </M.DropdownMenuRoot>
    )
  },
}

/** `size` 设在 Root 上，子菜单继承：`xs` 20 / `sm` 24 / `md` 32。 */
export const Sizes: Story = {
  render: () => (
    <Row>
      {(['xs', 'sm', 'md'] as const).map((size) => (
        <Item key={size} label={size}>
          <M.DropdownMenuRoot size={size}>
            <M.DropdownMenuTrigger asChild>
              <IconButton aria-label={`More actions (${size})`} variant="outline">
                <IconDots />
              </IconButton>
            </M.DropdownMenuTrigger>
            <M.DropdownMenuPortal>
              <M.DropdownMenuContent aria-label={`Actions ${size}`} align="start">
                <M.DropdownMenuItem icon={<IconCopy />}>Duplicate</M.DropdownMenuItem>
                <M.DropdownMenuItem critical icon={<IconTrash />}>
                  Delete
                </M.DropdownMenuItem>
              </M.DropdownMenuContent>
            </M.DropdownMenuPortal>
          </M.DropdownMenuRoot>
        </Item>
      ))}
    </Row>
  ),
}

/** 受控打开状态，并记录选择的命令。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<string[]>([])
    return (
      <Column>
        <M.DropdownMenuRoot open={open} onOpenChange={setOpen}>
          <M.DropdownMenuTrigger asChild>
            <Button>Actions</Button>
          </M.DropdownMenuTrigger>
          <M.DropdownMenuPortal>
            <M.DropdownMenuContent aria-label="Actions" align="start">
              {['Duplicate', 'Rename', 'Delete'].map((command) => (
                <M.DropdownMenuItem
                  key={command}
                  onSelect={() => setSelected((items) => [...items.slice(-4), command])}>
                  {command}
                </M.DropdownMenuItem>
              ))}
            </M.DropdownMenuContent>
          </M.DropdownMenuPortal>
        </M.DropdownMenuRoot>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open from outside
        </Button>
        <StateView value={{ open, selected }} />
      </Column>
    )
  },
}
