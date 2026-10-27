import { forwardRef, type CSSProperties, type ImgHTMLAttributes } from 'react'
import { css, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

export interface ImagePreviewProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> {
  /** 图片的文字说明（必填）；纯装饰时传空字符串。 */
  alt: string
  /** 图片在容器内的缩放方式，默认 `contain`。 */
  objectFit?: CSSProperties['objectFit']
  /** 追加 Panda 样式对象。 */
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
      className={cx(
        css({ display: 'block', maxWidth: '100%', minWidth: 0, borderRadius: 'var(--radii-control)' }, cssProp),
        className
      )}
      style={{ objectFit, ...style }}
    />
  )
})
