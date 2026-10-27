# Pivot UI 使用与开发指南

Pivot UI 是一套用于构建编辑器、属性面板和工具界面的 React 组件库。组件负责显示、输入与交互，应用负责提供数据、保存、撤销和业务校验。

- 包名：`@pivot-ui/react`
- 技术栈：React 19、TypeScript、Panda CSS、Radix UI
- 主题：light / dark / system
- 入口：组件、hooks 和常用类型从 `@pivot-ui/react` 导入；数据算法从 `/values` 导入；接口从 `/contracts` 导入；样式工具从 `/styling/*` 导入

## 1. 环境与安装

要求 Node.js `^22.18.0`、`^24.11.0` 或 `>=26.0.0`，pnpm `12.14.0`。

```bash
pnpm install --frozen-lockfile
pnpm dev        # Storybook: http://localhost:6009
pnpm dev:demo   # Vite 示例
```

本库通过 workspace 或源码链接接入。消费应用需要完成 Panda CSS 和 PostCSS 配置；最小依赖示例：

```json
{
  "dependencies": {
    "@pivot-ui/react": "workspace:*",
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  }
}
```

应用入口只加载一次 `@pivot-ui/react/panda.css`，并让 Panda 扫描应用源码和 `packages/interface/src/**/*.{ts,tsx}`。组件库内部在构建前生成 styled-system：

```bash
pnpm --filter @pivot-ui/react panda
```

## 2. 快速开始

```tsx
import { useState } from 'react'
import { Section, ThemeProvider, TooltipProvider, Vector3Input } from '@pivot-ui/react'

export function PositionField() {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 5 })
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Section title="Transform">
          <Vector3Input aria-label="Position" value={position} onValueChange={setPosition} />
        </Section>
      </TooltipProvider>
    </ThemeProvider>
  )
}
```

`value` 是当前显示值，`onValueChange` 是修改请求。只传固定 `value` 而不接受回调时，控件不会修改应用数据。

### Providers

| Provider               | 用途                                                     |
| ---------------------- | -------------------------------------------------------- |
| `ThemeProvider`        | 明暗主题、主题偏好和 `useTheme()`                        |
| `TooltipProvider`      | Tooltip 的延迟与分组行为                                 |
| `NotificationProvider` | 应用通知服务和全局 Toaster                               |
| `ConfirmationProvider` | 确认队列；需要传入自己的 `ConfirmationService`           |
| `DragDropProvider`     | 应用内拖放；组件内使用 `useDragSource` / `useDropTarget` |

Provider 只放在使用相应功能的区域。局部主题使用 `ThemeProvider` 或 `createThemeStore`；弹出的浮层会继承所属 Provider 的主题。

## 3. 设计系统

### 3.1 两档密度

组件只使用两档控件高度：

| 档位    | 高度      | 字号 | 圆角    | 图标      |
| ------- | --------- | ---- | ------- | --------- |
| compact | 20 / 24px | 12px | 4px     | 12 / 14px |
| regular | 32 / 36px | 14px | 6 / 8px | 16 / 18px |

- 工具栏、属性面板、菜单、树、表格使用 compact。
- 对话框、常规表单、文档页使用 regular。
- 控件高度来自 `sizes.controlXs/controlSm/controlMd/controlLg`，圆角来自 `radii.control/controlMd/controlLg`，字号来自 `fontSizes.control/controlLarge`。
- 11px 只用于 micro 角色（Kbd、轴标签、元信息）。Checkbox 的 14/18/22 是元素尺寸例外。
- AssetReferenceInput 的缩略图字段保留 48px；ColorPlane 130px、渐变条 64px、竖 Slider 160px 是内容尺寸例外。

### 3.2 Surface 层级

| 主题  | appBg | surface | surfaceRaised / overlay |
| ----- | ----- | ------- | ----------------------- |
| dark  | gray1 | gray2   | gray3                   |
| light | gray2 | gray1   | white                   |

