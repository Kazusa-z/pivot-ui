import type { AssetDescriptor } from '@pivot-ui/react'

/** Legacy presentation props only. Engine-object conversion belongs to the host resource adapter. */
export function legacyAssetDescriptor(
  id: string,
  name: string,
  thumbnailUrl?: string,
  loadingStatus?: 'loading' | 'error' | 'success'
): AssetDescriptor {
  return {
    id,
    name,
    kind: 'asset',
    thumbnailUrl,
    status: loadingStatus === 'loading' ? 'loading' : loadingStatus === 'error' ? 'error' : 'ready',
  }
}
