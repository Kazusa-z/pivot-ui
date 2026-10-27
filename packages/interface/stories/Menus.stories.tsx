import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconCopy, IconTrash } from '@tabler/icons-react'
import * as M from '../src/overlays/menus'
import type { MenuSize } from '../src/overlays/menus'
import { Button } from '../src/controls/buttons'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryField,
  StoryGrid,
  StoryCode,
  StoryKeyboard,
  StoryProps,
  StoryState,
  StoryNote,
} from './support/StoryPage'

const sizes: readonly MenuSize[] = ['xs', 'sm', 'md']

const contextTargetClass = css({
  display: 'grid',
  placeItems: 'center',
  width: '100%',
  minHeight: '120px',
  padding: 'var(--space-6)',
  border: '1px dashed var(--colors-borderStrong)',
  borderRadius: 'var(--radii-controlMd)',
  backgroundColor: 'var(--colors-surfaceSubtle)',
  color: 'var(--colors-textMuted)',
  fontSize: 'var(--fontSizes-control)',
  textAlign: 'center',
  cursor: 'context-menu',
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
})

function SizePicker({ value, onChange }: { value: MenuSize; onChange: (size: MenuSize) => void }) {
  return (
    <StoryRow>
      {sizes.map((size) => (
        <Button key={size} size={size} variant={value === size ? 'solid' : 'outline'} onClick={() => onChange(size)}>
          {size}
        </Button>
      ))}
    </StoryRow>
  )
}

function DropdownExample() {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState<MenuSize>('sm')
  const [visible, setVisible] = useState<boolean | 'indeterminate'>('indeterminate')
  const [mode, setMode] = useState('solid')
  const [selected, setSelected] = useState('none')
  const preventClose = (event: Event) => event.preventDefault()

  return (
    <StoryCard
      title="Dropdown menu"
      description="按钮展开的操作列表。勾选和单选通过 onCheckedChange / onValueChange 交给应用；需要连续调整时在 onSelect 中 preventDefault。">
      <StoryField label="Menu size" hint="项目高度 xs 20 / sm 24 / md 32；字号 12 / 12 / 14。">
        <SizePicker value={size} onChange={setSize} />
      </StoryField>
      <StoryRow>
        <M.DropdownMenuRoot size={size} open={open} onOpenChange={setOpen}>
          <M.DropdownMenuTrigger asChild>
            <Button>Open actions</Button>
          </M.DropdownMenuTrigger>
          <M.DropdownMenuPortal>
            <M.DropdownMenuContent aria-label="Document actions" css={{ minWidth: '260px' }}>
              <M.DropdownMenuLabel>Document</M.DropdownMenuLabel>
              <M.DropdownMenuItem icon={<IconCopy />} shortcuts="Ctrl+C" onSelect={() => setSelected('Copy')}>
                Copy
              </M.DropdownMenuItem>
              <M.DropdownMenuItem disabled>Unavailable action</M.DropdownMenuItem>
              <M.DropdownMenuSeparator />
              <M.DropdownMenuCheckboxItem checked={visible} onCheckedChange={setVisible} onSelect={preventClose}>
                Show guides
              </M.DropdownMenuCheckboxItem>
              <M.DropdownMenuLabel>Mode</M.DropdownMenuLabel>
              <M.DropdownMenuRadioGroup value={mode} onValueChange={setMode}>
                <M.DropdownMenuRadioItem value="solid" onSelect={preventClose}>
                  Solid
                </M.DropdownMenuRadioItem>
                <M.DropdownMenuRadioItem value="wire" onSelect={preventClose}>
                  Wireframe
                </M.DropdownMenuRadioItem>
                <M.DropdownMenuRadioItem value="locked" disabled>
                  Unavailable mode
                </M.DropdownMenuRadioItem>
              </M.DropdownMenuRadioGroup>
              <M.DropdownMenuSeparator />
              <M.DropdownMenuSub>
                <M.DropdownMenuSubTrigger>More choices</M.DropdownMenuSubTrigger>
                <M.DropdownMenuPortal>
                  <M.DropdownMenuSubContent css={{ minWidth: '180px' }}>
                    {Array.from({ length: 6 }, (_, index) => (
                      <M.DropdownMenuItem key={index} onSelect={() => setSelected(`Nested ${index + 1}`)}>
                        Nested {index + 1}
                      </M.DropdownMenuItem>
                    ))}
                  </M.DropdownMenuSubContent>
                </M.DropdownMenuPortal>
              </M.DropdownMenuSub>
              <M.DropdownMenuItem critical icon={<IconTrash />} onSelect={() => setSelected('Delete')}>
                Delete
              </M.DropdownMenuItem>
            </M.DropdownMenuContent>
          </M.DropdownMenuPortal>
        </M.DropdownMenuRoot>
      </StoryRow>
      <StoryState label="Dropdown state" value={{ size, open, visible, mode, selected }} />
    </StoryCard>
  )
}

