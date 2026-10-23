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
 * 为资源选择器提供搜索结果和资源详情。query 返回当前页，get 解析指定 ID，
 * 因此应用可以显示搜索结果之外的已选资源。描述中提供可展示的名称和图片地址。
 * 按需实现 rename、locate 和 chooseFile，启用改名、定位与文件选择。
 * 关闭选择器会结束当前展示；已发出的保存操作如需撤销，由应用执行撤销命令。
 */
export interface ResourceProvider {
  query(query: ResourceQuery): Promise<ResourcePage>
  get(id: AssetId): Promise<AssetDescriptor | null>
  rename?(id: AssetId, name: string): Promise<AssetDescriptor>
  locate?(id: AssetId): Promise<void>
  chooseFile?(): Promise<AssetDescriptor | null>
}

/** 保存列表或网格的展示偏好。应用将读写方法连接到 ResourcePicker 的 viewMode 和 onViewModeChange。 */
export interface ResourceViewPreferences {
  getViewMode(): ResourceViewMode
  setViewMode(mode: ResourceViewMode): void
}
