import { forwardRef, type ReactNode } from 'react'
import * as Primitive from '@radix-ui/react-tooltip'
import { css, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'
import {
  getOverlaySurfaceClass,
  overlayEnterStyles,
  OverlayLayerContext,
  useOverlayLayer,
  useOverlayTheme,
} from './shared'

/** Share this at an application or composition boundary so skip-delay works across triggers. */
export const TooltipProvider = Primitive.Provider
export type TooltipProviderProps = Primitive.TooltipProviderProps
export const TooltipRoot = Primitive.Root
export type TooltipRootProps = Primitive.TooltipProps
export const TooltipTrigger = Primitive.Trigger
export type TooltipTriggerProps = Primitive.TooltipTriggerProps
export type TooltipPortalProps = Omit<Primitive.TooltipPortalProps, 'forceMount'>
export function TooltipPortal(props: TooltipPortalProps) {
  return <Primitive.Portal {...props} forceMount={undefined} />
}
export interface TooltipContentProps extends Omit<Primitive.TooltipContentProps, 'forceMount'> {
  css?: SystemStyleObject
}
const contentStyles = css.raw({
  padding: 'var(--space-1_5) var(--space-2_5)',
  maxWidth: 'min(320px, var(--radix-tooltip-content-available-width))',
  fontSize: 'var(--fontSizes-control)',
  lineHeight: 'var(--lineHeights-1)',
  transformOrigin: 'var(--radix-tooltip-content-transform-origin)',
})
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(function TooltipContent(
  { css: cssProp, className, side = 'bottom', sideOffset = 6, ...props },
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
        side={side}
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
export type TooltipArrowProps = Primitive.TooltipArrowProps
export const TooltipArrow = forwardRef<SVGSVGElement, TooltipArrowProps>(function TooltipArrow(
  { className, ...props },
  ref
) {
  return (
    <Primitive.Arrow {...props} ref={ref} className={cx(css({ fill: 'var(--colors-surfaceRaised)' }), className)} />
  )
})
export interface TooltipProps {
  /** A single element that forwards native props/ref. Essential information belongs in visible text. */
  trigger: ReactNode
  children?: ReactNode
  rootProps?: Omit<TooltipRootProps, 'children'>
  triggerProps?: Omit<TooltipTriggerProps, 'children' | 'asChild'>
  portalProps?: Omit<TooltipPortalProps, 'children'>
  contentProps?: Omit<TooltipContentProps, 'children'>
}
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { trigger, children, rootProps, triggerProps, portalProps, contentProps },
  ref
) {
  return (
    <TooltipRoot {...rootProps}>
      <TooltipTrigger {...triggerProps} asChild>
        {trigger}
      </TooltipTrigger>
      <TooltipPortal {...portalProps}>
        <TooltipContent {...contentProps} ref={ref}>
          {children}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  )
})