function SizesExample() {
  return (
    <StoryCard title="Item sizes" description="三种尺寸使用同一套菜单结构，只改变项目高度、字号和内边距。">
      <StoryRow align="start">
        {sizes.map((size) => (
          <M.DropdownMenuRoot key={size} size={size}>
            <M.DropdownMenuTrigger asChild>
              <Button size={size} variant="outline">
                Open {size}
              </Button>
            </M.DropdownMenuTrigger>
            <M.DropdownMenuPortal>
              <M.DropdownMenuContent aria-label={`${size} actions`} css={{ minWidth: '200px' }}>
                <M.DropdownMenuLabel>{size} menu</M.DropdownMenuLabel>
                <M.DropdownMenuItem shortcuts="Ctrl+1">First action</M.DropdownMenuItem>
                <M.DropdownMenuItem shortcuts="Ctrl+2">Second action</M.DropdownMenuItem>
                <M.DropdownMenuSeparator />
                <M.DropdownMenuItem disabled>Unavailable</M.DropdownMenuItem>
              </M.DropdownMenuContent>
            </M.DropdownMenuPortal>
          </M.DropdownMenuRoot>
        ))}
      </StoryRow>
      <StoryNote>项目高度分别是 20 / 24 / 32；圆角 4 / 4 / 6。</StoryNote>
    </StoryCard>
  )
}

function ContextExample() {
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [selected, setSelected] = useState('none')
  const preventClose = (event: Event) => event.preventDefault()
  return (
    <StoryCard
      title="Context menu"
      description="在目标元素上右键打开；键盘用户聚焦目标后按 Shift+F10 或 ContextMenu 键。">
      <M.ContextMenuRoot open={open} onOpenChange={setOpen}>
        <M.ContextMenuTrigger asChild>
          <div tabIndex={0} className={contextTargetClass}>
            <Text size="sm" tone="muted">
              Right-click or press Shift+F10
            </Text>
          </div>
        </M.ContextMenuTrigger>
        <M.ContextMenuPortal>
          <M.ContextMenuContent aria-label="Target actions">
            <M.ContextMenuItem onSelect={() => setSelected('Inspect')}>Inspect</M.ContextMenuItem>
            <M.ContextMenuCheckboxItem checked={pinned} onCheckedChange={setPinned} onSelect={preventClose}>
              Pin to viewport
            </M.ContextMenuCheckboxItem>
            <M.ContextMenuSeparator />
            <M.ContextMenuSub>
              <M.ContextMenuSubTrigger>More</M.ContextMenuSubTrigger>
              <M.ContextMenuPortal>
                <M.ContextMenuSubContent>
                  <M.ContextMenuItem onSelect={() => setSelected('Duplicate')}>Duplicate</M.ContextMenuItem>
                </M.ContextMenuSubContent>
              </M.ContextMenuPortal>
            </M.ContextMenuSub>
            <M.ContextMenuItem disabled>Unavailable</M.ContextMenuItem>
          </M.ContextMenuContent>
        </M.ContextMenuPortal>
      </M.ContextMenuRoot>
      <StoryState label="Context state" value={{ open, pinned, selected }} />
    </StoryCard>
  )
}

