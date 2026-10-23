import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import type { ResourcePage, ResourceProvider, ResourceQuery } from '../../contracts/resources'
import {
  assertAssetDescriptor,
  copyAssetDescriptor,
  groupAssets,
  isAssetSelectable,
  type AssetDescriptor,
  type AssetId,
  type ResourceViewMode,
} from '../../values/assets'
import { AssetItem } from '../../widgets/collections/asset/AssetItem'
import { Pagination } from '../../widgets/navigation/Pagination'

export interface ResourceFilterOption {
  readonly value: string
  readonly label: string
}
export type { ResourceViewMode } from '../../values/assets'
export interface ResourcePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  provider: ResourceProvider
  selectedId?: AssetId | null
  defaultSelectedId?: AssetId | null
  onSelectedIdChange?: (id: AssetId | null) => void
  onSelect?: (id: AssetId, asset: AssetDescriptor) => boolean | void | Promise<boolean | void>
  onSelectSuccess?: (id: AssetId) => void
  queryText?: string
  defaultQueryText?: string
  onQueryTextChange?: (text: string) => void
  kinds?: readonly string[]
  defaultKinds?: readonly string[]
  onKindsChange?: (kinds: readonly string[]) => void
  kindOptions?: readonly ResourceFilterOption[]
  groupId?: string
  defaultGroupId?: string
  onGroupIdChange?: (groupId: string) => void
  groupOptions?: readonly ResourceFilterOption[]
  viewMode?: ResourceViewMode
  defaultViewMode?: ResourceViewMode
  onViewModeChange?: (mode: ResourceViewMode) => void
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  pageSize?: number
  disabled?: boolean
  readOnly?: boolean
  resetKey?: unknown
  label?: string
  css?: SystemStyleObject
}

