import { StrictMode, useEffect, useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../src/widgets/buttons'
import {
  Popover,
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverClose,
  PopoverTitle,
  PopoverDescription,
  PopoverArrow,
  Tooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
  HoverCard,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  HoverCardArrow,
} from '../src/widgets/overlays'
import { ThemeProvider, createThemeStore, themeClasses, useTheme } from '../src/foundation/theme'
import { css } from '../styled-system/css'
import { ContractFrame, ControlButton, ControlInput, StatePanel, contractStyles } from './support/ContractFrame'

const contentStack = css({ display: 'flex', flexDirection: 'column', gap: '10px', width: '240px', maxWidth: '100%' })
const headingClass = css({ margin: 0, fontSize: '14px', fontWeight: 600 })

function PopoverForm({ name = 'Popover' }: { name?: string }) {
  const [value, setValue] = useState('Draft')
  const [count, setCount] = useState(0)
  return (
    <div className={contentStack}>
      <PopoverTitle className={headingClass}>{name}</PopoverTitle>
      <PopoverDescription className={contractStyles.note}>
        编辑草稿后，可按 Escape 或点击 Close 关闭面板。
      </PopoverDescription>
      <ControlInput aria-label={`${name} draft`} value={value} onChange={(event) => setValue(event.target.value)} />
      <Button onClick={() => setCount((previous) => previous + 1)}>Count {count}</Button>
      <PopoverClose asChild>
        <Button>Close {name}</Button>
      </PopoverClose>
    </div>
  )
}

function ExampleFrame({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: (generation: number) => ReactNode
}) {
  const [generation, setGeneration] = useState(0)
  return (
    <ContractFrame title={title} description={description} onReset={() => setGeneration((value) => value + 1)}>
      {children(generation)}
    </ContractFrame>
  )
}

function UncontrolledExample() {
  const [changes, setChanges] = useState<boolean[]>([])
  return (
    <>
      <div className={contractStyles.row}>
        <Popover
          trigger={<Button>Open uncontrolled</Button>}
          rootProps={{ onOpenChange: (open) => setChanges((previous) => [...previous, open]) }}>
          <PopoverForm name="Uncontrolled" />
          <PopoverArrow />
        </Popover>
        <ControlButton>Outside focus target</ControlButton>
      </div>
      <StatePanel label="Open changes" value={changes} />
    </>
  )
}

function ControlledExample() {
  const [open, setOpen] = useState(false)
  const [acceptRequests, setAcceptRequests] = useState(true)
  const [requests, setRequests] = useState<boolean[]>([])
  return (
    <>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setOpen((value) => !value)}>External {open ? 'close' : 'open'}</ControlButton>
        <label>
          <input
            type="checkbox"
            checked={acceptRequests}
            onChange={(event) => setAcceptRequests(event.target.checked)}
          />{' '}
          Accept requests
        </label>
        <PopoverRoot
          open={open}
          onOpenChange={(next) => {
            setRequests((previous) => [...previous, next])
            if (acceptRequests) setOpen(next)
          }}>
          <PopoverTrigger asChild>
            <Button>Controlled trigger</Button>
          </PopoverTrigger>
          <PopoverPortal>
            <PopoverContent align="start">
              <PopoverForm name="Controlled" />
            </PopoverContent>
          </PopoverPortal>
        </PopoverRoot>
      </div>
      <StatePanel label="Controlled state" value={{ open, acceptRequests, requests }} />
    </>
  )
}

function EffectProbe({ report }: { report: (delta: number) => void }) {
  useEffect(() => {
    report(1)
    return () => report(-1)
  }, [report])
  return null
}

function KeepMountedExample() {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(false)
  const [effects, setEffects] = useState(0)
  const [outsideClicks, setOutsideClicks] = useState(0)
  const [report] = useState(() => (delta: number) => setEffects((value) => value + delta))
  return (
    <>
      <div className={contractStyles.row}>
        <label>
          <input type="checkbox" checked={modal} disabled={open} onChange={(event) => setModal(event.target.checked)} />{' '}
          Modal while open
        </label>
        <Popover
          trigger={<Button>Open retained form</Button>}
          rootProps={{ open, onOpenChange: setOpen, keepMounted: true, modal }}>
          <EffectProbe report={report} />
          <PopoverForm name="Retained" />
        </Popover>
        <ControlButton onClick={() => setOutsideClicks((value) => value + 1)}>
          Outside click {outsideClicks}
        </ControlButton>
      </div>
      <ControlInput aria-label="Outside input" placeholder="Focusable after closing" />
      <StatePanel label="Retained lifecycle" value={{ open, modal, activeContentEffects: effects, outsideClicks }} />
      <div className={css({ height: '140px', overflow: 'auto', border: '1px solid var(--colors-border)' })}>
        <div className={css({ height: '450px', padding: '8px' })}>
          Scroll here while the retained popover is closed.
        </div>
      </div>
    </>
  )
}

