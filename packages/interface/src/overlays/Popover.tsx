import { Activity, createContext, forwardRef, useContext, type ReactNode } from 'react'
import * as Primitive from '@radix-ui/react-popover'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { css, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'
import {
  getOverlaySurfaceClass,
  overlayEnterStyles,
  OverlayLayerContext,
  useOverlayLayer,
  useOverlayTheme,
} from './shared'

const LifecycleContext = createContext({ open: false, keepMounted: false })

export interface PopoverRootProps extends Primitive.PopoverProps {
  /** Preserve content state and DOM while closed; effects, focus layers and scroll locks are suspended. */
  keepMounted?: boolean
}

export function PopoverRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  keepMounted = false,
  ...props
}: PopoverRootProps) {
  const [open, setOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  })
  return (
    <LifecycleContext.Provider value={{ open, keepMounted }}>
      <Primitive.Root {...props} open={open} onOpenChange={setOpen} />
    </LifecycleContext.Provider>
  )
}

export type PopoverTriggerProps = Primitive.PopoverTriggerProps
export const PopoverTrigger = Primitive.Trigger
export type PopoverAnchorProps = Primitive.PopoverAnchorProps
export const PopoverAnchor = Primitive.Anchor
export type PopoverCloseProps = Primitive.PopoverCloseProps
export const PopoverClose = Primitive.Close
export type PopoverTitleProps = Primitive.PopoverTitleProps
export const PopoverTitle = Primitive.Title
export type PopoverDescriptionProps = Primitive.PopoverDescriptionProps
export const PopoverDescription = Primitive.Description

export type PopoverPortalProps = Omit<Primitive.PopoverPortalProps, 'forceMount'>
export function PopoverPortal(props: PopoverPortalProps) {
  const { keepMounted } = useContext(LifecycleContext)
  return <Primitive.Portal {...props} forceMount={keepMounted ? true : undefined} />
}

export interface PopoverContentProps extends Omit<Primitive.PopoverContentProps, 'forceMount'> {
  compact?: boolean
  constrainSize?: boolean
  css?: SystemStyleObject
}

const contentStyles = css.raw({
  padding: 'var(--space-3)',
  minWidth: '160px',
  maxWidth: 'var(--radix-popover-content-available-width)',
  transformOrigin: 'var(--radix-popover-content-transform-origin)',
  '&[data-compact]': { padding: 0 },
  '&[data-constrain-size]': {
    width: 'var(--radix-popover-trigger-width)',
    maxHeight: 'var(--radix-popover-content-available-height)',
  },
})

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { css: cssProp, className, compact, constrainSize, sideOffset = 6, ...props },
  ref
) {
  const theme = useOverlayTheme()
  const { layer, style } = useOverlayLayer(cssProp, props.style, props.asChild ? props.children : undefined)
  const { open, keepMounted } = useContext(LifecycleContext)
  // Radix forceMount alone leaves DismissableLayer/RemoveScroll active. Activity
  // keeps the same portal/DOM identity but disconnects those effects when hidden.
  return (
    <Activity mode={keepMounted && !open ? 'hidden' : 'visible'}>
      <OverlayLayerContext.Provider value={layer}>
        <Primitive.Content
          {...props}
          {...theme}
          style={style}
          ref={ref}
          forceMount={keepMounted ? true : undefined}
          sideOffset={sideOffset}
          data-compact={compact ? '' : undefined}
          data-constrain-size={constrainSize ? '' : undefined}
          className={cx(
            theme.className,
            getOverlaySurfaceClass(css.raw(contentStyles, overlayEnterStyles, cssProp)),
            className
          )}
        />
      </OverlayLayerContext.Provider>
    </Activity>
  )
})

export type PopoverArrowProps = Primitive.PopoverArrowProps
export const PopoverArrow = forwardRef<SVGSVGElement, PopoverArrowProps>(function PopoverArrow(
  { className, ...props },
  ref
) {
  return (
    <Primitive.Arrow {...props} ref={ref} className={cx(css({ fill: 'var(--colors-surfaceRaised)' }), className)} />
  )
})

export interface PopoverProps {
  /** A single element that forwards its native props and ref. */
  trigger: ReactNode
  children?: ReactNode
  rootProps?: Omit<PopoverRootProps, 'children'>
  triggerProps?: Omit<PopoverTriggerProps, 'children' | 'asChild'>
  portalProps?: Omit<PopoverPortalProps, 'children'>
  contentProps?: Omit<PopoverContentProps, 'children'>
}
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { trigger, children, rootProps, triggerProps, portalProps, contentProps },
  ref
) {
  return (
    <PopoverRoot {...rootProps}>
      <PopoverTrigger {...triggerProps} asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverPortal {...portalProps}>
        <PopoverContent {...contentProps} ref={ref}>
          {children}
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
})
