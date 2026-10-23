import type { ResourceViewPreferences } from '@pivot-ui/react/contracts'
import type { ResourceViewMode } from '@pivot-ui/react/values'

/** 保存资源选择器的列表或网格偏好。传入存储和 key，将读写结果连接到受控 viewMode。 */
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