function NestedExample() {
  return (
    <Popover trigger={<Button>Open outer</Button>}>
      <div className={contentStack}>
        <PopoverTitle className={headingClass}>Outer popover</PopoverTitle>
        <ControlInput aria-label="Outer field" defaultValue="Outer" />
        <Popover trigger={<Button>Open inner</Button>} contentProps={{ side: 'right', align: 'start' }}>
          <PopoverForm name="Inner" />
        </Popover>
        <PopoverClose asChild>
          <Button>Close outer</Button>
        </PopoverClose>
      </div>
    </Popover>
  )
}

function TooltipsExample() {
  const [controlledOpen, setControlledOpen] = useState(false)
  const [requests, setRequests] = useState<boolean[]>([])
  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={600}>
      <div className={contractStyles.row}>
        <Tooltip trigger={<Button>Tooltip one</Button>}>
          First shared hint
          <TooltipArrow />
        </Tooltip>
        <Tooltip trigger={<Button>Tooltip two</Button>} contentProps={{ side: 'right' }}>
          Second shared hint
        </Tooltip>
        <TooltipRoot
          open={controlledOpen}
          onOpenChange={(open) => {
            setControlledOpen(open)
            setRequests((previous) => [...previous, open])
          }}>
          <TooltipTrigger asChild>
            <Button>Controlled hint</Button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="top">
              Controlled tooltip
              <TooltipArrow />
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
        <ControlButton onClick={() => setControlledOpen((value) => !value)}>Toggle tooltip externally</ControlButton>
      </div>
      <StatePanel label="Tooltip state" value={{ controlledOpen, requests }} />
    </TooltipProvider>
  )
}

function HoverCardsExample() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className={contractStyles.row}>
        <HoverCard
          trigger={
            <a href="#asset-summary" onClick={(event) => event.preventDefault()}>
              Preview material
            </a>
          }
          rootProps={{ openDelay: 150, closeDelay: 150 }}>
          <div className={contentStack}>
            <strong>Brushed metal</strong>
            <p className={contractStyles.note}>这里展示材质的补充预览，主要信息与操作入口保留在页面上。</p>
          </div>
          <HoverCardArrow />
        </HoverCard>
        <HoverCardRoot open={open} onOpenChange={setOpen} openDelay={150}>
          <HoverCardTrigger asChild>
            <a href="#controlled-preview" onClick={(event) => event.preventDefault()}>
              Controlled preview
            </a>
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent side="right">
              Additional preview information.
              <HoverCardArrow />
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCardRoot>
        <ControlButton onClick={() => setOpen((value) => !value)}>Toggle preview externally</ControlButton>
      </div>
      <p id="asset-summary" className={contractStyles.note}>
        材质摘要直接显示在页面上，悬停卡片提供更多预览。
      </p>
      <StatePanel label="Hover card state" value={{ open }} />
    </>
  )
}

function LocalThemeContent() {
  const { resolvedTheme, setPreference } = useTheme()
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  return (
    <div className={themeClasses[resolvedTheme]} data-theme={resolvedTheme}>
      <div
        className={css({
          padding: '16px',
          minHeight: '180px',
          background: 'var(--colors-surface)',
          color: 'var(--colors-text)',
          border: '1px solid var(--colors-border)',
        })}>
        <div className={contractStyles.row}>
          <ControlButton onClick={() => setPreference(resolvedTheme === 'light' ? 'dark' : 'light')}>
            Local theme: {resolvedTheme}
          </ControlButton>
          <Popover trigger={<Button>Local popover</Button>} portalProps={{ container }}>
            <PopoverForm name="Local theme" />
          </Popover>
          <Tooltip
            trigger={<Button>Local tooltip</Button>}
            portalProps={{ container }}
            rootProps={{ delayDuration: 0 }}>
            Local theme tooltip
          </Tooltip>
          <HoverCard
            trigger={
              <a href="#preview" onClick={(event) => event.preventDefault()}>
                Local preview
              </a>
            }
            portalProps={{ container }}
            rootProps={{ openDelay: 0 }}>
            Local theme hover card
          </HoverCard>
        </div>
        <div ref={setContainer} data-testid="overlay-portal-container" />
      </div>
    </div>
  )
}
function PortalThemeExample() {
  const [store] = useState(() => createThemeStore({ initialPreference: 'light' }))
  return (
    <ThemeProvider store={store}>
      <LocalThemeContent />
    </ThemeProvider>
  )
}

