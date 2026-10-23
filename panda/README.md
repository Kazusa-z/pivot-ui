# 主题与样式

Pivot UI 使用 Panda CSS 生成样式。应用和组件共用这里的颜色、间距、字号及明暗主题定义，适合需要统一工具栏、属性面板和弹窗外观的界面。

首次接入请先完成[样式构建配置](../docs/CONSUMING.md)。`@pivot-ui/react/panda.css` 是 CSS layer 入口；应用通过 Panda 扫描源码生成实际使用的组件样式。

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

在 Storybook 的 `Foundation / Tokens` 中查看可用颜色、尺寸和字体。使用组件外观时优先选择语义 token，例如文本色和面板背景色，使明暗主题都能保持可读性。

## 为应用生成样式

1. 在本仓库运行 `pnpm --filter @pivot-ui/react panda`，生成组件包的样式工具模块。
2. 在应用的 Panda 配置中使用共享 `pandaBase`，扫描应用源码和 `packages/interface/src/**/*.{ts,tsx}`。
3. 在应用入口加载一次 `@pivot-ui/react/panda.css`，通过 Panda PostCSS 构建应用 CSS。

仓库中的 Vite 示例和 Storybook 已配置这些步骤。源码链接到其他应用时，请按[接入指南](../docs/CONSUMING.md)配置路径。

## 编写自定义样式

- 直接从上述 styling 子入口导入样式工具，便于 Panda 的静态扫描识别调用。组件包内部使用生成的 `styled-system` 模块。
- 为样式变体选择明确名称，如 `orientation`、`spacing`、`justify`。CSS 属性仍写在样式对象内，避免变体名称与 `direction`、`gap`、`justifyContent` 等属性混淆。
- SVG 路径使用原生 `<path d={...}>`，并通过 `css()` 的类名添加样式；`styled` 会把 `d` 识别为 CSS display 的简写。
- 空伪元素写作 `content: '""'`，以生成有效的 CSS content 声明。
- 自定义组件和 Radix 组件的样式对象直接写在 `styled()` 调用中，便于静态提取。
- 在 `css` 属性中使用 token 名称、`token(...)` 或 `var(--colors-...)`；具体写法见[接入指南](../docs/CONSUMING.md)。

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