- 页面背景用 `appBg`，卡片用 `surface`，浮层用 `surfaceRaised`。
- 浮层统一 6px 圆角和 `shadows.overlay`；Dialog 使用 8px 圆角和 `shadows.modal`。
- 浮层基础字号 14；Tooltip 使用 12。

### 3.3 状态

- 焦点：`outline: 2px solid var(--colors-focusRing)` + `outline-offset: 2px`；Menu/Tree 整行使用 `-2px`。
- 禁用：`opacity: 0.5` + `cursor: not-allowed`。
- 只读：保持正常颜色，仅 `cursor: default`。
- 错误/成功：改边框和文字色，不整块填充背景。
- 选中：行、选项、勾选使用 `selectionBg + selectionText`；卡片/磁贴使用 `selectionSubtleBg + selectionSubtleBorder + textStrong`。
- 实心主按钮使用 `primarySolid`，确保白字对比度；critical/positive 使用加深的 status solid。

### 3.4 Token 使用

```tsx
import { css } from '@pivot-ui/react/styling/css'

const panel = css({
  padding: 'var(--space-2)',
  borderRadius: 'var(--radii-controlMd)',
  backgroundColor: 'var(--colors-surface)',
  color: 'var(--colors-text)',
})
```

不要在组件样式中新增 22/27/28/30px 控件高度。确需内容尺寸时使用语义 token 或在审计脚本中登记例外。

## 4. 组件地图

### Foundation

- `Title`、`Text`、`Link`：字阶、语气和链接。
- `Kbd`、`KbdGroup`：快捷键展示。
- `Badge`、`Tag`、`StatusDot`：状态和分类。
- `ThemeProvider`、`useTheme`、`createThemeStore`：主题。
- `Icons`：常用图标与领域图标。

### 输入与选择

- `Input`、`Textarea`、`EditableText`、`InputNumber`：文本和数字输入。
- `Checkbox`、`Select`、`Combobox`、`SegmentControl`、`ToggleGroup`：单选、多选和分段选择。
- `Slider`、`DistributionSlider`：连续值和分布编辑。
- `Button`、`ActionButton`、`ActionButtonGroup`：文字按钮和图标操作。

### 布局与折叠

- `Section`、`Collapsible`、`Accordion`：分区和折叠。
- `PropertyRow`、`PropertyLabel`、`PropertyControl`、`PropertyDescription`：属性行。
- `Flex`、`ResizableSplit`、`SectionDivider`：布局、分隔和可调整面板。

### 浮层与反馈

- `Popover`、`Tooltip`、`HoverCard`：轻量浮层。
- `Dialog`、`AlertDialog`、`ConfirmationProvider`：模态操作和确认队列。
- `DropdownMenu`、`ContextMenu`、`Menubar`：菜单。
- `ToastView`、`NotificationProvider`、`useNotifications`：通知。
- `Callout`、`Progress`、`Spin`：反馈。

### 集合与导航

- `Tree`：层级选择、展开、重命名和拖放。
- `Table`、`DataTable`：表格、选中、行操作和密度。
- `AssetItem`、`AssetName`、`AssetThumbnail`：资源磁贴和列表。
- `Breadcrumbs`、`Pagination`：导航。

### 数值、颜色与曲线

- `NumericSlider`、`NumericTupleInput`、`Vector2Input/3/4`、`RectInput`：数值和几何。
- `ColorWidget`、`ColorPicker`、`ColorInput`、`HDRColorInput`、`ColorRamp`、`ColorRampChannels`、`ColorRampPicker`、`ColorDistributionTemplate`：颜色编辑。
- `CurveWidget`、`CurvePicker`、`CurvePresets`、`NumericDistributionTemplate`：曲线和数值分布。

### 资源与属性

- `ResourceProvider`、`ResourcePicker`、`AssetReferenceInput`：资源查询、选择和引用。
- `PropertyAccess`、`PropertyField`、`usePropertyBinding`：属性数据连接、草稿、提交、错误和混合值。

