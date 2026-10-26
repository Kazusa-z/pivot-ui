import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import type { ResourceProvider } from '../../contracts/resources'
import { useDropTarget } from '../../interaction/drag-drop/useDropTarget'
import {
  ASSET_REFERENCE_DRAG_TYPE,
  assertAssetDescriptor,
  copyAssetDescriptor,
  isAssetSelectable,
  matchesAssetFilter,
  type AssetDescriptor,
  type AssetId,
  type AssetDragData,
} from '../../values/assets'
import { Button } from '../../widgets/buttons/Button'
import { AssetThumbnail } from '../../widgets/collections/asset/AssetThumbnail'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  type PopoverContentProps,
  type PopoverPortalProps,
} from '../../widgets/overlays/Popover'
import { ResourcePicker, type ResourcePickerProps } from './ResourcePicker'

export interface AssetReferenceInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  value: AssetId | null
  provider: ResourceProvider
  /** 接收选中的资源 ID。接受后更新 value 并返回 true 或 void；返回 false 或抛出错误会保留选择器，方便用户重试。 */
  onValueChange?: (id: AssetId | null, asset: AssetDescriptor | null) => boolean | void | Promise<boolean | void>
  /** 为当前 value 对应的资源提供可直接展示的描述，例如名称和缩略图；资源引用仍通过 value 指定。 */
  selectedAsset?: AssetDescriptor
  kinds?: readonly string[]
  groupId?: string | null
  resetKey?: unknown
  label?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  /** 启用应用内资源拖放。请包裹 DragDropProvider，拖动数据使用 { id }，应用通过 provider 查询资源详情。 */
  dropEnabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  pickerProps?: Pick<
    ResourcePickerProps,
    | 'queryText'
    | 'defaultQueryText'
    | 'onQueryTextChange'
    | 'viewMode'
    | 'defaultViewMode'
    | 'onViewModeChange'
    | 'pageSize'
  >
  contentProps?: Omit<PopoverContentProps, 'children' | 'asChild'>
  portalProps?: Omit<PopoverPortalProps, 'children'>
  css?: SystemStyleObject
}
type Action = 'picker' | 'clear' | 'file' | 'drop' | 'locate'
interface Operation {
  provider: ResourceProvider
  resetKey: unknown
  initial: AssetId | null
  expected?: AssetId | null
  filter: string
  action: Action
}
function DropSurface({
  children,
  disabled,
  onDrop,
}: {
  children: ReactNode
  disabled: boolean
  onDrop: (id: string) => void
}) {
  const binding = useDropTarget<AssetDragData>({
    accept: [ASSET_REFERENCE_DRAG_TYPE],
    disabled,
    dropEffect: 'link',
    canDrop: ({ data }) => !!data && typeof data.id === 'string' && data.id.trim().length > 0,
    onDrop: ({ data }) => {
      onDrop(data.id)
      return true
    },
  })
  return (
    <div
      ref={binding.ref}
      data-asset-drop-target=""
      data-over={binding.isOver && binding.canDrop ? '' : undefined}
      className={css({
        minWidth: 0,
        borderRadius: 'var(--radii-controlMd)',
        '&[data-over]': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
      })}>
      {children}
    </div>
  )
}
const message = (error: unknown) => (error instanceof Error ? error.message : String(error))

