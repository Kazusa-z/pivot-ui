import { forwardRef, useState, type MouseEventHandler } from 'react'
import { Badge as BaseBadge, Tag, type BadgeProps as BaseBadgeProps } from '@pivot-ui/react'

export interface BadgeProps extends BaseBadgeProps {
  closable?: boolean
  onClose?: MouseEventHandler<HTMLButtonElement>
}

/** B11 removes this compatibility-only self-closing behavior. New Tag is always parent-controlled. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ closable, onClose, ...props }, ref) {
  const [closed, setClosed] = useState(false)
  if (closed) return null
  if (!closable) return <BaseBadge {...props} ref={ref} />
  return (
    <Tag
      {...props}
      ref={ref}
      onRemove={(event) => {
        onClose?.(event)
        if (!event.defaultPrevented) setClosed(true)
      }}
    />
  )
})
