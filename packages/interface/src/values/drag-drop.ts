/** In-process typed data. Native dataTransfer carries only an opaque session marker. */
export interface DragPayload<T = unknown> {
  readonly type: string
  readonly data: T
}

export type DragCancelReason =
  'escape' | 'outside' | 'disabled' | 'unmount' | 'reset' | 'replaced' | 'window-blur' | 'rejected'

export type DragResult<T = unknown> =
  | { readonly status: 'dropped'; readonly payload: DragPayload<T> }
  | { readonly status: 'cancelled'; readonly payload: DragPayload<T>; readonly reason: DragCancelReason }

export type DropPosition = 'before' | 'inside' | 'after'

export type DragDropSnapshot =
  { readonly phase: 'idle'; readonly payload: null } | { readonly phase: 'dragging'; readonly payload: DragPayload }
