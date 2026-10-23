import { forwardRef, type ReactNode } from 'react'
import { ScrollArea as BaseScrollArea, type ScrollAreaRootProps, type ScrollAreaViewportProps } from '@pivot-ui/react'

/** @deprecated Use explicit root props and viewportProps on @pivot-ui/react ScrollArea. */
export interface ScrollAreaProps extends ScrollAreaViewportProps {
  children: ReactNode
  type?: ScrollAreaRootProps['type']
  dir?: ScrollAreaRootProps['dir']
  scrollHideDelay?: number
  fullHeight?: boolean
  asContainer?: boolean
  subtle?: boolean
}

/** The legacy ref follows its event/style props and points to the scrolling viewport. */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { fullHeight = true, subtle = true, asContainer, type, dir, scrollHideDelay, children, style, ...viewportProps },
  ref
) {
  return (
    <BaseScrollArea
      sizing={fullHeight ? 'fill' : 'content'}
      type={type}
      dir={dir}
      scrollHideDelay={scrollHideDelay}
      scrollbarVariant={subtle ? 'subtle' : 'track'}
      viewportRef={ref}
      viewportProps={{
        tabIndex: -1,
        ...viewportProps,
        contentLayout: 'block',
        style: { ...(asContainer ? { padding: '4px' } : {}), ...style },
      }}>
      {children}
    </BaseScrollArea>
  )
})
