# @pivot-ui/react

Blender 5.2 LTS 对齐重构的统一源码包。当前完成范围为 B01：基础属性契约、编辑会话、宿主能力接口和 Storybook Mock。现有组件仍由 `@pivot-ui/editor`、`@pivot-ui/gui` 提供，按后续批次迁移。

## 入口与依赖

| 入口                        | 内容                                                                 | 依赖边界                               |
| --------------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| `@pivot-ui/react`           | 当前公开类型与 `getEditEndAction` 的显式汇总                         | 不导出 Mock 或 Storybook 组件          |
| `@pivot-ui/react/values`    | `PropertyValue`、`ChoiceValue`、`ChoiceOption`、`NumericConstraints` | 纯 TypeScript                          |
| `@pivot-ui/react/contracts` | 属性描述、访问、快照、编辑会话和可选宿主能力                         | 仅依赖 values，不依赖 React、DOM 或 Qt |
| `@pivot-ui/react/panda.css` | Panda CSS layer 入口                                                 | 消费端需配置 Panda PostCSS 与源码扫描  |

当前只定义 string、number、boolean 和 string/number enum。颜色、曲线、资源引用的专用模型分别在 B08–B10 实现。数值硬范围与软范围分开；step、dragStep、precision 是描述元数据，数值交互算法属于 B06。

`ChoiceOption.key` 是 UI 选择身份，`value` 是属性值。从 key 查找对应 option 后取原始 value，不通过字符串猜测数字；`'001'`、`'1'`、`1` 因而可以保持不同身份。

## 编辑会话

每个 `PropertyAccess<T>` 固定到一个 `{ objectId, propertyId }`。实现方提供稳定、不可变的 `getSnapshot()` 和 `subscribe()`；调用方可使用 React 的 `useSyncExternalStore`，契约本身不导入 React。

```ts
import type { PropertyAccess } from '@pivot-ui/react/contracts'

async function setNumber(access: PropertyAccess<number>, next: number) {
  const started = access.begin()
  if (started.status === 'unavailable') return started

  const changed = started.session.change(next)
  if (changed.status === 'invalid') {
    await started.session.cancel()
    return changed
  }
  return started.session.commit()
}
```

实际连续操作在开始时调用一次 `begin()`，操作中调用多次 `change()`，最后调用一次 `commit()` 或 `cancel()`。`getEditEndAction()` 固定事件语义：Enter、文本失焦、pointer-up、step 提交；Escape、pointer-cancel、拖动时窗口失焦、对象切换、卸载、禁用、只读等取消尚未提交的编辑。

- `snapshot.value/revision` 是权威状态；`snapshot.edit.previewValue` 是即时预览。延迟不会阻止预览更新。
- 会话捕获 target、初值和 baseRevision。一次成功提交只产生一笔事务，无变化不产生历史。
- 第一次终结请求生效，重复 commit/cancel 返回同一个 Promise。已经提交的请求继续针对原对象，取消或组件卸载不能撤回它。
- 编辑中收到外部新版本会取消草稿并接受外部状态。过期确认不能覆盖更新的权威版本或新会话。
- 拒绝与冲突结果携带当时的权威值和原因；不会盲目恢复旧的初值。

订阅者收到通知后应读取快照并更新展示，不应把通知当作一次新的用户操作。业务命令、持久化、真实撤销栈和 Qt 传输由未来应用适配层实现。

## 宿主能力

`HostCapabilities` 目前定义可选的 clipboard、preferences、files 接口。缺失表示不可用，调用方提供禁用或提示；组件不得自行调用浏览器或 Qt API 冒充已接入能力。文件引用是普通 `{ uri, name }` 数据，不携带 Qt 实例。Storybook 的剪贴板仅写入示例内存。

## Playground 与验证

```bash
pnpm dev:interface                    # http://localhost:6009
pnpm --filter @pivot-ui/react typecheck
pnpm --filter @pivot-ui/react build-storybook
pnpm verify                          # 完整仓库检查与三个 Storybook 构建
```

`Contracts / Property editing` 提供生命周期、延迟/拒绝、编辑中外部更新、过期确认、对象切换、可编辑状态/宿主能力、选择身份等场景。每个场景可 Reset，并展示快照与结果。使用原生 HTML 控件作为契约演示，不提前实现 B05/B06 的 PropertyField。

Mock 位于 `stories/support/mock-property-access.ts`，只服务示例与临时验证；包出口不包含它。它模拟订阅、会话、延迟、拒绝、外部更新及事务计数，不代表真实后端。

类型检查包含生产源码、全部 stories/support、Panda/PostCSS/Storybook 配置，以及仅 ES2022、无 React/DOM/Node 环境类型的 contracts/values 检查。Panda 在 dev、typecheck、build 前生成 `styled-system`；该目录与构建输出不提交。

进度与验证证据见 [实施台账](../../docs/refactor/blender-5.2/LEDGER.md)，架构边界见 [重构方案](../../docs/architecture/BLENDER_5_2_REFACTOR_PLAN.md)。
