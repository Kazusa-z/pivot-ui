# B05 文本、选择与属性绑定

> B11 收口说明：本文保留该批迁移记录；旧适配器、旧包与多 Storybook 指令已退出。当前属性联调和消费方式以 [B11 最终指南](./B11_INTEGRATION.md) 为准。历史验证数字不代表当前构建。

新入口统一来自 `@pivot-ui/react`。本批对应 U03、U04、U06–U10 和 G02、G03、G11–G14、G20；状态以 [实施台账](./LEDGER.md) 为准。

## 文本与编辑会话

`Input`、`Textarea` 保留原生属性、事件与 ref。`Input` 另有 startSlot/endSlot 和 rootRef；字段名称、说明、路径规则由调用者提供。`onValueChange(string)` 接收原始文本，不构造 React 事件，也不解析数字。普通受控输入每次输入由调用者回传 value。

需要提交语义时使用 `useTextEdit` 或 `EditableText`。共享内核只有一份本地草稿；权威值由外部的 value 提供。输入途中保留空字符串、中文组合输入等中间状态。Enter 与 blur 共享一次终结请求；Escape 取消当前草稿。多行普通 Enter 换行，Ctrl/⌘+Enter 提交。提交回调拒绝时保留草稿并显示错误，允许修改后重试；成功后显示外部接受的值，固定受控值不会假装接受编辑。

`useTextEdit` 接收 value、resetKey、disabled/readOnly、multiline、onBegin、onDraftChange、onCommit 和 onCancel，返回 draft、phase、error、begin/change/commit/cancel 与 inputProps。`resetKey` 用于同值但新 revision 或目标切换；值/版本变化使旧异步结果失效。pending 是等待提交结果；已经发给宿主的提交遵循 B01 的“首个终结请求生效”规则，UI 清理不能撤回它。onCancel 只通知未提交的编辑，或拒绝后恢复编辑的会话；pending 后的值更新、Escape、切换目标和卸载只使本地结果失效，不再发送第二个取消回调，因此成功回写不会被当作取消。

AssetName、Tree 改名及 FormItemArray 改名也使用这份内核。资源和集合的数据模型继续留在 B07/B10，本批不提前迁移其业务能力。

## 选项身份与控件语义

`ChoiceOption<T>` 包含稳定的 key、label、原始 value、可选 disabled/disabledReason。`createChoiceCollection` 集中验证身份和映射：key 非空且唯一，value 为唯一字符串或有限数字。控件内部用 key 导航，回调返回原始 value；`'001'`、`'1'` 和 `1` 均是不同值。空字符串可作为合法选项值，null 表示没有选择。

| 控件           | 值与交互                                                                          |
| -------------- | --------------------------------------------------------------------------------- |
| Checkbox       | checked 为 boolean 或 indeterminate；用户操作回调 boolean，混合态不是业务布尔值。 |
| Select         | 单选下拉，无搜索；value/defaultValue 为 T 或 null。                               |
| Combobox       | 搜索选项；multiple 为 false 时 T/null，为 true 时 readonly T[]。                  |
| SegmentControl | radio 单选；选中项不能通过再次点击取消。                                          |
| ToggleGroup    | single 为 T/null，可再次点击取消；multiple 使用数组，每项独立切换。               |

原生 form 的 name/form 序列化使用 String(value)，这是 HTML 表单的字符串边界；JS 回调仍返回原始类型。只读值可提交，disabled 不提交；单选 null 没有值，多选为同名多个值。新的 Select/Combobox 暂不提供浏览器 required 约束校验，属性有效性由应用/PropertyAccess 决定。Root/Item 低阶组合的值是 key，面向已有组合适配。

各控件保持 disabled 与 readOnly 区别：禁用控件不参与正常键盘操作；只读控件可获得焦点和读取状态，但不提出写入请求。只读不是固定受控值的替代写法，应明确声明。选项禁用原因留在描述/标题中；选项展示可以使用渲染回调，基础 ChoiceOption 不保存 React 节点。

## PropertyField 的职责

PropertyField 将一个 PropertyAccess 的 descriptor/snapshot/edit session 绑定到一个真实控件，并组合 PropertyRow 的标签和帮助说明。它不生成面板或管理应用对象树。

默认 string → Input、boolean → Checkbox、enum → Select；可指定 widget="textarea" 或 "combobox"。不相容的 descriptor/widget 组合会报错，数字字段留 B06。mixed 只描述多个选中对象的展示，聚合和接受写入后清除 mixed 由应用负责。暂不把多选数组塞入 B01 标量 PropertyValue。

文本复用 useTextEdit，PropertyField 只保存宿主会话引用；布尔/选项一次操作对应一次 begin/change/commit。组件直接订阅快照，权威值、revision、错误及历史由 access 管理。pending 时控件保留焦点但不再接受写入。外部更新、目标替换、不可用或卸载终止未提交会话；已提交请求仍按原目标完成，不覆盖新目标的 UI。

无后端时可在应用或 stories 中创建 MockPropertyAccess，后续用 C++/Qt 适配实现同一契约。Mock 仍只位于 stories/support，未进入生产包出口。

## 删除与过渡边界

本批删除 FormItemInput、FormItemTextarea、FormItemToggle、FormItemToggleGroup、FormItemSegmentControl、FormItemSelect、FormItemButton 的实现、出口和专属 stories。使用 PropertyRow + 控件；需要宿主会话时使用 PropertyField。按钮行直接组合 Button，不声明字符串字段值。

旧 UI 文本/选择入口暂作薄适配到新包，B11 删除。旧 children/SelectItem 的选项形状仅在适配边界转换；新组件直接接收 options。新代码不反向导入旧 UI 或 GUI。现有示例与 README 使用新组合，保留的数值、颜色、曲线和资源 FormItem 属于后续批次。

验证入口位于 6009 的 Widgets/Text Inputs、Widgets/Choices、Property/PropertyField 及 Layout/Action row。具体故事数量、首次失败与修复、生产和开发浏览器记录见台账。
