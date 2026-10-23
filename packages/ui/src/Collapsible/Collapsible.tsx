import { forwardRef } from 'react'
import { Collapsible as BaseCollapsible, type CollapsibleProps as BaseCollapsibleProps } from '@pivot-ui/react'
import { css, cx } from '@pivot-ui/react/styling/css'

export interface CollapsibleProps extends Omit<BaseCollapsibleProps, 'title'> {
  title?: BaseCollapsibleProps['title']
  triggerTitle?: boolean
  transparent?: boolean
  subtle?: boolean
  nesting?: boolean
  guideline?: boolean
}

// B11 removes the legacy visual flags; state and disclosure behavior have one implementation.
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  {
    title,
    triggerTitle = true,
    transparent,
    subtle,
    nesting,
    guideline,
    variant,
    triggerMode,
    css: cssProp,
    contentCss,
    className,
    ...props
  },
  ref
) {
  return (
    <BaseCollapsible
      {...props}
      ref={ref}
      title={title}
      triggerMode={triggerMode ?? (triggerTitle ? 'title' : 'icon')}
      variant={variant ?? (transparent ? 'transparent' : subtle ? 'surface' : 'subtle')}
      className={cx('collapsible', className)}
      css={css.raw(nesting ? { marginInlineStart: '4px', width: 'calc(100% - 4px)' } : {}, cssProp)}
      contentCss={css.raw(
        guideline ? { borderInlineStart: '1px solid var(--colors-grayA5)', paddingInlineStart: '4px' } : {},
        contentCss
      )}
    />
  )
})
