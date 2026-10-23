# B07 集合、导航与拖放

本批对应 U33–U36、G22 和 S06。新组件从 `@pivot-ui/react` 导入，纯模型也从 `@pivot-ui/react/values` 导入。验收和 Git 交付状态见 [实施台账](./LEDGER.md)。

## 职责与依赖

| 层                                             | 职责                                                                 | 不承担的职责                            |
| ---------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| values/collection、tree、pagination、drag-drop | 稳定身份、层级索引、可见节点和移动约束、分页算法、数据类型           | React、DOM、宿主连接                    |
| interaction/drag-drop                          | Provider 内的拖放会话、类型匹配、取消、只读快照和原生事件            | 修改业务数据、序列化资源对象、后端撤销  |
| widgets/navigation                             | Breadcrumbs 语义导航、Pagination 页码请求                            | 路由器、数据请求                        |
| widgets/collections                            | 原生 Table 结构、DataTable 组合、TreeRoot 的选择/展开/焦点及节点展示 | 资源模型、Outliner 业务、全功能数据网格 |
| templates/collections                          | CollectionTemplate 的增删改名和重排入口、子项内容组合                | 私有数据副本、后端属性协议、命令历史    |

数据流为 `宿主 items/collection → 控件 → 请求回调 → 宿主接受后回传`。树和模板都不强制接后端；当前可以使用 stories 中的本地 React 状态，未来将这些回调连接应用的 C++/Qt 适配器。资源引用模型仍留 B10。

## 稳定身份

`CollectionKey = string | number`，必须是非空字符串或有限数字；重复键立即报错。数字 `1` 和字符串 `"1"` 是两个身份。不要使用数组下标、可编辑名称或每次渲染随机生成的 ID。

`createCollection(items, getKey)` 暴露只读 items/keys/size 以及 get/has/indexOf。它复制并冻结数组结构，不冻结应用对象；更新项目时传入新的对象和数组。`createTreeCollection(items, {getKey, getChildren, getTextValue, isDisabled})` 建立纯层级索引，所有后代也必须全局唯一。`canMoveTreeItems` 拒绝自己、祖先移入后代及不合法目标；实际重排由应用完成。

## Tree

TreeRoot 接收 collection，可自动生成层级，也可组合 TreeItem、TreeItemContent、TreeGroup。TreeItem 的 `itemKey` 对应纯集合身份。TreeItemContent 管展示、展开按钮、可聚焦 actions、重命名草稿；不包含 prefab/实例状态等领域样式。

| 状态 | 受控接口                            | 默认接口            |
| ---- | ----------------------------------- | ------------------- |
| 选择 | selectedKeys / onSelectedKeysChange | defaultSelectedKeys |
| 展开 | expandedKeys / onExpandedKeysChange | defaultExpandedKeys |
| 焦点 | focusedKey / onFocusedKeyChange     | defaultFocusedKey   |

方向键、Home/End 和字符查找移动焦点；选择、展开和焦点分别请求。重排保留身份；删除或收起当前节点后找可用邻居/祖先。行内按钮和改名输入可单独聚焦，不因点击行操作而选择或展开。重命名复用 B05 useTextEdit：Enter 后的 blur 不重复提交，Escape 取消，Promise 拒绝保留草稿，目标/版本改变使旧界面结果失效。

`dragDrop={{type, canDrop, onDrop, onDragEnd, resetKey}}` 启用树拖放，祖先必须有 DragDropProvider。TreeDropRequest 包含 keys、targetKey、position（before/inside/after）。回调同步返回 false 可拒绝；accepted drop 只表示请求已交给应用。TreeDragPreview/TreeInsertionIndicator 只呈现拖放提示，数据不复制到浏览器 DataTransfer。应用的键盘移动按钮可调用相同移动命令，示例提供此等价入口。

## CollectionTemplate

使用 `items/getKey/getLabel/renderItem` 分离数据和 React 内容。展开和选择分别使用 expandedKeys/onExpandedKeysChange、selectedKeys/onSelectedKeysChange，也提供 default 版本。selectionMode 支持 none/single/multiple。

增删改名入口分别为 `onAdd()`、`onDelete(item,key)`、`onRename(item,name,key)`；均可返回 Promise。新增返回接受后项目的 key 可明确焦点目标，返回 void 时从新 items 查找新增身份。`onReorder(nextItems,{key,fromIndex,toIndex})` 请求新顺序；父级不回传时显示顺序保持原样。删除当前项后将焦点交给邻项或新增入口；受控选择/展开也通过回调请求清理。

有 onReorder 时需要显式 DragDropProvider；拖动手柄和“向上/向下”按钮使用同一重排路径。非拖放集合无需 Provider。readOnly 保留选择/展开阅读能力，禁用增删改名重排；disabled 停用交互。renderItem 自定义的子控件需自行消费 context.disabled/context.readOnly。resetKey 表示目标或数据版本身份，淘汰旧操作的界面结果，不能撤销已发出的宿主命令。

