import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import * as M from '../src/overlays/menus'
import { describeComponent } from './support/describe'
import { Column, StateView } from './support/layout'

function ApplicationMenus({ onSelect }: { onSelect?: (command: string) => void }) {
  const [statusBar, setStatusBar] = useState(true)
  const select = (command: string) => () => onSelect?.(command)
  return (
    <>
      <M.MenubarMenu value="file">
        <M.MenubarTrigger>File</M.MenubarTrigger>
        <M.MenubarPortal>
          <M.MenubarContent align="start">
            <M.MenubarItem shortcuts="ctrl+n" onSelect={select('New scene')}>
              New scene
            </M.MenubarItem>
            <M.MenubarItem shortcuts="ctrl+s" onSelect={select('Save')}>
              Save
            </M.MenubarItem>
            <M.MenubarSub>
              <M.MenubarSubTrigger>Export</M.MenubarSubTrigger>
              <M.MenubarPortal>
                <M.MenubarSubContent>
                  <M.MenubarItem onSelect={select('glTF')}>glTF</M.MenubarItem>
                  <M.MenubarItem onSelect={select('FBX')}>FBX</M.MenubarItem>
                </M.MenubarSubContent>
              </M.MenubarPortal>
            </M.MenubarSub>
          </M.MenubarContent>
        </M.MenubarPortal>
      </M.MenubarMenu>
      <M.MenubarMenu value="edit">
        <M.MenubarTrigger>Edit</M.MenubarTrigger>
        <M.MenubarPortal>
          <M.MenubarContent align="start">
            <M.MenubarItem shortcuts="ctrl+z" onSelect={select('Undo')}>
              Undo
            </M.MenubarItem>
            <M.MenubarItem shortcuts="ctrl+shift+z" disabled>
              Redo
            </M.MenubarItem>
          </M.MenubarContent>
        </M.MenubarPortal>
      </M.MenubarMenu>
      <M.MenubarMenu value="view">
        <M.MenubarTrigger>View</M.MenubarTrigger>
        <M.MenubarPortal>
          <M.MenubarContent align="start">
            <M.MenubarCheckboxItem
              checked={statusBar}
              onCheckedChange={setStatusBar}
              onSelect={(event) => event.preventDefault()}>
              Status bar
            </M.MenubarCheckboxItem>
          </M.MenubarContent>
        </M.MenubarPortal>
      </M.MenubarMenu>
    </>
  )
}

const meta = {
  title: 'Overlays/Menubar',
  component: M.MenubarRoot,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '应用窗口顶部的菜单栏：File、Edit、View……，每个菜单的内容与 `DropdownMenu` 相同。',
    use: ['编辑器主窗口的全局命令入口'],
    avoid: ['面板内部的少量操作 → 用 `DropdownMenu` 或 `IconButton`'],
    related: ['`DropdownMenu`：单个按钮展开的菜单'],
    notes: ['`MenubarRoot` 里放多个 `MenubarMenu`；`value` / `onValueChange` 可以受控当前打开的菜单'],
    keyboard: [
      ['← / →', '在顶部菜单之间移动'],
      ['↓ / Enter', '打开当前菜单'],
      ['Escape', '关闭菜单，焦点回到菜单栏'],
    ],
  }),
  args: { 'aria-label': 'Application menu', size: 'sm' },
} satisfies Meta<typeof M.MenubarRoot>
export default meta
type Story = StoryObj<typeof meta>

/** 打开一个菜单后，悬停其他顶部项会直接切换。 */
export const Basic: Story = {
  render: (args) => (
    <M.MenubarRoot {...args}>
      <ApplicationMenus />
    </M.MenubarRoot>
  ),
}

/** 受控当前菜单并记录命令。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [value, setValue] = useState('')
    const [selected, setSelected] = useState<string[]>([])
    return (
      <Column>
        <M.MenubarRoot aria-label="Application menu" value={value} onValueChange={setValue}>
          <ApplicationMenus onSelect={(command) => setSelected((items) => [...items.slice(-4), command])} />
        </M.MenubarRoot>
        <StateView value={{ value, selected }} />
      </Column>
    )
  },
}
