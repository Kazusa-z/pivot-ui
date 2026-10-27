# 主题与样式

Pivot UI 使用 Panda CSS 生成样式。应用和组件共用这里的颜色、间距、字号及明暗主题定义，适合需要统一工具栏、属性面板和弹窗外观的界面。

首次接入请先完成[样式构建配置](../docs/README.md)。`@pivot-ui/react/panda.css` 是 CSS layer 入口；应用通过 Panda 扫描源码生成实际使用的组件样式。

## 两档密度

组件只使用两档控件高度，不再新增 22/27/28/30px 这类一次性值；Checkbox 的 22px 是元素尺寸，不参与控件高度档位。

| 档位 | 高度        | 字号 | 圆角    | 图标      | 场景                             |
| ---- | ----------- | ---- | ------- | --------- | -------------------------------- |
| 紧凑 | `20 / 24px` | 12px | 4px     | 12 / 14px | 工具栏、属性面板、菜单、树、表格 |
| 常规 | `32 / 36px` | 14px | 6 / 8px | 16 / 18px | 对话框、常规表单、文档页         |

11px 只用于 micro 角色（Kbd、坐标轴标签、元信息）；10px 和 13px 不再用于新样式。Section/Tree/Table 的头部和行使用 `24 / 32px`。

## 语义颜色与层级

优先使用语义 token，而不是原始调色板：

| 角色                                                | 用途                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `appBg` / `surface` / `surfaceRaised`               | 页面、卡片、浮层的三级背景                                               |
| `panelBg` / `surfaceSubtle`                         | 面板和下沉区域                                                           |
| `text` / `textStrong` / `textMuted`                 | 正文、强调、辅助文字；`textMuted` 已按 4.5:1 调整                        |
| `primary` / `primarySolid`                          | 唯一的强调蓝：实心按钮、选中、曲线与进度共用同一色值，白字对比度 ≥ 4.5:1 |
| `primaryMuted`                                      | 低强调填充，用于承载文字的大面积数值条（块状 Slider）                    |
| `controlRaisedBg` + `shadows.raised`                | 中性轨道上被抬起的选中项（subtle 的 SegmentControl / ToggleGroup）       |
| `selectionBg` / `selectionText` / `selectionBorder` | 行、选项、勾选的实心选中                                                 |
| `selectionSubtleBg` / `selectionSubtleBorder`       | 卡片/磁贴的浅底选中                                                      |
| `info* / success* / warning* / danger*`             | 状态提示、Badge、Invalid；`*Icon`（第 11 阶）用于图标与标题              |

暗色下 `appBg` 比 `surface` 深一档，`surfaceRaised` 再亮一档；亮色下浮层使用 `white`。浮层统一使用 `shadows.overlay`，Dialog 使用 `shadows.modal`。

## 状态约定

- 焦点：`outline: 2px solid var(--colors-focusRing)` + `outline-offset: 2px`；整行内嵌的 Menu/Tree 行用 `-2px`。
- 禁用：只使用 `opacity: 0.5` + `cursor: not-allowed`，不再同时替换背景和文字色。
- 只读：保持正常颜色，仅 `cursor: default`。
- 错误/成功：只改边框和文字色，不整块填充背景。
- 选中：行/选项/勾选用实心 `selectionBg + selectionText`；卡片/磁贴用 `selectionSubtleBg + selectionSubtleBorder + textStrong`；分段控件默认用 `controlRaisedBg` 抬起选中项，`variant="solid"` 才用强调色填充。
- Hover：暗色主题向更亮一档变化，亮色主题向更暗一档变化。
- 色相：只使用 slate（灰）、blue（强调/信息）、green、amber、red（状态）和 violet（唯一分类色）。新增色相需要新的语义。

## 使用设计 token

在应用中从 `@pivot-ui/react/styling/css`、`/styling/jsx` 和 `/styling/tokens` 导入样式工具。它们分别提供样式类、带样式的元素和 token 查询；样式类型从 `/styling/types` 导入。

```tsx
import { styled } from '@pivot-ui/react/styling/jsx'

export const Inspector = styled('aside', {
  base: {
    padding: '12px',
    color: 'var(--colors-text)',
    backgroundColor: 'var(--colors-panelBg)',
  },
})
```

