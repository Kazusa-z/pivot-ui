import { useDragSource, DragDropProvider, type DragPayload } from '@pivot-ui/react'

/** @deprecated Use DragDropProvider and string payload types from @pivot-ui/react. */
export const DragDropContextProvider = DragDropProvider
export const LEGACY_DRAG_TYPE = 'pivot-legacy-layer'
export interface LegacyDragData<T> {
  readonly layer: number
  readonly item: T | undefined
}
export type LegacyDragPayload<T> = DragPayload<LegacyDragData<T>>

export interface IDragOptions<T> {
  type: number
  item?: T
  onEnd?: (event: DragEvent | null, item: T | undefined) => void
  onStart?: (event: DragEvent | null, item: T | undefined) => void
  onCancel?: (event: DragEvent | null, item: T | undefined) => void
  disable?: boolean
}

/** @deprecated Thin numeric-layer adapter; the scoped provider owns the only drag session. */
export function useDrag<T>(options: IDragOptions<T>) {
  const binding = useDragSource<LegacyDragData<T>>({
    type: LEGACY_DRAG_TYPE,
    data: { layer: options.type, item: options.item },
    resetKey: options.type,
    disabled: options.disable,
    onStart: (payload, context) => options.onStart?.(context.event, payload.data.item),
    onEnd: (result, context) => {
      if (result.status === 'cancelled') options.onCancel?.(context.event, result.payload.data.item)
      options.onEnd?.(context.event, result.payload.data.item)
    },
  })
  return [binding.ref, binding.previewRef] as const
}
