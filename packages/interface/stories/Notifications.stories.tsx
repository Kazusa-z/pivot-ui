import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  createNotificationService,
  NotificationProvider,
  ToastView,
  useNotifications,
} from '../src/overlays/notifications'
import { Button } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Column, Row } from './support/layout'

function NotificationActions() {
  const notifications = useNotifications()
  return (
    <Row>
      <Button onClick={() => notifications.success('Scene saved')}>Success</Button>
      <Button onClick={() => notifications.info('Lightmaps will rebuild on the next bake')}>Info</Button>
      <Button onClick={() => notifications.error('Export failed: disk is full', { role: 'alert' })}>Error</Button>
      <Button
        onClick={() =>
          notifications.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
            loading: 'Exporting scene…',
            success: 'Exported to Assets/Exports',
            error: 'Export failed',
          })
        }>
        Promise
      </Button>
      <Button variant="subtle" onClick={() => notifications.clear()}>
        Clear
      </Button>
    </Row>
  )
}

const meta = {
  title: 'Overlays/Notifications',
  component: NotificationProvider,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '在屏幕角落短暂显示的通知：保存结果、后台任务进度、错误。',
    use: [
      '操作完成后的反馈："已保存"',
      '后台任务：`promise()` 从 loading 自动切换到 success 或 error',
      '同一个任务的进度更新：传相同的 `id`',
    ],
    avoid: ['需要用户做决定 → 用 `AlertDialog`', '一直需要可见的状态 → 用 `Callout`', '字段校验错误 → 显示在字段旁边'],
    related: ['`Callout`：持续可见的提示', '`AlertDialog`：需要明确回答的确认'],
    notes: [
      '应用启动时 `createNotificationService()` 创建一次，用 `NotificationProvider` 放在根部；组件里用 `useNotifications()` 发送',
      '服务方法：`info` / `success` / `error` / `loading` / `promise` / `dismiss` / `clear`',
      '`ToastView` 是通知的外观，可以单独渲染在自定义位置',
      '通知不应是唯一的信息来源，重要结果也要能在界面其他地方找到',
    ],
  }),
  args: { children: null },
  argTypes: { children: { control: false }, service: { control: false } },
} satisfies Meta<typeof NotificationProvider>
export default meta
type Story = StoryObj<typeof meta>

/** 每个按钮通过 `useNotifications()` 发送一条通知；Promise 按钮演示 loading → success。 */
export const Basic: Story = {
  render: function Render(args) {
    const [service] = useState(createNotificationService)
    return (
      <NotificationProvider {...args} service={service}>
        <NotificationActions />
      </NotificationProvider>
    )
  },
}

/** `ToastView` 的四种状态，可以脱离服务单独使用；提供 `onDismiss` 时显示关闭按钮。 */
export const Appearance: Story = {
  render: () => (
    <Column width={360}>
      <ToastView>Scene saved locally</ToastView>
      <ToastView tone="success">Export finished</ToastView>
      <ToastView tone="error" role="alert" aria-live="assertive" onDismiss={() => {}}>
        Upload failed. Check your connection.
      </ToastView>
      <ToastView tone="loading">Preparing preview</ToastView>
    </Column>
  ),
}

/** 相同 `id` 更新同一条通知：loading 之后用 success 覆盖。 */
export const BehaviorUpdateById: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [service] = useState(createNotificationService)
    return (
      <NotificationProvider service={service}>
        <Row>
          <Button onClick={() => service.loading('Uploading 3 assets…', { id: 'upload' })}>Start</Button>
          <Button onClick={() => service.success('Uploaded 3 assets', { id: 'upload' })}>Finish</Button>
          <Button variant="subtle" onClick={() => service.dismiss('upload')}>
            Dismiss
          </Button>
        </Row>
      </NotificationProvider>
    )
  },
}
