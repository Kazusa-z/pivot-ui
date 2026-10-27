import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Dialog } from '../src/dialogs'
import { Popover, Tooltip, TooltipProvider, HoverCard } from '../src/overlays'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../src/overlays/menus'
import { Button } from '../src/controls/buttons'
import { Input } from '../src/controls/inputs/Input'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryState,
  StoryCode,
  StoryProps,
  StoryKeyboard,
  StoryNote,
} from './support/StoryPage'

const stack = css({ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '260px', maxWidth: '100%' })
const dialogStack = css({ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' })

function DialogWithChildren({ onAction }: { onAction: () => void }) {
  return (
    <Dialog
      title="Parent dialog"
      description="Open a child popover, menu, tooltip or hover card without leaving the dialog."
      trigger={<Button size="sm">Dialog with child overlays</Button>}>
      <div className={dialogStack}>
        <Text size="sm" tone="muted">
          Child surfaces inherit the dialog theme and stack above it. Escape closes the topmost surface first.
        </Text>
        <StoryRow>
          <Popover
            trigger={
              <Button size="sm" variant="outline">
                Child popover
              </Button>
            }>
            <div className={stack}>
              <Input size="sm" aria-label="Nested popover field" defaultValue="Popover above dialog" />
              <Text size="sm" tone="muted">
                This field is inside a portal, above the dialog.
              </Text>
            </div>
          </Popover>

          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                Child menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={onAction}>Direct action</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Child submenu</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onSelect={onAction}>Nested action</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>

          <Tooltip
            trigger={
              <Button size="sm" variant="subtle">
                Child tooltip
              </Button>
            }>
            Tooltip above the dialog
          </Tooltip>

          <HoverCard
            trigger={
              <Button size="sm" variant="subtle">
                Child preview
              </Button>
            }
            rootProps={{ openDelay: 100 }}>
            <Text size="sm" tone="muted">
              Hover preview above the dialog. It is supplementary, not required information.
            </Text>
          </HoverCard>
        </StoryRow>
      </div>
    </Dialog>
  )
}

function PopoverWithDialog({ onAction }: { onAction: () => void }) {
  return (
    <Popover
      trigger={
        <Button size="sm" variant="outline">
          Popover with child dialog
        </Button>
      }>
      <div className={stack}>
        <Text size="sm" tone="muted">
          A popover can open a dialog, and that dialog can open a third popover layer.
        </Text>
        <Dialog
          title="Dialog above popover"
          description="Layer two uses the dialog surface; the next popover is layer three."
          trigger={<Button size="sm">Open child dialog</Button>}>
          <div className={dialogStack}>
            <Popover
              trigger={
                <Button size="sm" variant="outline">
                  Third layer popover
                </Button>
              }>
              <div className={stack}>
                <Input size="sm" aria-label="Third layer field" defaultValue="Above both parents" />
                <Button size="sm" onClick={onAction}>
                  Apply from layer three
                </Button>
              </div>
            </Popover>
          </div>
        </Dialog>
      </div>
    </Popover>
  )
}

function ControlledDialog() {
  const [open, setOpen] = useState(false)
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
      <StoryRow>
        <Dialog
          title="Controlled dialog"
          trigger={<Button size="sm">Open controlled dialog</Button>}
          rootProps={{ open, onOpenChange: setOpen }}>
          <div className={dialogStack}>
            <Text size="sm" tone="muted">
              This dialog is controlled by the application. The trigger still opens it through onOpenChange.
            </Text>
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
              Close from content
            </Button>
          </div>
        </Dialog>
        <Button size="sm" variant="subtle" onClick={() => setOpen((value) => !value)}>
          External {open ? 'close' : 'open'}
        </Button>
        <Button size="sm" variant="outline" disabled>
          Disabled dialog
        </Button>
      </StoryRow>
      <StoryState label="Dialog state" value={{ open }} />
    </div>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '浮层可以嵌套用于分层操作。Dialog、Popover、菜单、Tooltip 和 HoverCard 共用 OverlayLayer 的层级规则：子表面使用父层 +10，Escape 按最上层逐级关闭，主题会穿过 Portal。应用只为需要受控的层保存 open 状态。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Overlays/OverlayLayers',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function OverlayLayersPage() {
  const [actions, setActions] = useState(0)
  return (
    <StoryPage
      eyebrow="Overlays"
      title="Overlay layers"
      summary="嵌套浮层保持父层上下文，按父层 +10 叠加。Dialog 可以包含 Popover、菜单、Tooltip 和预览；Popover 也可以打开 Dialog，再进入下一层。"
      meta={
        <>
          <span>Dialog</span>
          <span>·</span>
          <span>Popover</span>
          <span>·</span>
          <span>Menu / Tooltip / HoverCard</span>
        </>
      }>
      <StorySection
        title="Nested layers"
        description="每一层都通过 Portal 渲染，因此 DOM 顺序不决定层级；OverlayLayer 的 context 负责传递下一层。">
        <StoryGrid>
          <StoryCard title="Dialog → child overlays" description="All child surfaces stack above the parent dialog.">
            <TooltipProvider delayDuration={100}>
              <DialogWithChildren onAction={() => setActions((value) => value + 1)} />
            </TooltipProvider>
          </StoryCard>
          <StoryCard title="Popover → dialog → popover" description="Three levels share one ordering rule.">
            <TooltipProvider delayDuration={100}>
              <PopoverWithDialog onAction={() => setActions((value) => value + 1)} />
            </TooltipProvider>
          </StoryCard>
        </StoryGrid>
        <StoryState label="Layer actions" value={{ actions }} />
      </StorySection>

      <StorySection title="States" description="受控 Dialog 由应用决定开关；disabled 触发按钮不会打开层。">
        <StoryCard title="Controlled / disabled">
          <ControlledDialog />
        </StoryCard>
      </StorySection>

      <StorySection title="Stacking">
        <StoryGrid>
          <StoryCard
            title="Automatic +10"
            description="Each nested content surface receives the next layer from context.">
            <StoryCode
              label="layer order"
              code={`Dialog           layer 40
  Popover        layer 50
    Menu         layer 60
      Submenu    layer 70`}
            />
          </StoryCard>
          <StoryCard
            title="Explicit base"
            description="A numeric style.zIndex starts that surface at the requested layer; children continue from it.">
            <StoryCode
              label="override"
              code={`<PopoverContent style={{ zIndex: 200 }}>
  ...
</PopoverContent>`}
            />
          </StoryCard>
          <StoryCard
            title="Third-party adapter"
            description="OverlayLayer adds theme and stacking without adding a DOM node.">
            <StoryCode
              label="tsx"
              code={`<OverlayLayer asChild>
  <ThirdPartyContent>…</ThirdPartyContent>
</OverlayLayer>`}
            />
          </StoryCard>
        </StoryGrid>
        <StoryNote>
          `OverlayLayer` 只包住第三方的浮层内容，不包 Trigger；子元素必须转发 props 和 ref。不要把必需的页面信息只放在
          Tooltip 或 HoverCard 中。
        </StoryNote>
      </StorySection>

      <StorySection title="Keyboard & accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Escape', action: 'Closes the topmost overlay first and returns focus to its trigger.' },
            { keys: 'Tab', action: 'Moves through focusable content inside the active overlay.' },
            { keys: ['Arrow keys', 'Enter'], action: 'Moves through menu items and activates the focused item.' },
            { keys: 'Focus', action: 'A hover card may also open on keyboard focus; it is still non-essential.' },
          ]}
        />
        <StoryNote>
          模态 Dialog 会锁定页面滚动与焦点；非模态 Popover
          允许外部点击。嵌套时不要同时打开多个模态层，除非应用明确需要并处理好焦点顺序。
        </StoryNote>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<TooltipProvider>
  <Dialog title="Parent" trigger={<Button>Open</Button>}>
    <Popover trigger={<Button>Child</Button>}>
      <Input aria-label="Nested field" />
    </Popover>
  </Dialog>
</TooltipProvider>

<OverlayLayer asChild>
  <ThirdPartyContent>…</ThirdPartyContent>
</OverlayLayer>`}
          />
          <StoryProps
            rows={[
              {
                name: 'OverlayLayer.asChild',
                type: 'true',
                description: '必需；把主题、层级和 ref 合并到唯一的子元素上，不额外生成 DOM。',
              },
              {
                name: 'OverlayLayer.zIndex',
                type: 'number',
                description: '作为该层的数值基准；子层从基准 +10 开始。',
              },
              {
                name: 'Dialog.rootProps.open',
                type: 'boolean',
                description: '受控开关；应用可接受或拒绝 onOpenChange 请求。',
              },
              {
                name: 'Popover.contentProps',
                type: 'PopoverContentProps',
                description: '可传 side/align、compact、zIndex 等定位与表面属性。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <OverlayLayersPage /> }
