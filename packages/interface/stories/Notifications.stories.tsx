import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../src/controls/buttons'
import {
  createNotificationService,
  NotificationProvider,
  ToastView,
  useNotifications,
} from '../src/overlays/notifications'
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

const toastStack = css({
  display: 'grid',
  gap: 'var(--space-2)',
  minWidth: 0,
  maxWidth: '100%',
})
const longWord = css({ minWidth: 0, overflowWrap: 'anywhere' })

function DismissibleToast() {
  const [visible, setVisible] = useState(true)
  const [dismissed, setDismissed] = useState(0)
  return (
    <div className={toastStack}>
      <ToastView
        visible={visible}
        onDismiss={() => {
          setVisible(false)
          setDismissed((value) => value + 1)
        }}>
        Changes saved to “Scene 04”
      </ToastView>
      {!visible && (
        <Button size="sm" variant="outline" onClick={() => setVisible(true)}>
          Show notification again
        </Button>
      )}
      <StoryState label="Visibility state" value={{ visible, dismissed }} />
    </div>
  )
}

function ActionToast() {
  const [actions, setActions] = useState(0)
  return (
    <div className={toastStack}>
      <ToastView>
        <span>Change applied to the active layer. </span>
        <Button size="xs" variant="subtle" onClick={() => setActions((value) => value + 1)}>
          Undo
        </Button>
      </ToastView>
      <StoryState label="Inline actions" value={{ undoCount: actions }} />
    </div>
  )
}

function NotificationActions() {
  const service = useNotifications()
  const [events, setEvents] = useState<string[]>([])
  const record = (event: string) => setEvents((previous) => [...previous.slice(-5), event])
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
      <StoryRow>
        <Button size="sm" onClick={() => (service.info('Scene saved', { duration: 60000 }), record('info'))}>
          Info
        </Button>
        <Button size="sm" onClick={() => (service.success('Export finished', { duration: 60000 }), record('success'))}>
          Success
        </Button>
        <Button
          size="sm"
          critical
          onClick={() => (
            service.error('Export failed', { duration: 60000, role: 'alert', ariaLive: 'assertive' }),
            record('error')
          )}>
          Error
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            service.loading('Task update', { id: 'one-task', duration: 60000 })
            record('loading:one-task')
          }}>
          Update same task
        </Button>
      </StoryRow>
      <StoryRow>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const operation = new Promise<string>((resolve) => setTimeout(() => resolve('Export finished'), 800))
            void service.promise(
              operation,
              { loading: 'Exporting scene…', success: (value) => value, error: 'Export failed' },
              { duration: 60000 }
            )
            record('promise:start')
          }}>
          Run promise
        </Button>
        <Button size="sm" variant="subtle" onClick={() => (service.dismiss(), record('dismiss-all'))}>
          Dismiss all
        </Button>
        <Button size="sm" variant="subtle" onClick={() => (service.clear(), record('clear'))}>
          Clear immediately
        </Button>
      </StoryRow>
      <StoryState label="Service events" value={{ events }} />
    </div>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '通知用于保存结果、后台任务和短暂提示。应用创建 createNotificationService，用 NotificationProvider 提供显示区域，再从 useNotifications 发送、更新或关闭消息；同一 id 更新同一条通知。ToastView 可以脱离服务单独渲染，适合自定义内容和内联操作。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Overlays/Notifications',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function NotificationsPage() {
  const [service] = useState(createNotificationService)
  return (
    <StoryPage
      eyebrow="Overlays"
      title="Notifications"
      summary="用状态图标、简短消息和可选操作反馈结果。独立 ToastView 适合自定义展示；NotificationProvider + service 负责排队、同 id 更新、Promise 状态和关闭。"
      meta={
        <>
          <span>320px width</span>
          <span>·</span>
          <span>32px min height</span>
          <span>·</span>
          <span>status / alert</span>
        </>
      }>
      <StorySection
        title="Variants"
        description="info、success、error 和 loading 使用同一表面与图标槽位；error 使用 alert/assertive。">
        <StoryGrid>
          <StoryCard title="Status tones" description="Standalone ToastView; no service or provider required.">
            <div className={toastStack}>
              <ToastView>Scene saved locally</ToastView>
              <ToastView tone="success">Export finished</ToastView>
              <ToastView tone="error" role="alert" aria-live="assertive">
                Export failed
              </ToastView>
              <ToastView tone="loading">Preparing preview</ToastView>
            </div>
          </StoryCard>
          <StoryCard
            title="Custom content"
            description="Inline actions stay inside the notification; dismiss remains optional.">
            <ActionToast />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Sizes & layout"
        description="通知固定 320px 宽，视口不足时收缩；内容换行，长单词不会撑破表面。">
        <StoryGrid>
          <StoryCard title="320px surface" description="8px/10px padding, 32px minimum height, 16px status icon.">
            <div className={toastStack}>
              <ToastView tone="success">Exported “Scene 04” to the asset library</ToastView>
              <ToastView>
                <span className={longWord}>LongUnbrokenNotificationContentMustRemainInsideTheNarrowViewport</span>
              </ToastView>
            </div>
          </StoryCard>
          <StoryCard
            title="Visible state"
            description="visible=false keeps the surface mounted for exit while making it inert.">
            <DismissibleToast />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Behavior"
        description="服务连接后按钮才会发送通知；同一个 id 更新已有任务，Promise 会从 loading 进入 success 或 error。">
        <StoryCard
          title="Notification service"
          description="The Toaster is owned by NotificationProvider at the application boundary.">
          <NotificationProvider service={service}>
            <NotificationActions />
          </NotificationProvider>
        </StoryCard>
      </StorySection>

      <StorySection title="Keyboard & accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: 'Moves focus to the dismiss button or an inline action when present.' },
            { keys: ['Enter', 'Space'], action: 'Activates the focused dismiss button or inline action.' },
            {
              keys: 'Focus',
              action: 'Notification surfaces do not trap focus; close and inline actions remain reachable.',
            },
          ]}
        />
        <StoryNote>
          默认通知使用 role=status 和 polite live region；错误使用 role=alert 和
          assertive。通知不应是唯一的信息来源，关闭按钮通过 `dismissLabel` 提供可读名称，不要只显示图标。
        </StoryNote>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const service = createNotificationService()

<NotificationProvider service={service}>
  <App />
</NotificationProvider>

service.success('Saved', { id: 'save' })
service.promise(save(), {
  loading: 'Saving…',
  success: 'Saved',
  error: 'Could not save',
}, { id: 'save' })`}
          />
          <StoryProps
            rows={[
              {
                name: 'NotificationProvider.service',
                type: 'NotificationService',
                description: '省略时 Provider 创建自己的服务；传入时可在应用其他位置发送通知。',
              },
              {
                name: 'ToastView.tone',
                type: "'info' | 'success' | 'error' | 'loading'",
                defaultValue: "'info'",
                description: '选择状态图标与语义色。',
              },
              {
                name: 'ToastView.onDismiss',
                type: '() => void',
                description: '提供时显示关闭按钮；服务宿主会自动传入 dismiss。',
              },
              {
                name: 'NotificationOptions.id',
                type: 'string',
                description: '同一 id 更新已有通知，而不是新增一条。',
              },
              {
                name: 'NotificationOptions.role / ariaLive',
                type: "'status' | 'alert' / 'polite' | 'assertive' | 'off'",
                description: '错误等需要立即播报的内容使用 alert/assertive。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <NotificationsPage /> }
