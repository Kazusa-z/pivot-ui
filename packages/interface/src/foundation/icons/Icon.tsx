import { forwardRef, useId, type SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** A meaningful icon name. Omit for decoration next to an existing text label. */
  title?: string
  titleId?: string
}

export const IconFrame = forwardRef<SVGSVGElement, IconProps>(function IconFrame(
  { title, titleId, children, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...props },
  ref
) {
  const generatedId = useId()
  const resolvedTitleId = titleId ?? `${generatedId}-title`
  const hasName = Boolean(title || ariaLabel || ariaLabelledBy)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      role={hasName ? 'img' : undefined}
      aria-hidden={hasName ? undefined : true}
      focusable="false"
      {...props}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? (title && !ariaLabel ? resolvedTitleId : undefined)}
      ref={ref}>
      {title && <title id={resolvedTitleId}>{title}</title>}
      {children}
    </svg>
  )
})