完整组件名和主要参数见 [组件 API 参考](../packages/interface/README.md)。

## 5. 数据与编辑生命周期

### 5.1 受控值

大多数编辑控件成对使用 `value` / `onValueChange`；可选 `defaultValue` 允许组件内部保存未受控状态。需要与其他组件同步或接入保存逻辑时使用受控值。

### 5.2 编辑开始、预览、提交、取消

需要异步保存的控件提供：

- `value` / `onValueChange`：实时预览，应用可以先更新界面。
- `onEditStart`：开始一次编辑；返回 `false` 可拒绝。
- `onValueCommit`：提交最终值；可返回 Promise，失败时保留草稿并允许重试。
- `onEditCancel`：Escape、失焦、外部更新或卸载时取消。

对象切换时更新 `resetKey`，即使两次对象的数据相同。`resetKey` 应是稳定 ID、版本号或 `useMemo` 结果，不要每次 render 新建对象。

### 5.3 PropertyAccess

```ts
interface PropertyAccess<T> {
  getSnapshot(): PropertySnapshot<T>
  subscribe(listener: () => void): () => void
  begin(): BeginEditResult<T>
}
```

`PropertyField` 使用 `access` 读取快照、开始编辑、预览和提交。快照包含 `target`、`revision`、`value`、`disabled`、`readOnly`、`error`、`edit.previewValue` 等信息。保存确认、持久化和撤销记录由应用负责；后端未就绪时可以用内存实现。

内置字段：`Input`、`Textarea`、`Checkbox`、`Select`、`Combobox`、`InputNumber`、`NumericSlider`。复杂值通过 `render` 组合 `Vector3Input`、颜色、曲线或资源控件。`density="compact" | "regular"` 控制内置控件高度。

### 5.4 异步保存与错误

提交被拒绝时应抛出错误，让控件保留草稿和错误信息；接受后由应用更新 `value`。不要把已经发送的保存请求伪装成取消。取消只影响当前草稿，不撤销已提交的服务器操作。

### 5.5 资源

`ResourceProvider` 负责 `query` 与 `get`；可选 `rename`、`locate`、`chooseFile`。`ResourcePicker` 通过 `onSelect` / `onSelectedIdChange` 回写选择；`AssetReferenceInput` 通过 `onValueChange` 接收引用变化。资源状态（loading/error/missing/not selectable）应保留在 `AssetDescriptor` 中。

## 6. 主题与样式接入

### 6.1 Panda 配置

消费应用继承共享 `panda` 配置，扫描应用源码和组件源码，并在入口导入 `@pivot-ui/react/panda.css`。开发环境先运行：

```bash
pnpm --filter @pivot-ui/react panda
```

### 6.2 自定义样式

```tsx
import { styled } from '@pivot-ui/react/styling/jsx'

const Inspector = styled('aside', {
  base: {
    display: 'grid',
    gap: 'var(--space-2)',
    padding: 'var(--space-3)',
    backgroundColor: 'var(--colors-surface)',
    color: 'var(--colors-text)',
  },
})
```

保持 `css()`、`styled()` 和 recipe 可被 Panda 静态扫描；动态值用 CSS 变量或原生 `style`，不要动态拼接无法提取的类名。

### 6.3 局部主题

`ThemeProvider` 提供 `light` / `dark` / `system`。局部主题可以嵌套 Provider；浮层会通过 portal 继承所属 Provider 的主题。主题偏好由应用保存，组件不写入 `localStorage`。

## 7. Storybook

```bash
pnpm dev        # 启动 Storybook
pnpm build:storybook
```

- 每个公开组件一个 `Overview` 文档页。
- 行为、边界和键盘示例使用 `tags: ['!autodocs']`，不进入 docs 页面。
- 文档统一使用 `stories/support/StoryPage.tsx`；不引入旧 `ContractFrame` 或原生演示控件。
- `Foundation / Control matrix` 展示两档密度与核心状态的代码对照。
- 主题工具栏可切换明暗主题；`Foundation / Tokens` 展示颜色、字阶、圆角和间距。

