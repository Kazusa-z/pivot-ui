import type { ResourceViewPreferences } from '@pivot-ui/react/contracts'
import type { ResourceViewMode } from '@pivot-ui/react/values'

/** The application chooses the storage and key. Components never read localStorage themselves. */
export function createBrowserResourceViewPreferences(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  key = 'pivot.resource-view.v1'
): ResourceViewPreferences {
  return {
    getViewMode() {
      const value = storage.getItem(key)
      if (value === null) return 'grid'
      if (value !== 'grid' && value !== 'list') throw new Error('Invalid resource view preference.')
      return value
    },
    setViewMode(mode: ResourceViewMode) {
      if (mode !== 'grid' && mode !== 'list') throw new TypeError('Invalid resource view mode.')
      storage.setItem(key, mode)
    },
  }
}
