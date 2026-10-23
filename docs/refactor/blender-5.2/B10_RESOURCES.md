# B10 资源引用与选择

B10 迁移 U41、G18、G23。资源引用是稳定 ID 或 null；资源名称、缩略图和路径是可以重新获取的展示快照。引擎实例留在应用侧。

| 层                        | 入口                                                    | 职责                                                          |
| ------------------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| values                    | AssetDescriptor、AssetId、AssetStatus、ResourceViewMode | 纯数据、复制与校验、过滤、分组；无 React、DOM、文件和引擎依赖 |
| contracts                 | ResourceProvider、ResourceQuery、ResourcePage           | query/get 和可选 rename/locate/chooseFile；返回可展示的快照   |
| widgets/collections/asset | AssetItem、AssetThumbnail、AssetName                    | 展示、独立选择按钮、名称编辑；没有查询和持久化                |
| templates/resources       | ResourcePicker                                          | 检索、类型/分组筛选、分页、网格/列表、选择及改名              |
| templates/resources       | AssetReferenceInput                                     | 当前引用、弹出选择器、清空、定位、文件选择和可选内部拖放      |
| host / stories support    | 真实适配或 MockResourceProvider                         | 资源获取、缩略图 URL、文件对话框、改名写入、定位及显示偏好    |

依赖为 templates → widgets/interaction → values；templates 通过纯契约访问宿主。新实现不导入旧 UI/GUI 包。`AssetName` 复用 B05 EditableText；选择按钮、改名输入与附加动作是并列控件。

## 接入

```tsx
import { AssetReferenceInput, ResourcePicker } from '@pivot-ui/react'
import type { AssetId } from '@pivot-ui/react/values'
import type { ResourceProvider } from '@pivot-ui/react/contracts'

// provider 由应用创建，value 从模拟状态或宿主快照提供。
function Reference({
  value,
  provider,
  assign,
}: {
  value: AssetId | null
  provider: ResourceProvider
  assign: (id: AssetId | null) => Promise<boolean>
}) {
  return <AssetReferenceInput value={value} provider={provider} onValueChange={assign} />
}
```

`onValueChange(id, asset)` 是一次原子赋值命令。返回 false 或抛错表示拒绝，保留当前引用并显示错误；true/void 表示命令完成，实际回显始终来自 value。它不是连续拖动的 preview/commit 会话，不会因浏览查询或切换视图而写属性。已发出的宿主命令不能通过关闭弹层撤回；宿主负责命令自身的目标与版本校验。`resetKey` 用于对象身份切换，即便两个对象持有相同引用也应传入不同身份。

`AssetDescriptor` 包含 id/name/kind/status，可选 thumbnailUrl/description/path/group/selectable/disabledReason。status 为 ready/loading/error/missing；只有 ready 且 selectable 不为 false 可以选择。kind 由宿主定义，组件不硬编码引擎枚举。路径是目录片段，不包含资源名；分组使用独立稳定 ID，重名路径和 `__proto__` 等字符串都不会覆盖其它组。控件不隐式删除文件扩展名。

`ResourceProvider.query` 接收 text、kinds、groupId 和零基 offset/limit，返回 items/total/offset。`ResourcePicker` 的 page 是一基页码，内部转换一次；列表中 ID 必须唯一。默认每页 24 项。当前选中 ID 独立于查询结果，不因筛选、分页或空结果被清空。引用框通过 `get(id)` 单独解析当前值；丢失的资源保留 ID 和 missing 状态，可明确清空。`selectedAsset` 可提供与当前 ID 匹配的展示快照，快照新鲜度由提供方负责。

ResourcePicker 的 selectedId、queryText、kinds、groupId、viewMode、page 各自支持受控或 default 初值；对应 on…Change 请求由 owner 回显。`onSelect` 返回 false/拒绝时不改变选中项；`onSelectSuccess` 只在有效请求成功后触发。查询、对象、provider、可用性或 resetKey 变化后，过期结果不能覆盖新 UI。刷新按钮重新查询，改名成功后重新获取列表，失败保留编辑草稿供重试。只读模式允许浏览，不执行选择和改名。

## 宿主能力与拖放

缺少 locate/chooseFile 时对应动作禁用；缺少 rename 时不呈现改名操作。`chooseFile()` 由宿主打开对话框并导入/解析资源，返回已进入资源库的描述符或 null 表示取消。组件再次通过 get 验证 ID、可用性与 kinds/groupId；搜索文本只影响浏览，不限制当前引用或拖入资源。缩略图 URL 在宿主/provider 侧准备，错误图片有展示回退。

内部拖放显式启用 `dropEnabled` 并由应用包裹 `DragDropProvider`。使用 `ASSET_REFERENCE_DRAG_TYPE`，payload data 为 `{id}`，不传引擎对象；放下后再次向 provider 解析，拒绝不存在、未就绪或不符合筛选的资源。B07 的拖放 accepted 表示目标接收了投递，异步赋值仍可能被宿主拒绝并显示错误。普通引用框不要求拖放 Provider；系统文件拖入没有被伪装为内部资源引用。

显示偏好由应用用受控 viewMode 接线；`app/src/host/browser/resource-preferences.ts` 提供显式 Storage 适配。控件不读 localStorage；旧 `pivot-ui-gui-asset-picker-display-mode` 不自动迁移。Mock 位于 stories/support，不进入生产公开包；支持查询、独立 get、延迟、失败、改名、模拟定位和文件结果。示例引擎转换集中在 `stories/support/resource-host-adapter.ts`，用 ID Map 找回原实例。

## 旧入口与后续

删除 GUI FormItemAssetPicker、AssetPickerContent、AssetPickerPopover、PickableAssetItem、SearchBarBorder、BasicAssetType、重复 Props 及专属故事。旧 UI AssetItem/AssetName/AssetThumbnail 暂留展示 props 到新描述符的薄适配；expand 仍为外层组合，B11 删除旧包时收口。

故事位于 Widgets/AssetItem、Templates/Resources/ResourcePicker、Templates/Resources/AssetReferenceInput 和 Contracts/Resources。验证与 Git 交付见 [实施台账](./LEDGER.md)。B10 不实现真实 Qt/C++ 服务或业务页面；复杂资源 PropertyField 绑定与旧包最终删除属于 B11。