function MenubarExample() {
  const [value, setValue] = useState('')
  const [selected, setSelected] = useState('none')
  const [statusBar, setStatusBar] = useState(true)
  const preventClose = (event: Event) => event.preventDefault()
  return (
    <StoryCard
      title="Menubar"
      description="顶部菜单在 Left / Right 之间移动，Down 打开当前菜单；只有一个菜单打开时，悬停会跟随切换。">
      <M.MenubarRoot aria-label="Application menu" value={value} onValueChange={setValue}>
        <M.MenubarMenu value="file">
          <M.MenubarTrigger>File</M.MenubarTrigger>
          <M.MenubarPortal>
            <M.MenubarContent align="start">
              <M.MenubarItem shortcuts="Ctrl+N" onSelect={() => setSelected('New')}>
                New
              </M.MenubarItem>
              <M.MenubarSub>
                <M.MenubarSubTrigger>Export</M.MenubarSubTrigger>
                <M.MenubarPortal>
                  <M.MenubarSubContent>
                    <M.MenubarItem onSelect={() => setSelected('PNG')}>PNG</M.MenubarItem>
                    <M.MenubarItem onSelect={() => setSelected('JPEG')}>JPEG</M.MenubarItem>
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
              <M.MenubarCheckboxItem checked={statusBar} onCheckedChange={setStatusBar} onSelect={preventClose}>
                Status bar
              </M.MenubarCheckboxItem>
            </M.MenubarContent>
          </M.MenubarPortal>
        </M.MenubarMenu>
        <M.MenubarMenu value="disabled">
          <M.MenubarTrigger disabled>Disabled</M.MenubarTrigger>
        </M.MenubarMenu>
      </M.MenubarRoot>
      <StoryState label="Menubar state" value={{ value, selected, statusBar }} />
    </StoryCard>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'DropdownMenu 用于按钮展开的操作列表，ContextMenu 用于目标元素的上下文操作，Menubar 用于顶部菜单。三种菜单共享 20/24/32 的项目高度、4/6 圆角和实心选中，应用负责保存勾选/单选值并执行操作。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Overlays/Menus',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Overlays"
      title="Menus"
      summary="用菜单收纳一组操作：按钮用 DropdownMenu，目标元素用 ContextMenu，应用顶部用 Menubar。项目高度 20/24/32，选中态使用实心 selection 颜色，键盘与禁用语义一致。"
      meta={
        <>
          <span>DropdownMenu</span>
          <span>·</span>
          <span>ContextMenu</span>
          <span>·</span>
          <span>Menubar</span>
        </>
      }>
      <StorySection
        title="Variants"
        description="DropdownMenu 是按钮触发的默认变体；ContextMenu 和 Menubar 复用同一套项目外观。">
        <DropdownExample />
      </StorySection>

      <StorySection title="Sizes" description="尺寸属于菜单根节点，子菜单和 Portal 内容会继承。">
        <SizesExample />
      </StorySection>

      <StorySection
        title="Context menu and menubar"
        description="同一套项目样式用于右键菜单和顶部菜单；上下文目标需要可获得焦点。">
        <StoryGrid>
          <ContextExample />
          <MenubarExample />
        </StoryGrid>
      </StorySection>

      <StorySection title="Keyboard and accessibility" description="菜单项目始终保留可见焦点；禁用项目会被跳过。">
        <StoryCard>
          <StoryKeyboard
            rows={[
              { keys: ['Enter', 'Space'], action: '打开聚焦的菜单触发器' },
              { keys: ['ArrowDown', 'ArrowUp'], action: '移动到下一项/上一项，跳过 disabled' },
              { keys: ['Home', 'End'], action: '跳到第一项/最后一项' },
              { keys: ['ArrowRight'], action: '进入子菜单' },
              { keys: ['ArrowLeft', 'Escape'], action: '返回上一级或关闭菜单，焦点回到触发器' },
              { keys: ['Shift+F10', 'ContextMenu'], action: '在 ContextMenu 目标上打开菜单' },
            ]}
          />
          <StoryNote>
            ContextMenu 的目标通过 tabIndex
            获得焦点；不要把唯一入口只放在右键上。菜单内容必须有可访问名称，图标项目还要有文字或 aria-label。
          </StoryNote>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<DropdownMenuRoot size="sm">
  <DropdownMenuTrigger asChild>
    <Button>Open actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuPortal>
    <DropdownMenuContent aria-label="Actions">
      <DropdownMenuItem shortcuts="Ctrl+C" onSelect={copy}>Copy</DropdownMenuItem>
      <DropdownMenuCheckboxItem checked={guides} onCheckedChange={setGuides}>
        Show guides
      </DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem critical onSelect={remove}>Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuPortal>
</DropdownMenuRoot>`}
          />
          <StoryProps
            rows={[
              {
                name: 'size',
                type: "'xs' | 'sm' | 'md'",
                defaultValue: "'sm'",
                description: '项目高度 20 / 24 / 32。',
              },
              {
                name: 'open / onOpenChange',
                type: 'boolean / (open) => void',
                description: '受控开关；省略时由组件保存。',
              },
              {
                name: 'modal',
                type: 'boolean',
                defaultValue: 'true',
                description: '打开时是否阻止页面滚动和外部交互。',
              },
              { name: 'onSelect', type: '(event) => void', description: '选择项目；preventDefault 可保持菜单打开。' },
              {
                name: 'checked / onCheckedChange',
                type: "boolean | 'indeterminate'",
                description: 'CheckboxItem 的状态。',
              },
              {
                name: 'critical',
                type: 'boolean',
                defaultValue: 'false',
                description: '危险操作使用 dangerText；高亮时使用 dangerSolid。',
              },
              { name: 'shortcuts', type: 'KbdGroupProps["shortcuts"]', description: '右侧快捷键提示，不触发操作。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
