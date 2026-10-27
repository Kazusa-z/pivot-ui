import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { AlertDialog } from './AlertDialog'
import type { ConfirmationService } from './confirmation-service'

const ConfirmationContext = createContext<ConfirmationService | null>(null)
const useClientLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

export interface ConfirmationProviderProps {
  /** Exactly one mounted Provider per service; distinct applications use distinct services. */
  service: ConfirmationService
  children?: ReactNode
}

export function ConfirmationProvider({ service, children }: ConfirmationProviderProps) {
  const parent = useContext(ConfirmationContext)
  const owner = useRef({})
  const restoreFocus = useRef<HTMLElement | null>(null)
  const snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot)
  useClientLayoutEffect(() => service.connect(owner.current), [service])
  if (parent === service) {
    throw new Error('Do not nest ConfirmationProviders with the same service. A service has one mounted host.')
  }
  const active = snapshot.requests[0]
  return (
    <ConfirmationContext.Provider value={service}>
      {children}
      {active && (
        <AlertDialog
          key={active.id}
          {...active.options}
          rootProps={{
            open: true,
            onOpenChange: (open) => {
              if (!open) void active.close()
            },
          }}
          onConfirm={() => {
            void active.confirm()
          }}
          onCancel={() => {
            void active.cancel()
          }}
          contentProps={{
            onOpenAutoFocus: (event) => {
              if (!restoreFocus.current) {
                const document = (event.currentTarget as HTMLElement | null)?.ownerDocument ?? globalThis.document
                const focused = document.activeElement
                if (focused instanceof document.defaultView!.HTMLElement) restoreFocus.current = focused
              }
            },
            onCloseAutoFocus: (event) => {
              event.preventDefault()
              if (!service.getSnapshot().requests.length) {
                const target = restoreFocus.current
                restoreFocus.current = null
                if (target?.isConnected) target.focus()
              }
            },
          }}
        />
      )}
    </ConfirmationContext.Provider>
  )
}

export function useConfirmation(): ConfirmationService {
  const service = useContext(ConfirmationContext)
  if (!service) throw new Error('useConfirmation must be called inside a ConfirmationProvider.')
  return service
}
