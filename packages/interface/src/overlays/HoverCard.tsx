import { forwardRef, type ReactNode } from 'react'
import * as Primitive from '@radix-ui/react-hover-card'
import { css, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'
import {
  getOverlaySurfaceClass,
  overlayEnterStyles,
  OverlayLayerContext,
  useOverlayLayer,
  useOverlayTheme,
} from './shared'

export const HoverCardRoot = Primitive.Root
export type HoverCardRootProps = Primitive.HoverCardProps
export const HoverCardTrigger = Primitive.Trigger
export type HoverCardTriggerProps = Primitive.HoverCardTriggerProps
export type HoverCardPortalProps = Omit<Primitive.HoverCardPortalProps, 'forceMount'>
export function HoverCardPortal(props: HoverCardPortalProps) {
  return <Primitive.Portal {...props} forceMount={undefined} />
}
export interface HoverCardContentProps extends Omit<Primitive.HoverCardContentProps, 'forceMount'> {
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}
const contentStyles = css.raw({
  padding: 'var(--space-2)',
  maxWidth: 'min(360px, var(--radix-hover-card-content-available-width))',
  transformOrigin: 'var(--radix-hover-card-content-transform-origin)',
})
export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(function HoverCardContent(
  { css: cssProp, className, sideOffset = 6, ...props },
  ref
) {
  const theme = useOverlayTheme()
  const { layer, style } = useOverlayLayer(cssProp, props.style, props.asChild ? props.children : undefined)
  return (
    <OverlayLayerContext.Provider value={layer}>
      <Primitive.Content
        {...props}
        {...theme}
        style={style}
        ref={ref}
        forceMount={undefined}
        sideOffset={sideOffset}
        className={cx(
          theme.className,
          getOverlaySurfaceClass(css.raw(contentStyles, overlayEnterStyles, cssProp)),
          className
        )}
      />
    </OverlayLayerContext.Provider>
  )
})
export type HoverCardArrowProps = Primitive.HoverCardArrowProps
export const HoverCardArrow = forwardRef<SVGSVGElement, HoverCardArrowProps>(function HoverCardArrow(
  { className, ...props },
  ref
) {
  return (
    <Primitive.Arrow {...props} ref={ref} className={cx(css({ fill: 'var(--colors-surfaceRaised)' }), className)} />
  )
})
/** Nonessential hover/focus preview. Use Popover for a focusable form or required actions. */
export interface HoverCardProps {
  /** 触发元素，悬停或聚焦时显示卡片；必须能转发 props 和 ref。 */
  trigger: ReactNode
  /** 浮层里的内容。 */
  children?: ReactNode
  /** 传给 Root 的属性：`open` / `defaultOpen` / `onOpenChange` 控制开关，`openDelay` / `closeDelay` 悬停延迟。 */
  rootProps?: Omit<HoverCardRootProps, 'children'>
  /** 合并到触发元素上的额外属性。 */
  triggerProps?: Omit<HoverCardTriggerProps, 'children' | 'asChild'>
  /** 传给 Portal 的属性，例如 `container`。 */
  portalProps?: Omit<HoverCardPortalProps, 'children'>
  /** 传给浮层内容的属性：`side`、`align`、`sideOffset` 等定位参数。 */
  contentProps?: Omit<HoverCardContentProps, 'children'>
}
export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(function HoverCard(
  { trigger, children, rootProps, triggerProps, portalProps, contentProps },
  ref
) {
  return (
    <HoverCardRoot {...rootProps}>
      <HoverCardTrigger {...triggerProps} asChild>
        {trigger}
      </HoverCardTrigger>
      <HoverCardPortal {...portalProps}>
        <HoverCardContent {...contentProps} ref={ref}>
          {children}
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCardRoot>
  )
})
