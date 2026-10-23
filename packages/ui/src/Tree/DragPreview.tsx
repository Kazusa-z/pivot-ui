import type { ReactNode } from 'react'
import { TreeDragPreview } from '@pivot-ui/react'

export interface DragPreviewProps {
  text: ReactNode
  size?: number
}
/** Compatibility prop names; remove with the old package in B11. */
export function DragPreview({ text, size }: DragPreviewProps) {
  return <TreeDragPreview count={size}>{text}</TreeDragPreview>
}
