import type { CSSProperties, ReactElement } from 'react'
import { toast as schedule } from 'react-hot-toast'

export type NotificationMessage = string | ReactElement | null
export type NotificationPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
export interface NotificationOptions {
  id?: string
  duration?: number
  icon?: NotificationMessage
  position?: NotificationPosition
  role?: 'status' | 'alert'
  ariaLive?: 'polite' | 'assertive' | 'off'
  className?: string
  style?: CSSProperties
}
export interface NotificationPromiseMessages<T> {
  loading: NotificationMessage
  success: NotificationMessage | ((value: T) => NotificationMessage)
  error: NotificationMessage | ((error: unknown) => NotificationMessage)
}

export interface NotificationService {
  readonly id: string
  /** Returns null while no provider is connected. An existing id updates one notification. */
  info(message: NotificationMessage, options?: NotificationOptions): string | null
  success(message: NotificationMessage, options?: NotificationOptions): string | null
  error(message: NotificationMessage, options?: NotificationOptions): string | null
  loading(message: NotificationMessage, options?: NotificationOptions): string | null
  dismiss(id?: string): void
  clear(): void
  /** 根据 Promise 显示等待、成功或失败消息。清空通知后结束展示；需要取消任务时，应用调用对应操作的取消接口。 */
  promise<T>(operation: Promise<T>, messages: NotificationPromiseMessages<T>, options?: NotificationOptions): Promise<T>
  /** Provider lifecycle; reference counted so nested providers can share a service. */
  connect(): () => void
}

let nextService = 0

/** 创建可共享的通知服务。将服务传给 NotificationProvider 后，可从组件或应用任务中发送和更新消息。 */
export function createNotificationService(): NotificationService {
  const id = `pivot-notifications-${++nextService}`
  let connections = 0
  let lifecycle = 0
  let generation = 0
  const pending = new Map<string, symbol>()
  const show = (
    type: 'blank' | 'success' | 'error' | 'loading',
    message: NotificationMessage,
    options?: NotificationOptions
  ) => {
    if (options?.id) pending.delete(options.id)
    const { role = 'status', ariaLive = 'polite', ...schedulerOptions } = options ?? {}
    return connections
      ? (type === 'blank' ? schedule : schedule[type])(message, {
          ...schedulerOptions,
          ariaProps: { role, 'aria-live': ariaLive },
          toasterId: id,
        })
      : null
  }
  const clear = () => {
    generation++
    pending.clear()
    schedule.removeAll(id)
  }
  return {
    id,
    info: (message, options) => show('blank', message, options),
    success: (message, options) => show('success', message, options),
    error: (message, options) => show('error', message, options),
    loading: (message, options) => show('loading', message, options),
    dismiss: (toastId) => {
      if (toastId) pending.delete(toastId)
      else pending.clear()
      schedule.dismiss(toastId, id)
    },
    clear,
    async promise(operation, messages, options) {
      const version = generation
      const toastId = show('loading', messages.loading, options)
      const request = Symbol('notification-promise')
      if (toastId) pending.set(toastId, request)
      const isCurrent = () => connections > 0 && version === generation && !!toastId && pending.get(toastId) === request
      try {
        const value = await operation
        if (isCurrent() && toastId) {
          const message = typeof messages.success === 'function' ? messages.success(value) : messages.success
          // A caller's formatter can clear, dismiss, or replace this notification synchronously.
          if (isCurrent()) show('success', message, { ...options, id: toastId })
        }
        return value
      } catch (error) {
        if (isCurrent() && toastId) {
          const message = typeof messages.error === 'function' ? messages.error(error) : messages.error
          if (isCurrent()) show('error', message, { ...options, id: toastId })
        }
        throw error
      } finally {
        if (toastId && pending.get(toastId) === request) pending.delete(toastId)
      }
    },
    connect() {
      connections++
      lifecycle++
      let connected = true
      return () => {
        if (!connected) return
        connected = false
        connections--
        const version = ++lifecycle
        // React StrictMode reconnects synchronously; actual unmount clears only this scope.
        queueMicrotask(() => {
          if (!connections && lifecycle === version) clear()
        })
      }
    },
  }
}
