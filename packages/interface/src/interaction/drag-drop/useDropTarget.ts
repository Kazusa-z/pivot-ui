import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefCallback } from 'react'
import type { DragPayload } from '../../values/drag-drop'
import { useDragDropStore, type DragDropEventContext } from './DragDropProvider'
import { DRAG_SESSION_MIME } from './useDragSource'

export interface DropTargetOptions<T, E extends HTMLElement = HTMLDivElement> {
  accept: readonly string[]
  disabled?: boolean
  canDrop?: (payload: DragPayload<T>) => boolean
  dropEffect?: 'copy' | 'move' | 'link'
  onDrop: (payload: DragPayload<T>, context: DragDropEventContext<E>) => boolean | void
  onEnter?: (payload: DragPayload<T>, context: DragDropEventContext<E>) => void
  onLeave?: (payload: DragPayload<T>, context: DragDropEventContext<E>) => void
  onOver?: (payload: DragPayload<T>, context: DragDropEventContext<E>) => void
  /** 接收从系统拖入的 File 数组。应用可使用 File API 读取内容，或将文件交给上传服务；应用内数据通过 onDrop 接收。 */
  onFilesDrop?: (files: readonly File[], context: DragDropEventContext<E>) => boolean | void
}

export interface DropTargetBinding<E extends HTMLElement = HTMLDivElement> {
  ref: RefCallback<E>
  isOver: boolean
  canDrop: boolean
}

export function useDropTarget<T, E extends HTMLElement = HTMLDivElement>(
  options: DropTargetOptions<T, E>
): DropTargetBinding<E> {
  const store = useDragDropStore()
  const latest = useRef(options)
  latest.current = options
  const [element, setElement] = useState<E | null>(null)
  const [isOver, setIsOver] = useState(false)
  const hover = useRef<{ payload: DragPayload<T> | null; depth: number } | null>(null)
  const ref = useCallback((node: E | null) => setElement(node), [])
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const accepts = (payload: DragPayload): boolean =>
    !latest.current.disabled &&
    latest.current.accept.includes(payload.type) &&
    latest.current.canDrop?.(payload as DragPayload<T>) !== false
  const permitted = snapshot.phase === 'dragging' && accepts(snapshot.payload)
  const clear = useRef((_: DragEvent | null) => {})
  clear.current = (event) => {
    const old = hover.current
    hover.current = null
    setIsOver(false)
    if (old?.payload) latest.current.onLeave?.(old.payload, { event, element })
  }
  useLayoutEffect(() => {
    if (options.disabled || (hover.current?.payload && !permitted)) clear.current(null)
  }, [options.disabled, permitted, snapshot])
  useLayoutEffect(() => {
    if (!element) return
    const accepted = (event: DragEvent) => {
      if (latest.current.disabled) return null
      const session = store.getSession()
      if (session) return accepts(session.payload) ? { session, payload: session.payload as DragPayload<T> } : null
      return latest.current.onFilesDrop && event.dataTransfer?.types.includes('Files')
        ? { session: null, payload: null }
        : null
    }
    const enter = (event: DragEvent) => {
      const match = accepted(event)
      if (!match) return
      event.preventDefault()
      event.stopPropagation()
      if (!hover.current) {
        hover.current = { payload: match.payload, depth: 1 }
        setIsOver(true)
        if (match.payload) latest.current.onEnter?.(match.payload, { event, element })
      } else hover.current.depth++
    }
    const over = (event: DragEvent) => {
      const match = accepted(event)
      if (!match) {
        if (hover.current) clear.current(event)
        return
      }
      event.preventDefault()
      event.stopPropagation()
      if (event.dataTransfer) event.dataTransfer.dropEffect = latest.current.dropEffect ?? 'move'
      if (match.payload) latest.current.onOver?.(match.payload, { event, element })
    }
    const leave = (event: DragEvent) => {
      if (!hover.current) return
      event.stopPropagation()
      hover.current.depth = Math.max(0, hover.current.depth - 1)
      if (hover.current.depth === 0 || !element.contains(event.relatedTarget as Node | null)) clear.current(event)
    }
    const drop = (event: DragEvent) => {
      const match = accepted(event)
      if (!match) {
        clear.current(event)
        return
      }
      event.preventDefault()
      event.stopPropagation()
      if (match.session) {
        if (event.dataTransfer?.getData(DRAG_SESSION_MIME) !== match.session.token) {
          clear.current(event)
          return
        }
        const onDrop = latest.current.onDrop
        try {
          store.drop(match.session.owner, event, () => onDrop(match.payload!, { event, element }))
        } finally {
          clear.current(event)
        }
      } else {
        try {
          const files = Array.from(event.dataTransfer?.files ?? [])
          if (files.length) latest.current.onFilesDrop?.(files, { event, element })
        } finally {
          clear.current(event)
        }
      }
    }
    const unsubscribe = store.subscribe(() => {
      if (store.getSnapshot().phase === 'idle') clear.current(null)
    })
    const cancelHover = () => clear.current(null)
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelHover()
    }
    window.addEventListener('blur', cancelHover)
    window.addEventListener('dragend', cancelHover)
    window.addEventListener('keydown', keydown, true)
    element.addEventListener('dragenter', enter)
    element.addEventListener('dragover', over)
    element.addEventListener('dragleave', leave)
    element.addEventListener('drop', drop)
    return () => {
      unsubscribe()
      window.removeEventListener('blur', cancelHover)
      window.removeEventListener('dragend', cancelHover)
      window.removeEventListener('keydown', keydown, true)
      element.removeEventListener('dragenter', enter)
      element.removeEventListener('dragover', over)
      element.removeEventListener('dragleave', leave)
      element.removeEventListener('drop', drop)
      clear.current(null)
    }
  }, [element, store])
  return { ref, isOver, canDrop: permitted }
}
