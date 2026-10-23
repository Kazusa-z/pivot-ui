import { forwardRef, type ReactNode } from 'react'
import { ResizableSplit } from '@pivot-ui/react'

/** @deprecated Use ResizableSplit with explicit pixel sizes and constraints. */
export interface ResizablePanelProps {
  children: ReactNode
  asChild?: boolean
  direction?: 'horizontal' | 'vertical'
  handlerPosition?: 'left' | 'right' | 'top' | 'bottom'
  variant?: 'transparent' | 'solid'
  reverse?: boolean
  range?: { min?: number; max?: number }
  defaultSize?: number
}

export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(function ResizablePanel(
  {
    children,
    asChild,
    direction = 'horizontal',
    handlerPosition,
    variant = 'transparent',
    reverse,
    range,
    defaultSize,
  },
  ref
) {
  return (
    <ResizableSplit
      ref={asChild ? undefined : ref}
      primaryRef={asChild ? ref : undefined}
      primaryAsChild={asChild}
      primary={children}
      orientation={direction}
      primarySide={reverse || handlerPosition === 'left' || handlerPosition === 'top' ? 'end' : 'start'}
      defaultSize={defaultSize}
      minSize={range?.min}
      maxSize={range?.max}
      separatorLabel="Resize panel"
      css={
        variant === 'transparent'
          ? {
              '& > [role="separator"]:not(:hover):not(:focus-visible):not([data-resizing])': {
                backgroundColor: 'transparent',
              },
            }
          : undefined
      }
    />
  )
})
