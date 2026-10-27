import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../src/controls/buttons'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { Input } from '../src/controls/inputs/Input'
import {
  HoverCard,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  Popover,
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverClose,
  PopoverTitle,
  PopoverDescription,
  Tooltip,
  TooltipProvider,
} from '../src/overlays'
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

const contentStack = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  width: '240px',
  maxWidth: '100%',
})
const popoverTitle = css({ margin: 0, fontSize: 'var(--fontSizes-controlLarge)', fontWeight: 600 })
const compactList = css({
  display: 'grid',
  gap: 'var(--space-0_5)',
  minWidth: '160px',
  padding: 'var(--space-1)',
})

function PopoverForm({ name = 'Rename object' }: { name?: string }) {
  const [value, setValue] = useState('Cube')
  return (
    <div className={contentStack}>
      <PopoverTitle className={popoverTitle}>{name}</PopoverTitle>
      <PopoverDescription>
        <Text as="span" size="sm" tone="muted">
          Edit the name, then save or press Escape to cancel.
        </Text>
      </PopoverDescription>
      <Input size="sm" aria-label={`${name} value`} value={value} onValueChange={setValue} placeholder="Object name" />
      <StoryRow>
        <PopoverClose asChild>
          <Button size="sm">Save</Button>
        </PopoverClose>
        <PopoverClose asChild>
          <Button size="sm" variant="subtle">
            Cancel
          </Button>
        </PopoverClose>
      </StoryRow>
    </div>
  )
}

function CompactActions() {
  return (
    <div className={compactList}>
      {['Duplicate', 'Rename', 'Delete'].map((label) => (
        <PopoverClose asChild key={label}>
          <Button size="sm" variant="subtle" critical={label === 'Delete'} fullWidth>
            {label}
          </Button>
        </PopoverClose>
      ))}
    </div>
  )
}

function ControlledPopover() {
  const [open, setOpen] = useState(false)
  const [accept, setAccept] = useState(true)
  const [requests, setRequests] = useState<boolean[]>([])
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
      <StoryRow>
        <Button size="sm" variant="outline" onClick={() => setOpen((value) => !value)}>
          External {open ? 'close' : 'open'}
        </Button>
        <Checkbox checked={accept} onCheckedChange={(value) => setAccept(value === true)} label="Accept requests" />
        <PopoverRoot
          open={open}
          onOpenChange={(next) => {
            setRequests((previous) => [...previous, next])
            if (accept) setOpen(next)
          }}>
          <PopoverTrigger asChild>
            <Button size="sm">Controlled trigger</Button>
          </PopoverTrigger>
          <PopoverPortal>
            <PopoverContent align="start">
              <PopoverForm name="Controlled popover" />
            </PopoverContent>
          </PopoverPortal>
        </PopoverRoot>
      </StoryRow>
      <StoryState label="Controlled state" value={{ open, accept, requests }} />
    </div>
  )
}

function RetainedPopover() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('Draft name')
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
      <StoryRow>
        <Popover
          trigger={<Button size="sm">Open retained form</Button>}
          rootProps={{ open, onOpenChange: setOpen, keepMounted: true }}>
          <div className={contentStack}>
            <PopoverTitle className={popoverTitle}>Retained form</PopoverTitle>
            <PopoverDescription>
              <Text as="span" size="sm" tone="muted">
                Close and reopen: the draft and DOM stay mounted while effects and focus are suspended.
              </Text>
            </PopoverDescription>
            <Input size="sm" aria-label="Retained draft" value={draft} onValueChange={setDraft} />
            <PopoverClose asChild>
              <Button size="sm">Done</Button>
            </PopoverClose>
          </div>
        </Popover>
      </StoryRow>
      <StoryState label="Retained state" value={{ open, draft }} />
    </div>
  )
}

