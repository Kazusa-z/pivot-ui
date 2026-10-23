# 从输入框到属性表单

这条阅读路线适合熟悉 React、第一次使用组件库的开发者。每一步都可以独立使用，不需要先搭建完整应用。

## 1. 显示一个可编辑值

按照[安装指南](../../CONSUMING.md)配置样式和 Provider，用 `useState` 连接 `Input` 或 `InputNumber` 的 `value/onValueChange`。在旁边显示当前值，确认父组件确实接受了回调。

## 2. 加上标签和说明

用 `PropertyRow` 放置一行内容，`PropertyLabel` 通过 `htmlFor` 指向输入 ID。说明文字用 `PropertyDescription`，输入通过 `aria-describedby` 指向它。

多个输入共同表示一个值时，把它们作为一个有名称的 group；每个子输入仍要有自己的名称，例如 X、Y、Z。布局参数见[组件 API](../../../packages/interface/README.md)。

## 3. 选择合适的编辑器

从[组件选择指南](../../architecture/BLENDER_5_2_REFACTOR_PLAN.md)选择现成组合。向量用几何输入，颜色用颜色编辑器，层级列表用树，资源引用用引用输入。用真实数据形状，不要先转成含义不明的字符串。

## 4. 区分预览与保存

实时变化用于立即更新界面；完成编辑后再保存一次。数值、颜色和曲线控件用 `onValueChange` 提供实时值，用 `onValueCommit` 提交。需要取消预览时，应用负责恢复应当显示的值。

文本改名可以使用 `EditableText`，它会处理 Enter、失焦、Escape 和异步失败后的草稿。详见[文本与选项](./B05_TEXT_CHOICES.md)。

## 5. 接入应用数据

多个属性需要一致的校验、保存和撤销行为时，实现 `PropertyAccess<T>`，再用 `PropertyField` 连接控件。它只连接一个字段；页面排列和复杂编辑器仍由 React 组合。

完整示例见[属性数据与提交](./B11_INTEGRATION.md)。先用应用内存保存数据，再换成网络或桌面接口，都可以使用同一组控件。

## 6. 检查实际界面

尝试键盘、长文本、窄窗口和两种主题，再尝试保存失败、切换对象和外部数据更新。参考[交互示例](./LEDGER.md)及[可访问性检查](../../migration/VISUAL_REGRESSION.md)。
