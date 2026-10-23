import { forwardRef, type CSSProperties, type ImgHTMLAttributes } from 'react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

export interface ImagePreviewProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> {
  alt: string
  objectFit?: CSSProperties['objectFit']
  css?: SystemStyleObject
}

/** Image presentation only. Resource resolution and loading/error policy belong to the caller. */
export const ImagePreview = forwardRef<HTMLImageElement, ImagePreviewProps>(function ImagePreview(
  { alt, src, objectFit = 'contain', css: cssProp, className, style, ...props },
  ref
) {
  return (
    <img
      {...props}
      ref={ref}
      src={src || undefined}
      alt={alt}
      className={cx(css({ display: 'block', maxWidth: '100%', minWidth: 0 }, cssProp), className)}
      style={{ objectFit, ...style }}
    />
  )
})