function OverlayExamples() {
  return (
    <StoryGrid>
      <StoryCard title="Popover" description="Click-triggered, focusable, with a title, description and actions.">
        <Popover trigger={<Button size="sm">Rename object</Button>}>
          <PopoverForm />
        </Popover>
      </StoryCard>
      <StoryCard title="Tooltip" description="Hover or focus for a short, non-essential explanation.">
        <TooltipProvider delayDuration={300}>
          <Tooltip
            trigger={
              <Button size="sm" variant="outline">
                Hover or focus
              </Button>
            }>
            Short hint for this control
          </Tooltip>
        </TooltipProvider>
      </StoryCard>
      <StoryCard
        title="Hover card"
        description="A non-essential preview that stays open while the pointer moves inside.">
        <HoverCard
          trigger={
            <Button size="sm" variant="subtle">
              Preview material
            </Button>
          }
          rootProps={{ openDelay: 150, closeDelay: 150 }}>
          <div className={css({ display: 'grid', gap: 'var(--space-1)', maxWidth: '240px' })}>
            <strong>Brushed metal</strong>
            <Text as="span" size="sm" tone="muted">
              Preview only. The material name and actions remain visible on the page.
            </Text>
          </div>
        </HoverCard>
      </StoryCard>
    </StoryGrid>
  )
}

function PaddingExamples() {
  return (
    <StoryGrid>
      <StoryCard title="Popover · 12px" description="Default content padding for forms and short panels.">
        <Popover trigger={<Button size="sm">Default padding</Button>}>
          <PopoverForm name="Default padding" />
        </Popover>
      </StoryCard>
      <StoryCard title="Popover compact · 0px" description="Compact puts padding on the inner menu/list instead.">
        <Popover
          trigger={
            <Button size="sm" variant="outline">
              Compact actions
            </Button>
          }
          contentProps={{ compact: true }}>
          <CompactActions />
        </Popover>
      </StoryCard>
      <StoryCard title="Tooltip · 6 × 10" description="12px text with 6px/10px padding.">
        <TooltipProvider>
          <Tooltip
            trigger={
              <Button size="sm" variant="outline">
                Tooltip
              </Button>
            }
            contentProps={{ side: 'right' }}>
            Resize the active object
          </Tooltip>
        </TooltipProvider>
      </StoryCard>
      <StoryCard title="Hover card · 8px" description="8px padding for richer previews.">
        <HoverCard
          trigger={
            <Button size="sm" variant="subtle">
              Hover card
            </Button>
          }
          contentProps={{ side: 'right' }}>
          <div className={css({ display: 'grid', gap: 'var(--space-1)', maxWidth: '220px' })}>
            <strong>Material preview</strong>
            <Text as="span" size="sm" tone="muted">
              Additional context, never the only place for required actions.
            </Text>
          </div>
        </HoverCard>
      </StoryCard>
    </StoryGrid>
  )
}

