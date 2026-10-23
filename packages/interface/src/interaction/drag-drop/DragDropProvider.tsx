import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { DragCancelReason, DragDropSnapshot, DragPayload, DragResult } from '../../values/drag-drop'

export interface DragDropEventContext<E extends HTMLElement = HTMLElement> {
  readonly event: DragEvent | null
  readonly element: E | null
}

interface Session {
  readonly owner: symbol
  readonly token: string
  readonly payload: DragPayload
  readonly source: HTMLElement
  readonly finish: (result: DragResult, event: DragEvent | null) => void
}

const idle: DragDropSnapshot = Object.freeze({ phase: 'idle', payload: null })
let nextToken = 0

function createStore() {
  let session: Session | null = null
  let snapshot: DragDropSnapshot = idle
  let epoch = 0
  let dropping = false
  const listeners = new Set<() => void>()
  const publish = () => {
    snapshot = session ? Object.freeze({ phase: 'dragging', payload: session.payload }) : idle
    for (const listener of [...listeners]) listener()
  }
  const finish = (owner: symbol, status: 'dropped' | DragCancelReason, event: DragEvent | null) => {
    const previous = session
    if (!previous || previous.owner !== owner) return
    session = null
    try {
      publish()
    } finally {
      previous.finish(
        status === 'dropped'
          ? { status, payload: previous.payload }
          : { status: 'cancelled', payload: previous.payload, reason: status },
        event
      )
    }
  }
  return {
    getSnapshot: () => snapshot,
    getSession: () => session,
    getEpoch: () => epoch,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    begin(
      owner: symbol,
      payload: DragPayload,
      source: HTMLElement,
      onFinish: Session['finish'],
      isValid: () => boolean
    ) {
      if (dropping) return null
      if (!payload.type.trim()) throw new Error('A drag payload requires a nonempty type.')
      const startingEpoch = epoch
      if (session) finish(session.owner, 'replaced', null)
      // A completion callback is allowed to start another interaction; never overwrite it.
      if (session || epoch !== startingEpoch || !isValid()) return null
      const token = `pivot-drag-${++nextToken}`
      session = { owner, token, payload: Object.freeze({ ...payload }), source, finish: onFinish }
      publish()
      return token
    },
    finish,
    drop(owner: symbol, event: DragEvent, apply: () => boolean | void) {
      const previous = session
      if (!previous || previous.owner !== owner) return
      // Claim the terminal operation before application code can reorder/unmount the source.
      // Source cleanup and dragend must not turn a completed drop into a cancellation.
      session = null
      dropping = true
      let accepted = false
      try {
        publish()
        accepted = apply() !== false
      } finally {
        dropping = false
        previous.finish(
          accepted
            ? { status: 'dropped', payload: previous.payload }
            : { status: 'cancelled', payload: previous.payload, reason: 'rejected' },
          event
        )
      }
    },
    cancel(reason: DragCancelReason = 'reset') {
      epoch++
      if (session) finish(session.owner, reason, null)
    },
  }
}

type DragDropStore = ReturnType<typeof createStore>
const DragDropContext = createContext<DragDropStore | null>(null)

export interface DragDropProviderProps {
  children?: ReactNode
  /** 切换页面或数据目标时更新此值，以结束正在进行的拖动。已完成的列表修改由应用在对应回调中保存。 */
  resetKey?: unknown
}

/** 为一个区域内的拖动来源和接收目标建立连接。在需要互相拖放的组件外包裹同一个 Provider。 */
export function DragDropProvider({ children, resetKey }: DragDropProviderProps) {
  const [store] = useState(createStore)
  const previousReset = useRef(resetKey)
  useLayoutEffect(() => {
    if (!Object.is(previousReset.current, resetKey)) {
      previousReset.current = resetKey
      store.cancel('reset')
    }
  }, [resetKey, store])
  useLayoutEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && store.getSession()) {
        event.preventDefault()
        store.cancel('escape')
      }
    }
    const blur = () => store.cancel('window-blur')
    window.addEventListener('keydown', keydown, true)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', keydown, true)
      window.removeEventListener('blur', blur)
      store.cancel('unmount')
    }
  }, [store])
  return <DragDropContext.Provider value={store}>{children}</DragDropContext.Provider>
}

/** Internal hook: applications consume snapshots/actions, never the mutable session. */
export function useDragDropStore() {
  const store = useContext(DragDropContext)
  if (!store) throw new Error('Drag and drop hooks require DragDropProvider.')
  return store
}

export function useDragDropState(): DragDropSnapshot {
  const store = useDragDropStore()
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}

export function useDragDropCancel(): (reason?: DragCancelReason) => void {
  return useDragDropStore().cancel
}
