# 主题与样式配置

组件使用 Panda CSS 生成样式。你可以直接使用默认外观，也可以通过组件的 `css`、`className` 和原生 `style` 调整局部布局。先完成源码扫描，再添加自定义样式。

## 生成组件样式

`@pivot-ui/react/panda.css` 声明 CSS 层级顺序。组件的实际样式由消费应用的 Panda/PostCSS 从源码提取。

1. 继承 [共享 Panda 配置](../../panda/base.ts)。
2. 扫描应用文件和 `packages/interface/src/**/*.{ts,tsx}`。
3. 在入口导入一次 `@pivot-ui/react/panda.css`。
4. 在组件库运行 `pnpm --filter @pivot-ui/react panda`，生成组件导入的样式模块。
5. 运行应用自己的开发或构建命令，生成消费应用 CSS。

完整配置见 [Panda 使用说明](../../panda/README.md)和[应用示例配置](../../app/panda.config.ts)。

## 调整局部外观

接受 `css` 的组件可以直接传静态样式对象。一般 HTML 元素可以使用公开的 `css()`；实时变化的尺寸使用 `style`。

```tsx
import { Button } from '@pivot-ui/react'
import { css } from '@pivot-ui/react/styling/css'

export function CompactActions() {
  return (
    <div className={css({ display: 'flex', gap: '8px', minWidth: 0 })}>
      <Button css={{ minWidth: '80px' }}>Apply</Button>
      <Button style={{ width: 96 }}>Cancel</Button>
    </div>
  )
}
```

浮层的内容样式放在 `contentProps.css`。此类嵌套对象使用 `css.raw()`，让 Panda 在源码中识别声明：

```tsx
import { Button, Popover } from '@pivot-ui/react'
import { css } from '@pivot-ui/react/styling/css'

export function SizedPopover() {
  return (
    <Popover
      trigger={<Button>Details</Button>}
      contentProps={{ css: css.raw({ width: '280px', maxWidth: 'calc(100vw - 24px)' }) }}>
      Details go here.
    </Popover>
  )
}
```

不要把 `styled` 包装成另一层导出再用于应用代码；Panda 需要识别它的导入位置。也不要动态拼出样式类名。`css` 的类型可从 `@pivot-ui/react/styling/types` 导入。

## 明暗主题

`ThemeProvider` 和 `useTheme()` 管理当前主题。`preference` 可为 `light`、`dark` 或 `system`；`resolvedTheme` 是实际显示的明暗主题。默认配置会跟随系统并保存浏览器偏好。

用 `createThemeStore` 可以替换偏好保存、系统主题监听和外观应用方式。局部 Provider 只提供主题状态；要让普通内容显示局部主题，还需给该区域配置对应外观或主题 class。库的浮层会沿 React 组件关系读取主题，即使内容渲染到另一个 DOM 容器。

Storybook 的 `Foundation / Tokens` 展示语义颜色、间距、字体、圆角和阴影。优先使用语义颜色区分文字、背景、边框和错误，避免为单一主题写死所有颜色。

## 布局建议

长名称所在的 flex/grid 子项通常需要 `minWidth: 0`。可滚动区域需要明确的可用高度；`ScrollAreaViewport` 才是读取 scrollTop 或调用 scrollTo 的元素。窄窗口中的浮层应限制最大宽高并允许内容滚动。

出现问题时见[样式问题排查](./LEDGER.md)。
