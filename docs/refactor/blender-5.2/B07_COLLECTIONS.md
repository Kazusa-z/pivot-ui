# 集合与导航

树用于层级数据，CollectionTemplate 用于带展开内容和编辑动作的列表，DataTable 用于列式展示。它们都使用应用提供的数组和稳定 key，不自行加载或保存数据。

## 先确定项目身份

`CollectionKey` 是非空字符串或有限数字。相同集合中的 key 必须唯一，数字 `1` 与字符串 `'1'` 是两个不同身份。不要使用可编辑名称、数组下标或每次 render 生成的随机值。

`createCollection(items, getKey)` 提供 `items/keys/size/get/has/indexOf`。它复制数组结构，项目对象仍由应用管理；更新时传入新对象和新数组。

## CollectionTemplate：可编辑列表

使用 `getKey/getLabel` 读取身份和标题，`renderItem` 显示展开内容。增删、改名和重排都由回调请求，父组件接受后回传 items。

```tsx
import { useState } from 'react'
import { CollectionTemplate, DragDropProvider, InputNumber } from '@pivot-ui/react'

type Layer = { id: string; name: string; weight: number }

export function Layers() {
  const [layers, setLayers] = useState<readonly Layer[]>([
    { id: 'base', name: 'Base', weight: 1 },
    { id: 'detail', name: 'Detail', weight: 0.5 },
  ])
  return (
    <DragDropProvider>
      <CollectionTemplate
        items={layers}
        getKey={(layer) => layer.id}
        getLabel={(layer) => layer.name}
        onReorder={setLayers}
        onRename={(layer, name) =>
          setLayers((items) => items.map((item) => (item.id === layer.id ? { ...item, name } : item)))
        }
        onDelete={(layer) => setLayers((items) => items.filter((item) => item.id !== layer.id))}
        renderItem={(layer, state) => (
          <InputNumber
            aria-label={`${layer.name} weight`}
            value={layer.weight}
            disabled={state.disabled}
            readOnly={state.readOnly}
            onValueChange={(weight) =>
              setLayers((items) => items.map((item) => (item.id === layer.id ? { ...item, weight } : item)))
            }
          />
        )}
      />
    </DragDropProvider>
  )
}
```

`onAdd/onDelete/onRename/onReorder` 可以返回 Promise。改名失败保留草稿，操作成功后显示应用回传的数据。`onAdd` 返回新项目 key 可以明确焦点目标；返回 void 时根据更新后的 items 寻找新增项。

选择和展开使用独立的 `selectedKeys/onSelectedKeysChange`、`expandedKeys/onExpandedKeysChange`，也有 default 初值。`readOnly` 保留选择和展开，但禁止增删改名及重排；`disabled` 停用交互。`renderItem` 内的自定义控件需要接收 context 中的禁用和只读状态。

提供 `onReorder` 时需要 `DragDropProvider`。拖动手柄和上下移动按钮使用同一个重排请求。`resetKey` 变化使过期操作不再更新当前界面，但不会撤销已经执行的服务器操作。

## Tree：层级浏览

先用 `createTreeCollection(items, { getKey, getChildren, getTextValue, isDisabled })` 建立层级数据，再传给 TreeRoot。后代 key 在整棵树中也必须唯一。

TreeRoot 可以自动渲染，也可以组合 TreeItem、TreeItemContent 和 TreeGroup。TreeItem 的 `itemKey` 指向集合中的节点；TreeItemContent 提供标题、展开、独立 actions 和改名入口。

| 状态 | 受控参数                            | 初始值参数          |
| ---- | ----------------------------------- | ------------------- |
| 选择 | selectedKeys / onSelectedKeysChange | defaultSelectedKeys |
| 展开 | expandedKeys / onExpandedKeysChange | defaultExpandedKeys |
| 焦点 | focusedKey / onFocusedKeyChange     | defaultFocusedKey   |

方向键、Home/End 和字符查找移动焦点；选择、展开和焦点各自变化。删除或收起当前节点后会寻找可用邻居或祖先。改名支持 Enter、Escape 和异步失败后的重试。

Tree 的 `readOnly` 允许展开浏览，但禁止选择、改名和移动；`disabled` 禁用交互。`dragDrop` 可提供 `type/canDrop/onDrop/onDragEnd/resetKey`，需要外层 DragDropProvider。放下请求包含 `keys/targetKey/position`，position 为 before、inside 或 after；应用负责实际更新层级。

## 表格

Table、TableHead、TableBody、TableFoot、TableRow、TableHeaderCell、TableCell、TableCaption 对应原生表格结构，适合你完全控制内容的情况。

DataTable 通过 `rows/rowKey/columns` 生成表格。rowKey 是取 key 的函数；每列提供 `key/header/cell(row)`，还可配置宽度、对齐和行标题。选中行通过 `selectedKeys/onSelectedKeysChange` 控制，actions 提供独立按钮。

排序、筛选、分页和数据加载由应用组合。`disabled/isRowDisabled` 作用于生成的选择和动作；自定义 cell 里的输入需要你自行传入禁用状态。

## 面包屑与分页

Breadcrumbs 的 items 使用 `{key,label,href?,disabled?}`。有 href 时显示链接，有 onNavigate 时可请求应用导航，最后一项标记为当前页面。相同目录名需要不同的路径 key。

Pagination 使用 `page/defaultPage/onPageChange`、`totalCount/pageSize`。page 从 1 开始，零结果时计算状态为 0；总数和每页数量必须是有效整数。数据变化只校正显示范围，不伪造点击回调。labels 可本地化导航和空态文字。

## 自定义拖放

`useDragSource` 使用 `type/data`，`useDropTarget` 使用 `accept/canDrop/onDrop`。把返回的 ref 接到实际元素；状态可通过 `useDragDropState` 读取，通过 `useDragDropCancel` 取消。

拖放在一个 DragDropProvider 内工作。传递的数据为 `{type,data}`，不会自动跨窗口或变成外部文件。`onDrop` 同步返回 false 可以拒绝，接受只表示收到请求，异步业务结果仍由应用处理。文件拖入使用显式的 `onFilesDrop`，资源引用接法见[资源选择](./B10_RESOURCES.md)。
