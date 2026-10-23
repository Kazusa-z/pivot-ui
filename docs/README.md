# Pivot UI 文档

当前唯一组件包为 [`@pivot-ui/react`](../packages/interface/README.md) `0.1.0`，workspace `1.0.0`。B11 收口后的代码按 values、contracts、foundation、interaction、widgets、layout、templates、property 分工，不再维护 UI/GUI 双包。

## 当前指南

| 文档                                                      | 内容                                      |
| --------------------------------------------------------- | ----------------------------------------- |
| [接入指南](./CONSUMING.md)                                | 源码消费、Panda、Provider、属性与宿主边界 |
| [开发指南](./DEVELOPMENT.md)                              | 命令、分层、样式提取和验证                |
| [组件 API](../packages/interface/README.md)               | 当前公开入口与组件组合                    |
| [B11 属性联调](./refactor/blender-5.2/B11_INTEGRATION.md) | 泛型属性、复杂值绑定与最终迁移约定        |
| [实施台账](./refactor/blender-5.2/LEDGER.md)              | 各批验收、剩余限制及 Git 交付             |

## 架构与批次记录

[已采纳架构方案](./architecture/BLENDER_5_2_REFACTOR_PLAN.md)统一术语、职责和 65 项组件处置；[批次计划](./refactor/blender-5.2/BATCHES.md)记录 B00–B11 的范围。B11 为最后一批；真实 C++ / Qt 接入和业务页面属于之后的应用开发。

以下指南保留迁移过程与具体接口说明。涉及“保留旧适配器”“三个 Storybook”“后续 B11 接入”的历史表述，以 B11 最终指南为准；已删除源码可从对应批次 Git 提交查看。

- [B04 浮层与服务](./refactor/blender-5.2/B04_OVERLAYS.md)
- [B05 文本与选择](./refactor/blender-5.2/B05_TEXT_CHOICES.md)
- [B06 数值与几何](./refactor/blender-5.2/B06_NUMERIC.md)
- [B07 集合与拖放](./refactor/blender-5.2/B07_COLLECTIONS.md)
- [B08 颜色与渐变](./refactor/blender-5.2/B08_COLOR.md)
- [B09 曲线与数值分布](./refactor/blender-5.2/B09_CURVES.md)
- [B10 资源引用](./refactor/blender-5.2/B10_RESOURCES.md)

## 早期迁移归档

[发布归档](./RELEASE_ARCHIVE.md)、[Panda 迁移台账](./migration/LEDGER.md)、[视觉报告](./migration/VISUAL_REGRESSION.md)和[原始数据](./migration/visual-regression-report.json)为历史证据，不代表当前包结构和安装方式。
