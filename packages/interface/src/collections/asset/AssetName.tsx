import { forwardRef, useMemo, type HTMLAttributes } from 'react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { assertAssetDescriptor, type AssetDescriptor } from '../../values/assets'
import { EditableText } from '../../controls/inputs/EditableText'

export interface AssetNameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** 资源描述。 */
  asset: AssetDescriptor
  /** 提供后可以就地改名。 */
  onRename?: (name: string) => void | Promise<void>
  /** 禁用改名。 */
  disabled?: boolean
  /** 只读：显示名称，不能改名。 */
  readOnly?: boolean
  /** 外部更新时改变，取消正在进行的改名。 */
  resetKey?: unknown
  /** 追加 Panda 样式对象。 */
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
