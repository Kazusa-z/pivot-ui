import { useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Toaster as SchedulerHost, resolveValue, toast, type ToasterProps as SchedulerHostProps } from 'react-hot-toast'
import { ToastView } from './ToastView'
import { useOverlayTheme } from '../overlays/shared'
import { cx } from '../../../styled-system/css'

export interface ToasterProps extends Omit<SchedulerHostProps, 'children'> {
  /** Defaults to document.body after mount; portal nodes are owned by React. */
  container?: Element | DocumentFragment | null
  dismissible?: boolean
  dismissLabel?: string
  onDismiss?: (id: string) => void
}

// Elect one visual host per scheduler id. Separate ids remain independent.
const hosts = new Map<string, Set<symbol>>()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const noHost = () => null

export function Toaster({
  toasterId,
  container,
  dismissible = true,
  dismissLabel,
  onDismiss,
  containerClassName,
  containerStyle,
  ...props
}: ToasterProps) {
  const key = toasterId || 'default'
  const [token] = useState(() => Symbol('notification-host'))
  const theme = useOverlayTheme()
  const owner = useSyncExternalStore(subscribe, () => hosts.get(key)?.values().next().value ?? null, noHost)
  useEffect(() => {
    const group = hosts.get(key) ?? new Set<symbol>()
    hosts.set(key, group)
    group.add(token)
    emit()
    return () => {
      group.delete(token)
      if (!group.size) hosts.delete(key)
      emit()
      queueMicrotask(() => {
        if (!hosts.has(key)) toast.removeAll(key)
      })
    }
  }, [key, token])
  if (owner !== token) return null
  const target = container ?? (typeof document === 'undefined' ? null : document.body)
  if (!target) return null
  return createPortal(
    <SchedulerHost
      {...props}
      toasterId={key}
      containerClassName={cx(theme.className, containerClassName)}
      containerStyle={{ inset: 16, zIndex: 100, ...containerStyle }}>
      {(notification) => (
        <ToastView
          tone={notification.type === 'blank' || notification.type === 'custom' ? 'info' : notification.type}
          icon={notification.icon}
          visible={notification.visible}
          role={notification.ariaProps.role}
          aria-live={notification.ariaProps['aria-live']}
          className={notification.className}
          style={notification.style}
          dismissLabel={dismissLabel}
          onDismiss={
            dismissible
              ? () => (onDismiss ? onDismiss(notification.id) : toast.dismiss(notification.id, key))
              : undefined
          }>
          {resolveValue(notification.message, notification)}
        </ToastView>
      )}
    </SchedulerHost>,
    target
  )
}

/** 直接使用 react-hot-toast 调度通知，需配合 Toaster 展示。需要按应用区域共享服务时，使用 NotificationProvider 和 useNotifications。 */
export { toast } from 'react-hot-toast'
