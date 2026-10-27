import { forwardRef, useState, type HTMLAttributes } from 'react'
import { IconFile, IconFileAlert, IconFileOff } from '@tabler/icons-react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { assertAssetDescriptor, type AssetDescriptor } from '../../values/assets'
import { Spin } from '../../display/feedback/Spin'

export interface AssetThumbnailProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  asset: AssetDescriptor
  viewMode?: 'grid' | 'list'
  /** The containing control already names the asset. */
  decorative?: boolean
  css?: SystemStyleObject
}

/** Displays a supplied URL only; resolving or fetching asset metadata belongs to the host. */
export const AssetThumbnail = forwardRef<HTMLSpanElement, AssetThumbnailProps>(function AssetThumbnail(
  { asset, viewMode = 'grid', decorative = false, css: cssProp, className, ...props },
  ref
) {
  assertAssetDescriptor(asset)
  const [failedImage, setFailedImage] = useState<{ id: string; url: string } | null>(null)
  const failed = failedImage?.id === asset.id && failedImage.url === asset.thumbnailUrl
  const showImage = asset.status === 'ready' && !!asset.thumbnailUrl && !failed
  const statusLabel =
    asset.status === 'loading'
      ? 'Loading'
      : asset.status === 'error'
        ? 'Unavailable'
        : asset.status === 'missing'
          ? 'Missing'
          : failed
            ? 'Preview unavailable'
            : asset.kind
  return (
    <span
      {...props}
      ref={ref}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${asset.name}: ${statusLabel}`}
      data-asset-thumbnail=""
      data-status={asset.status}
      data-image-error={failed || undefined}
      className={cx(
        css(
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            minWidth: 0,
            borderRadius: 'var(--radii-control)',
            color: 'var(--colors-textMuted)',
            backgroundColor: 'var(--colors-surfaceSubtle)',
            aspectRatio: '1 / 1',
          },
          viewMode === 'list'
            ? { width: 'var(--sizes-controlLg)', height: 'var(--sizes-controlLg)' }
            : { width: '100%', minHeight: '64px' },
          cssProp
        ),
        className
      )}>
      {showImage ? (
        <img
          key={`${asset.id}:${asset.thumbnailUrl}`}
          src={asset.thumbnailUrl}
          alt=""
          draggable={false}
          onError={() => setFailedImage({ id: asset.id, url: asset.thumbnailUrl! })}
          className={css({ display: 'block', width: '100%', height: '100%', objectFit: 'contain' })}
        />
      ) : asset.status === 'loading' ? (
        <Spin decorative size="md" />
      ) : asset.status === 'error' || failed ? (
        <IconFileAlert aria-hidden="true" size={viewMode === 'list' ? 22 : 36} />
      ) : asset.status === 'missing' ? (
        <IconFileOff aria-hidden="true" size={viewMode === 'list' ? 22 : 36} />
      ) : (
        <IconFile aria-hidden="true" size={viewMode === 'list' ? 22 : 36} />
      )}
    </span>
  )
})
