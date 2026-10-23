import {
  Children,
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { Slot } from '@radix-ui/react-slot'
import { css, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

export type ResizeCancelReason = 'escape' | 'pointer-cancel' | 'capture-lost' | 'window-blur' | 'configuration-change'
export interface ResizableSplitProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The pane whose size is controlled, in CSS pixels. */
  primary: ReactNode
  /** Omit the secondary pane to resize a standalone region. */
  children?: ReactNode
  orientation?: 'horizontal' | 'vertical'
  primarySide?: 'start' | 'end'
  size?: number
  defaultSize?: number
  minSize?: number
  maxSize?: number
  minSecondarySize?: number
  keyboardStep?: number
  disabled?: boolean
  separatorLabel?: string
  /** Requests a size; a controlled parent decides whether to accept it. */
  onSizeChange?: (size: number) => void
  /** Final requested size on pointer release or a keyboard adjustment. */
  onSizeCommit?: (size: number) => void
  onResizeCancel?: (reason: ResizeCancelReason) => void
  primaryProps?: HTMLAttributes<HTMLDivElement>
  secondaryProps?: HTMLAttributes<HTMLDivElement>
  primaryRef?: Ref<HTMLDivElement>
  /** The primary child must forward its props and ref to a single element. */
  primaryAsChild?: boolean
  css?: SystemStyleObject
}

const handleSize = 6
const paneClass = css({ minWidth: 0, minHeight: 0, overflow: 'hidden', boxSizing: 'border-box' })
const handleClass = css({
  flex: '0 0 6px',
  position: 'relative',
  touchAction: 'none',
  userSelect: 'none',
  outline: 'none',
  backgroundColor: 'var(--colors-border)',
  '&:hover, &:focus-visible, &[data-resizing]': { backgroundColor: 'var(--colors-focusRing)' },
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '-2px' },
  '&[aria-disabled="true"]': { cursor: 'default', opacity: 0.5 },
})

