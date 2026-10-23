export type AssetId = string
export type AssetStatus = 'ready' | 'loading' | 'error' | 'missing'
export type ResourceViewMode = 'grid' | 'list'

/** A display snapshot. Engine instances and thumbnail loading belong to the provider. */
export interface AssetDescriptor {
  readonly id: AssetId
  readonly name: string
  readonly kind: string
  readonly status: AssetStatus
  readonly thumbnailUrl?: string
  readonly description?: string
  readonly path?: readonly string[]
  readonly group?: { readonly id: string; readonly label: string }
  readonly selectable?: boolean
  readonly disabledReason?: string
}

export interface AssetFilter {
  readonly text?: string
  readonly kinds?: readonly string[]
  readonly groupId?: string
}

export interface AssetGroup {
  readonly id: string | null
  readonly label: string
  readonly items: readonly AssetDescriptor[]
}

const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

export function assertAssetDescriptor(asset: AssetDescriptor): void {
  if (!asset || !nonempty(asset.id) || !nonempty(asset.name) || !nonempty(asset.kind)) {
    throw new TypeError('Assets require nonempty id, name and kind strings.')
  }
  if (!['ready', 'loading', 'error', 'missing'].includes(asset.status)) throw new TypeError('Invalid asset status.')
  for (const value of [asset.thumbnailUrl, asset.description, asset.disabledReason]) {
    if (value !== undefined && typeof value !== 'string') throw new TypeError('Invalid asset display metadata.')
  }
  if (
    asset.path !== undefined &&
    (!Array.isArray(asset.path) || !asset.path.every((part) => typeof part === 'string'))
  ) {
    throw new TypeError('Asset path must contain strings.')
  }
  if (asset.group !== undefined && (!asset.group || !nonempty(asset.group.id) || !nonempty(asset.group.label))) {
    throw new TypeError('Asset group requires a stable id and label.')
  }
  if (asset.selectable !== undefined && typeof asset.selectable !== 'boolean')
    throw new TypeError('Invalid asset selectable flag.')
}

export function copyAssetDescriptor(asset: AssetDescriptor): AssetDescriptor {
  assertAssetDescriptor(asset)
  return Object.freeze({
    id: asset.id,
    name: asset.name,
    kind: asset.kind,
    status: asset.status,
    ...(asset.thumbnailUrl !== undefined ? { thumbnailUrl: asset.thumbnailUrl } : {}),
    ...(asset.description !== undefined ? { description: asset.description } : {}),
    ...(asset.path !== undefined ? { path: Object.freeze([...asset.path]) } : {}),
    ...(asset.group !== undefined ? { group: Object.freeze({ ...asset.group }) } : {}),
    ...(asset.selectable !== undefined ? { selectable: asset.selectable } : {}),
    ...(asset.disabledReason !== undefined ? { disabledReason: asset.disabledReason } : {}),
  })
}

export function assertAssetCollection(assets: readonly AssetDescriptor[]): void {
  const ids = new Set<string>()
  for (const asset of assets) {
    assertAssetDescriptor(asset)
    if (ids.has(asset.id)) throw new TypeError(`Duplicate asset id: ${asset.id}`)
    ids.add(asset.id)
  }
}

export function isAssetSelectable(asset: AssetDescriptor): boolean {
  return asset.status === 'ready' && asset.selectable !== false
}

export function matchesAssetFilter(asset: AssetDescriptor, filter: AssetFilter): boolean {
  if (filter.kinds?.length && !filter.kinds.includes(asset.kind)) return false
  if (filter.groupId !== undefined && asset.group?.id !== filter.groupId) return false
  const text = filter.text?.trim().toLocaleLowerCase()
  return (
    !text || [asset.name, asset.description ?? '', ...(asset.path ?? [])].join(' ').toLocaleLowerCase().includes(text)
  )
}

export function filterAssets(assets: readonly AssetDescriptor[], filter: AssetFilter): readonly AssetDescriptor[] {
  return assets.filter((asset) => matchesAssetFilter(asset, filter))
}

/** Map preserves insertion order and does not treat group IDs as object property names. */
export function groupAssets(assets: readonly AssetDescriptor[], ungroupedLabel = 'Resources'): readonly AssetGroup[] {
  const groups = new Map<string | null, { id: string | null; label: string; items: AssetDescriptor[] }>()
  for (const asset of assets) {
    const id = asset.group?.id ?? null
    let group = groups.get(id)
    if (!group) {
      group = { id, label: asset.group?.label ?? ungroupedLabel, items: [] }
      groups.set(id, group)
    }
    group.items.push(asset)
  }
  return [...groups.values()]
}

export const ASSET_REFERENCE_DRAG_TYPE = 'asset-reference'
export interface AssetDragData {
  readonly id: AssetId
}
