import type { AssetDescriptor, AssetId, ResourceViewMode } from '../values/assets'

export interface ResourceQuery {
  readonly text: string
  readonly kinds?: readonly string[]
  readonly groupId?: string
  readonly offset: number
  readonly limit: number
}

export interface ResourcePage {
  readonly items: readonly AssetDescriptor[]
  readonly total: number
  readonly offset: number
}

/**
 * Application-owned resource access. Snapshots contain resolved display URLs, never engine objects.
 * get is independent of query/pagination, including the current reference outside the visible page.
 * Optional commands are explicit capabilities. Late UI results can be ignored, but sent host commands
 * cannot be undone by closing or unmounting a control.
 */
export interface ResourceProvider {
  query(query: ResourceQuery): Promise<ResourcePage>
  get(id: AssetId): Promise<AssetDescriptor | null>
  rename?(id: AssetId, name: string): Promise<AssetDescriptor>
  locate?(id: AssetId): Promise<void>
  chooseFile?(): Promise<AssetDescriptor | null>
}

/** Persistence is opt-in and assembled by the application around controlled viewMode props. */
export interface ResourceViewPreferences {
  getViewMode(): ResourceViewMode
  setViewMode(mode: ResourceViewMode): void
}
