import { Fragment, isValidElement, type ReactNode } from 'react'

/** Radix Slot needs one element that can receive native props and a ref. */
export function assertMenuChild(asChild: boolean | undefined, children: ReactNode) {
  if (asChild && (!isValidElement(children) || children.type === Fragment)) {
    throw new Error('Menu asChild requires a single non-Fragment element.')
  }
}