`ThemeProvider` 管理 `light-theme` / `dark-theme` class。默认暗色变量定义在 `:root`，明色值定义在 `.light-theme`。Panda token 通过这些变量随主题切换，例如 `--panda-colors-gray3` 对应 `var(--colors-gray3)`。

在 Storybook 的 `Foundation / Tokens` 中查看可用颜色、尺寸和字体。使用组件外观时优先选择语义 token，例如文本色和面板背景色，使明暗主题都能保持可读性；两档高度、圆角、状态和 surface 的对照也在该页展示。

## 为应用生成样式

1. 在本仓库运行 `pnpm --filter @pivot-ui/react panda`，生成组件包的样式工具模块。
2. 在应用的 Panda 配置中使用共享 `pandaBase`，扫描应用源码和 `packages/interface/src/**/*.{ts,tsx}`。
3. 在应用入口加载一次 `@pivot-ui/react/panda.css`，通过 Panda PostCSS 构建应用 CSS；同时导入 `@pivot-ui/react/fonts.css` 使用随包字体。

仓库中的 Vite 示例和 Storybook 已配置这些步骤。源码链接到其他应用时，请按[使用与开发指南](../docs/README.md)配置路径。

## 编写自定义样式

- 直接从上述 styling 子入口导入样式工具，便于 Panda 的静态扫描识别调用。组件包内部使用生成的 `styled-system` 模块。
- 为样式变体选择明确名称，如 `orientation`、`spacing`、`justify`。CSS 属性仍写在样式对象内，避免变体名称与 `direction`、`gap`、`justifyContent` 等属性混淆。
- SVG 路径使用原生 `<path d={...}>`，并通过 `css()` 的类名添加样式；`styled` 会把 `d` 识别为 CSS display 的简写。
- 空伪元素写作 `content: '""'`，以生成有效的 CSS content 声明。
- 自定义组件和 Radix 组件的样式对象直接写在 `styled()` 调用中，便于静态提取。
- 在 `css` 属性中使用 token 名称、`token(...)` 或 `var(--colors-...)`；具体写法见[使用与开发指南](../docs/README.md)。

## 调整共享主题

| 文件                                              | 用途                                  |
| ------------------------------------------------- | ------------------------------------- |
| `base.ts`                                         | 共享 Panda 配置、动画关键帧和全局设置 |
| `global.ts`                                       | 字体、明暗主题 CSS 变量和全局样式     |
| `theme.ts`                                        | Panda token 与 CSS 变量的映射         |
| `token-source/colors.ts`、`token-source/sizes.ts` | 修改颜色和尺寸的源数据                |
| `designTokens.ts`                                 | 根据源数据生成的 token 表             |
| `reset.ts`                                        | 浏览器默认样式重置                    |
| `generate-tokens.mjs`                             | 生成 token 表的脚本                   |

修改源数据后，生成 token 表并检查组件效果：

```bash
node panda/generate-tokens.mjs
pnpm --filter @pivot-ui/react panda
pnpm verify
```

生成器使用仓库安装的 `esbuild`。在 Storybook 中分别切换明暗主题，检查文本、焦点状态、悬浮层和禁用控件的可读性。

## 样式与 Story 审计

`pnpm verify` 会在构建前运行两条审计：

```bash
pnpm audit:styles
pnpm audit:stories
```

- `audit:styles` 扫描组件源码中的裸 `height`、`minHeight`、`borderRadius` 和 `fontSize`；只允许图标/指示线、内容尺寸和文档化例外。它还检查所有 `--colors-*` 引用在明暗主题中都已定义且已解析。
- `audit:stories` 要求 58 个 story 文件使用 `StoryPage`、只有一个 `Overview`（行为 story 必须 `!autodocs`），并拒绝 `ContractFrame`、`Control*` 和原生演示 `<select>/<input>`。

新增控件尺寸必须使用 `var(--sizes-control*)`、`var(--radii-*)`、`var(--fontSizes-*)`；确需例外时在审计脚本中写明文件与用途。
