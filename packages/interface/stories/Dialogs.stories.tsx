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
      title="由应用控制的弹窗"
      description="点击按钮打开重命名表单，焦点进入输入框，Tab 在模态内容内移动。Escape 或关闭按钮触发 onOpenChange；应用回写 open 后关闭弹窗，焦点回到触发按钮。"
      onReset={() => {
        setOpen(false)
        setValue('Object')
        setChanges([])
      }}>
      <Dialog
        title="Rename object"
        description="编辑对象的显示名称。"
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
      title="仅有标题的简单弹窗"
      description="简短弹窗可以只提供 title 作为名称。此例由组件保存开关状态，onOpenChange 记录变化；Reset 重新创建实例并恢复 defaultOpen。"
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
      title="自定义弹窗部件与显示位置"
      description="需要调整标题、关闭按钮或渲染位置时，可直接组合 Dialog 的各个部件。此例把 Portal 放入指定容器，内容与遮罩都使用该区域的浅色主题。"
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
              <DialogDescription>此内容显示在为 Portal 指定的局部容器中。</DialogDescription>
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
      title="在弹窗中打开下一层操作"
      description="打开外层后还可进入内层弹窗。Escape 先关闭最上层并返回其触发按钮，再次按下会关闭外层；应用分别保存两个 open 值。"
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
      title={narrow ? '窄视口中的长确认内容' : '等待确认后执行操作'}
      description="AlertDialog 适合需要明确决定的操作，打开时优先聚焦 Cancel。Confirm 和 Cancel 将决定交给各自回调，Escape 通过 onOpenChange 请求关闭，遮罩点击会保留弹窗。可缩小预览宽度查看长内容滚动，标题和操作按钮持续可见。"
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

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Dialogs',
  parameters: {
    docs: {
      description: {
        component:
          'Dialog 用于需要集中注意力的表单或详细操作，AlertDialog 适合需要明确确认的操作。打开后焦点进入弹窗，关闭后回到触发按钮；通过 rootProps 传入 open 和 onOpenChange 可由应用控制开关。也可直接组合 Root、Trigger、Portal、Content 等部件，并为内容提供标题和必要的说明。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Controlled: Story = { render: () => <ControlledExample /> }
export const UncontrolledTitleOnly: Story = { render: () => <UncontrolledExample /> }
export const CompositionAndTheme: Story = { render: () => <CompositionExample /> }
export const Nested: Story = { render: () => <NestedExample /> }
export const Alert: Story = { render: () => <AlertExample /> }
export const NarrowAndLong: Story = { render: () => <AlertExample narrow /> }
