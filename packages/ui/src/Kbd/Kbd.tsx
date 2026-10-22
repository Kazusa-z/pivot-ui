import { forwardRef } from 'react'
import {
  Kbd as BaseKbd,
  KbdGroup as BaseKbdGroup,
  type KbdProps as BaseKbdProps,
  type KbdGroupProps as BaseKbdGroupProps,
} from '@pivot-ui/react'

export { KbdGroupRoot as StyledKbdGroup } from '@pivot-ui/react'

export interface KbdProps extends BaseKbdProps {
  uppercase?: boolean
  lowercase?: boolean
}
export interface KbdGroupProps extends BaseKbdGroupProps {
  uppercase?: boolean
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { uppercase = true, lowercase, letterCase, ...props },
  ref
) {
  return (
    <BaseKbd {...props} letterCase={letterCase ?? (lowercase ? 'lower' : uppercase ? 'upper' : 'preserve')} ref={ref} />
  )
})

export const KbdGroup = forwardRef<HTMLSpanElement, KbdGroupProps>(function KbdGroup(
  { uppercase = true, letterCase, ...props },
  ref
) {
  return <BaseKbdGroup {...props} letterCase={letterCase ?? (uppercase ? 'upper' : 'preserve')} ref={ref} />
})
