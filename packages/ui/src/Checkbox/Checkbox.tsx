import { forwardRef } from 'react'
import { Checkbox as CheckboxControl, type CheckboxProps as ControlProps } from '@pivot-ui/react'

export interface CheckboxProps extends ControlProps {
  /** @deprecated Pass label directly to the new Checkbox. */
  withLabel?: boolean
}

/** Compatibility entry; behavior and styling live in @pivot-ui/react. */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { withLabel = false, label, ...props },
  ref
) {
  return <CheckboxControl {...props} ref={ref} label={withLabel ? label : undefined} />
})
