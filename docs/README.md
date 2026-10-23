# Pivot UI 使用指南

Pivot UI 提供 React 控件，帮助你组合表单、属性面板、颜色和曲线编辑器、树及资源选择器。组件负责显示和用户交互；你通过 props 提供数据，通过回调接收修改。

如果只想先做界面，可以从 `useState` 开始，不需要先实现服务器或属性访问接口。

## 从这里开始

1. [安装与第一个界面](./CONSUMING.md)：配置样式、主题和普通受控组件。
2. [选择合适的组件](./architecture/BLENDER_5_2_REFACTOR_PLAN.md)：按界面需求查找控件和组合方式。
3. [分步练习](./refactor/blender-5.2/BATCHES.md)：从一行输入扩展到可保存的属性表单。
4. [运行示例与调试](./DEVELOPMENT.md)：启动 Storybook、构建应用和定位问题。

## 按控件用途阅读

| 你想做什么                             | 阅读                                                        |
| -------------------------------------- | ----------------------------------------------------------- |
| 输入文本、改名、单选或多选             | [文本和选项](./refactor/blender-5.2/B05_TEXT_CHOICES.md)    |
| 编辑数值、范围、向量或矩形             | [数值和几何](./refactor/blender-5.2/B06_NUMERIC.md)         |
| 打开菜单、提示、对话框或通知           | [浮层与消息](./refactor/blender-5.2/B04_OVERLAYS.md)        |
| 展示树、可编辑列表、表格和分页         | [集合与导航](./refactor/blender-5.2/B07_COLLECTIONS.md)     |
| 编辑单色、HDR、渐变和颜色分布          | [颜色编辑](./refactor/blender-5.2/B08_COLOR.md)             |
| 编辑曲线、预设和数值分布               | [曲线编辑](./refactor/blender-5.2/B09_CURVES.md)            |
| 选择、解析和展示资源引用               | [资源选择](./refactor/blender-5.2/B10_RESOURCES.md)         |
| 将控件连接到应用的保存、校验和撤销逻辑 | [属性数据与提交](./refactor/blender-5.2/B11_INTEGRATION.md) |

## 样式、示例和常见问题

- [主题与样式配置](./migration/README.md)：Panda CSS、主题、尺寸和局部样式。
- [样式问题排查](./migration/LEDGER.md)：没有样式、浮层主题不一致、布局溢出等问题。
- [键盘、窄窗口与可访问性](./migration/VISUAL_REGRESSION.md)：检查组合后的实际界面。
- [交互示例索引](./refactor/blender-5.2/LEDGER.md)：在 Storybook 中尝试输入、异步保存和外部更新。
- [能力与应用职责](./RELEASE_ARCHIVE.md)：哪些操作由组件提供，哪些服务需要你接入。
- [公开组件与参数](../packages/interface/README.md)：按组件名称查找 API。

组件和类型从 `@pivot-ui/react` 导入。只需要数据类型或算法时，也可以使用 `@pivot-ui/react/values` 和 `@pivot-ui/react/contracts`。
