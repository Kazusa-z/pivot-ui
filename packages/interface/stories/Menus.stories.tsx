import { StrictMode, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconCopy, IconTrash } from '@tabler/icons-react'
import * as M from '../src/widgets/menus'
import { Button } from '../src/widgets/buttons'
import { createThemeStore, ThemeProvider, useTheme } from '../src/foundation/theme'
import { css } from '../styled-system/css'
import { ContractFrame, ControlButton, ControlSelect, StatePanel, contractStyles } from './support/ContractFrame'

function DropdownControlledExample() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('none')
  const [changes, setChanges] = useState(0)
  return (
    <ContractFrame
      title="由应用控制开关的操作菜单"
      description="DropdownMenu 适合按钮展开的操作列表。聚焦按钮后按 Enter、Space 或方向键打开，用 Up/Down、Home/End 或字母定位项目；选择时 onSelect 执行对应操作，Escape 关闭后回到触发按钮。"
      onReset={() => {
        setOpen(false)
        setSelected('none')
        setChanges(0)
      }}>
      <div className={contractStyles.row}>
        <M.DropdownMenuRoot
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            setChanges((count) => count + 1)
          }}>
          <M.DropdownMenuTrigger asChild>
            <Button>Open actions</Button>
          </M.DropdownMenuTrigger>
          <M.DropdownMenuPortal>
            <M.DropdownMenuContent align="start" aria-label="Actions">
              <M.DropdownMenuLabel>Document</M.DropdownMenuLabel>
              <M.DropdownMenuItem icon={<IconCopy />} shortcuts="Ctrl+C" onSelect={() => setSelected('Copy')}>
                Copy
              </M.DropdownMenuItem>
              <M.DropdownMenuItem disabled onSelect={() => setSelected('Disabled must not run')}>
                Unavailable action
              </M.DropdownMenuItem>
              <M.DropdownMenuSeparator />
              <M.DropdownMenuItem critical icon={<IconTrash />} onSelect={() => setSelected('Delete')}>
                Delete
              </M.DropdownMenuItem>
            </M.DropdownMenuContent>
          </M.DropdownMenuPortal>
        </M.DropdownMenuRoot>
        <ControlButton onClick={() => setOpen(true)}>External open</ControlButton>
      </div>
      <StatePanel label="Dropdown state" value={{ open, selected, changes }} />
    </ContractFrame>
  )
}

function UncontrolledExample() {
  const [generation, setGeneration] = useState(0)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('none')
  const [refTag, setRefTag] = useState('none')
  return (
    <ContractFrame
      title="简单菜单与链接菜单项"
      description="省略 open 时由组件保存展开状态，onOpenChange 可用于观察变化。asChild 可让菜单项使用真实链接并保留 ref；此例将 Content 放在原位置，需要脱离容器裁切时可加入 Portal。"
      onReset={() => {
        setGeneration((n) => n + 1)
        setOpen(false)
        setSelected('none')
      }}>
      <M.DropdownMenuRoot key={generation} defaultOpen={false} modal={false} onOpenChange={setOpen}>
        <M.DropdownMenuTrigger asChild>
          <Button>Open inline menu</Button>
        </M.DropdownMenuTrigger>
        <M.DropdownMenuContent align="start" aria-label="Inline links">
          <M.DropdownMenuItem asChild shortcuts="Ctrl+O" onSelect={() => setSelected('Link')}>
            <a
              href="#menu-link"
              ref={(node) => {
                if (node) setRefTag(node.tagName)
              }}
              onClick={(event) => event.preventDefault()}>
              Open link
            </a>
          </M.DropdownMenuItem>
          <M.DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              setSelected('Kept open')
            }}>
            Keep menu open
          </M.DropdownMenuItem>
          <M.DropdownMenuItem onSelect={() => setSelected('Close')}>Close normally</M.DropdownMenuItem>
        </M.DropdownMenuContent>
      </M.DropdownMenuRoot>
      <StatePanel label="Uncontrolled state" value={{ open, selected, refTag }} />
    </ContractFrame>
  )
}

