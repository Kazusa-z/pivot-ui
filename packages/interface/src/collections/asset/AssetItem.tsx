import { forwardRef, useId, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { assertAssetDescriptor, isAssetSelectable, type AssetDescriptor } from '../../values/assets'
import { AssetName } from './AssetName'
import { AssetThumbnail } from './AssetThumbnail'

export interface AssetItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** 资源描述：id、名称、类型、缩略图和状态（loading / error / missing 等）。 */
  asset: AssetDescriptor
  /** 是否选中。 */
  selected?: boolean
  /** 点击或按 Enter 选择时调用。 */
  onSelect?: (id: string) => void
  /** 提供后名称可以就地改名；返回 Promise 时失败会保留草稿。 */
  onRename?: (name: string) => void | Promise<void>
  /** 禁用：不能选择和改名。 */
  disabled?: boolean
  /** 只读：可以选择，但不能改名。 */
  readOnly?: boolean
  /** `grid` 缩略图磁贴（默认），`list` 单行列表。 */
  viewMode?: 'grid' | 'list'
  /** 文字密度：`compact` 名称 12px（默认），`regular` 名称 14px。 */
  density?: 'compact' | 'regular'
  /** 附加操作，例如更多菜单按钮。 */
  actions?: ReactNode
  /** 外部更新资源时改变，取消正在进行的改名。 */
  resetKey?: unknown
  /** 传给内部选择按钮的属性，例如拖动相关事件。 */
  selectionButtonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled' | 'type' | 'onSelect'>
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}

/** Selection, rename and host actions are sibling controls, never nested buttons. */
export const AssetItem = forwardRef<HTMLDivElement, AssetItemProps>(function AssetItem(
  {
    asset,
    selected = false,
    onSelect,
    onRename,
    disabled = false,
    readOnly = false,
    viewMode = 'grid',
    density = 'compact',
    actions,
    resetKey,
    selectionButtonProps,
    css: cssProp,
    className,
    ...props
  },
  ref
) {
  assertAssetDescriptor(asset)
  const statusId = useId()
  const available = !disabled && isAssetSelectable(asset)
  const interactive = !!onSelect || !!selectionButtonProps?.onClick
  const status =
    asset.status === 'loading'
      ? 'Loading'
      : asset.status === 'error'
        ? 'Unavailable'
        : asset.status === 'missing'
          ? 'Missing'
          : asset.selectable === false
            ? 'Not selectable'
            : null
  const explanation = asset.disabledReason || status
  const showNameInSelection = !onRename
  const content = (
    <>
      <AssetThumbnail asset={asset} viewMode={viewMode} decorative />
      <span
        className={
          showNameInSelection
            ? css({ minWidth: 0, overflowWrap: 'anywhere', textAlign: 'start' })
            : css({
                position: 'absolute',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                clipPath: 'inset(50%)',
                whiteSpace: 'nowrap',
              })
        }>
        {asset.name}
      </span>
    </>
  )
  const selectionClass = css(
    {
      minWidth: 0,
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1_5)',
      border: 0,
      padding: 0,
      borderRadius: 'var(--radii-control)',
      font: 'inherit',
      fontSize: 'var(--fontSizes-control)',
      color: 'inherit',
      backgroundColor: 'transparent',
      flex: '1',
      '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
    },
    viewMode === 'grid' ? { flexDirection: 'column', width: '100%' } : { flexDirection: 'row' },
    interactive ? { cursor: 'pointer', '&:disabled': { cursor: 'default', opacity: 0.5 } } : {}
  )
  return (
    <div
      {...props}
      ref={ref}
      role={props.role ?? 'group'}
      aria-label={props['aria-label'] ?? asset.name}
      data-asset-id={asset.id}
      data-selected={selected || undefined}
      data-view-mode={viewMode}
      data-density={density}
      data-status={asset.status}
      className={cx(
        css(
          {
            display: 'flex',
            minWidth: 0,
            gap: viewMode === 'grid' ? 'var(--space-1_5)' : 'var(--space-1)',
            padding: 'var(--space-1_5)',
            border: '1px solid var(--colors-border)',
            borderRadius: 'var(--radii-controlMd)',
            color: 'var(--colors-text)',
            backgroundColor: 'var(--colors-surface)',
            fontSize: 'var(--asset-font-size, var(--fontSizes-control))',
            '--asset-font-size': 'var(--fontSizes-control)',
            '--asset-meta-size': 'var(--fontSizes-micro)',
            '&[data-density=regular]': {
              '--asset-font-size': 'var(--fontSizes-controlLarge)',
              '--asset-meta-size': 'var(--fontSizes-control)',
            },
            '&:not([data-selected]):hover': { backgroundColor: 'var(--colors-softBgHover)' },
          },
          viewMode === 'grid'
            ? { flexDirection: 'column', alignItems: 'stretch' }
            : { flexDirection: 'row', alignItems: 'center' },
          selected
            ? {
                borderColor: 'var(--colors-selectionSubtleBorder)',
                backgroundColor: 'var(--colors-selectionSubtleBg)',
              }
            : {},
          cssProp
        ),
        className
      )}>
      {interactive ? (
        <button
          {...selectionButtonProps}
          type="button"
          disabled={!available}
          aria-pressed={selected}
          aria-label={selectionButtonProps?.['aria-label'] ?? `Select ${asset.name}`}
          aria-describedby={
            [selectionButtonProps?.['aria-describedby'], explanation ? statusId : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={cx(selectionClass, selectionButtonProps?.className)}
          onClick={(event) => {
            selectionButtonProps?.onClick?.(event)
            if (!event.defaultPrevented && available) onSelect?.(asset.id)
          }}>
          {content}
        </button>
      ) : (
        <div className={selectionClass}>{content}</div>
      )}
      {onRename && (
        <AssetName
          asset={asset}
          onRename={onRename}
          disabled={disabled}
          readOnly={readOnly}
          resetKey={resetKey}
          css={{
            fontSize: 'var(--asset-font-size, var(--fontSizes-control))',
            ...(viewMode === 'list' ? { flex: '1' } : {}),
          }}
        />
      )}
      {explanation && (
        <span
          id={statusId}
          className={css({
            fontSize: 'var(--asset-meta-size, var(--fontSizes-micro))',
            color: 'var(--colors-textMuted)',
            overflowWrap: 'anywhere',
          })}>
          {explanation}
        </span>
      )}
      {actions && (
        <div className={css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-1)' })}>
          {actions}
        </div>
      )}
    </div>
  )
})
