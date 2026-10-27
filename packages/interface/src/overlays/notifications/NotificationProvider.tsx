import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { createNotificationService, type NotificationService } from './service'
import { Toaster, type ToasterProps } from './Toaster'

const NotificationContext = createContext<NotificationService | null>(null)
const useHostEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
export interface NotificationProviderProps {
  children: ReactNode
  service?: NotificationService
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
