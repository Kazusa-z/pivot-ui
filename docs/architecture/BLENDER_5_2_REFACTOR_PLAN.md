# 选择合适的组件

从你需要的界面行为选择组件。一个输入只需要控件；带标签和说明的一行需要布局组合；一组颜色或曲线操作可以使用现成编辑器；需要保存、校验和撤销时，再连接应用数据接口。

## 普通输入和按钮

| 需求               | 组件                                                    | 你需要提供                   |
| ------------------ | ------------------------------------------------------- | ---------------------------- |
| 单行或多行文本     | Input、Textarea                                         | 当前文本和修改回调           |
| 点击文字后改名     | EditableText                                            | 当前文字及提交处理           |
| 数字输入与拖动微调 | InputNumber                                             | 数字、范围和精度             |
| 滑块或范围         | Slider、NumericSlider                                   | 数值及范围                   |
| 开关、单选、多选   | Checkbox、Select、Combobox、SegmentControl、ToggleGroup | 选项和选中值                 |
| 执行动作           | Button、ActionButton                                    | 点击处理；图标按钮还需要名称 |
| 展示状态           | Badge、Tag、Callout、Progress、Spin                     | 文本、状态或进度             |

`onValueChange` 给出用户请求的值，你把它写入 React 状态后传回 `value`。如果一次编辑需要“完成”或“取消”，使用对应提交回调，详见[文本](../refactor/blender-5.2/B05_TEXT_CHOICES.md)和[数值](../refactor/blender-5.2/B06_NUMERIC.md)指南。

## 布局和属性行

`Flex` 排列内容，`Section` 提供可折叠区域，`ScrollArea` 提供滚动，`ResizableSplit` 提供可调整大小的两块区域。把输入、按钮或自定义内容放入这些布局组件即可。

一个带标签的字段可以组合 `PropertyRow`、`PropertyLabel`、`PropertyControl` 和 `PropertyDescription`。显式指定输入的 ID 和标签关联，再把多行字段放进 Section 或你的页面布局。

`PropertyField` 适合已经有统一属性数据接口的应用。它把一个属性连接到一个控件，并展示标签、说明和错误。复杂值仍由你在 `render` 中选择具体组件。见[属性数据与提交](../refactor/blender-5.2/B11_INTEGRATION.md)。

## 多个控件组成的编辑器

| 需求                 | 建议组合                                                 |
| -------------------- | -------------------------------------------------------- |
| 位置、方向、尺寸     | Vector2Input、Vector3Input、Vector4Input、RectInput      |
| 自定义多轴数值       | NumericTupleInput                                        |
| 固定总量的分段       | DistributionSlider                                       |
| 单色或 HDR 颜色      | ColorInput、HDRColorInput；需要内联面板时用 ColorWidget  |
| 颜色渐变与透明度轨道 | ColorRamp、ColorRampChannels；弹出面板用 ColorRampPicker |
| 点和控制柄曲线       | CurveWidget；弹出面板用 CurvePicker                      |
| 在常量和曲线间选择   | NumericDistributionTemplate                              |
| 在单色和渐变间选择   | ColorDistributionTemplate                                |
| 搜索资源并保存引用   | AssetReferenceInput、ResourcePicker                      |

这类组件共用一个业务值。例如 `ColorInput` 内的 HEX、透明度和弹出面板都修改同一个 `ColorValue`。选择渐变点、缩放曲线、切换浏览布局属于显示状态，单独使用相应 props，不应变成业务值修改。

## 集合与导航

`TreeRoot` 用于层级浏览；`CollectionTemplate` 用于展开项目并增删、改名或排序；`DataTable` 用于按列展示。数据始终由应用提供，选择、展开和焦点分别控制。

项目必须有稳定 ID。不要用可编辑名称、数组下标或每次 render 生成的随机值作为 key。拖放需要显式 `DragDropProvider`，放下回调只提出请求，应用负责改变数据顺序。见[集合与导航](../refactor/blender-5.2/B07_COLLECTIONS.md)。

## 浮层和应用服务

提示用 `Tooltip`；可交互的小面板用 `Popover`；需要集中处理的任务用 `Dialog`；需要明确确认的决定用 `AlertDialog` 或确认服务。菜单根据触发方式选择 `DropdownMenu`、`ContextMenu` 或 `Menubar`。

资源查询、剪贴板、文件选择、取色和预设保存需要应用传入服务。组件只依赖这些服务的接口，不决定数据放在哪里。你可以先实现内存版本，再连接服务器或桌面程序，而不用改控件组合。

## 导入方式

- 组件、hooks 和常用类型：`@pivot-ui/react`。
- 数据类型、颜色转换、曲线采样等算法：`@pivot-ui/react/values`。
- 属性、资源和可选能力接口：`@pivot-ui/react/contracts`。
- 样式工具：`@pivot-ui/react/styling/*`，详见[样式配置](../migration/README.md)。
