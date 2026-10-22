import {
  Children,
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { Slot } from '@radix-ui/react-slot'
import { useButtonState, type ButtonStateOptions } from './useButtonState'

export interface ButtonBaseProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStateOptions {
  /**
   * The single child must forward props and its ref to the rendered element.
   * An href prop identifies links; other custom components receive button defaults.
   */
  asChild?: boolean
  renderContent?: (children: ReactNode, loading: boolean) => ReactNode
}

export const ButtonBase = forwardRef<HTMLButtonElement, ButtonBaseProps>(function ButtonBase(
  {
    asChild,
    children,
    renderContent,
    async,
    loading,
    onAsyncError,
    disabled,
    onClick,
    onClickCapture,
    onKeyDown,
    onKeyUp,
    type = 'button',
    ...rest
  },
  ref
) {
  const candidate = asChild ? Children.only(children) : null
  if (asChild && (!isValidElement(candidate) || candidate.type === Fragment)) {
    throw new Error('Button asChild requires a single non-Fragment element.')
  }
  const child = candidate as ReactElement<ButtonHTMLAttributes<HTMLButtonElement>> | null
  const childProps = child?.props
  const state = useButtonState({
    async,
    loading,
    onAsyncError,
    disabled:
      disabled ||
      childProps?.disabled ||
      childProps?.['aria-disabled'] === true ||
      childProps?.['aria-disabled'] === 'true',
  })

  const guard = (event: { preventDefault(): void; stopPropagation(): void }) => {
    if (!state.isBlocked()) return false
    event.preventDefault()
    event.stopPropagation()
    return true
  }
  const isCustomButton = (event: KeyboardEvent<HTMLButtonElement>) => {
    const element = event.currentTarget
    return (
      element.tagName !== 'BUTTON' &&
      element.tagName !== 'INPUT' &&
      !(element.tagName === 'A' && element.hasAttribute('href'))
    )
  }
  const handlers: ButtonHTMLAttributes<HTMLButtonElement> = {
    onClickCapture(event) {
      if (guard(event)) return
      childProps?.onClickCapture?.(event)
      if (!event.defaultPrevented) onClickCapture?.(event)
    },
    onClick(event) {
      state.activate(event, () => {
        childProps?.onClick?.(event)
        if (!event.defaultPrevented) onClick?.(event)
      })
    },
    onKeyDown(event) {
      if (state.isBlocked()) {
        if (event.key === 'Enter' || event.key === ' ') guard(event)
        return
      }
      childProps?.onKeyDown?.(event)
      if (!event.defaultPrevented) onKeyDown?.(event)
      if (event.defaultPrevented || !isCustomButton(event)) return
      if (event.key === ' ') event.preventDefault()
      if (event.key === 'Enter' && !event.repeat) {
        event.preventDefault()
        event.currentTarget.click()
      }
    },
    onKeyUp(event) {
      if (state.isBlocked()) {
        if (event.key === 'Enter' || event.key === ' ') guard(event)
        return
      }
      childProps?.onKeyUp?.(event)
      if (!event.defaultPrevented) onKeyUp?.(event)
      if (!event.defaultPrevented && event.key === ' ' && isCustomButton(event)) {
        event.preventDefault()
        event.currentTarget.click()
      }
    },
  }
  const accessibility = {
    'aria-busy': state.loading || rest['aria-busy'],
    'aria-disabled': state.disabled || rest['aria-disabled'],
    'data-loading': state.loading ? '' : undefined,
  }
  if (asChild && child) {
    const link = 'href' in child.props
    const button = child.type === 'button' || (typeof child.type !== 'string' && !link)
    const protectedChild = cloneElement(child, {
      ...handlers,
      ...accessibility,
      ...(button ? { disabled: state.disabled, type: childProps?.type ?? type } : {}),
      ...(link && state.disabled ? { href: undefined } : {}),
      role: childProps?.role ?? rest.role ?? (link ? 'link' : button ? undefined : 'button'),
      tabIndex: state.disabled ? -1 : (childProps?.tabIndex ?? rest.tabIndex ?? (button || link ? undefined : 0)),
      children: renderContent ? renderContent(childProps?.children, state.loading) : childProps?.children,
    })
    return (
      <Slot {...rest} ref={ref}>
        {protectedChild}
      </Slot>
    )
  }
  return (
    <button {...rest} {...handlers} {...accessibility} type={type} disabled={state.disabled} ref={ref}>
      {renderContent ? renderContent(children, state.loading) : children}
    </button>
  )
})
