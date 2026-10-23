import { forwardRef, type ReactNode } from 'react'
import { Section, type SectionProps } from '@pivot-ui/react'
import { css } from '@pivot-ui/react/styling/css'

export interface FormItemGroupProps extends Omit<SectionProps, 'title'> {
  label?: string
  customTitle?: ReactNode
  transparent?: boolean
  subtle?: boolean
  nesting?: boolean
  guideline?: boolean
  triggerTitle?: boolean
}

// B11 removes this name adapter. Section has no field value or change contract.
export const FormItemGroup = forwardRef<HTMLDivElement, FormItemGroupProps>(function FormItemGroup(
  {
    label,
    customTitle,
    transparent,
    subtle,
    nesting,
    guideline,
    triggerTitle = true,
    variant,
    triggerMode,
    css: cssProp,
    contentCss,
    ...props
  },
  ref
) {
  return (
    <Section
      {...props}
      ref={ref}
      title={customTitle ?? label}
      triggerMode={triggerMode ?? (triggerTitle ? 'title' : 'icon')}
      variant={variant ?? (transparent ? 'transparent' : subtle ? 'surface' : 'subtle')}
      css={css.raw(
        { marginBottom: '2px', '&:last-child': { marginBottom: 0 } },
        nesting ? { marginInlineStart: '4px', width: 'calc(100% - 4px)' } : {},
        cssProp
      )}
      contentCss={css.raw(
        guideline ? { borderInlineStart: '1px solid var(--colors-grayA5)', paddingInlineStart: '4px' } : {},
        contentCss
      )}
    />
  )
})
