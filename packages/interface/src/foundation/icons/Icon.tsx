import { forwardRef, useId, type SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** 图标单独表达含义时的名称（也可用 `aria-label`）；放在已有文字旁作装饰时省略，图标会对读屏隐藏。 */
  title?: string
  /** 自定义 `<title>` 元素的 id。 */
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