function CheckedExample() {
  const [visible, setVisible] = useState<boolean | 'indeterminate'>('indeterminate')
  const [mode, setMode] = useState('solid')
  const [changes, setChanges] = useState(0)
  return (
    <ContractFrame
      title="在菜单中调整选项"
      description="用 CheckboxItem 和 RadioGroup 在菜单中调整显示选项。应用在 onCheckedChange 或 onValueChange 中保存值；需要连续修改时，可在选择事件中调用 preventDefault 保持菜单打开。禁用项目会在键盘浏览时跳过。"
      onReset={() => {
        setVisible('indeterminate')
        setMode('solid')
        setChanges(0)
      }}>
      <M.DropdownMenuRoot>
        <M.DropdownMenuTrigger asChild>
          <Button>Display options</Button>
        </M.DropdownMenuTrigger>
        <M.DropdownMenuPortal>
          <M.DropdownMenuContent aria-label="Display options">
            <M.DropdownMenuCheckboxItem
              checked={visible}
              onCheckedChange={(value) => {
                setVisible(value)
                setChanges((n) => n + 1)
              }}
              onSelect={(event) => event.preventDefault()}>
              Show guides
            </M.DropdownMenuCheckboxItem>
            <M.DropdownMenuCheckboxItem disabled checked onCheckedChange={() => setChanges(-999)}>
              Locked option
            </M.DropdownMenuCheckboxItem>
            <M.DropdownMenuSeparator />
            <M.DropdownMenuLabel id="menu-mode-label">Mode</M.DropdownMenuLabel>
            <M.DropdownMenuRadioGroup
              aria-labelledby="menu-mode-label"
              value={mode}
              onValueChange={(value) => {
                setMode(value)
                setChanges((n) => n + 1)
              }}>
              <M.DropdownMenuRadioItem value="solid" onSelect={(event) => event.preventDefault()}>
                Solid
              </M.DropdownMenuRadioItem>
              <M.DropdownMenuRadioItem value="wire" onSelect={(event) => event.preventDefault()}>
                Wireframe
              </M.DropdownMenuRadioItem>
              <M.DropdownMenuRadioItem value="locked" disabled>
                Unavailable mode
              </M.DropdownMenuRadioItem>
            </M.DropdownMenuRadioGroup>
          </M.DropdownMenuContent>
        </M.DropdownMenuPortal>
      </M.DropdownMenuRoot>
      <StatePanel label="Selection state" value={{ visible, mode, changes }} />
    </ContractFrame>
  )
}

