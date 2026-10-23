import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  AlertDialog,
} from '../src/widgets/dialogs'
import { Button } from '../src/widgets/buttons'
import { ThemeProvider } from '../src/foundation/theme/react'
import { createThemeStore } from '../src/foundation/theme/store'
import { ContractFrame, ControlButton, ControlInput, StatePanel, contractStyles } from './support/ContractFrame'

function ControlledExample() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('Object')
  const [changes, setChanges] = useState<boolean[]>([])
  return (
    <ContractFrame
      title="Controlled dialog"
      description="打开后焦点进入字段；Tab 保持在模态框内，Escape 或关闭按钮请求关闭，并归还到触发按钮。状态配置与内容配置分开。"
      onReset={() => {
        setOpen(false)
        setValue('Object')
        setChanges([])
      }}>
      <Dialog
        title="Rename object"
        description="Change the display name."
        trigger={<Button>Open controlled dialog</Button>}
        rootProps={{
          open,
          onOpenChange: (next) => {
            setOpen(next)
            setChanges((values) => [...values, next])
          },
        }}>
        <label className={contractStyles.stack}>
          Object name
          <ControlInput value={value} onChange={(event) => setValue(event.currentTarget.value)} />
        </label>
      </Dialog>
      <ControlButton>Next focus target</ControlButton>
      <StatePanel label="Dialog state" value={{ open, value, changes }} />
    </ContractFrame>
  )
}

function UncontrolledExample() {
  const [generation, setGeneration] = useState(0)
  const [lastOpen, setLastOpen] = useState(false)
  return (
    <ContractFrame
      title="Uncontrolled, title only"
      description="无需 description 时，不生成空描述或无效 aria-describedby。标题仍是可访问名称；Reset 重建组件以恢复 defaultOpen。"
      onReset={() => {
        setGeneration((value) => value + 1)
        setLastOpen(false)
      }}>
      <Dialog
        key={generation}
        title="Display preferences"
        trigger={<Button>Open title-only dialog</Button>}
        rootProps={{ defaultOpen: false, onOpenChange: setLastOpen }}>
        <ControlInput aria-label="Grid size" defaultValue="16" />
      </Dialog>
      <StatePanel label="Last open notification" value={{ lastOpen }} />
    </ContractFrame>
  )
}

function CompositionExample() {
  const [store] = useState(() => createThemeStore({ initialPreference: 'light' }))
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  return (
    <ContractFrame
      title="Explicit composition and portal"
      description="每个部件可单独配置。Portal 使用指定容器，内容和遮罩继承局部浅色主题；不依赖 document 根主题。"
      onReset={() => setOpen(false)}>
      <ThemeProvider store={store}>
        <DialogRoot open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Open composed light dialog</Button>
          </DialogTrigger>
          <DialogPortal container={container}>
            <DialogOverlay />
            <DialogContent>
              <DialogTitle>Composed dialog</DialogTitle>
              <DialogDescription>Content is rendered into the local portal target.</DialogDescription>
              <div className={contractStyles.stack}>
                <ControlInput aria-label="Composed field" defaultValue="Local value" />
                <DialogClose asChild>
                  <Button>Done</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </DialogPortal>
        </DialogRoot>
        <div ref={setContainer} data-local-portal="dialog" />
      </ThemeProvider>
      <StatePanel label="Composition state" value={{ open, portalReady: !!container, theme: 'light' }} />
    </ContractFrame>
  )
}

function NestedExample() {
  const [outer, setOuter] = useState(false)
  const [inner, setInner] = useState(false)
  return (
    <ContractFrame
      title="Nested dialogs"
      description="Escape 先关闭最上层，焦点返回内层触发按钮；再次 Escape 关闭外层，回到页面触发按钮。"
      onReset={() => {
        setInner(false)
        setOuter(false)
      }}>
      <Dialog
        title="Outer dialog"
        trigger={<Button>Open outer dialog</Button>}
        rootProps={{ open: outer, onOpenChange: setOuter }}>
        <div className={contractStyles.stack}>
          <ControlInput aria-label="Outer field" defaultValue="Outer" />
          <Dialog
            title="Inner dialog"
            trigger={<Button>Open inner dialog</Button>}
            rootProps={{ open: inner, onOpenChange: setInner }}>
            <ControlInput aria-label="Inner field" defaultValue="Inner" />
          </Dialog>
        </div>
      </Dialog>
      <StatePanel label="Nested state" value={{ outer, inner }} />
    </ContractFrame>
  )
}

function AlertExample({ narrow = false }: { narrow?: boolean }) {
  const [last, setLast] = useState('none')
  const [open, setOpen] = useState(false)
  return (
    <ContractFrame
      title={narrow ? 'Long content and narrow viewport' : 'Declarative confirmation'}
      description="确认框优先聚焦 Cancel，点击遮罩不关闭。Confirm/Cancel 各触发一次回调；Escape 只请求关闭。窄屏使用 Storybook viewport，长说明和正文单独滚动，标题与操作按钮保持可见。"
      onReset={() => {
        setOpen(false)
        setLast('none')
      }}>
      <AlertDialog
        title={narrow ? 'Review a long change before applying it' : 'Apply changes?'}
        description={
          narrow
            ? Array.from(
                { length: 18 },
                (_, index) => `Change ${index + 1}: this paragraph wraps within the viewport.`
              ).join('\n\n')
            : undefined
        }
        trigger={<Button>Open confirmation</Button>}
        rootProps={{ open, onOpenChange: setOpen }}
        onConfirm={() => setLast('confirmed')}
        onCancel={() => setLast('cancelled')}
      />
      <StatePanel label="Confirmation state" value={{ open, last }} />
    </ContractFrame>
  )
}

const meta = { title: 'Widgets/Dialogs', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Controlled: Story = { render: () => <ControlledExample /> }
export const UncontrolledTitleOnly: Story = { render: () => <UncontrolledExample /> }
export const CompositionAndTheme: Story = { render: () => <CompositionExample /> }
export const Nested: Story = { render: () => <NestedExample /> }
export const Alert: Story = { render: () => <AlertExample /> }
export const NarrowAndLong: Story = { render: () => <AlertExample narrow /> }
