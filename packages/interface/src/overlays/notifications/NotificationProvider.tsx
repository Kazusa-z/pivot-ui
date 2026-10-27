import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { createNotificationService, type NotificationService } from './service'
import { Toaster, type ToasterProps } from './Toaster'

const NotificationContext = createContext<NotificationService | null>(null)
const useHostEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
export interface NotificationProviderProps {
  /** 使用通知的应用区域。 */
  children: ReactNode
  /** 通知服务，通常在应用启动时用 `createNotificationService()` 创建一次；省略时使用库内默认服务。 */
  service?: NotificationService
  /** 传给通知显示区域（Toaster）的属性，例如 `position`、`container`。 */
  hostProps?: Omit<ToasterProps, 'toasterId' | 'onDismiss'>
}

/** 为界面提供通知服务和展示位置。子组件通过 useNotifications 发送消息，可传入 service 与应用中的其他调用方共享通知。 */
export function NotificationProvider({ children, service, hostProps }: NotificationProviderProps) {
  const [ownService] = useState(createNotificationService)
  const activeService = service ?? ownService
  useHostEffect(() => activeService.connect(), [activeService])
  return (
    <NotificationContext.Provider value={activeService}>
      {children}
      <Toaster {...hostProps} toasterId={activeService.id} onDismiss={activeService.dismiss} />
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationService {
  const service = useContext(NotificationContext)
  if (!service) throw new Error('useNotifications requires NotificationProvider.')
  return service
}