/** 展示和更换一个资源引用，适合材质、图片等资源字段。通过 provider.get 加载当前 ID 的详情，通过回调请求更换或清空。 */
export const AssetReferenceInput = forwardRef<HTMLDivElement, AssetReferenceInputProps>(function AssetReferenceInput(
  {
    value,
    provider,
    onValueChange,
    selectedAsset,
    kinds,
    groupId,
    resetKey,
    label = 'Asset reference',
    placeholder = 'Choose an asset',
    disabled = false,
    readOnly = false,
    dropEnabled = false,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    pickerProps,
    contentProps,
    portalProps,
    css: cssProp,
    className,
    ...props
  },
  ref
) {
  if (value !== null && (typeof value !== 'string' || !value.trim()))
    throw new TypeError('Asset references must be a nonempty ID or null.')
  if (selectedAsset) assertAssetDescriptor(selectedAsset)
  const [localOpen, setLocalOpen] = useState(defaultOpen)
  const open = controlledOpen ?? localOpen
  const [resolved, setResolved] = useState<{
    provider: ResourceProvider
    id: AssetId
    resetKey: unknown
    resolution: number
    asset: AssetDescriptor | null
    error: string | null
  } | null>(null)
  const [resolution, setResolution] = useState(0)
  const [phase, setPhase] = useState<Action | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hostCommandError, setHostCommandError] = useState(false)
  const [invalidation, setInvalidation] = useState(0)
  const current = useRef<Operation | null>(null)
  const mounted = useRef(true)
  const retry = useRef<{ action: Action; run: () => void } | null>(null)
  const filter = JSON.stringify([kinds ?? null, groupId ?? null])
  const latest = useRef({ value, provider, resetKey, disabled, readOnly, onValueChange, filter, kinds, groupId })
  latest.current = { value, provider, resetKey, disabled, readOnly, onValueChange, filter, kinds, groupId }
  const errorId = useId(),
    resolutionErrorId = useId()
  function setOpen(next: boolean) {
    if (controlledOpen === undefined) setLocalOpen(next)
    if (next !== open) onOpenChange?.(next)
  }
  function isCurrent(operation: Operation) {
    const next = latest.current
    return (
      mounted.current &&
      current.current === operation &&
      next.provider === operation.provider &&
      Object.is(next.resetKey, operation.resetKey) &&
      next.filter === operation.filter &&
      !next.disabled &&
      (operation.action === 'locate' || (!next.readOnly && !!next.onValueChange)) &&
      (next.value === operation.initial || (operation.expected !== undefined && next.value === operation.expected))
    )
  }
  function invalidate() {
    current.current = null
    retry.current = null
    setPhase(null)
    setError(null)
    setHostCommandError(false)
    setInvalidation((old) => old + 1)
  }
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      current.current = null
      retry.current = null
    }
  }, [])
  useLayoutEffect(() => {
    if (!open && current.current?.action === 'picker') invalidate()
  }, [open])
  const previousOpen = useRef(open)
  useEffect(() => {
    // Picker commands may rename the same ID. Refresh metadata on dismissal without changing the reference.
    if (previousOpen.current && !open && value !== null && selectedAsset?.id !== value) setResolution((old) => old + 1)
    previousOpen.current = open
  }, [open, value, selectedAsset])
  const identity = useRef({ provider, resetKey, value, disabled, readOnly, filter })
  useLayoutEffect(() => {
    const previous = identity.current
    const changed =
      previous.provider !== provider ||
      !Object.is(previous.resetKey, resetKey) ||
      previous.filter !== filter ||
      previous.disabled !== disabled ||
      previous.readOnly !== readOnly ||
      previous.value !== value
    if (changed && (!current.current || !isCurrent(current.current))) invalidate()
    if (disabled || previous.provider !== provider || !Object.is(previous.resetKey, resetKey)) setOpen(false)
    identity.current = { provider, resetKey, value, disabled, readOnly, filter }
  }, [provider, resetKey, value, disabled, readOnly, filter])
  useEffect(() => {
    if (value === null || selectedAsset?.id === value) return
    let active = true
    Promise.resolve()
      .then(() => provider.get(value))
      .then((asset) => {
        if (!active) return
        if (asset) {
          assertAssetDescriptor(asset)
          if (asset.id !== value) throw Error('The resource provider returned a different asset ID.')
        }
        setResolved({
          provider,
          id: value,
          resetKey,
          resolution,
          asset: asset ? copyAssetDescriptor(asset) : null,
          error: null,
        })
      })
      .catch((cause: unknown) => {
        if (active) setResolved({ provider, id: value, resetKey, resolution, asset: null, error: message(cause) })
      })
    return () => {
      active = false
    }
  }, [value, provider, selectedAsset, resetKey, resolution])
  const snapshot = selectedAsset?.id === value ? selectedAsset : undefined
  const resolutionCurrent =
    resolved?.id === value &&
    resolved.provider === provider &&
    Object.is(resolved.resetKey, resetKey) &&
    resolved.resolution === resolution
  const asset = snapshot ?? (resolutionCurrent ? resolved.asset : null)
  const loading = value !== null && !snapshot && !resolutionCurrent
  const resolutionError = !snapshot && resolutionCurrent ? resolved.error : null
  const displayed: AssetDescriptor | null =
    value === null
      ? null
      : (asset ?? { id: value, name: value, kind: 'unknown', status: loading ? 'loading' : 'missing' })
  const name = displayed?.name ?? placeholder
  const pickerReset = useMemo(() => ({ provider, resetKey, invalidation }), [provider, resetKey, invalidation])

  async function run(action: Action, id?: AssetId): Promise<void> {
    const owner = latest.current
    if (current.current || owner.disabled || (action !== 'locate' && (owner.readOnly || !owner.onValueChange)))
      throw Error('Asset reference is unavailable for this action.')
    const operation: Operation = {
      provider: owner.provider,
      resetKey: owner.resetKey,
      initial: owner.value,
      filter: owner.filter,
      action,
    }
    current.current = operation
    setPhase(action)
    setError(null)
    setHostCommandError(false)
    retry.current = null
    let submitted = false
    try {
      if (action === 'locate') {
        if (!owner.value || !owner.provider.locate) throw Error('Asset location is unavailable.')
        await owner.provider.locate(owner.value)
      } else {
        let next: AssetDescriptor | null = null
        if (action === 'file') {
          if (!owner.provider.chooseFile) throw Error('File selection is unavailable.')
          const chosen = await owner.provider.chooseFile()
          if (!isCurrent(operation)) return
          if (!chosen) return
          assertAssetDescriptor(chosen)
          id = chosen.id
        }
        if (action !== 'clear') {
          if (!id) throw Error('Choose an asset ID.')
          next = await owner.provider.get(id)
          if (!isCurrent(operation)) return
          if (!next) throw Error('The asset no longer exists.')
          assertAssetDescriptor(next)
          if (next.id !== id) throw Error('The resource provider returned a different asset ID.')
          if (!isAssetSelectable(next)) throw Error(next.disabledReason ?? 'The asset is not ready for selection.')
          if (!matchesAssetFilter(next, { kinds: owner.kinds, groupId: owner.groupId || undefined }))
            throw Error('This asset does not match the accepted kind or group.')
          next = copyAssetDescriptor(next)
        }
        operation.expected = next?.id ?? null
        if (!isCurrent(operation)) return
        if (operation.expected !== owner.value) {
          submitted = true
          const accepted = await owner.onValueChange?.(operation.expected, next)
          if (!isCurrent(operation)) return
          if (accepted === false) throw Error('The reference change was rejected. Retry the selection.')
        }
        if (isCurrent(operation)) {
          if (next)
            setResolved({
              provider: owner.provider,
              id: next.id,
              resetKey: owner.resetKey,
              resolution,
              asset: next,
              error: null,
            })
          setOpen(false)
        }
      }
    } catch (cause) {
      if (!isCurrent(operation)) return
      setHostCommandError(submitted)
      if (action !== 'picker') {
        setError(message(cause))
        retry.current = {
          action,
          run: () => {
            void run(action, id).catch(() => {})
          },
        }
      }
      throw cause
    } finally {
      if (current.current === operation) {
        current.current = null
        if (mounted.current) setPhase(null)
      }
    }
  }
  const unavailable = disabled || readOnly || !onValueChange
  const buttons = (
    <div
      className={css({
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-1_5)',
        alignItems: 'center',
        minWidth: 0,
      })}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={`${label}: ${name}`}
          aria-invalid={!!(error || resolutionError || props['aria-invalid']) || undefined}
          aria-errormessage={
            error
              ? hostCommandError && props['aria-errormessage']
                ? props['aria-errormessage']
                : errorId
              : resolutionError
                ? resolutionErrorId
                : props['aria-errormessage']
          }
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            flex: '1 1 180px',
            minWidth: 0,
            minHeight: '48px',
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid var(--colors-borderStrong)',
            borderRadius: 'var(--radii-controlMd)',
            background: 'var(--colors-surfaceSubtle)',
            color: 'var(--colors-text)',
            font: 'inherit',
            textAlign: 'start',
            '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
            '&:disabled': { opacity: 0.5 },
          })}>
          {displayed && (
            <AssetThumbnail asset={displayed} viewMode="list" decorative css={css.raw({ flex: '0 0 36px' })} />
          )}
          <span className={css({ display: 'grid', minWidth: 0, gap: 'var(--space-0_5)' })}>
            <span
              title={name}
              className={css({
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                fontSize: 'var(--fontSizes-control)',
              })}>
              {name}
            </span>
            {displayed && displayed.status !== 'ready' && (
              <span className={css({ fontSize: 'var(--fontSizes-micro)', color: 'var(--colors-textMuted)' })}>
                {displayed.status}
              </span>
            )}
          </span>
        </button>
      </PopoverTrigger>
      <Button
        size="sm"
        disabled={disabled || !!phase || value === null || !provider.locate}
        onClick={() => {
          void run('locate').catch(() => {})
        }}>
        Locate
      </Button>
      <Button
        size="sm"
        disabled={unavailable || !!phase || value === null}
        onClick={() => {
          void run('clear').catch(() => {})
        }}>
        Clear
      </Button>
      <Button
        size="sm"
        disabled={unavailable || !!phase || !provider.chooseFile}
        onClick={() => {
          void run('file').catch(() => {})
        }}>
        Choose file
      </Button>
    </div>
  )
  return (
    <div
      {...props}
      ref={ref}
      role={props.role ?? 'group'}
      aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : label)}
      aria-busy={!!phase || loading || displayed?.status === 'loading' || undefined}
      className={cx(css({ display: 'grid', gap: 'var(--space-1_5)', minWidth: 0, width: '100%' }, cssProp), className)}>
      <PopoverRoot open={open && !disabled} onOpenChange={setOpen}>
        {dropEnabled ? (
          <DropSurface
            disabled={unavailable || !!phase}
            onDrop={(id) => {
              void run('drop', id).catch(() => {})
            }}>
            {buttons}
          </DropSurface>
        ) : (
          buttons
        )}
        <PopoverPortal {...portalProps}>
          <PopoverContent
            collisionPadding={12}
            {...contentProps}
            css={css.raw(
              {
                width: '600px',
                maxWidth: 'min(var(--radix-popover-content-available-width), calc(100vw - 24px))',
                maxHeight: 'min(var(--radix-popover-content-available-height), calc(100dvh - 24px))',
                overflowY: 'auto',
                boxSizing: 'border-box',
                minWidth: 0,
              },
              contentProps?.css
            )}>
            <PopoverTitle className={css({ margin: '0 0 var(--space-1)', fontSize: 'var(--fontSizes-controlLarge)' })}>
              {label}
            </PopoverTitle>
            <PopoverDescription
              className={css({
                margin: '0 0 var(--space-3)',
                fontSize: 'var(--fontSizes-control)',
                color: 'var(--colors-textMuted)',
              })}>
              Search or browse resources, then choose an available asset to use in this field.
            </PopoverDescription>
            <ResourcePicker
              {...pickerProps}
              provider={provider}
              selectedId={value}
              kinds={kinds}
              groupId={groupId || undefined}
              resetKey={pickerReset}
              disabled={disabled}
              readOnly={unavailable || (phase !== null && phase !== 'picker')}
              onSelect={(id) => run('picker', id)}
              aria-errormessage={hostCommandError ? props['aria-errormessage'] : undefined}
            />
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
      {phase && (
        <span role="status" className={css({ fontSize: 'var(--fontSizes-control)' })}>
          {phase === 'locate' ? 'Locating asset…' : 'Updating reference…'}
        </span>
      )}
      {resolutionError && (
        <div>
          <span id={resolutionErrorId} role="alert">
            {resolutionError}
          </span>
          <Button size="sm" disabled={disabled} onClick={() => setResolution((old) => old + 1)}>
            Retry reference
          </Button>
        </div>
      )}
      {error && !(hostCommandError && props['aria-errormessage']) && (
        <div>
          <span id={errorId} role="alert">
            {error}
          </span>
          <Button
            size="sm"
            disabled={disabled || !!phase || (unavailable && retry.current?.action !== 'locate')}
            onClick={() => retry.current?.run()}>
            Retry action
          </Button>
        </div>
      )}
    </div>
  )
})
