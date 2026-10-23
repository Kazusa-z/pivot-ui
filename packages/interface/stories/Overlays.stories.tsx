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
        Edit the draft, then close with Escape or Close.
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
            <p className={contractStyles.note}>An optional material preview. It contains no required controls.</p>
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
        Visible material summary remains available without opening the card.
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

const meta = { title: 'Widgets/Overlays', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const PopoverUncontrolled: Story = {
  render: () => (
    <ExampleFrame
      title="Popover: uncontrolled"
      description="Repeated opening, Close, Escape and outside clicks restore focus. Default content unmounts when closed.">
      {(key) => <UncontrolledExample key={key} />}
    </ExampleFrame>
  ),
}
export const PopoverControlled: Story = {
  render: () => (
    <ExampleFrame
      title="Popover: controlled"
      description="Root owns open requests. Disable accepting requests to verify that Escape and Close cannot override the supplied state.">
      {(key) => <ControlledExample key={key} />}
    </ExampleFrame>
  ),
}
export const PopoverKeepMounted: Story = {
  render: () => (
    <ExampleFrame
      title="Popover: retained content"
      description="Edit the draft/count, close and reopen: state remains. While closed, effects are zero, the page accepts focus/click/scroll, including after a modal open.">
      {(key) => <KeepMountedExample key={key} />}
    </ExampleFrame>
  ),
}
export const NestedPopovers: Story = {
  render: () => (
    <ExampleFrame
      title="Nested popovers"
      description="Open outer then inner. Escape closes the inner first and restores its trigger; the next Escape closes the outer.">
      {(key) => <NestedExample key={key} />}
    </ExampleFrame>
  ),
}
export const SharedTooltips: Story = {
  render: () => (
    <ExampleFrame
      title="Tooltip: shared provider"
      description="Hover or focus the buttons. A shared provider coordinates delay/skip-delay; Escape dismisses the hint without moving focus. Root control is separate from content position.">
      {(key) => <TooltipsExample key={key} />}
    </ExampleFrame>
  ),
}
export const HoverCardPreview: Story = {
  render: () => (
    <ExampleFrame
      title="HoverCard: optional preview"
      description="Hover/focus the links or externally control the second preview. Pointer transfer into content keeps it visible; required information remains on the page.">
      {(key) => <HoverCardsExample key={key} />}
    </ExampleFrame>
  ),
}
export const PortalTheme: Story = {
  render: () => (
    <ExampleFrame
      title="Local theme and portal container"
      description="Change the local theme independently of Storybook. All three content surfaces inherit that theme inside the explicit portal container.">
      {(key) => <PortalThemeExample key={key} />}
    </ExampleFrame>
  ),
}
export const StrictModeLifecycle: Story = {
  render: () => (
    <ExampleFrame
      title="StrictMode and unmount"
      description="Open/close repeatedly, then unmount the modal from inside. Active effects return to zero and page actions/focus remain usable. Mount creates a fresh lifecycle.">
      {(key) => <StrictModeExample key={key} />}
    </ExampleFrame>
  ),
}