function LifecycleContent({ onRemove, report }: { onRemove: () => void; report: (delta: number) => void }) {
  return (
    <Popover trigger={<Button>StrictMode trigger</Button>} rootProps={{ keepMounted: true, modal: true }}>
      <EffectProbe report={report} />
      <div className={contentStack}>
        <PopoverTitle className={headingClass}>StrictMode lifecycle</PopoverTitle>
        <ControlInput aria-label="StrictMode draft" defaultValue="Preserved" />
        <Button onClick={onRemove}>Unmount from content</Button>
        <PopoverClose asChild>
          <Button>Close StrictMode</Button>
        </PopoverClose>
      </div>
    </Popover>
  )
}
function StrictModeExample() {
  const [mounted, setMounted] = useState(true)
  const [effects, setEffects] = useState(0)
  const [clicks, setClicks] = useState(0)
  const [report] = useState(() => (delta: number) => setEffects((value) => value + delta))
  return (
    <>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setMounted((value) => !value)}>
          {mounted ? 'Unmount' : 'Mount'} overlay
        </ControlButton>
        <ControlButton onClick={() => setClicks((value) => value + 1)}>Page action {clicks}</ControlButton>
        <StrictMode>{mounted && <LifecycleContent onRemove={() => setMounted(false)} report={report} />}</StrictMode>
      </div>
      <ControlInput aria-label="After unmount focus target" />
      <StatePanel label="StrictMode lifecycle" value={{ mounted, activeContentEffects: effects, clicks }} />
    </>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Overlays',
  parameters: {
    docs: {
      description: {
        component:
          'Popover 用于点击后展开的小型表单或操作面板，Tooltip 用于悬停或聚焦时的短提示，HoverCard 用于补充预览。Root 的 open 和 onOpenChange 控制开关，便捷组合通过 rootProps 传入；Portal 容器和内容属性分别配置。TooltipProvider 放在共享提示的应用边界，必需信息与操作应放在页面或可主动打开的面板中。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const PopoverUncontrolled: Story = {
  render: () => (
    <ExampleFrame
      title="Popover：临时编辑面板"
      description="Popover 适合临时编辑小段内容。点击触发按钮打开，用 Close 或 Escape 关闭后焦点回到触发按钮；也可点击外部区域继续页面操作。默认关闭时卸载内容，再次打开会创建新的表单状态。">
      {(key) => <UncontrolledExample key={key} />}
    </ExampleFrame>
  ),
}
export const PopoverControlled: Story = {
  render: () => (
    <ExampleFrame
      title="Popover：由应用决定开关"
      description="需要由应用决定是否关闭时，使用 open 和 onOpenChange。此例记录触发按钮、Escape 和 Close 发出的开关请求；取消 Accept requests 后应用保留原值，因此面板继续按传入状态显示。">
      {(key) => <ControlledExample key={key} />}
    </ExampleFrame>
  ),
}
export const PopoverKeepMounted: Story = {
  render: () => (
    <ExampleFrame
      title="Popover：关闭后保留表单状态"
      description="keepMounted 适合需要在多次打开之间保留草稿的表单。修改文字或计数后关闭，再次打开仍保留状态；关闭期间内容隐藏、effect 暂停，页面恢复正常聚焦、点击与滚动。">
      {(key) => <KeepMountedExample key={key} />}
    </ExampleFrame>
  ),
}
export const NestedPopovers: Story = {
  render: () => (
    <ExampleFrame
      title="嵌套的小型操作面板"
      description="嵌套 Popover 可把次级编辑放在当前操作旁。先打开外层再打开内层，Escape 会先关闭内层并返回它的触发按钮，再次按下则关闭外层。">
      {(key) => <NestedExample key={key} />}
    </ExampleFrame>
  ),
}
export const SharedTooltips: Story = {
  render: () => (
    <ExampleFrame
      title="Tooltip：共享等待时间的提示"
      description="Tooltip 适合解释按钮或缩写。悬停或聚焦按钮即可查看提示；共享 TooltipProvider 协调多个提示的等待时间。Escape 收起提示并保留当前焦点，受控开关与内容位置分别配置。">
      {(key) => <TooltipsExample key={key} />}
    </ExampleFrame>
  ),
}
export const HoverCardPreview: Story = {
  render: () => (
    <ExampleFrame
      title="HoverCard：查看补充预览"
      description="HoverCard 适合链接旁的补充预览。悬停链接后可以把指针移入卡片继续查看，也可通过 open 和 onOpenChange 从应用控制显示；主要信息和操作入口应直接放在页面中。">
      {(key) => <HoverCardsExample key={key} />}
    </ExampleFrame>
  ),
}
export const PortalTheme: Story = {
  render: () => (
    <ExampleFrame
      title="浮层的局部主题与显示位置"
      description="局部 ThemeProvider 可以让这组控件独立切换明暗主题。Popover、Tooltip 和 HoverCard 的内容都通过指定 Portal 容器显示，并沿用所在区域的主题。">
      {(key) => <PortalThemeExample key={key} />}
    </ExampleFrame>
  ),
}
export const StrictModeLifecycle: Story = {
  render: () => (
    <ExampleFrame
      title="移除并重新挂载弹层"
      description="此例展示弹层随所属组件挂载和卸载的行为。打开后可从内容中移除组件，浮层与活动 effect 会一并清理；页面操作仍可使用，重新挂载会建立新的表单状态。">
      {(key) => <StrictModeExample key={key} />}
    </ExampleFrame>
  ),
}