function usePickerState<T>(value: T | undefined, initial: T, onChange: ((value: T) => void) | undefined) {
  const [local, setLocal] = useState(initial)
  const current = value === undefined ? local : value
  function request(next: T) {
    if (Object.is(next, current)) return
    if (value === undefined) setLocal(next)
    onChange?.(next)
  }
  return [current, request] as const
}
const emptyKinds: readonly string[] = []
const controlClass = css({
  minWidth: 0,
  maxWidth: '100%',
  minHeight: '30px',
  padding: '4px 8px',
  border: '1px solid var(--colors-borderStrong)',
  borderRadius: '4px',
  background: 'var(--colors-surfaceSubtle)',
  color: 'var(--colors-text)',
  font: 'inherit',
  fontSize: '12px',
  '&:disabled': { opacity: 0.5 },
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
})
type QueryResult = { key: string; provider: ResourceProvider; resetKey: unknown; page?: ResourcePage; error?: string }
type SelectionFocus = { id: AssetId; button: HTMLButtonElement; abandoned: boolean; dispose: () => void }
type Command = {
  kind: 'select' | 'rename'
  id: AssetId
  initialId: AssetId | null
  generation: number
  focus?: SelectionFocus
}
function message(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

/** Resource browsing is UI state. Selecting an ID is an atomic request to the host. */
export const ResourcePicker = forwardRef<HTMLDivElement, ResourcePickerProps>(function ResourcePicker(
  {
    provider,
    selectedId: selectedProp,
    defaultSelectedId = null,
    onSelectedIdChange,
    onSelect,
    onSelectSuccess,
    queryText: queryProp,
    defaultQueryText = '',
    onQueryTextChange,
    kinds: kindsProp,
    defaultKinds = emptyKinds,
    onKindsChange,
    kindOptions = [],
    groupId: groupProp,
    defaultGroupId = '',
    onGroupIdChange,
    groupOptions = [],
    viewMode: viewProp,
    defaultViewMode = 'grid',
    onViewModeChange,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    pageSize = 24,
    disabled = false,
    readOnly = false,
    resetKey,
    label = 'Resources',
    css: cssProp,
    className,
    ...props
  },
  ref
) {
  if (!Number.isSafeInteger(pageSize) || pageSize < 1)
    throw new RangeError('Resource pageSize must be a positive safe integer.')
  const [selectedId, setSelectedId] = usePickerState(selectedProp, defaultSelectedId, onSelectedIdChange)
  const [queryText, setQueryText] = usePickerState(queryProp, defaultQueryText, onQueryTextChange)
  const [kinds, setKinds] = usePickerState(kindsProp, defaultKinds, onKindsChange)
  const [groupId, setGroupId] = usePickerState(groupProp, defaultGroupId, onGroupIdChange)
  const [viewMode, setViewMode] = usePickerState(viewProp, defaultViewMode, onViewModeChange)
  const [page, setPage] = usePickerState(pageProp, defaultPage, onPageChange)
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger((page - 1) * pageSize))
    throw new RangeError('Resource page must be a positive safe integer within the supported offset range.')
  const filterKey = JSON.stringify([queryText, kinds, groupId, pageSize])
  const previousFilter = useRef(filterKey)
  const queryPage = previousFilter.current !== filterKey && pageProp === undefined ? 1 : page
  const queryKey = JSON.stringify([filterKey, queryPage])
  const query = useMemo<ResourceQuery>(
    () => ({
      text: queryText,
      kinds: kinds.length ? [...kinds] : undefined,
      groupId: groupId || undefined,
      offset: (queryPage - 1) * pageSize,
      limit: pageSize,
    }),
    [queryKey]
  )
  const [result, setResult] = useState<QueryResult | null>(null)
  const [pagination, setPagination] = useState<{ provider: ResourceProvider; resetKey: unknown; total: number } | null>(
    null
  )
  const [querying, setQuerying] = useState(false)
  const [reload, setReload] = useState(0)
  const [command, setCommand] = useState<Command | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(false),
    generation = useRef(0),
    active = useRef<Command | null>(null)
  const element = useRef<HTMLDivElement>(null),
    restoreSelectionFocus = useRef<SelectionFocus | null>(null)
  useImperativeHandle(ref, () => element.current!, [])
  const latest = useRef({
    provider,
    queryKey,
    resetKey,
    disabled,
    readOnly,
    selectedId,
    onSelect,
    onSelectSuccess,
    setSelectedId,
  })
  latest.current = {
    provider,
    queryKey,
    resetKey,
    disabled,
    readOnly,
    selectedId,
    onSelect,
    onSelectSuccess,
    setSelectedId,
  }
  const inputId = useId(),
    kindId = useId(),
    groupInputId = useId(),
    errorId = useId()
  const currentResult =
    result?.key === queryKey && result.provider === provider && Object.is(result.resetKey, resetKey) ? result : null
  const loading = !disabled && (!currentResult || querying)
  const data = currentResult?.page
  const paginationTotal =
    pagination?.provider === provider && Object.is(pagination.resetKey, resetKey) ? pagination.total : undefined
  const busy = command !== null
  const groups = useMemo(() => groupAssets(data?.items ?? [], 'Ungrouped'), [data])
  function invalidate() {
    generation.current++
    active.current?.focus?.dispose()
    restoreSelectionFocus.current?.dispose()
    restoreSelectionFocus.current = null
    active.current = null
    setCommand(null)
    setError(null)
  }
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      generation.current++
      active.current?.focus?.dispose()
      restoreSelectionFocus.current?.dispose()
      restoreSelectionFocus.current = null
      active.current = null
    }
  }, [])
  useLayoutEffect(() => {
    invalidate()
  }, [provider, queryKey, resetKey, disabled, readOnly])
  useLayoutEffect(() => {
    setResult(null)
    setPagination(null)
  }, [provider, resetKey])
  useLayoutEffect(() => {
    const pending = active.current
    if (pending?.kind === 'select' && selectedId !== pending.initialId && selectedId !== pending.id) invalidate()
  }, [selectedId])
  useLayoutEffect(() => {
    const request = restoreSelectionFocus.current
    if (command || !request) return
    restoreSelectionFocus.current = null
    request.dispose()
    const container = element.current
    if (!container || request.abandoned) return
    const document = container.ownerDocument
    // Disabling the active native button may send focus to the document. Only repair that loss.
    if (document.activeElement !== document.body && document.activeElement !== request.button) return
    const item = [...container.querySelectorAll<HTMLElement>('[data-asset-id]')].find(
      (item) => item.dataset.assetId === request.id
    )
    const button = item?.querySelector<HTMLButtonElement>('button[aria-pressed]')
    if (button && !button.disabled) button.focus()
  })
  useLayoutEffect(() => {
    if (previousFilter.current !== filterKey) {
      previousFilter.current = filterKey
      setPage(1)
    }
  }, [filterKey])
  useEffect(() => {
    if (disabled) return
    let valid = true
    const isCurrent = () =>
      valid &&
      mounted.current &&
      latest.current.provider === provider &&
      latest.current.queryKey === queryKey &&
      Object.is(latest.current.resetKey, resetKey) &&
      !latest.current.disabled
    setQuerying(true)
    void (async () => {
      try {
        const response = await provider.query(query)
        if (!isCurrent()) return
        if (
          !response ||
          !Array.isArray(response.items) ||
          !Number.isSafeInteger(response.total) ||
          response.total < 0 ||
          response.offset !== query.offset ||
          response.items.length > query.limit ||
          response.items.length > Math.max(0, response.total - response.offset)
        )
          throw new TypeError('The resource provider returned an invalid page.')
        const ids = new Set<AssetId>()
        const items = response.items.map((item) => {
          assertAssetDescriptor(item)
          if (ids.has(item.id)) throw new TypeError('Resource IDs must be unique within a page.')
          ids.add(item.id)
          return copyAssetDescriptor(item)
        })
        setResult({
          key: queryKey,
          provider,
          resetKey,
          page: { items, total: response.total, offset: response.offset },
        })
        setPagination({ provider, resetKey, total: response.total })
        setQuerying(false)
        const lastPage = Math.max(1, Math.ceil(response.total / pageSize))
        if (queryPage > lastPage) setPage(lastPage)
      } catch (cause) {
        if (isCurrent()) {
          setResult((previous) => ({
            key: queryKey,
            provider,
            resetKey,
            page:
              previous?.key === queryKey && previous.provider === provider && Object.is(previous.resetKey, resetKey)
                ? previous.page
                : undefined,
            error: message(cause),
          }))
          setQuerying(false)
        }
      }
    })()
    return () => {
      valid = false
    }
  }, [provider, queryKey, resetKey, disabled, reload])
  function start(kind: Command['kind'], asset: AssetDescriptor) {
    if (!mounted.current || active.current || latest.current.disabled || latest.current.readOnly) return null
    const next: Command = { kind, id: asset.id, initialId: latest.current.selectedId, generation: generation.current }
    if (kind === 'select') {
      const container = element.current
      const document = container?.ownerDocument
      const button = document?.activeElement
      if (
        container &&
        document &&
        button instanceof HTMLButtonElement &&
        container.contains(button) &&
        button.hasAttribute('aria-pressed') &&
        button.closest<HTMLElement>('[data-asset-id]')?.dataset.assetId === asset.id
      ) {
        const focus: SelectionFocus = { id: asset.id, button, abandoned: false, dispose: () => {} }
        const abandon = () => {
          focus.abandoned = true
        }
        const moved = (event: FocusEvent) => {
          if (event.target !== button && event.target !== document.body) abandon()
        }
        const pointed = (event: PointerEvent) => {
          if (event.target instanceof Node && !button.contains(event.target)) abandon()
        }
        const tabbed = (event: KeyboardEvent) => {
          if (event.key === 'Tab') abandon()
        }
        document.addEventListener('focusin', moved)
        document.addEventListener('pointerdown', pointed, true)
        document.addEventListener('keydown', tabbed, true)
        document.defaultView?.addEventListener('blur', abandon)
        focus.dispose = () => {
          document.removeEventListener('focusin', moved)
          document.removeEventListener('pointerdown', pointed, true)
          document.removeEventListener('keydown', tabbed, true)
          document.defaultView?.removeEventListener('blur', abandon)
        }
        next.focus = focus
      }
    }
    active.current = next
    setCommand(next)
    setError(null)
    return next
  }
  function current(token: Command) {
    return mounted.current && active.current === token && token.generation === generation.current
  }
  function finish(token: Command, restoreFocus = false) {
    if (current(token)) {
      if (restoreFocus && token.focus) restoreSelectionFocus.current = token.focus
      else token.focus?.dispose()
      active.current = null
      setCommand(null)
    }
  }
  async function select(asset: AssetDescriptor) {
    if (!isAssetSelectable(asset)) return
    const token = start('select', asset)
    if (!token) return
    try {
      const accepted = await latest.current.onSelect?.(asset.id, copyAssetDescriptor(asset))
      if (!current(token)) return
      if (accepted === false) {
        setError('The resource selection was rejected. Try again.')
        finish(token, true)
        return
      }
      latest.current.setSelectedId(asset.id)
      if (!current(token)) return
      finish(token, true)
      latest.current.onSelectSuccess?.(asset.id)
    } catch (cause) {
      if (current(token)) {
        setError(message(cause))
        finish(token, true)
      }
    }
  }
  async function rename(asset: AssetDescriptor, name: string) {
    const service = latest.current.provider
    if (!service.rename) return
    const token = start('rename', asset)
    if (!token) return
    try {
      const renamed = await service.rename(asset.id, name)
      if (!current(token)) return
      assertAssetDescriptor(renamed)
      if (renamed.id !== asset.id) throw new TypeError('Renaming a resource must preserve its ID.')
      const snapshot = copyAssetDescriptor(renamed)
      setResult((previous) =>
        previous?.page
          ? {
              ...previous,
              page: {
                ...previous.page,
                items: previous.page.items.map((item) => (item.id === snapshot.id ? snapshot : item)),
              },
            }
          : previous
      )
      finish(token)
      setReload((value) => value + 1)
    } catch (cause) {
      if (current(token)) {
        finish(token)
        throw cause
      }
    }
  }
  const childReset = useMemo(() => ({ provider, queryKey, resetKey }), [provider, queryKey, resetKey])
  const queryError = currentResult?.error
  const shownError = error ?? queryError
  const fieldClass = css({ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, fontSize: '12px' })
  const outsidePage = paginationTotal !== undefined && queryPage > Math.max(1, Math.ceil(paginationTotal / pageSize))
  return (
    <div
      {...props}
      ref={element}
      role={props.role ?? 'region'}
      aria-label={props['aria-label'] ?? label}
      aria-busy={loading || busy || undefined}
      aria-describedby={
        [props['aria-describedby'], shownError ? errorId : undefined].filter(Boolean).join(' ') || undefined
      }
      className={cx(
        css(
          {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: 0,
            maxWidth: '100%',
            color: 'var(--colors-text)',
          },
          cssProp
        ),
        className
      )}>
      <div className={css({ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '8px' })}>
        <label htmlFor={inputId} className={cx(fieldClass, css({ flex: '1 1 180px' }))}>
          Search resources
          <input
            id={inputId}
            type="search"
            className={controlClass}
            value={queryText}
            disabled={disabled || busy}
            onChange={(event) => setQueryText(event.target.value)}
          />
        </label>
        {kindOptions.length > 0 && (
          <label htmlFor={kindId} className={fieldClass}>
            Kinds
            <select
              id={kindId}
              multiple
              className={controlClass}
              value={[...kinds]}
              disabled={disabled || busy}
              onChange={(event) => setKinds(Array.from(event.target.selectedOptions, (option) => option.value))}>
              {kindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {groupOptions.length > 0 && (
          <label htmlFor={groupInputId} className={fieldClass}>
            Group
            <select
              id={groupInputId}
              className={controlClass}
              value={groupId}
              disabled={disabled || busy}
              onChange={(event) => setGroupId(event.target.value)}>
              <option value="">All groups</option>
              {groupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <div role="group" aria-label="Resource view" className={css({ display: 'flex', gap: '4px' })}>
          {(['grid', 'list'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={controlClass}
              aria-pressed={viewMode === mode}
              disabled={disabled}
              onClick={() => setViewMode(mode)}>
              {mode === 'grid' ? 'Grid' : 'List'}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={controlClass}
          disabled={disabled || busy || loading}
          onClick={() => setReload((value) => value + 1)}>
          Refresh resources
        </button>
      </div>
      {shownError && (
        <div
          role="alert"
          id={errorId}
          className={css({ fontSize: '12px', color: 'var(--colors-dangerText)', overflowWrap: 'anywhere' })}>
          {shownError}
        </div>
      )}
      {loading && (
        <p role="status" className={css({ margin: 0, fontSize: '12px' })}>
          Loading resources…
        </p>
      )}
      {data && (
        <>
          <p role="status" className={css({ margin: 0, fontSize: '12px', color: 'var(--colors-textMuted)' })}>
            {data.total === 0 ? 'No resources found.' : `${data.total} resource${data.total === 1 ? '' : 's'}`}
            {command?.kind === 'select' ? ' — Selecting…' : ''}
          </p>
          {groups.map((group) => (
            <section
              key={group.id === null ? 'ungrouped' : `group:${group.id}`}
              aria-label={group.label}
              className={css({ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 })}>
              <h3 className={css({ margin: 0, fontSize: '12px', fontWeight: 600 })}>{group.label}</h3>
              <ul
                className={css(
                  { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '8px', minWidth: 0 },
                  viewMode === 'grid'
                    ? { gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 128px), 1fr))' }
                    : { gridTemplateColumns: 'minmax(0, 1fr)' }
                )}>
                {group.items.map((asset) => (
                  <li key={asset.id} className={css({ minWidth: 0 })}>
                    <AssetItem
                      asset={asset}
                      selected={selectedId === asset.id}
                      viewMode={viewMode}
                      readOnly={readOnly}
                      disabled={disabled || (busy && !(command?.kind === 'rename' && command.id === asset.id))}
                      onSelect={
                        readOnly
                          ? undefined
                          : () => {
                              void select(asset)
                            }
                      }
                      onRename={provider.rename ? (name) => rename(asset, name) : undefined}
                      resetKey={childReset}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
      {paginationTotal !== undefined &&
        (outsidePage ? (
          <button
            type="button"
            className={controlClass}
            disabled={disabled || busy}
            onClick={() => setPage(Math.max(1, Math.ceil(paginationTotal / pageSize)))}>
            Go to last available page
          </button>
        ) : (
          <Pagination
            totalCount={paginationTotal}
            pageSize={pageSize}
            page={queryPage}
            onPageChange={setPage}
            disabled={disabled || busy}
            aria-label="Resource pages"
          />
        ))}
    </div>
  )
})
