import { Fragment, forwardRef, isValidElement, type HTMLAttributes, type ReactElement } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { css, cx } from '../../styled-system/css'
import { OverlayLayerContext, useOverlayLayer, useOverlayTheme } from './shared'

export interface OverlayLayerProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** 必须为 `true`：样式、主题 class 和层级直接合并到子元素上，不额外增加 DOM。 */
  asChild: true
  /** 第三方浮层的实际内容元素（不是触发器），必须转发 props 和 ref。 */
  children: ReactElement
}

/**
 * Adapt third-party portal content to inherited theme and stacking without adding DOM.
 * A numeric style.zIndex chooses this surface's base; nested overlays use the next layer.
 * Place inside the third-party Portal, around its actual Content (not around a Trigger).
 */
export const OverlayLayer = forwardRef<HTMLElement, OverlayLayerProps>(function OverlayLayer(
  { asChild, children, className, style: styleProp, ...props },
  ref
) {
  if (!asChild || !isValidElement(children) || children.type === Fragment) {
    throw new Error('OverlayLayer requires asChild and one non-Fragment element that forwards props and its ref.')
  }
  const theme = useOverlayTheme()
  const { layer, style } = useOverlayLayer(undefined, styleProp, children)
  return (
    <OverlayLayerContext.Provider value={layer}>
      <Slot
        {...props}
        {...theme}
        ref={ref}
        style={style}
        className={cx(theme.className, css({ zIndex: 'var(--pivot-overlay-layer, 50)' }), className)}>
        {children}
      </Slot>
    </OverlayLayerContext.Provider>
  )
})
