import { copyAssetDescriptor, type AssetDescriptor } from '../../src/values/assets'

/** 示例资源记录，演示应用如何将引擎数据转换为控件需要的 ID、名称和展示地址。 */
export interface EngineAssetFixture {
  readonly id: string
  readonly name: string
  readonly thumbnailUrl?: string
  readonly isInitCompleted: boolean
  readonly loadFailed?: boolean
  readonly isSubAsset?: boolean
  readonly mainAsset?: EngineAssetFixture
  getMetaConfig(): { readonly type: string }
  getTempRoutes(): readonly string[]
}

export function engineAssetToDescriptor(asset: EngineAssetFixture): AssetDescriptor {
  const kind = asset.getMetaConfig().type
  const parent = asset.isSubAsset ? asset.mainAsset : undefined
  const path = parent ? [...parent.getTempRoutes(), parent.name] : [...asset.getTempRoutes()]
  return copyAssetDescriptor({
    id: asset.id,
    // This is an explicit host presentation policy, not a widget filename rule.
    name: ['Texture', 'Texture2D', 'TextureCube'].includes(kind)
      ? asset.name.replace(/\.(png|jpe?g|webp|hdr)$/i, '')
      : asset.name,
    kind,
    status: asset.loadFailed ? 'error' : asset.isInitCompleted ? 'ready' : 'loading',
    thumbnailUrl: asset.thumbnailUrl,
    path,
    ...(path.length ? { group: { id: JSON.stringify(path), label: path.join(' / ') } } : {}),
  })
}

export function createEngineAssetLookup(assets: readonly EngineAssetFixture[]) {
  const byId = new Map<string, EngineAssetFixture>()
  for (const asset of assets) {
    engineAssetToDescriptor(asset)
    if (byId.has(asset.id)) throw new Error(`Duplicate engine asset ID: ${asset.id}`)
    byId.set(asset.id, asset)
  }
  return { descriptors: assets.map(engineAssetToDescriptor), getEngineAsset: (id: string) => byId.get(id) ?? null }
}
