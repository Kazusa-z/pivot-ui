import { useDropTarget } from '@pivot-ui/react'
import { LEGACY_DRAG_TYPE, type LegacyDragData } from './useDrag'

export interface IDropOptions<T> {
  accept: number
  acceptFiles?: boolean
  onDrop?: (event: DragEvent | null, item: T | undefined, element: HTMLElement) => void
  onLeave?: (event: DragEvent | null, item: T | undefined, element: HTMLElement) => void
  onEnter?: (event: DragEvent | null, item: T | undefined, element: HTMLElement) => void
  onOver?: (event: DragEvent | null, item: T | undefined, element: HTMLElement) => void
  disable?: boolean
}

/** @deprecated Numeric bitmask compatibility only; useDropTarget owns all interaction state. */
export function useDrop<E extends HTMLElement = HTMLElement, T = unknown>(options: IDropOptions<T>) {
  return useDropTarget<LegacyDragData<T>, E>({
    accept: [LEGACY_DRAG_TYPE],
    disabled: options.disable,
    canDrop: ({ data }) => (options.accept & data.layer) !== 0,
    onDrop: ({ data }, { event, element }) => {
      if (element) options.onDrop?.(event, data.item, element)
    },
    onEnter: ({ data }, { event, element }) => {
      if (element) options.onEnter?.(event, data.item, element)
    },
    onLeave: ({ data }, { event, element }) => {
      if (element) options.onLeave?.(event, data.item, element)
    },
    onOver: ({ data }, { event, element }) => {
      if (element) options.onOver?.(event, data.item, element)
    },
    onFilesDrop: options.acceptFiles
      ? (_, { event, element }) => {
          if (element) options.onDrop?.(event, undefined, element)
        }
      : undefined,
  }).ref
}
