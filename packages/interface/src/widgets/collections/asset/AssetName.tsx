import { forwardRef, useMemo, type HTMLAttributes } from 'react'
import { css, cx } from '../../../../styled-system/css'
import type { SystemStyleObject } from '../../../../styled-system/types'
import { assertAssetDescriptor, type AssetDescriptor } from '../../../values/assets'
import { EditableText } from '../../inputs/EditableText'

export interface AssetNameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  asset: AssetDescriptor
  onRename?: (name: string) => void | Promise<void>
  disabled?: boolean
  readOnly?: boolean
  resetKey?: unknown
  css?: SystemStyleObject
}

/** The host owns the accepted name. EditableText owns the temporary draft and submission lifecycle. */
export const AssetName = forwardRef<HTMLDivElement, AssetNameProps>(function AssetName(
  { asset, onRename, disabled, readOnly, resetKey, css: cssProp, className, ...props },
  ref
) {
  assertAssetDescriptor(asset)
  const identity = useMemo(() => ({ id: asset.id, resetKey }), [asset.id, resetKey])
  const nameStyle = css.raw(
    {
      minWidth: 0,
      maxWidth: '100%',
      fontSize: 'var(--fontSizes-control)',
      overflowWrap: 'anywhere',
      color: 'var(--colors-text)',
    },
    cssProp
  )
  if (!onRename)
    return (
      <div {...props} ref={ref} className={cx(css(nameStyle), className)} title={asset.name}>
        {asset.name}
      </div>
    )
  return (
    <EditableText
      {...props}
      ref={ref}
      css={nameStyle}
      className={className}
      value={asset.name}
      resetKey={identity}
      disabled={disabled || asset.status !== 'ready'}
      readOnly={readOnly}
      label={`asset ${asset.name}`}
      showIcon
      onCommit={(name) => {
        if (name.trim().length === 0) throw new Error('Asset name cannot be empty.')
        if (name !== asset.name) return onRename(name)
      }}
    />
  )
})
