# Pivot UI

面向 3D 编辑器的 React 组件库。统一包 `@pivot-ui/react` 提供基础控件、布局、颜色、曲线、集合、资源模板及属性编辑绑定；应用拥有数据、命令、撤销和宿主能力。

本轮 Blender 术语与分层改造收口到 B11。原 UI/GUI 包与兼容适配器已退出，后续开发使用统一入口。真实 C++ / Qt 接入、业务页面和完整编辑器工作区属于应用开发，不是组件库自动生成的功能。

## 开始开发

使用 Node.js `^22.18.0`、`^24.11.0` 或 `>=26.0.0`，pnpm `12.14.0`：

```bash
pnpm install --frozen-lockfile
pnpm dev                 # 统一 Storybook，http://localhost:6009
pnpm dev:demo            # 现有 Vite 示例
pnpm verify              # 格式、类型、demo 与统一 Storybook 生产构建
```

`pnpm dev:interface` 与 `pnpm dev` 指向相同 Storybook。`Foundation / Tokens` 展示明暗主题和完整设计 token；`Foundation / Theme` 展示主题状态；`Property` 展示真实控件与模拟宿主的属性联调。

## 包与职责

| 位置                                                 | 职责                                      |
| ---------------------------------------------------- | ----------------------------------------- |
| [packages/interface](./packages/interface/README.md) | `@pivot-ui/react`：唯一组件源码包         |
| [app](./app)                                         | `@pivot-ui/demo`：Vite 消费与样式提取示例 |
| [panda](./panda/README.md)                           | 唯一 token 源与共享 Panda 配置            |
| [storybook](./storybook)                             | 浏览器展示的主题、Provider 与构建配置     |

库内依赖从 `values / contracts` 向 `foundation / interaction / widgets / layout / templates / property` 逐层组合。布局不猜控件，控件不读引擎对象，模板不负责业务命令。

## 使用

先按[接入指南](./docs/CONSUMING.md)配置源码扫描和 Panda PostCSS。普通受控组合可以先使用本地状态：

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

需要提交、拒绝、撤销边界和异步同步时，使用 `PropertyAccess<T>` 加 `PropertyField<T>`。Mock 只在 Storybook；应用实现相同契约即可先用内存数据驱动 UI，再换成 C++ / Qt 适配层。复杂值由 typed `render` 显式组合，避免恢复 GUIRoot 式的隐式页面生成。

## 文档

- [文档索引](./docs/README.md)
- [组件 API](./packages/interface/README.md)
- [开发与验证](./docs/DEVELOPMENT.md)
- [B11 属性联调与最终接入](./docs/refactor/blender-5.2/B11_INTEGRATION.md)
- [重构台账](./docs/refactor/blender-5.2/LEDGER.md)

React 19、TypeScript、Panda CSS、Radix UI。当前按 workspace 或源码链接消费，不发布预构建 npm 包。许可证：[MIT](./LICENSE)。
