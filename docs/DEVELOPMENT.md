# 运行示例与调试

Storybook 展示各组件的独立用法，`app` 展示在 Vite 应用中消费组件和生成样式。先在独立故事里确认组件行为，再放入应用布局，通常更容易定位数据或样式问题。

## 常用命令

使用 Node.js `^22.18.0`、`^24.11.0` 或 `>=26.0.0`，pnpm `12.14.0`。

| 命令                               | 用途                                             |
| ---------------------------------- | ------------------------------------------------ |
| `pnpm install --frozen-lockfile`   | 安装锁定的依赖                                   |
| `pnpm dev` 或 `pnpm dev:interface` | 在端口 6009 启动 Storybook                       |
| `pnpm dev:demo`                    | 启动 Vite 应用示例                               |
| `pnpm typecheck`                   | 检查组件、示例、应用和构建配置的 TypeScript 类型 |
| `pnpm build:demo`                  | 构建应用示例                                     |
| `pnpm build:storybook`             | 构建可静态部署的 Storybook                       |
| `pnpm verify:quick`                | 检查格式和类型                                   |
| `pnpm audit:styles`                | 扫描裸 px 的控件尺寸、圆角和字号                 |
| `pnpm audit:stories`               | 检查 StoryPage、Overview 和旧 story 依赖         |
| `pnpm verify`                      | 检查格式、类型、两条审计并构建应用和 Storybook   |
| `pnpm clean`                       | 清理生成的样式模块、构建产物和缓存               |

## 先检查数据回传

遇到“拖动了却没有变化”，先检查父组件是否在 `onValueChange` 后传回新的 `value`。如果你希望控件不能修改值，请显式设置 `readOnly`，而不是通过忽略回调模拟只读。

需要异步保存的组件通常区分 `onValueChange` 和 `onValueCommit`：前者更新正在编辑的预览，后者等待一次编辑的保存结果。不要在每次指针移动时都创建一条撤销记录。

对象切换时更新 `resetKey`，即使两个对象的数据一样。把 `resetKey` 做成稳定的对象 ID、版本号或 `useMemo` 结果，不要每次 render 都创建一个新对象。

## 找到相应故事

Storybook 的主题工具栏切换明暗主题。`Foundation / Tokens` 展示可用颜色和尺寸，`Foundation / Theme` 展示主题状态，`Property` 展示控件与应用数据的连接。

故事中的模拟服务只用于演示，不属于公开包导出。你可以阅读它们理解接口，再在应用中实现自己的服务。按场景查找故事见[交互示例索引](./refactor/blender-5.2/LEDGER.md)。

## 样式没有出现时

组件源码使用 Panda CSS。类型检查和构建脚本会先生成 `styled-system`；消费应用仍然需要扫描组件源码并生成自己的 CSS。

```bash
pnpm --filter @pivot-ui/react panda
```

自定义样式从 `@pivot-ui/react/styling/css`、`/styling/jsx` 或 `/styling/tokens` 导入。保持 `css()`、`styled()` 和 recipe 定义可以被源码扫描看到。动态数值用原生 `style` 或 CSS 变量；不要动态拼接无法提取的样式代码。

新增控件尺寸、圆角或字号时先运行 `pnpm audit:styles`。审计允许图标/指示线、内容尺寸和文档化例外；其余裸 px 应改成 `sizes`/`radii`/`fontSizes` token。Storybook story 改动后运行 `pnpm audit:stories`，确保仍使用 `StoryPage`、只有一个 `Overview`，且没有 `ContractFrame` 或原生演示控件。

如果只有生产构建缺样式，检查消费应用的扫描路径和 PostCSS 配置，而不是只看开发页面。更具体的排查步骤见[样式问题排查](./migration/LEDGER.md)。

## 组合后检查交互

至少尝试键盘操作、鼠标拖动、窄窗口、长文本和明暗主题。对异步保存，尝试失败后重试、保存期间切换对象、组件卸载以及外部数据更新。

浏览器控制台中的 React 或可访问性提示通常指向组合问题，例如嵌套按钮、缺少对话框标题或没有转发 ref 的 `asChild` 子元素。参见[键盘、窄窗口与可访问性](./migration/VISUAL_REGRESSION.md)。

## 阅读源码

公开入口位于 `packages/interface/src/index.ts`。`widgets` 放独立控件，`templates` 放多个控件的组合，`layout` 放布局，`property` 连接应用数据。只需要类型和算法时查看 `values`；需要实现资源或属性接口时查看 `contracts`。

应用负责加载、保存、撤销、资源服务和外部程序通信。不要把服务器连接或引擎实例塞进控件值。更多接法见[属性数据与提交](./refactor/blender-5.2/B11_INTEGRATION.md)。
