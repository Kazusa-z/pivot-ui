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

应用入口只加载一次 `@pivot-ui/react/panda.css`，并让 Panda 扫描应用源码和 `packages/interface/src/**/*.{ts,tsx}`。界面字体（Geist）与代码字体（JetBrains Mono）随包提供，在入口同时导入 `@pivot-ui/react/fonts.css`；不导入时回退到系统 UI 字体和系统等宽字体。组件库内部在构建前生成 styled-system：

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
- AssetField 的缩略图字段保留 48px；ColorPlane 130px、渐变条 64px、竖 Slider 160px 是内容尺寸例外。

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
- 选中：行、选项、勾选使用 `selectionBg + selectionText`；卡片/磁贴使用 `selectionSubtleBg + selectionSubtleBorder + textStrong`；SegmentControl/ToggleGroup 的 subtle 变体用 `controlRaisedBg` 抬起选中项，solid 变体用强调色填充。
- 强调色只有一个蓝色：实心按钮、选中、曲线和进度共用 `primary`；块状 Slider 的填充使用 `primaryMuted`，让上面的标签和单位保持可读。critical/positive 使用加深的 status solid。
- Hover 在暗色主题中变亮、在亮色主题中变暗。
- Callout 使用状态色 10% 的浅色底，图标和标题用状态色，正文保持 `text`。
- 色相只用 slate、blue、green、amber、red 和 violet；Badge 的分类色只有 violet。

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

组件按层组织，源码目录、`src/index.ts` 的导出分组和 Storybook 侧边栏使用同一套层级。每层只依赖更低的层（`pnpm audit:layers` 检查）；`values`、`contracts`、`interaction` 是不含界面的共享模块。

```
property     PropertyField · usePropertyBinding                       连接应用数据
editors      numeric · color · curve · resources                      按值类型的编辑器
collections  Tree · Table · DataTable · Asset* · CollectionEditor · Breadcrumbs · Pagination
layout       Section · Accordion · PropertyRow · Flex · ResizableSplit · ScrollArea · Separator
dialogs      Dialog · AlertDialog · ConfirmationProvider
controls     Button · IconButton · Input · NumberInput · Select · Combobox · Checkbox · SegmentControl · ToggleGroup · Slider · PartitionSlider
overlays     Popover · Tooltip · HoverCard · OverlayLayer · DropdownMenu · ContextMenu · Menubar · NotificationProvider
display      Badge · Tag · Kbd · ReadonlyValue · ImagePreview · Callout · Progress · Spin
foundation   ThemeProvider · Text · Title · Link · Icons
```

### 命名约定

组件名的后缀说明它的形态：

| 后缀      | 含义                       | 例子                                                       |
| --------- | -------------------------- | ---------------------------------------------------------- |
| `*Input`  | 在一个输入框里直接编辑值   | `NumberInput`、`Vector3Input`、`NumberTupleInput`          |
| `*Field`  | 属性面板里的紧凑组合字段   | `SliderField`、`ColorField`、`HDRColorField`、`AssetField` |
| `*Picker` | 一个预览按钮，点开浮层编辑 | `ColorPicker`、`ColorRampPicker`、`CurvePicker`            |
| `*Editor` | 完整展开的内联编辑面板     | `ColorEditor`、`CurveEditor`、`CollectionEditor`           |

### Editors

- 数值：`SliderField`（输入框 + 滑块）、`NumberTupleInput`、`Vector2Input/3/4`、`RectInput`、`NumericDistributionEditor`（固定值 / 随机范围 / 曲线）。
- 颜色：`ColorEditor`、`ColorField`、`HDRColorField`、`ColorPicker`、`ColorRampEditor`、`ColorAlphaRampEditor`（颜色轨与透明度轨分开）、`ColorRampPicker`、`ColorDistributionEditor`。
- 曲线：`CurveEditor`、`CurvePicker`、`CurvePresets`。
- 资源：`ResourceBrowser`（内联浏览、搜索、分页）、`AssetField`（展示和更换一个资源引用）。

`PartitionSlider` 把一个总量切分成多段（拖动分界点）；`NumericDistributionEditor` / `ColorDistributionEditor` 编辑随机分布。两者含义不同，名字也不同。

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