function finite(value: number | undefined, fallback: number) {
  return value !== undefined && Number.isFinite(value) ? value : fallback
}
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** A pixel-sized pane and optional remaining pane; no workspace or persistence state. */
export const ResizableSplit = forwardRef<HTMLDivElement, ResizableSplitProps>(function ResizableSplit(
  {
    primary,
    children,
    orientation = 'horizontal',
    primarySide = 'start',
    size,
    defaultSize = 240,
    minSize = 80,
    maxSize = 960,
    minSecondarySize = 80,
    keyboardStep = 10,
    disabled = false,
    separatorLabel = 'Resize panes',
    onSizeChange,
    onSizeCommit,
    onResizeCancel,
    primaryProps,
    secondaryProps,
    primaryRef,
    primaryAsChild,
    css: cssProp,
    className,
    style,
    ...props
  },
  forwardedRef
) {
  const root = useRef<HTMLDivElement>(null)
  const generatedId = useId()
  const primaryChild = primaryAsChild ? Children.only(primary) : null
  if (primaryAsChild && (!isValidElement(primaryChild) || primaryChild.type === Fragment)) {
    throw new Error('ResizableSplit primaryAsChild requires one non-Fragment element.')
  }
  const primaryElement = primaryChild as ReactElement<HTMLAttributes<HTMLDivElement>> | null
  const primaryId = primaryProps?.id ?? primaryElement?.props.id ?? `${generatedId}-primary`
  const [internalSize, setInternalSize] = useState(() => finite(defaultSize, 240))
  const [extent, setExtent] = useState<number | null>(null)
  const [resizing, setResizing] = useState(false)
  const hasSecondary = children !== undefined && children !== null
  const horizontal = orientation === 'horizontal'
  const requestedMin = Math.max(0, finite(minSize, 80))
  const requestedMax = Math.max(requestedMin, finite(maxSize, 960))
  const available =
    hasSecondary && extent !== null
      ? Math.max(0, extent - handleSize - Math.max(0, finite(minSecondarySize, 80)))
      : requestedMax
  const maximum = Math.min(requestedMax, available)
  const minimum = Math.min(requestedMin, maximum)
  const currentSize = clamp(finite(size, internalSize), minimum, maximum)
  const current = useRef(currentSize)
  current.current = currentSize
  const drag = useRef<{
    pointerId: number
    coordinate: number
    initial: number
    requested: number
    sign: number
    element: HTMLDivElement
  } | null>(null)

  useLayoutEffect(() => {
    const element = root.current
    if (!hasSecondary || !element) {
      setExtent(null)
      return
    }
    const measure = () => {
      const computed = element.ownerDocument.defaultView?.getComputedStyle(element)
      const padding = computed
        ? horizontal
          ? parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight)
          : parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom)
        : 0
      setExtent(Math.max(0, (horizontal ? element.clientWidth : element.clientHeight) - padding))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [hasSecondary, horizontal])

  function request(next: number) {
    const bounded = clamp(next, minimum, maximum)
    if (drag.current) drag.current.requested = bounded
    if (size === undefined) {
      current.current = bounded
      setInternalSize(bounded)
    }
    onSizeChange?.(bounded)
  }
  function release() {
    const active = drag.current
    drag.current = null
    setResizing(false)
    if (active?.element.hasPointerCapture(active.pointerId)) active.element.releasePointerCapture(active.pointerId)
    return active
  }
  function cancel(reason: ResizeCancelReason, restore = true) {
    const active = release()
    if (!active) return
    if (restore) request(active.initial)
    onResizeCancel?.(reason)
  }
  const cancelRef = useRef(cancel)
  cancelRef.current = cancel
  useEffect(() => {
    if (!resizing) return
    const view = root.current?.ownerDocument.defaultView
    const blur = () => cancelRef.current('window-blur')
    view?.addEventListener('blur', blur)
    return () => view?.removeEventListener('blur', blur)
  }, [resizing])
  useEffect(() => {
    cancelRef.current('configuration-change')
  }, [orientation, primarySide, disabled, minimum, maximum, props.dir, style?.direction])
  useEffect(
    () => () => {
      const active = drag.current
      drag.current = null
      if (active?.element.hasPointerCapture(active.pointerId)) active.element.releasePointerCapture(active.pointerId)
    },
    []
  )

  function directionSign() {
    const rtl =
      horizontal && root.current?.ownerDocument.defaultView?.getComputedStyle(root.current).direction === 'rtl'
    return (primarySide === 'end' ? -1 : 1) * (rtl ? -1 : 1)
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0 || !event.isPrimary || drag.current || minimum === maximum) return
    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointerId: event.pointerId,
      coordinate: horizontal ? event.clientX : event.clientY,
      initial: current.current,
      requested: current.current,
      sign: directionSign(),
      element: event.currentTarget,
    }
    setResizing(true)
  }
  const primaryStyle: CSSProperties = {
    ...primaryProps?.style,
    flex: '0 0 auto',
    ...(horizontal ? { width: currentSize } : { height: currentSize }),
  }
  let primaryContent = primary
  if (primaryElement) {
    primaryContent = cloneElement(primaryElement, {
      id: primaryId,
      style: { ...primaryElement.props.style, ...primaryStyle },
    })
  }
  const Primary = primaryAsChild ? Slot : 'div'
  return (
    <div
      {...props}
      ref={(element) => {
        root.current = element
        if (typeof forwardedRef === 'function') return forwardedRef(element)
        if (forwardedRef) forwardedRef.current = element
      }}
      className={cx(css({ display: 'flex', minWidth: 0, minHeight: 0, boxSizing: 'border-box' }, cssProp), className)}
      data-orientation={orientation}
      style={{
        ...(hasSecondary ? { width: '100%', height: '100%' } : {}),
        ...style,
        flexDirection: horizontal
          ? primarySide === 'start'
            ? 'row'
            : 'row-reverse'
          : primarySide === 'start'
            ? 'column'
            : 'column-reverse',
        ...(!hasSecondary
          ? horizontal
            ? { width: currentSize + handleSize }
            : { height: currentSize + handleSize }
          : {}),
      }}>
      <Primary
        {...primaryProps}
        id={primaryId}
        ref={primaryRef}
        className={cx(paneClass, primaryProps?.className)}
        style={primaryStyle}>
        {primaryContent}
      </Primary>
      <div
        role="separator"
        aria-label={separatorLabel}
        aria-controls={primaryId}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuemin={minimum}
        aria-valuemax={maximum}
        aria-valuenow={currentSize}
        aria-valuetext={`${Math.round(currentSize)} pixels`}
        aria-disabled={disabled || minimum === maximum || undefined}
        tabIndex={disabled || minimum === maximum ? -1 : 0}
        className={handleClass}
        data-resizing={resizing ? '' : undefined}
        style={{ cursor: disabled || minimum === maximum ? 'default' : horizontal ? 'col-resize' : 'row-resize' }}
        onPointerDown={pointerDown}
        onPointerMove={(event) => {
          const active = drag.current
          if (!active || active.pointerId !== event.pointerId) return
          event.preventDefault()
          request(active.initial + ((horizontal ? event.clientX : event.clientY) - active.coordinate) * active.sign)
        }}
        onPointerUp={(event) => {
          if (drag.current?.pointerId !== event.pointerId) return
          const active = release()
          if (active) onSizeCommit?.(active.requested)
        }}
        onPointerCancel={(event) => {
          if (drag.current?.pointerId === event.pointerId) cancel('pointer-cancel')
        }}
        onLostPointerCapture={(event) => {
          if (drag.current?.pointerId === event.pointerId) cancel('capture-lost')
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && drag.current) {
            event.preventDefault()
            cancel('escape')
            return
          }
          if (disabled || drag.current || event.altKey || event.ctrlKey || event.metaKey || minimum === maximum) return
          const increase = horizontal ? 'ArrowRight' : 'ArrowDown'
          const decrease = horizontal ? 'ArrowLeft' : 'ArrowUp'
          let next: number
          if (event.key === 'Home') next = minimum
          else if (event.key === 'End') next = maximum
          else if (event.key === increase || event.key === decrease)
            next =
              current.current +
              (event.key === increase ? 1 : -1) *
                directionSign() *
                Math.max(0.1, finite(keyboardStep, 10)) *
                (event.shiftKey ? 10 : 1)
          else return
          event.preventDefault()
          request(next)
          onSizeCommit?.(clamp(next, minimum, maximum))
        }}
      />
      {hasSecondary && (
        <div
          {...secondaryProps}
          className={cx(paneClass, secondaryProps?.className)}
          style={{ ...secondaryProps?.style, flex: '1 1 0' }}>
          {children}
        </div>
      )}
    </div>
  )
})
