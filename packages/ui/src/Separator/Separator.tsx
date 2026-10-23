import { forwardRef } from 'react'
import { Separator as BaseSeparator, SectionDivider, type SeparatorProps as BaseSeparatorProps } from '@pivot-ui/react'

/** @deprecated Use Separator for lines and SectionDivider for text. */
export interface SeparatorProps extends BaseSeparatorProps {
  text?: string
  raw?: boolean
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { text, raw, orientation, decorative, style, ...props },
  ref
) {
  if (text)
    return (
      <SectionDivider {...props} ref={ref} style={style}>
        {text}
      </SectionDivider>
    )
  return (
    <BaseSeparator
      {...props}
      ref={ref}
      orientation={orientation}
      decorative={decorative}
      style={{
        ...(raw ? { display: 'block', margin: 0, backgroundColor: 'var(--colors-surfaceSubtle)' } : {}),
        ...style,
      }}
    />
  )
})
