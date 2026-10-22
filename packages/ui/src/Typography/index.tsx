import { forwardRef } from 'react'
import {
  Text as BaseText,
  Bold as BaseBold,
  type TextProps as BaseTextProps,
  type BoldProps as BaseBoldProps,
} from '@pivot-ui/react'

export { Link, Title, type LinkProps, type TitleProps } from '@pivot-ui/react'

export interface TextProps extends BaseTextProps {
  code?: boolean
  highContrast?: boolean
  muted?: boolean
  deleted?: boolean
  ellipsis?: boolean
  primary?: boolean
  error?: boolean
}

/** Legacy presentation flags map to the single typography implementation. */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { code, highContrast, muted, deleted, ellipsis, primary, error, tone, weight, ...props },
  ref
) {
  return (
    <BaseText
      monospace={code}
      truncate={ellipsis}
      strikethrough={deleted}
      tone={tone ?? (error ? 'danger' : primary || highContrast ? 'strong' : muted ? 'muted' : 'default')}
      weight={weight === 'bold' ? 'semi' : weight}
      {...props}
      ref={ref}
    />
  )
})

export interface BoldProps extends BaseBoldProps {
  variant?: 'subtle'
}

export const Bold = forwardRef<HTMLElement, BoldProps>(function Bold({ variant, tone, ...props }, ref) {
  return <BaseBold tone={tone ?? (variant === 'subtle' ? 'muted' : 'strong')} {...props} ref={ref} />
})