function NestedExample() {
  const [size, setSize] = useState<M.MenuSize>('sm')
  const [selected, setSelected] = useState('none')
  return (
    <ContractFrame
      title="子菜单、长列表与窄布局"
      description="子菜单适合把相关操作分组。Right 进入子菜单，Left 返回，End 可到末项；子菜单沿用所在菜单的尺寸和主题。此例也展示长列表滚动和窄宽度下的标签换行。"
      onReset={() => {
        setSize('sm')
        setSelected('none')
      }}>
      <div className={contractStyles.row}>
        <ControlSelect
          aria-label="Menu size"
          value={size}
          onChange={(event) => setSize(event.target.value as M.MenuSize)}>
          <option value="xs">xs</option>
          <option value="sm">sm</option>
          <option value="md">md</option>
        </ControlSelect>
        <M.DropdownMenuRoot size={size}>
          <M.DropdownMenuTrigger asChild>
            <Button>Nested menu</Button>
          </M.DropdownMenuTrigger>
          <M.DropdownMenuPortal>
            <M.DropdownMenuContent css={{ width: '220px', minWidth: 0, maxHeight: '260px' }}>
              <M.DropdownMenuSub>
                <M.DropdownMenuSubTrigger>More choices</M.DropdownMenuSubTrigger>
                <M.DropdownMenuPortal>
                  <M.DropdownMenuSubContent css={{ width: '180px', minWidth: 0, maxHeight: '220px' }}>
                    {Array.from({ length: 30 }, (_, index) => (
                      <M.DropdownMenuItem key={index} onSelect={() => setSelected(`Nested ${index + 1}`)}>
                        Nested {index + 1}
                      </M.DropdownMenuItem>
                    ))}
                  </M.DropdownMenuSubContent>
                </M.DropdownMenuPortal>
              </M.DropdownMenuSub>
              <M.DropdownMenuSub>
                <M.DropdownMenuSubTrigger disabled>Unavailable submenu</M.DropdownMenuSubTrigger>
                <M.DropdownMenuPortal>
                  <M.DropdownMenuSubContent>
                    <M.DropdownMenuItem>Never reached</M.DropdownMenuItem>
                  </M.DropdownMenuSubContent>
                </M.DropdownMenuPortal>
              </M.DropdownMenuSub>
              <M.DropdownMenuItem onSelect={() => setSelected('Long label')}>
                A very long menu label with enough detail to wrap instead of escaping the narrow surface
              </M.DropdownMenuItem>
              {Array.from({ length: 20 }, (_, index) => (
                <M.DropdownMenuItem key={index} onSelect={() => setSelected(`Item ${index + 1}`)}>
                  Item {index + 1}
                </M.DropdownMenuItem>
              ))}
            </M.DropdownMenuContent>
          </M.DropdownMenuPortal>
        </M.DropdownMenuRoot>
      </div>
      <StatePanel label="Nested state" value={{ size, selected }} />
    </ContractFrame>
  )
}

function ContextExample() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('none')
  const [disabled, setDisabled] = useState(false)
  const [checked, setChecked] = useState(false)
  return (
    <ContractFrame
      title="目标元素的上下文操作"
      description="ContextMenu 为目标元素提供上下文操作。可右键打开，也可聚焦目标后按 Shift+F10 或 ContextMenu 键；选择项目通过回调交给应用。需要从应用控制显示时，使用 open 与 onOpenChange。"
      onReset={() => {
        setOpen(false)
        setSelected('none')
        setDisabled(false)
        setChecked(false)
      }}>
      <ControlButton
        onClick={() => {
          setDisabled((value) => !value)
          setOpen(false)
        }}>
        Toggle trigger disabled
      </ControlButton>
      <M.ContextMenuRoot open={open} onOpenChange={setOpen}>
        <M.ContextMenuTrigger asChild disabled={disabled}>
          <div
            tabIndex={disabled ? -1 : 0}
            className={css({
              padding: '32px',
              border: '1px dashed var(--colors-borderStrong)',
              borderRadius: '6px',
              '&:focus-visible': { outline: '2px solid var(--colors-focusRing)' },
            })}>
            Context target
          </div>
        </M.ContextMenuTrigger>
        <M.ContextMenuPortal>
          <M.ContextMenuContent aria-label="Target actions">
            <M.ContextMenuItem onSelect={() => setSelected('Inspect')}>Inspect</M.ContextMenuItem>
            <M.ContextMenuCheckboxItem
              checked={checked}
              onCheckedChange={setChecked}
              onSelect={(event) => event.preventDefault()}>
              Pinned
            </M.ContextMenuCheckboxItem>
            <M.ContextMenuSub>
              <M.ContextMenuSubTrigger>More</M.ContextMenuSubTrigger>
              <M.ContextMenuPortal>
                <M.ContextMenuSubContent>
                  <M.ContextMenuItem onSelect={() => setSelected('Duplicate')}>Duplicate</M.ContextMenuItem>
                </M.ContextMenuSubContent>
              </M.ContextMenuPortal>
            </M.ContextMenuSub>
            <M.ContextMenuItem disabled onSelect={() => setSelected('Disabled must not run')}>
              Unavailable
            </M.ContextMenuItem>
          </M.ContextMenuContent>
        </M.ContextMenuPortal>
      </M.ContextMenuRoot>
      <StatePanel label="Context state" value={{ open, selected, disabled, checked }} />
    </ContractFrame>
  )
}

