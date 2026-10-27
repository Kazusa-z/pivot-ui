# Pivot UI

用于搭建编辑器和工具面板的 React 组件库。`@pivot-ui/react` 提供按钮、输入框、布局、颜色与曲线编辑器、资源选择器，以及连接应用数据的属性字段。你可以从一个受控输入开始，逐步组合设置页、属性面板和资源浏览界面。

## 先运行示例

使用 Node.js `^22.18.0`、`^24.11.0` 或 `>=26.0.0`，pnpm `12.14.0`：

```bash
pnpm install --frozen-lockfile
pnpm dev                 # Storybook：http://localhost:6009
pnpm dev:demo            # Vite 示例应用
pnpm verify             # 格式、类型、示例应用与 Storybook 构建检查
```

组件按层组织：`Foundation` → `Display` → `Overlays` → `Controls` → `Layout` / `Dialogs` → `Collections` → `Editors` → `Property`，源码目录与 Storybook 侧边栏一一对应，分层说明见[组件地图](./docs/README.md#4-组件地图)。工具栏的 Theme 可切换明暗主题；`Foundation / Tokens` 可以查看颜色、间距和字号。

## 在 React 中使用

本库通过 workspace 或源码链接接入。先按[使用与开发指南](./docs/README.md)配置依赖和 Panda CSS，再导入组件。例如，用三个数值输入编辑位置：

```tsx
import { useState } from 'react'
import { Section, Vector3Input } from '@pivot-ui/react'

export function PositionExample() {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 5 })
  return (
    <Section title="Position">
      <Vector3Input aria-label="Position" value={position} onValueChange={setPosition} />
    </Section>
  )
}
```

`value` 决定当前显示值，`onValueChange` 返回编辑后的值。普通界面可以直接使用 React 状态；需要保存确认、错误提示或撤销记录时，可以使用 `PropertyField<T>` 和 `PropertyAccess<T>` 连接应用的数据服务。后端尚未准备好时，也可以先实现内存数据服务，组件用法保持一致。

页面内容由你通过 React 组合。保存文件、资源查询、持久化和撤销由应用提供实现，相关接口及示例见[使用与开发指南](./docs/README.md)。

## 使用指南

- [使用与开发指南](./docs/README.md)：安装、样式、组件、数据接入和本地开发。
- [组件速查](./packages/interface/README.md)：选择控件，了解主要属性与回调。
- [主题与样式](./panda/README.md)：使用设计 token，定制应用外观。

## 仓库目录

| 位置                                                 | 用途                                        |
| ---------------------------------------------------- | ------------------------------------------- |
| [packages/interface](./packages/interface/README.md) | `@pivot-ui/react` 组件源码与 Storybook 示例 |
| [app](./app)                                         | 展示如何在 Vite 应用中使用组件和主题        |
| [panda](./panda/README.md)                           | 共享样式预设、颜色、间距和字号              |
| [storybook](./storybook)                             | Storybook 的主题工具栏与预览配置            |

技术依赖：React 19、TypeScript、Panda CSS、Radix UI。许可证：[MIT](./LICENSE)。