内置字段：`Input`、`Textarea`、`Checkbox`、`Select`、`Combobox`、`NumberInput`、`SliderField`。复杂值通过 `render` 组合 `Vector3Input`、颜色、曲线或资源控件。`density="compact" | "regular"` 控制内置控件高度。

### 5.4 异步保存与错误

提交被拒绝时应抛出错误，让控件保留草稿和错误信息；接受后由应用更新 `value`。不要把已经发送的保存请求伪装成取消。取消只影响当前草稿，不撤销已提交的服务器操作。

### 5.5 资源

`ResourceProvider` 负责 `query` 与 `get`；可选 `rename`、`locate`、`chooseFile`。`ResourceBrowser` 通过 `onSelect` / `onSelectedIdChange` 回写选择；`AssetField` 通过 `onValueChange` 接收引用变化。资源状态（loading/error/missing/not selectable）应保留在 `AssetDescriptor` 中。

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

侧边栏从上到下是 `Guides`，然后按层排列：`Foundation` → `Display` → `Overlays` → `Controls` → `Layout` → `Dialogs` → `Collections` → `Editors/<Numeric|Color|Curve|Resources>` → `Property`，与源码目录一致。

### 组件页

每个组件一个 story 文件，文件名与页面名相同（`Controls/Button` → `stories/Button.stories.tsx`）。文档页由 `storybook/docs.tsx` 统一生成，顺序固定：

1. 标题和一句话用途（`describeComponent` 的 `summary`）。
2. 第一个 story：典型示例。它使用 args，下方的 API 表可以直接改参数。
3. 适合、不适合、相近组件、键盘（`describeComponent` 的其余字段）。
4. API 表：从 props 类型和 JSDoc 自动生成。props 写中文 JSDoc；继承其他文件的选项时，用 `extends` 具名接口（不要只写 `Omit<...>`），否则 API 表读不到。
5. 其余 story：变体、尺寸、状态、组合用法。每个 story 的 JSDoc 注释就是它在文档里的说明。

```tsx
const meta = {
  title: 'Controls/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: describeComponent({ summary: '…', use: […], avoid: […], related: […] }),
  args: { children: 'Save' },
} satisfies Meta<typeof Button>

export const Basic: Story = {}
/** 一组操作里只放一个 solid。 */
export const Variants: Story = { render: (args) => <Row>…</Row> }
```

- 示例只展示组件本身，用 `stories/support/layout.tsx` 的 `Row`、`Column`、`Grid`、`Item`、`Panel` 排版；不要加标题卡片或调试面板。
- 拒绝请求、保存失败、外部更新这类测试场景写成 `Behavior*` story，加 `tags: ['!autodocs']`，只出现在侧边栏，可以用 `StateView` 显示内部状态。
- 说明使用中文；组件名、prop 名和示例数据使用英文。
- `pnpm audit:stories` 检查标题、文件名、`describeComponent` 和 Behavior 规则。`Guides/*` 页面写在 `stories/guides/*.mdx`。

## 8. 开发与质量

### 命令

| 命令                                       | 用途                                           |
| ------------------------------------------ | ---------------------------------------------- |
| `pnpm dev` / `pnpm dev:interface`          | 启动 Storybook                                 |
| `pnpm dev:demo`                            | 启动 Vite 示例                                 |
| `pnpm typecheck`                           | 检查组件、Storybook、示例和工具配置            |
| `pnpm audit:styles`                        | 扫描裸 px 尺寸，并检查颜色变量在两套主题中存在 |
| `pnpm audit:stories`                       | 检查组件页的标题、文件名、描述和 Behavior 规则 |
| `pnpm audit:layers`                        | 检查组件只依赖更低的层                         |
| `pnpm verify:quick`                        | 格式 + 类型                                    |
| `pnpm verify`                              | 格式 + 类型 + 三条审计 + demo/Storybook 构建   |
| `pnpm build:demo` / `pnpm build:storybook` | 构建示例 / 静态 Storybook                      |
| `pnpm clean`                               | 清理生成文件和缓存                             |

### 修改组件

1. 先确认现有 token 和状态约定，优先复用 `sizes` / `radii` / `fontSizes` / `colors`。
2. 在 `packages/interface/src` 修改组件，在相邻 story 中更新演示。
3. 运行 `pnpm typecheck` 和相应 story。
4. 运行 `pnpm audit:styles`、`pnpm audit:stories`、`pnpm audit:layers`。
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
