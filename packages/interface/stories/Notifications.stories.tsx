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
      title="在应用中发送通知"
      description="NotificationProvider 将服务连接到通知显示区域。点击不同按钮发送消息，同一任务使用相同 id 更新已有通知；应用通过 dismiss 关闭通知，或通过 clear 立即清除。"
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
      title="任务通知的更新与清除"
      description="异步任务可以先显示等待提示，再用结果更新通知。此例提供完成、清除和卸载操作；应用结束这次任务的显示后，服务会忽略其迟到更新。多个 Provider 连接同一服务时，共享一处通知显示区域。"
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
      title="独立区域的通知和主题"
      description="为两个区域分别创建通知服务，可以各自发送和清除消息。它们可使用相同 id 表示各自任务，通知浮层仍沿用所在 Provider 的明暗主题。"
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
      title="自定义通知内容与动作"
      description="ToastView 适合自定义通知外观与操作按钮。这里展示加载、成功、错误和撤销动作；应用决定消息内容及操作回调，显示时长和更新调度可交给通知服务。"
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
  tags: ['autodocs'],
  title: 'Overlays/Notifications',
  parameters: {
    docs: {
      description: {
        component:
          '通知组件适合反馈保存结果、后台任务和短暂提示。应用创建 createNotificationService，并用 NotificationProvider 提供显示区域；useNotifications 获取服务后可发送、更新或关闭通知。同一 id 用于更新同一任务，ToastView 用于自定义展示，任务执行和结果处理由应用负责。',
      },
    },
    layout: 'fullscreen',
  },
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