function MenubarExample() {
  const [value, setValue] = useState('')
  const [rtl, setRtl] = useState(false)
  const [selected, setSelected] = useState('none')
  const [checked, setChecked] = useState(true)
  return (
    <ContractFrame
      title="顶部菜单的键盘导航"
      description="Menubar 适合应用顶部菜单。Left/Right 在顶层入口之间移动，Down 打开菜单，Escape 退回上一级；切换 RTL 后横向按键方向随界面阅读方向调整。"
      onReset={() => {
        setValue('')
        setRtl(false)
        setSelected('none')
        setChecked(true)
      }}>
      <ControlButton
        onClick={() => {
          setValue('')
          setRtl((v) => !v)
        }}>
        Toggle RTL
      </ControlButton>
      <M.MenubarRoot aria-label="Application menu" value={value} onValueChange={setValue} dir={rtl ? 'rtl' : 'ltr'}>
        <M.MenubarMenu value="file">
          <M.MenubarTrigger>File</M.MenubarTrigger>
          <M.MenubarPortal>
            <M.MenubarContent align="start">
              <M.MenubarItem onSelect={() => setSelected('New')}>New</M.MenubarItem>
              <M.MenubarSub>
                <M.MenubarSubTrigger>Export</M.MenubarSubTrigger>
                <M.MenubarPortal>
                  <M.MenubarSubContent>
                    <M.MenubarItem onSelect={() => setSelected('PNG')}>PNG</M.MenubarItem>
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
              <M.MenubarItem shortcuts="Ctrl+Z" onSelect={() => setSelected('Undo')}>
                Undo
              </M.MenubarItem>
              <M.MenubarItem disabled>Redo</M.MenubarItem>
            </M.MenubarContent>
          </M.MenubarPortal>
        </M.MenubarMenu>
        <M.MenubarMenu value="view">
          <M.MenubarTrigger>View</M.MenubarTrigger>
          <M.MenubarPortal>
            <M.MenubarContent align="start">
              <M.MenubarCheckboxItem
                checked={checked}
                onCheckedChange={setChecked}
                onSelect={(event) => event.preventDefault()}>
                Status bar
              </M.MenubarCheckboxItem>
            </M.MenubarContent>
          </M.MenubarPortal>
        </M.MenubarMenu>
        <M.MenubarMenu value="disabled">
          <M.MenubarTrigger disabled>Disabled menu</M.MenubarTrigger>
        </M.MenubarMenu>
      </M.MenubarRoot>
      <StatePanel label="Menubar state" value={{ value, rtl, selected, checked }} />
    </ContractFrame>
  )
}

function ScopedMenu() {
  const { resolvedTheme, setPreference } = useTheme()
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [custom, setCustom] = useState(false)
  const [selected, setSelected] = useState('none')
  return (
    <ContractFrame
      title="局部主题与菜单显示位置"
      description="局部 ThemeProvider 可为一个区域选择独立主题。切换后，主菜单和子菜单即使通过 Portal 渲染，也沿用该区域的主题；自定义容器用于控制浮层放置位置。"
      onReset={() => {
        setPreference('light')
        setCustom(false)
        setSelected('none')
      }}>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setPreference(resolvedTheme === 'light' ? 'dark' : 'light')}>
          Toggle local theme
        </ControlButton>
        <ControlButton onClick={() => setCustom((v) => !v)}>Toggle custom portal</ControlButton>
      </div>
      <M.DropdownMenuRoot modal={false}>
        <M.DropdownMenuTrigger asChild>
          <Button>Scoped menu</Button>
        </M.DropdownMenuTrigger>
        <M.DropdownMenuPortal container={custom ? container : undefined}>
          <M.DropdownMenuContent
            aria-label="Scoped actions"
            css={{ minWidth: '180px', borderColor: 'var(--colors-primary)' }}>
            <M.DropdownMenuItem onSelect={() => setSelected('Local action')}>Local action</M.DropdownMenuItem>
            <M.DropdownMenuSub>
              <M.DropdownMenuSubTrigger>Scoped submenu</M.DropdownMenuSubTrigger>
              <M.DropdownMenuPortal container={custom ? container : undefined}>
                <M.DropdownMenuSubContent>
                  <M.DropdownMenuItem onSelect={() => setSelected('Local nested action')}>
                    Local nested action
                  </M.DropdownMenuItem>
                </M.DropdownMenuSubContent>
              </M.DropdownMenuPortal>
            </M.DropdownMenuSub>
          </M.DropdownMenuContent>
        </M.DropdownMenuPortal>
      </M.DropdownMenuRoot>
      <div ref={setContainer} data-menu-portal-container="custom" />
      <StatePanel label="Portal state" value={{ resolvedTheme, portal: custom ? 'custom' : 'body', selected }} />
    </ContractFrame>
  )
}
function ScopedThemeExample() {
  const [store] = useState(() => createThemeStore({ initialPreference: 'light' }))
  return (
    <ThemeProvider store={store}>
      <ScopedMenu />
    </ThemeProvider>
  )
}

