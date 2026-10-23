import type { ResourcePage, ResourceProvider, ResourceQuery } from '../../src/contracts/resources'
import {
  assertAssetCollection,
  copyAssetDescriptor,
  filterAssets,
  isAssetSelectable,
  type AssetDescriptor,
} from '../../src/values/assets'

export type MockResourceOperation = 'query' | 'get' | 'rename' | 'locate' | 'chooseFile'
export interface MockResourceEvent {
  readonly operation: MockResourceOperation
  readonly id?: string
  readonly query?: ResourceQuery
}
export interface MockResourceProvider extends ResourceProvider {
  rename(id: string, name: string): Promise<AssetDescriptor>
  locate(id: string): Promise<void>
  chooseFile(): Promise<AssetDescriptor | null>
  rejectNext(operation: MockResourceOperation, message?: string): void
  setDelay(ms: number): void
  setAssets(assets: readonly AssetDescriptor[]): void
  setFileResult(id: string | null): void
  getEvents(): readonly MockResourceEvent[]
}

const thumbnail = (fill: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="8" fill="${fill}"/><path d="M16 68 48 20 80 68Z" fill="white" opacity=".5"/></svg>`)}`

export const resourceKindOptions = [
  { value: 'texture', label: 'Textures' },
  { value: 'material', label: 'Materials' },
  { value: 'model', label: 'Models' },
] as const
export const resourceGroupOptions = [
  { value: 'surfaces', label: 'Surfaces' },
  { value: 'scene', label: 'Scene' },
] as const
export const mockAssets: readonly AssetDescriptor[] = Array.from({ length: 18 }, (_, index) => {
  const kind = resourceKindOptions[index % 3].value
  const group = resourceGroupOptions[index % 2]
  return copyAssetDescriptor({
    id: `asset-${index + 1}`,
    name: `${['Brick', 'Copper', 'Cube', 'Marble', 'Glass', 'Sphere'][index % 6]} ${Math.floor(index / 6) + 1}`,
    kind,
    status: index === 15 ? 'loading' : index === 16 ? 'error' : 'ready',
    thumbnailUrl: thumbnail(['#b86644', '#8d9bb5', '#428c83'][index % 3]),
    path: ['Library', group.label],
    group: { id: group.value, label: group.label },
    ...(index === 17 ? { selectable: false, disabledReason: 'Restricted by the host' } : {}),
  })
})

/** Deterministic host simulation. Each request snapshots its delay/failure/data at dispatch. */
export function createMockResourceProvider(
  options: { assets?: readonly AssetDescriptor[]; delayMs?: number } = {}
): MockResourceProvider {
  let assets: readonly AssetDescriptor[] = []
  let delay = options.delayMs ?? 0
  let fileResult: string | null = null
  const failures = new Map<MockResourceOperation, string>()
  const events: MockResourceEvent[] = []
  function setAssets(next: readonly AssetDescriptor[]) {
    assertAssetCollection(next)
    assets = next.map(copyAssetDescriptor)
  }
  function setDelay(ms: number) {
    if (!Number.isFinite(ms) || ms < 0) throw new TypeError('Resource delay must be nonnegative.')
    delay = ms
  }
  async function wait(event: MockResourceEvent) {
    events.push(event)
    const failure = failures.get(event.operation)
    failures.delete(event.operation)
    const duration = delay
    if (duration) await new Promise<void>((resolve) => setTimeout(resolve, duration))
    if (failure !== undefined) throw new Error(failure)
  }
  setAssets(options.assets ?? mockAssets)
  setDelay(delay)
  return {
    async query(query): Promise<ResourcePage> {
      if (
        !Number.isSafeInteger(query.offset) ||
        query.offset < 0 ||
        !Number.isSafeInteger(query.limit) ||
        query.limit < 1
      )
        throw new TypeError('Invalid resource pagination.')
      const snapshot = filterAssets(assets, query)
      await wait({ operation: 'query', query: { ...query, kinds: query.kinds ? [...query.kinds] : undefined } })
      return {
        items: snapshot.slice(query.offset, query.offset + query.limit).map(copyAssetDescriptor),
        total: snapshot.length,
        offset: query.offset,
      }
    },
    async get(id) {
      const asset = assets.find((item) => item.id === id)
      await wait({ operation: 'get', id })
      return asset ? copyAssetDescriptor(asset) : null
    },
    async rename(id, name) {
      await wait({ operation: 'rename', id })
      const asset = assets.find((item) => item.id === id)
      if (!asset || !isAssetSelectable(asset)) throw new Error('Resource is not available for rename.')
      if (!name.trim()) throw new Error('A resource name is required.')
      const renamed = copyAssetDescriptor({ ...asset, name: name.trim() })
      assets = assets.map((item) => (item.id === id ? renamed : item))
      return copyAssetDescriptor(renamed)
    },
    async locate(id) {
      await wait({ operation: 'locate', id })
      if (!assets.some((item) => item.id === id && isAssetSelectable(item)))
        throw new Error('Resource cannot be located.')
    },
    async chooseFile() {
      const asset = assets.find((item) => item.id === fileResult)
      await wait({ operation: 'chooseFile' })
      return asset ? copyAssetDescriptor(asset) : null
    },
    rejectNext(operation, message = `Mock ${operation} rejected`) {
      failures.set(operation, message)
    },
    setDelay,
    setAssets,
    setFileResult(id) {
      fileResult = id
    },
    getEvents: () =>
      events.map((event) => ({
        ...event,
        ...(event.query
          ? { query: { ...event.query, kinds: event.query.kinds ? [...event.query.kinds] : undefined } }
          : {}),
      })),
  }
}
