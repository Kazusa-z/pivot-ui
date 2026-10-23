# 资源选择

资源控件用于展示和选择一个资源引用，例如材质、图片或模型。表单保存稳定 ID 或 null，名称、缩略图和路径通过应用服务获取。

## 选择组件

| 组件                | 用途                                          |
| ------------------- | --------------------------------------------- |
| AssetItem           | 展示一个资源，提供选择按钮、改名和附加动作    |
| AssetThumbnail      | 单独展示缩略图及失败回退                      |
| AssetName           | 单独展示和编辑名称                            |
| ResourcePicker      | 搜索、筛选、分页、列表/网格、选择及改名       |
| AssetReferenceInput | 展示当前 ID，打开选择器、清空、定位或选择文件 |

AssetItem 不查询资源。ResourcePicker 需要 ResourceProvider；AssetReferenceInput 还会独立解析当前 ID，因此即使当前资源不在搜索结果页里，也能显示它。

## 最小接法

```tsx
import { useState } from 'react'
import { AssetReferenceInput, type AssetId, type ResourceProvider } from '@pivot-ui/react'

export function MaterialReference({ provider }: { provider: ResourceProvider }) {
  const [id, setId] = useState<AssetId | null>(null)
  return (
    <AssetReferenceInput label="Material" provider={provider} value={id} kinds={['material']} onValueChange={setId} />
  )
}
```

provider 由应用创建并保持稳定。可以先使用内存数据，再连接服务器或桌面接口。组件不会创建资源库，也不会把外部引擎对象作为 value。

## 资源数据

`AssetDescriptor` 至少包含 `id/name/kind/status`。可选字段包括 `thumbnailUrl/description/path/group/selectable/disabledReason`。

status 为 `ready/loading/error/missing`。只有 ready 且 selectable 不为 false 的资源可以选择。kind 是应用定义的字符串；path 是目录片段，不包含文件名；group 使用稳定 id 和显示 label。

缩略图 URL 由应用准备，加载失败时控件显示回退。缺失的资源仍保留当前 ID，用户可以明确清空它；查询结果为空不会自动清空引用。

## 实现 ResourceProvider

| 方法                 | 参数与结果                                                                |
| -------------------- | ------------------------------------------------------------------------- |
| `query`              | 接收 text、可选 kinds/groupId、零基 offset/limit；返回 items/total/offset |
| `get`                | 接收 ID，返回描述符或 null                                                |
| `rename`（可选）     | 接收 ID 和名称，返回更新后的描述符                                        |
| `locate`（可选）     | 根据 ID 在应用中定位资源                                                  |
| `chooseFile`（可选） | 打开文件选择并导入或解析资源，返回描述符；取消返回 null                   |

一次 query 结果的 ID 必须唯一。ResourcePicker 的 page 从 1 开始，内部转换为查询偏移；默认每页 24 项。分页、筛选和搜索只影响浏览结果，当前引用通过 get 独立解析。

## 选择、改名和异步结果

AssetReferenceInput 的 `onValueChange(id, asset)` 表示一次赋值请求。返回 false 或抛错可以拒绝；返回 true/void 表示请求完成，实际显示仍以父组件回传的 value 为准。

ResourcePicker 用 `selectedId/onSelect` 管理选择，成功后可通过 `onSelectSuccess` 响应。`queryText/kinds/groupId/viewMode/page` 可受控，也可使用对应 default 初始值。父组件拒绝修改时，控件不会自行伪装已接受。

改名回调可返回 Promise。成功后更新列表，失败保留输入草稿，用户可重试或取消。查询、provider、目标或可用状态变化后，过期结果不会覆盖当前界面。

对象切换时更新稳定的 `resetKey`，即使新对象也引用同一个 ID。已经发出的赋值或改名请求不能通过关闭面板撤回；应用应在执行保存时校验目标和数据版本。

## 只读和可选能力

只读模式可以浏览和查看，不能选择或改名。AssetItem 在只读时禁止改名，是否提供查看用选择动作由调用方决定。disabled 停用相关交互。

没有 rename 时不显示改名入口；没有 locate/chooseFile 时对应动作不可用。文件选择返回后会重新解析 ID，检查资源是否就绪并符合 kinds/groupId。搜索文字只限制浏览，不限制已选引用。

需要记住列表/网格偏好时，由应用控制 viewMode 并保存它。控件不自行读取 localStorage。

## 内部拖放

设置 `dropEnabled`，并在外层使用 `DragDropProvider`。资源拖放使用 `ASSET_REFERENCE_DRAG_TYPE`，data 为 `{id}`；放下后通过 provider 再次解析，拒绝不存在、未就绪或不符合筛选的资源。

接收放下后，应用继续处理异步赋值并反馈结果。接收系统文件时可另外组合 `useDropTarget` 的 `onFilesDrop`，由应用导入文件并取得资源 ID。普通引用输入没有启用拖放时不需要 DragDropProvider。

将引用连接到统一属性保存时，见[属性数据与提交](./B11_INTEGRATION.md)。
