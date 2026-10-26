# 安装与第一个界面

`@pivot-ui/react` 是 React 组件源码包。你可以在本仓库的应用里直接使用，也可以把 `packages/interface` 链接到自己的应用。接入时需要配置消费应用生成 CSS，下面给出完整步骤和可参考的配置文件。

## 运行仓库中的示例

环境要求：Node.js `^22.18.0`、`^24.11.0` 或 `>=26.0.0`，pnpm `12.14.0`，React 和 React DOM `^19.3.1`。

```bash
pnpm install --frozen-lockfile
pnpm dev        # Storybook：http://localhost:6009
pnpm dev:demo   # Vite 应用示例
```

已有同仓库应用可以在依赖中使用 `"@pivot-ui/react": "workspace:*"`。独立应用可以在应用目录执行 `pnpm link ../pivot-ui/packages/interface`；路径按你的目录调整。

## 配置样式

消费应用需要 Panda CSS 和 PostCSS。工作配置可直接查看 [应用的 Panda 配置](../app/panda.config.ts)、[PostCSS 配置](../app/postcss.config.cjs)和[应用入口](../app/src/main.tsx)。关键要求是：

- 继承仓库的 `panda/base.ts`，使用相同主题和样式入口映射。
- 扫描应用源码及 `packages/interface/src/**/*.{ts,tsx}`。
- 在应用入口导入一次 `@pivot-ui/react/panda.css`，声明 CSS 层级顺序。
- 在构建前生成库内样式模块，并让应用自己的 PostCSS 运行 Panda 提取。

```bash
# 在组件库仓库中执行
pnpm --filter @pivot-ui/react panda
```

`panda.css` 只有 CSS 层级声明，组件规则由源码扫描生成。独立应用需要能够访问本仓库的共享 Panda 配置。更多说明见[主题与样式配置](./migration/README.md)。

控件只使用两档密度：紧凑 `20/24px`、常规 `32/36px`，圆角 `4/6/8` 和字号 `11/12/14` 来自语义 token。不要在应用中新增 22/27/28/30px 这类一次性控件高度；需要检查时运行 `pnpm audit:styles` 和 `pnpm audit:stories`，或直接运行 `pnpm verify`。

## 先使用普通 React 状态

`value` 是当前显示值，`onValueChange` 请求你更新它。这与普通 React 受控输入相同。

```tsx
import { useState } from 'react'
import { Input, Section, ThemeProvider, TooltipProvider } from '@pivot-ui/react'

export function App() {
  const [name, setName] = useState('Camera')
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Section title="Object">
          <Input aria-label="Object name" value={name} onValueChange={setName} />
          <p>Current name: {name}</p>
        </Section>
      </TooltipProvider>
    </ThemeProvider>
  )
}
```

如果你传入固定 `value` 而不接受回调，控件不会自行改变应用数据。可以使用 `defaultValue` 的控件允许内部保存状态；需要与其它组件同步时，优先使用受控值。

## 主题和提示

`ThemeProvider` 提供主题状态。`useTheme()` 返回 `preference`、`resolvedTheme` 和 `setPreference`：前者可以是 `light`、`dark` 或 `system`，实际显示主题为 `light` 或 `dark`。

```tsx
import { Button, useTheme } from '@pivot-ui/react'

export function ThemeToggle() {
  const { resolvedTheme, setPreference } = useTheme()
  return <Button onClick={() => setPreference(resolvedTheme === 'dark' ? 'light' : 'dark')}>Switch theme</Button>
}
```

默认主题会读取浏览器偏好并跟随系统设置。需要局部主题或自己保存偏好时，使用 `createThemeStore` 并传给 Provider。局部区域还需要对应的主题 class 或外观适配；弹出的内容会读取所属 Provider 的主题。

`Tooltip` 需要外层有 `TooltipProvider`。确认框、通知和拖放各有自己的 Provider，只在使用相应功能的区域添加。详见[浮层与消息](./refactor/blender-5.2/B04_OVERLAYS.md)和[集合与导航](./refactor/blender-5.2/B07_COLLECTIONS.md)。

## 需要保存和撤销时

普通 `useState` 组合适合即时编辑。需要区分编辑中的预览、保存成功和保存失败时，可以使用控件的提交回调，或让 `PropertyField` 连接应用提供的 `PropertyAccess`。

`PropertyAccess` 是一个接口：应用提供当前数据、订阅更新和保存行为，可以连接内存状态、服务器或桌面程序。文本、数字、布尔和枚举有内置显示；复杂值用 `render` 明确选择组件。通过 React 组合这些字段来安排页面，详见[属性数据与提交](./refactor/blender-5.2/B11_INTEGRATION.md)。

资源查询、文件选择、屏幕取色、剪贴板和预设保存也由应用传入相应服务。把服务方法连接到需要使用的浏览器、服务器或桌面接口后，对应操作即可使用；没有提供的能力保持不可用。