function HoverControlled() {
  const [open, setOpen] = useState(false)
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
      <StoryRow>
        <HoverCardRoot open={open} onOpenChange={setOpen} openDelay={150}>
          <HoverCardTrigger asChild>
            <Button size="sm" variant="subtle">
              Controlled preview
            </Button>
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent side="right">
              <Text as="span" size="sm" tone="muted">
                The application can open this preview externally.
              </Text>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCardRoot>
        <Button size="sm" variant="outline" onClick={() => setOpen((value) => !value)}>
          Toggle preview
        </Button>
      </StoryRow>
      <StoryState label="Hover card state" value={{ open }} />
    </div>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Popover 承载可操作的临时面板，Tooltip 只放非必要短提示，HoverCard 提供非必要预览。三者共用 surfaceRaised、6px 圆角、overlay shadow 与 150ms 入场；Popover 默认 12px padding，可用 compact 把 padding 交给内容。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Overlays/Popovers',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Overlays"
      title="Popovers, tooltips & hover cards"
      summary="点击打开的可操作浮层、悬停短提示和补充预览。Popover 可以承载表单与按钮，Tooltip 和 HoverCard 只用于非必要信息；开关、焦点返回和 Escape 关闭由组件处理。"
      meta={
        <>
          <span>surfaceRaised</span>
          <span>·</span>
          <span>6px radius</span>
          <span>·</span>
          <span>150ms enter</span>
        </>
      }>
      <StorySection
        title="Variants"
        description="先按交互目的选组件：操作和表单用 Popover，短解释用 Tooltip，补充预览用 HoverCard。">
        <OverlayExamples />
      </StorySection>

      <StorySection
        title="Padding"
        description="尺寸由内容类型决定：Popover 12px，compact 为 0；Tooltip 6×10；HoverCard 8。">
        <PaddingExamples />
      </StorySection>

      <StorySection title="States" description="受控开关允许应用拒绝请求；keepMounted 在关闭时保留表单状态。">
        <StoryGrid>
          <StoryCard title="Controlled open" description="The application accepts or rejects each open-change request.">
            <ControlledPopover />
          </StoryCard>
          <StoryCard title="Retained form" description="DOM and draft survive a close; effects and focus do not.">
            <RetainedPopover />
          </StoryCard>
          <StoryCard
            title="Disabled trigger"
            description="Disabled triggers do not open. Explain the reason in visible text; a separate tooltip trigger can add detail.">
            <StoryRow>
              <Button size="sm" disabled>
                Disabled popover
              </Button>
              <TooltipProvider>
                <Tooltip
                  trigger={
                    <Button size="sm" variant="outline">
                      Tooltip trigger
                    </Button>
                  }>
                  A tooltip can explain why a nearby control is disabled
                </Tooltip>
              </TooltipProvider>
            </StoryRow>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Behavior" description="受控 HoverCard 可以由页面状态打开，也可以继续响应 hover/focus。">
        <StoryCard title="Controlled hover card">
          <HoverControlled />
        </StoryCard>
      </StorySection>

      <StorySection title="Keyboard & accessibility">
        <StoryKeyboard
          rows={[
            { keys: ['Enter', 'Space'], action: 'Opens a popover from its trigger.' },
            { keys: 'Escape', action: 'Closes the topmost popover and returns focus to the trigger.' },
            { keys: 'Tab', action: 'Moves through interactive content; Shift+Tab moves back.' },
            { keys: 'Focus', action: 'Shows a tooltip; Escape dismisses it without moving focus.' },
            { keys: 'Hover', action: 'Opens a hover card; moving into the card keeps it open.' },
          ]}
        />
        <StoryNote>
          Tooltip 和 HoverCard 不能承载必需信息或唯一操作入口。Popover
          的内容需要可聚焦、可键盘操作；触发按钮要有明确的名称。
        </StoryNote>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Popover trigger={<Button>Rename</Button>}>
  <PopoverTitle>Rename object</PopoverTitle>
  <Input value={name} onValueChange={setName} />
  <PopoverClose asChild><Button>Save</Button></PopoverClose>
</Popover>

<TooltipProvider>
  <Tooltip trigger={<Button>Help</Button>}>Short hint</Tooltip>
</TooltipProvider>`}
          />
          <StoryProps
            rows={[
              {
                name: 'Popover.rootProps.open',
                type: 'boolean',
                description: '受控开关；配合 onOpenChange 接受或拒绝请求。',
              },
              {
                name: 'Popover.contentProps.compact',
                type: 'boolean',
                defaultValue: 'false',
                description: '去掉 12px padding，由内部列表负责留白。',
              },
              {
                name: 'Popover.rootProps.keepMounted',
                type: 'boolean',
                defaultValue: 'false',
                description: '关闭后保留 DOM 和表单状态，同时暂停 effect/focus。',
              },
              {
                name: 'Tooltip.rootProps.delayDuration',
                type: 'number',
                defaultValue: '700',
                description: '共享 Provider 下的首次显示延迟。',
              },
              {
                name: 'HoverCard.rootProps.openDelay',
                type: 'number',
                defaultValue: '700',
                description: '悬停进入后的打开延迟。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}
