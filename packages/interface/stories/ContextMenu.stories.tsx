import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconCopy, IconPencil, IconTrash } from '@tabler/icons-react'
import * as M from '../src/overlays/menus'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { Column, StateView } from './support/layout'

const target = css({
  display: 'grid',
  placeItems: 'center',
  width: '320px',
  maxWidth: '100%',
  minHeight: '120px',
  border: '1px dashed var(--colors-borderStrong)',
  borderRadius: 'var(--radii-controlMd)',
  backgroundColor: 'var(--colors-surfaceSubtle)',
  color: 'var(--colors-textMuted)',
  fontSize: 'var(--fontSizes-control)',
  cursor: 'context-menu',
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
})

function ObjectMenu({ onSelect }: { onSelect?: (command: string) => void }) {
  return (
    <M.ContextMenuPortal>
      <M.ContextMenuContent aria-label="Object actions" css={{ minWidth: '200px' }}>
        <M.ContextMenuItem icon={<IconPencil />} shortcuts="f2" onSelect={() => onSelect?.('Rename')}>
          Rename
        </M.ContextMenuItem>
        <M.ContextMenuItem icon={<IconCopy />} shortcuts="ctrl+d" onSelect={() => onSelect?.('Duplicate')}>
          Duplicate
        </M.ContextMenuItem>
        <M.ContextMenuSub>
          <M.ContextMenuSubTrigger>Create child</M.ContextMenuSubTrigger>
          <M.ContextMenuPortal>
            <M.ContextMenuSubContent>
              <M.ContextMenuItem onSelect={() => onSelect?.('Empty')}>Empty</M.ContextMenuItem>
              <M.ContextMenuItem onSelect={() => onSelect?.('Cube')}>Cube</M.ContextMenuItem>
              <M.ContextMenuItem onSelect={() => onSelect?.('Light')}>Light</M.ContextMenuItem>
            </M.ContextMenuSubContent>
          </M.ContextMenuPortal>
        </M.ContextMenuSub>
        <M.ContextMenuSeparator />
        <M.ContextMenuItem critical icon={<IconTrash />} shortcuts="delete" onSelect={() => onSelect?.('Delete')}>
          Delete
        </M.ContextMenuItem>
      </M.ContextMenuContent>
    </M.ContextMenuPortal>
  )
}

const meta = {
  title: 'Overlays/ContextMenu',
  component: M.ContextMenuRoot,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '在目标元素上右键打开的菜单；菜单项与 `DropdownMenu` 相同。',
    use: ['场景层级、资源列表、视口中对象的上下文操作'],
    avoid: ['唯一的操作入口 → 右键不容易被发现，同样的命令也应该能从按钮或菜单栏找到'],
    related: ['`DropdownMenu`：按钮展开的菜单', '`Menubar`：应用顶部菜单栏'],
    notes: ['`ContextMenuTrigger asChild` 包住可聚焦的目标元素，键盘用户才能用 Shift + F10 打开'],
    keyboard: [
      ['右键 / Shift + F10 / Menu 键', '打开'],
      ['↑ / ↓', '移动高亮'],
      ['→ / ←', '打开 / 关闭子菜单'],
      ['Escape', '关闭'],
    ],
  }),
  args: { size: 'sm' },
} satisfies Meta<typeof M.ContextMenuRoot>
export default meta
type Story = StoryObj<typeof meta>

/** 在虚线区域内右键，或聚焦后按 Shift + F10。 */
export const Basic: Story = {
  render: (args) => (
    <M.ContextMenuRoot {...args}>
      <M.ContextMenuTrigger asChild>
        <div tabIndex={0} className={target}>
          Right-click the object
        </div>
      </M.ContextMenuTrigger>
      <ObjectMenu />
    </M.ContextMenuRoot>
  ),
}

/** 记录选择的命令。 */
export const BehaviorSelection: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [selected, setSelected] = useState<string[]>([])
    return (
      <Column>
        <M.ContextMenuRoot>
          <M.ContextMenuTrigger asChild>
            <div tabIndex={0} className={target}>
              Right-click the object
            </div>
          </M.ContextMenuTrigger>
          <ObjectMenu onSelect={(command) => setSelected((items) => [...items.slice(-4), command])} />
        </M.ContextMenuRoot>
        <StateView value={{ selected }} />
      </Column>
    )
  },
}