function LifecycleExample() {
  const [mounted, setMounted] = useState(true)
  const [generation, setGeneration] = useState(0)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('none')
  return (
    <ContractFrame
      title="移除并重新挂载菜单"
      description="菜单随所属组件一起挂载和卸载。打开后可按 Escape 关闭，或移除整个菜单；对应浮层会一并移除，页面上的其他操作仍可使用。重新挂载后可再次打开。"
      onReset={() => {
        setMounted(true)
        setGeneration((n) => n + 1)
        setOpen(false)
        setSelected('none')
      }}>
      <ControlButton
        onClick={() => {
          setMounted((v) => !v)
          setOpen(false)
        }}>
        Toggle mounted
      </ControlButton>
      <StrictMode>
        {mounted && (
          <M.DropdownMenuRoot key={generation} modal={false} open={open} onOpenChange={setOpen}>
            <M.DropdownMenuTrigger asChild>
              <Button>Lifecycle menu</Button>
            </M.DropdownMenuTrigger>
            <M.DropdownMenuPortal>
              <M.DropdownMenuContent aria-label="Lifecycle actions">
                <M.DropdownMenuItem onSelect={() => setSelected('Action')}>Run action</M.DropdownMenuItem>
                <M.DropdownMenuItem
                  onSelect={() => {
                    setMounted(false)
                    setOpen(false)
                    setSelected('Unmounted')
                  }}>
                  Unmount while open
                </M.DropdownMenuItem>
              </M.DropdownMenuContent>
            </M.DropdownMenuPortal>
          </M.DropdownMenuRoot>
        )}
      </StrictMode>
      <StatePanel label="Lifecycle state" value={{ mounted, open, selected }} />
    </ContractFrame>
  )
}

export default {
  tags: ['autodocs'],
  title: 'Widgets/Menus',
  parameters: {
    docs: {
      description: {
        component:
          'DropdownMenu 用于按钮展开的操作列表，ContextMenu 用于目标元素的上下文操作，Menubar 用于应用顶部菜单。用户可通过键盘浏览和选择，onSelect、onCheckedChange、onValueChange 等回调把操作交给应用。应用保存勾选与单选状态；菜单内容可组合子菜单、快捷键提示和独立的 Portal 配置。',
      },
    },
    layout: 'padded',
  },
} satisfies Meta
export const DropdownControlled: StoryObj = { render: () => <DropdownControlledExample /> }
export const UncontrolledAndAsChild: StoryObj = { render: () => <UncontrolledExample /> }
export const CheckedAndRadio: StoryObj = { render: () => <CheckedExample /> }
export const NestedAndScrollable: StoryObj = { render: () => <NestedExample /> }
export const Context: StoryObj = { render: () => <ContextExample /> }
export const MenubarKeyboard: StoryObj = { render: () => <MenubarExample /> }
export const ScopedThemeAndPortal: StoryObj = { render: () => <ScopedThemeExample /> }
export const Lifecycle: StoryObj = { render: () => <LifecycleExample /> }