## 8. 开发与质量

### 命令

| 命令                                       | 用途                                           |
| ------------------------------------------ | ---------------------------------------------- |
| `pnpm dev` / `pnpm dev:interface`          | 启动 Storybook                                 |
| `pnpm dev:demo`                            | 启动 Vite 示例                                 |
| `pnpm typecheck`                           | 检查组件、Storybook、示例和工具配置            |
| `pnpm audit:styles`                        | 扫描裸 px 尺寸，并检查颜色变量在两套主题中存在 |
| `pnpm audit:stories`                       | 检查 StoryPage、Overview、标题和旧 story 依赖  |
| `pnpm verify:quick`                        | 格式 + 类型                                    |
| `pnpm verify`                              | 格式 + 类型 + 两条审计 + demo/Storybook 构建   |
| `pnpm build:demo` / `pnpm build:storybook` | 构建示例 / 静态 Storybook                      |
| `pnpm clean`                               | 清理生成文件和缓存                             |

### 修改组件

1. 先确认现有 token 和状态约定，优先复用 `sizes` / `radii` / `fontSizes` / `colors`。
2. 在 `packages/interface/src` 修改组件，在相邻 story 中更新演示。
3. 运行 `pnpm typecheck` 和相应 story。
4. 运行 `pnpm audit:styles`、`pnpm audit:stories`。
5. 提交前运行 `pnpm verify`。

### 样式审计白名单

`audit:styles` 允许图标/指示线、内容尺寸和明确登记的文件例外。新增例外必须说明用途；控制高度、圆角和字号不能随手写裸 px。它同时检查每个 `--colors-*` 引用在明暗主题中都有已解析的值；`node panda/generate-tokens.mjs` 遇到未解析的 `$token` 或两套主题键不一致时会直接失败。

### 可访问性

- 所有交互元素需要可读名称；图标按钮用 `aria-label`。
- 对话框需要标题；没有描述时显式设置 `aria-describedby={undefined}`。
- 菜单、树、表格和拖放都提供键盘路径；组合后至少检查 Tab、方向键、Enter/Space、Escape。
- 浮层关闭后焦点返回触发元素。
- 不要嵌套按钮；按钮内的图标应 `aria-hidden`。

## 9. 常见问题

| 现象                     | 检查                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------ |
| 组件没有样式             | 运行 `pnpm --filter @pivot-ui/react panda`，确认应用扫描了组件源码并加载 `panda.css` |
| 浮层主题不一致           | 确认浮层在 `ThemeProvider` 内，并使用库的 Popover/Dialog 组件                        |
| 修改后界面不更新         | `onValueChange` 是否把新值写回 `value`                                               |
| 编辑中收到外部更新被取消 | 使用稳定 `resetKey`；外部更新会取消当前草稿                                          |
| 保存失败后草稿消失       | `onValueCommit` 应抛出错误并让应用保留旧 `value`                                     |
| 资源字段显示 missing     | 检查 `ResourceProvider.get` 返回的 ID 是否与引用一致                                 |
| 树/表格行高不统一        | 使用 `density`，不要手写 27/28/30px                                                  |
| 快捷键被页面拦截         | 检查父级 `onKeyDown` 是否调用了 `preventDefault`                                     |

## 10. 仓库结构

| 路径                         | 用途                                       |
| ---------------------------- | ------------------------------------------ |
| `packages/interface/src`     | 组件、模板、布局、属性、值算法和 contracts |
| `packages/interface/stories` | Storybook 文档与行为示例                   |
| `app`                        | Vite 消费示例                              |
| `panda`                      | 共享 Panda 配置、token 源和生成器          |
| `scripts`                    | 样式和 story 审计                          |
| `storybook`                  | Storybook 主题工具栏与 Vite 配置           |
| `docs`                       | 本指南                                     |

## 11. 许可

MIT。见 [LICENSE](../LICENSE)。
