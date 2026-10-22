# @pivot-ui/react

Blender 5.2 LTS 对齐重构的统一源码包。B01 提供基础属性契约、编辑会话、宿主能力接口和 Storybook Mock；B02 提供主题状态、按钮、反馈、排版、快捷键展示和图标。尚未迁移的组件继续使用 `@pivot-ui/editor`、`@pivot-ui/gui`，已迁移的旧入口仅作兼容适配。

## 入口与依赖

| 入口                                                             | 内容                                                                 | 依赖边界                                   |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| `@pivot-ui/react`                                                | 当前公开组件、主题 API、值和契约的显式汇总                           | 不导出 Mock 或 Storybook 组件              |
| `@pivot-ui/react/values`                                         | `PropertyValue`、`ChoiceValue`、`ChoiceOption`、`NumericConstraints` | 纯 TypeScript                              |
| `@pivot-ui/react/contracts`                                      | 属性描述、访问、快照、编辑会话和可选宿主能力                         | 仅依赖 values，不依赖 React、DOM 或 Qt     |
| `@pivot-ui/react/panda.css`                                      | Panda CSS layer 入口                                                 | 消费端需配置 Panda PostCSS 与源码扫描      |
| `@pivot-ui/react/theme`                                          | 主题 store、Provider、hooks 和可选浏览器适配器                       | 不依赖旧 ui/gui 包；导入不读写浏览器状态   |
| `@pivot-ui/react/styling/css`、`/styling/jsx`、`/styling/tokens` | 直接指向生成的 Panda 运行模块                                        | 不经二次 re-export；需先生成 styled-system |
| `@pivot-ui/react/styling/types`                                  | Panda 的 SystemStyleObject、RecipeVariantProps 等类型                | 仅类型，不作为运行时模块导入               |

当前只定义 string、number、boolean 和 string/number enum。颜色、曲线、资源引用的专用模型分别在 B08–B10 实现。数值硬范围与软范围分开；step、dragStep、precision 是描述元数据，数值交互算法属于 B06。

`ChoiceOption.key` 是 UI 选择身份，`value` 是属性值。从 key 查找对应 option 后取原始 value，不通过字符串猜测数字；`'001'`、`'1'`、`1` 因而可以保持不同身份。

## 主题与视觉基础

`ThemeProvider` 和 `useTheme()` 共享同一 store。`preference` 保留 `light | dark | system`，`resolvedTheme` 始终是 `light | dark`；系统从暗色切到明色不会把用户的 `system` 偏好改成 `light`。同一 Provider 下的消费者和使用同一 store 的多个 Provider 自动同步。

```tsx
import { Button, Text, ThemeProvider, useTheme } from '@pivot-ui/react'

function ThemeSwitch() {
  const { preference, resolvedTheme, setPreference } = useTheme()
  return (
    <>
      <Text>
        Preference: {preference}; actual: {resolvedTheme}
      </Text>
      <Button onClick={() => setPreference('system')}>Follow system</Button>
    </>
  )
}

export function Example() {
  return (
    <ThemeProvider>
      <ThemeSwitch />
    </ThemeProvider>
  )
}
```

默认 Provider 使用浏览器主题存储、系统主题监听和文档 class 适配器。需要模拟或接入宿主时，创建 `createThemeStore({ initialPreference, storage, system, appearance })` 并传给 Provider。三个能力可分别省略或替换；读取快照不修改 DOM，连接/断开负责订阅和清理。组件不会自行接入 Qt。

| 层与组件                                                 | 职责                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| foundation：Text、Bold、Title、Link                      | HTML 语义通过 `as` 选择，视觉字号通过 `size` 选择                     |
| foundation：通用图标、文件图标、Arrow                    | 统一 SVG props、ref 和可访问名称；应用选择领域文件图标                |
| widgets/buttons：Button、ActionButton、ActionButtonGroup | 共享 disabled/loading/async 内核；图标按钮提供名称，Group 仅分组容器  |
| widgets/display：Badge、Tag                              | Badge 只展示；Tag 的原生移除按钮调用 `onRemove`，由父组件决定是否删除 |
| widgets/display：Kbd、KbdGroup                           | 使用纯快捷键格式化函数展示按键/手势，不注册快捷键                     |
| widgets/feedback：Callout、Progress、Spin                | 明确信息语义、进度范围和加载状态                                      |

Button 的 `async` 只是 Promise 便利回调；`onAsyncError` 接收失败，业务命令、持久化和撤销仍由应用处理。外部 `loading` 与内部等待状态共同禁用激活。`asChild` 的自定义子组件必须向真实 DOM 转发 props/ref；带 `href` 的子元素按链接处理，其余自定义包装按按钮处理并默认 `type="button"`，避免意外提交表单。

Callout 的 `severity` 选择视觉等级，`role` 决定普通说明、`status` 或 `alert`，不会把所有静态说明都设为实时告警。Progress 的 `max` 必须为正有限数，非法范围退回 100；空值表示不定进度，确定进度按 `value / max` 显示。Spin 支持名称或装饰用途，并尊重减少动态效果偏好。

全局 token 与预设继续以仓库 `panda/` 为唯一来源。包内直接导入生成的 `styled-system`；消费端使用 styling 子入口，并将统一包 `src` 加入 Panda 扫描。demo 和三个 Storybook 都使用相同预设，只加载一个 layer 入口，详见[接入说明](../../docs/CONSUMING.md)。

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
