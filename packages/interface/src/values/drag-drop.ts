/** 应用内拖放的数据：type 标识类型，data 携带接收回调所需的内容。跨应用文件拖入请使用 onFilesDrop。 */
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
