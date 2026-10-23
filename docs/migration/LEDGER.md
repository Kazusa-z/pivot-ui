# 样式问题排查

先确认问题发生在独立组件、应用布局还是生产构建。下面按现象列出最常见的检查位置。

| 现象                         | 检查什么                                                               |
| ---------------------------- | ---------------------------------------------------------------------- |
| 所有控件都没有外观           | 应用是否导入 layer CSS，PostCSS 是否运行 Panda，是否扫描组件源码       |
| 提示找不到 styled-system     | 在组件库运行 `pnpm --filter @pivot-ui/react panda`                     |
| 开发正常，构建后缺少局部样式 | 样式调用是否能静态识别；嵌套配置是否使用 `css.raw()`                   |
| 自定义样式没有效果           | 参数是否传到真正的 Content/Viewport/输入；是否被原生 style 覆盖        |
| 浮层主题与区域不同           | Provider 的 store、普通内容主题 class、Portal 是否使用库提供的 Content |
| 长标题撑宽页面               | 容器和 flex/grid 子项是否允许收缩；是否缺少 `minWidth: 0`              |
| 滚动区域不滚动               | 父容器是否有高度；内容是否放在 ScrollAreaViewport 中                   |
| 下拉内容被对话框挡住         | 是否使用支持层级关系的库浮层；外部浮层可接入 OverlayLayer              |
| 图标或按钮尺寸不符           | `size` 是否属于该组件参数；图标是否独立指定宽高                        |
| 样式工具类型报错             | 是否从公开 styling 子入口导入；生成模块是否存在                        |

## 区分三个常用参数

`css` 是由 Panda 提取的样式声明；`className` 附加已有类名；`style` 是原生 React 内联样式。固定视觉规则适合 `css`，拖动产生的实时坐标适合 `style`。

对于 Popover 等组合，Root 管开关，Content 管内容尺寸和定位。把宽度传到 Root 不会自动让弹层内容变宽。参数示例见[浮层与消息](../refactor/blender-5.2/B04_OVERLAYS.md)。

## 检查主题

在 Storybook 切换明暗主题，观察同一元素的背景、文字、边框和焦点轮廓。如果只是应用中的某一区域错误，检查那一区域的 Provider 与外观设置。不要通过全局覆盖所有浮层颜色来掩盖局部主题配置问题。

## 检查构建

```bash
pnpm --filter @pivot-ui/react panda
pnpm build:demo
pnpm build:storybook
```

构建成功后仍应打开产物检查实际界面。只看到 className 不代表规则已经生成；浏览器的计算样式能帮助确认 CSS 是否生效。

更多接入说明见[主题与样式配置](./README.md)，交互检查见[键盘、窄窗口与可访问性](./VISUAL_REGRESSION.md)。
