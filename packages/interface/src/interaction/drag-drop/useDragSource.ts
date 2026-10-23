import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefCallback } from 'react'
import type { DragPayload, DragResult } from '../../values/drag-drop'
import { useDragDropStore, type DragDropEventContext } from './DragDropProvider'

export const DRAG_SESSION_MIME = 'application/x-pivot-ui-drag'

export interface DragSourceOptions<T, E extends HTMLElement = HTMLDivElement> {
  type: string
  data: T
  disabled?: boolean
  /** Invalidate an armed/active source when application target identity changes. */
  resetKey?: unknown
  effectAllowed?: 'copy' | 'move' | 'link' | 'copyMove'
  onStart?: (payload: DragPayload<T>, context: DragDropEventContext<E>) => boolean | void
  onEnd?: (result: DragResult<T>, context: DragDropEventContext<E>) => void
}

export interface DragSourceBinding<E extends HTMLElement = HTMLDivElement> {
  ref: RefCallback<E>
  previewRef: RefCallback<HTMLElement>
  isDragging: boolean
}

export function useDragSource<T, E extends HTMLElement = HTMLDivElement>(
  options: DragSourceOptions<T, E>
): DragSourceBinding<E> {
  const store = useDragDropStore()
  const owner = useRef(Symbol('drag-source'))
  const latest = useRef(options)
  latest.current = options
  const [element, setElement] = useState<E | null>(null)
  const preview = useRef<HTMLElement | null>(null)
  const ref = useCallback((node: E | null) => setElement(node), [])
  const previewRef = useCallback((node: HTMLElement | null) => {
    preview.current = node
  }, [])
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const previous = useRef({ type: options.type, resetKey: options.resetKey, disabled: options.disabled })
  useLayoutEffect(() => {
    if (
      options.disabled ||
      previous.current.type !== options.type ||
      !Object.is(previous.current.resetKey, options.resetKey)
    )
      store.finish(owner.current, options.disabled ? 'disabled' : 'reset', null)
    previous.current = { type: options.type, resetKey: options.resetKey, disabled: options.disabled }
  }, [options.disabled, options.type, options.resetKey, store])
  useLayoutEffect(() => {
    if (!element) return
    const original = element.getAttribute('draggable')
    const originalUserDrag = element.style.getPropertyValue('-webkit-user-drag')
    const originalPriority = element.style.getPropertyPriority('-webkit-user-drag')
    element.draggable = !options.disabled
    // Button resets can override the draggable attribute's browser presentation style.
    element.style.setProperty('-webkit-user-drag', options.disabled ? 'none' : 'element')
    const start = (event: DragEvent) => {
      const current = latest.current
      if (current.disabled || !event.dataTransfer) {
        event.preventDefault()
        return
      }
      // Native dragging in text inputs or row actions must not lift their surrounding row.
      const target = event.target as Element | null
      const interactive = target?.closest('input,textarea,button,select,[contenteditable="true"],a[href]')
      if (interactive && interactive !== element && element.contains(interactive)) {
        event.preventDefault()
        return
      }
      const payload = Object.freeze({ type: current.type, data: current.data })
      const epoch = store.getEpoch()
      if (current.onStart?.(payload, { event, element }) === false || event.defaultPrevented) {
        event.preventDefault()
        return
      }
      const isValid = () =>
        element.isConnected &&
        !latest.current.disabled &&
        latest.current.type === current.type &&
        Object.is(latest.current.resetKey, current.resetKey) &&
        store.getEpoch() === epoch
      if (!isValid()) {
        event.preventDefault()
        return
      }
      const token = store.begin(
        owner.current,
        payload,
        element,
        (result, terminalEvent) => current.onEnd?.(result as DragResult<T>, { event: terminalEvent, element }),
        isValid
      )
      if (!token) {
        event.preventDefault()
        return
      }
      event.stopPropagation()
      try {
        event.dataTransfer.effectAllowed = current.effectAllowed ?? 'move'
        event.dataTransfer.setData(DRAG_SESSION_MIME, token)
        if (preview.current) event.dataTransfer.setDragImage(preview.current, 0, 0)
      } catch (error) {
        event.preventDefault()
        store.finish(owner.current, 'rejected', event)
        throw error
      }
    }
    const end = (event: DragEvent) => {
      event.stopPropagation()
      store.finish(owner.current, 'outside', event)
    }
    element.addEventListener('dragstart', start)
    element.addEventListener('dragend', end)
    return () => {
      element.removeEventListener('dragstart', start)
      element.removeEventListener('dragend', end)
      if (original === null) element.removeAttribute('draggable')
      else element.setAttribute('draggable', original)
      if (originalUserDrag) element.style.setProperty('-webkit-user-drag', originalUserDrag, originalPriority)
      else element.style.removeProperty('-webkit-user-drag')
      store.finish(owner.current, 'unmount', null)
    }
  }, [element, store])
  useLayoutEffect(() => {
    if (element) {
      element.draggable = !options.disabled
      element.style.setProperty('-webkit-user-drag', options.disabled ? 'none' : 'element')
    }
  }, [element, options.disabled])
  return { ref, previewRef, isDragging: snapshot.phase === 'dragging' && store.getSession()?.owner === owner.current }
}
