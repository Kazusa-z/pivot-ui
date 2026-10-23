import { forwardRef } from 'react'
import { Collapsible, type CollapsibleProps } from '../widgets/disclosure/Collapsible'

export type SectionProps = CollapsibleProps

/** 将相关字段或内容放入有标题的区域，默认展开。通过 children 组合内容，通过 actions 提供标题旁的操作。 */
export const Section = forwardRef<HTMLDivElement, SectionProps>(function Section(
  { defaultOpen = true, ...props },
  ref
) {
  return <Collapsible {...props} defaultOpen={defaultOpen} ref={ref} />
})
