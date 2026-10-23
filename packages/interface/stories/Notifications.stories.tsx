import { StrictMode, useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  createNotificationService,
  NotificationProvider,
  ToastView,
  useNotifications,
} from '../src/widgets/notifications'
import { createThemeStore, ThemeProvider } from '../src/foundation/theme'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'

function NotificationActions() {
  const service = useNotifications()
  const [updates, setUpdates] = useState(0)
  return (
    <div className={contractStyles.row}>
      <ControlButton onClick={() => service.info('Scene saved', { duration: 60000 })}>Information</ControlButton>
      <ControlButton onClick={() => service.success('Export finished', { duration: 60000 })}>Success</ControlButton>
      <ControlButton
        onClick={() => service.error('Export failed', { duration: 60000, role: 'alert', ariaLive: 'assertive' })}>
        Error
      </ControlButton>
      <ControlButton
        onClick={() => {
          const next = updates + 1
          setUpdates(next)
          service.loading(`Task update ${next}`, { id: 'one-task' })
        }}>
        Update same task
      </ControlButton>
      <ControlButton onClick={() => service.dismiss()}>Dismiss all</ControlButton>
      <ControlButton onClick={() => service.clear()}>Clear immediately</ControlButton>
      <output>Task updates: {updates}</output>
    </div>
  )
}

function OverviewExample() {
  const [service] = useState(createNotificationService)
  const [generation, setGeneration] = useState(0)
  return (
    <ContractFrame
      title="Application notification host"
      description="Provider 提供一个通知服务和宿主；同一 id 更新同一条通知，主题由自有 ToastView 呈现。"
      onReset={() => {
        service.clear()
        setGeneration((value) => value + 1)
      }}>
      <NotificationProvider service={service}>
        <NotificationActions key={generation} />
      </NotificationProvider>
    </ContractFrame>
  )
}

function LifecycleExample() {
  const [service] = useState(createNotificationService)
  const [mounted, setMounted] = useState(true)
  const [duplicate, setDuplicate] = useState(false)
  const [result, setResult] = useState('Idle')
  const pending = useRef<((value: string) => void) | null>(null)
  const alive = useRef(false)
  const sequence = useRef(0)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      sequence.current++
      pending.current?.('Disposed')
    }
  }, [])
  const begin = () => {
    const current = ++sequence.current
    service.clear()
    pending.current?.('Replaced')
    const operation = new Promise<string>((resolve) => {
      pending.current = resolve
    })
    setResult('Pending')
    void service
      .promise(
        operation,
        { loading: 'Waiting for manual completion', success: (value) => value, error: 'Failed' },
        { id: 'deferred-task', duration: 60000 }
      )
      .then((value) => {
        if (alive.current && sequence.current === current) setResult(value)
      })
  }
  return (
    <ContractFrame
      title="Notifications: lifecycle and duplicate hosts"
      description="同一服务重复装配只呈现一个宿主。关闭通知、清理或真实卸载后，迟到结果不会重新出现；StrictMode 重连保留当前作用域。"
      onReset={() => {
        sequence.current++
        service.clear()
        pending.current?.('Reset')
        pending.current = null
        setMounted(true)
        setDuplicate(false)
        setResult('Idle')
      }}>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setMounted(!mounted)}>
          {mounted ? 'Unmount primary provider' : 'Mount primary provider'}
        </ControlButton>
        <label>
          <input type="checkbox" checked={duplicate} onChange={(e) => setDuplicate(e.currentTarget.checked)} />{' '}
          Duplicate provider
        </label>
        <ControlButton onClick={begin}>Start deferred operation</ControlButton>
        <ControlButton
          onClick={() => {
            pending.current?.('Completed operation')
            pending.current = null
          }}>
          Resolve operation
        </ControlButton>
        <ControlButton onClick={() => service.clear()}>Clear pending notification</ControlButton>
      </div>
      {mounted && (
        <NotificationProvider service={service}>
          <NotificationActions />
        </NotificationProvider>
      )}
      {duplicate && (
        <NotificationProvider service={service}>
          <span>Second connection to the same service</span>
        </NotificationProvider>
      )}
      <StatePanel label="Notification lifecycle" value={{ mounted, duplicate, result }} />
    </ContractFrame>
  )
}

function ThemedScope({ mode }: { mode: 'light' | 'dark' }) {
  const [store] = useState(() => createThemeStore({ initialPreference: mode }))
  const [service] = useState(createNotificationService)
  return (
    <ThemeProvider store={store}>
      <NotificationProvider service={service} hostProps={{ position: mode === 'light' ? 'top-left' : 'top-right' }}>
        <ControlButton
          onClick={() => service.success(`${mode} scoped notification`, { id: 'same-id', duration: 60000 })}>
          Notify {mode} scope
        </ControlButton>
        <ControlButton onClick={() => service.clear()}>Clear {mode} scope</ControlButton>
      </NotificationProvider>
    </ThemeProvider>
  )
}

function ScopedExample() {
  const [generation, setGeneration] = useState(0)
  return (
    <ContractFrame
      title="Isolated themes and notification scopes"
      description="两个应用域可使用相同通知 id；清理其中一个不影响另一个。Portal 到 body 后仍使用各自 Provider 的明暗主题。"
      onReset={() => setGeneration((value) => value + 1)}>
      <div key={generation} className={contractStyles.row}>
        <ThemedScope mode="light" />
        <ThemedScope mode="dark" />
      </div>
    </ContractFrame>
  )
}

function PresentationExample() {
  const [actions, setActions] = useState(0)
  return (
    <ContractFrame
      title="Toast presentation without scheduling"
      description="ToastView 只负责展示与动作。状态/时长/队列由注入服务和通知调度适配器负责。"
      onReset={() => setActions(0)}>
      <div style={{ width: 220, maxWidth: '100%' }} className={contractStyles.stack}>
        <ToastView>LongUnbrokenNotificationContentMustRemainInsideTheNarrowViewport</ToastView>
        <ToastView tone="loading">Preparing preview</ToastView>
        <ToastView tone="success">Saved</ToastView>
        <ToastView tone="error" role="alert">
          Unable to save
        </ToastView>
        <ToastView>
          <span>Change applied </span>
          <ControlButton onClick={() => setActions((value) => value + 1)}>Undo</ControlButton>
        </ToastView>
      </div>
      <StatePanel label="Presentation state" value={{ actions }} />
    </ContractFrame>
  )
}

const meta = {
  title: 'Overlays/Notifications',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <StrictMode>
        <Story />
      </StrictMode>
    ),
  ],
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <OverviewExample /> }
export const Lifecycle: Story = { render: () => <LifecycleExample /> }
export const ScopedThemes: Story = { render: () => <ScopedExample /> }
export const Presentation: Story = { render: () => <PresentationExample /> }
