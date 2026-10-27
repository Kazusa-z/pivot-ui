import type { Meta, StoryObj } from '@storybook/react'
import { Dialog } from '../src/dialogs'
import { HoverCard, OverlayLayer, Popover, Tooltip, TooltipProvider } from '../src/overlays'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../src/overlays/menus'
import { Button } from '../src/controls/buttons'
import { Input } from '../src/controls/inputs/Input'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { Row } from './support/layout'

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
        <Row>
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
        </Row>
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

const meta = {
  title: 'Overlays/OverlayLayer',
  component: OverlayLayer,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '浮层的层级与主题规则：嵌套的 Dialog、Popover、菜单、Tooltip 自动叠在父层之上，并继承父层的主题。',
    use: [
      '库里的浮层已经内置这套规则，直接嵌套即可，不需要手动设置 z-index',
      '接入第三方浮层（例如其他库的下拉）时，用 `OverlayLayer asChild` 包住它的内容元素，让它也继承主题和层级',
    ],
    notes: [
      '每一层比父层高 10；Escape 先关闭最上层',
      '浮层通过 Portal 渲染，DOM 位置不决定层级，由 context 传递',
      '`OverlayLayer` 放在第三方 Portal 里面、包住实际内容，不要包住触发器',
    ],
  }),
  decorators: [(Story) => <TooltipProvider delayDuration={100}>{Story()}</TooltipProvider>],
  args: { asChild: true, children: <div /> },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof OverlayLayer>
export default meta
type Story = StoryObj<typeof meta>

/** 在对话框里打开 Popover、菜单（含子菜单）、Tooltip 和 HoverCard，它们都显示在对话框之上。 */
export const NestedInDialog: Story = { render: () => <DialogWithChildren onAction={() => {}} /> }

/** Popover → Dialog → Popover：三层使用同一套规则。 */
export const ThreeLevels: Story = { render: () => <PopoverWithDialog onAction={() => {}} /> }
