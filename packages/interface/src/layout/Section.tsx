import { forwardRef } from 'react'
import { Collapsible, type CollapsibleProps } from '../widgets/disclosure/Collapsible'

export type SectionProps = CollapsibleProps

/** A general titled layout section; content and its data remain owned by the caller. */
export const Section = forwardRef<HTMLDivElement, SectionProps>(function Section(
  { defaultOpen = true, ...props },
  ref
) {
  return <Collapsible {...props} defaultOpen={defaultOpen} ref={ref} />
})