```tsx
<DragDropProvider>
  <CollectionTemplate
    items={layers}
    getKey={(layer) => layer.id}
    getLabel={(layer) => layer.name}
    onReorder={(next) => setLayers(next)}
    onRename={(layer, name) =>
      setLayers((current) => current.map((item) => (item.id === layer.id ? { ...item, name } : item)))
    }
    renderItem={(layer, state) => (
      <InputNumber
        value={layer.weight}
        disabled={state.disabled}
        readOnly={state.readOnly}
        onValueChange={(weight) => updateWeight(layer.id, weight)}
      />
    )}
  />
</DragDropProvider>
```

## Table、Breadcrumbs 与 Pagination

Table/TableHead/TableBody/TableFoot/TableRow/TableHeaderCell/TableCell/TableCaption 对应原生表格语义；DataTable 接收 `rows/rowKey/columns`，rowKey(row) 是函数且 columns 至少一项，column 是 `{key, header, cell(row)}`，可指定 rowHeader、width、align。selection 显式传 selectedKeys/onSelectedKeysChange；actions 生成可聚焦按钮，支持全表/行/操作禁用；disabled/isRowDisabled 只禁用生成的选择与动作，自定义 cell 控件由调用者处理禁用。删除聚焦行时焦点转到邻行操作；空态和 caption 是显式入口。分页、排序、筛选和加载由宿主组合。

Breadcrumbs 输出 nav/ol/li；items 使用 `{key,label,href?,disabled?}`。有 href 为链接，有 onNavigate 为按钮，最后一项用 aria-current=page 表示当前路径。重复名称应使用累计路径 ID，不能用单段名称作 key。BreadcrumbItem 可用于已有 ol 的结构组合。

Pagination 使用 page/defaultPage/onPageChange。totalCount 是非负安全整数，pageSize 是正安全整数。`getPaginationState` 在零结果时返回 page=0，无伪造第 1 页；越界页码钳到有效范围，数据变化不会伪造点击回调。boundaryCount 为 1–100，siblingCount 为 0–100；算法工作量不随总页数线性增长。labels 可本地化全部导航、页码、省略号和空态。

## 拖放公共接口

DragDropProvider 拥有一个局部会话。useDragSource 使用字符串 type、只读 data 约定和 ref/previewRef；useDropTarget 使用 accept 类型列表、canDrop 及 ref/isOver/canDrop。内部 payload 为 `{type,data}`，原生 DataTransfer 只保存不透明会话标记，不序列化应用对象。不同 Provider 隔离，不支持自动跨窗口或跨应用导入。

useDragDropState 返回 idle/dragging 只读快照；useDragDropCancel 发送取消请求。没有可直接突变的公共 context。一个成功开始的会话只产生一次 onEnd：dropped 或 cancelled；取消原因包括 escape、outside、disabled、unmount、reset、replaced、window-blur、rejected。Provider/source resetKey 改变取消旧会话。

onDrop 是同步请求回调，可返回 false 拒绝。库在调用应用回调前占有终结操作，因此同步重排或卸载拖拽源不会把成功放下误报为取消。业务异步拒绝和撤销属于应用命令层。外部文件只通过显式 onFilesDrop 接收 File 列表；可用原生文件输入提供键盘入口，示例不上传文件。

## 旧入口退出

| 旧入口                      | 本批处置                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| UI Breadcrumbs              | 仅将 id 映射为 key；BreadcrumbItem isCurrent 映射 current                                 |
| UI Pagination/usePagination | currentPage 映射 page；算法直接复用 values/pagination                                     |
| UI Table                    | dataSource/dataIndex 转换为 DataTable；onClickRow 变为明确的 Open 行按钮                  |
| UI Tree 组件族              | 薄导出新组件；低层 props 按新 TreeRoot/itemKey API 迁移，旧空键盘/内容占位删除            |
| UI useDrag/useDrop          | 仅将 numeric layer/bitmask 转为内部类型化 payload；ref 为回调 ref，取消时 event 可为 null |
| DragDropContextProvider     | DragDropProvider 的过渡别名；使用 hooks 必须显式包裹                                      |
| DragContext                 | 删除公共可变对象，改用只读快照与取消 API                                                  |
| GUI FormItemArray           | 实现、出口和专属故事删除；改用 CollectionTemplate，自定义子表单在 renderItem 中组合       |

AssetPicker 继续使用薄拖放适配，类型化选中数据，并修正重复路径片段的 Breadcrumb key；资产领域模型不在本批迁移。

## 验证入口

Storybook 新组为 Widgets/Navigation、Widgets/Collections、Widgets/Tree、Templates/CollectionTemplate、Interaction/Drag and drop。覆盖受控拒绝、空列表、稳定 ID、删除焦点、展开与选择、异步改名拒绝/重试、外部版本、禁用/只读、原生拖放及 Provider 隔离。

按台账执行格式、全仓类型、Demo/三套 Storybook 构建；纯算法和模拟 DOM 临时探针放系统 TEMP，不提交独立测试文件。再在浏览器实测键盘、指针拖放、明暗主题及窄窗口。模拟 DOM 与 Storybook 不代表 Qt 原生嵌入或平台辅助技术验收。
