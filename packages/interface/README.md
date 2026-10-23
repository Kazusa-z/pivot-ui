# @pivot-ui/react

Blender 5.2 LTS 对齐重构的统一源码包。B01 提供基础属性契约、编辑会话、宿主能力接口和 Storybook Mock；B02 提供主题状态、按钮、反馈、排版、快捷键展示和图标；B03 提供布局、字段结构、折叠组合、滚动和可调整分隔布局；B04 当前新增浮层、菜单、对话框和应用拥有的确认/通知服务。尚未迁移的组件继续使用 `@pivot-ui/editor`、`@pivot-ui/gui`，已迁移的旧入口仅作兼容适配。各批验收状态以实施台账为准。

## 入口与依赖

| 入口                                                             | 内容                                                                 | 依赖边界                                   |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| `@pivot-ui/react`                                                | 当前公开组件、主题 API、值和契约的显式汇总                           | 不导出 Mock 或 Storybook 组件              |
| `@pivot-ui/react/values`                                         | `PropertyValue`、`ChoiceValue`、`ChoiceOption`、`NumericConstraints` | 纯 TypeScript                              |
| `@pivot-ui/react/contracts`                                      | 属性描述、访问、快照、编辑会话和可选宿主能力                         | 仅依赖 values，不依赖 React、DOM 或 Qt     |
| `@pivot-ui/react/panda.css`                                      | Panda CSS layer 入口                                                 | 消费端需配置 Panda PostCSS 与源码扫描      |
| `@pivot-ui/react/theme`                                          | 主题 store、Provider、hooks 和可选浏览器适配器                       | 不依赖旧 ui/gui 包；导入不读写浏览器状态   |
| `@pivot-ui/react/styling/css`、`/styling/jsx`、`/styling/tokens` | 直接指向生成的 Panda 运行模块                                        | 不经二次 re-export；需先生成 styled-system |
| `@pivot-ui/react/styling/types`                                  | Panda 的 SystemStyleObject、RecipeVariantProps 等类型                | 仅类型，不作为运行时模块导入               |

当前只定义 string、number、boolean 和 string/number enum。颜色、曲线、资源引用的专用模型分别在 B08–B10 实现。数值硬范围与软范围分开；step、dragStep、precision 是描述元数据，数值交互算法属于 B06。

`ChoiceOption.key` 是 UI 选择身份，`value` 是属性值。从 key 查找对应 option 后取原始 value，不通过字符串猜测数字；`'001'`、`'1'`、`1` 因而可以保持不同身份。

## 主题与视觉基础

`ThemeProvider` 和 `useTheme()` 共享同一 store。`preference` 保留 `light | dark | system`，`resolvedTheme` 始终是 `light | dark`；系统从暗色切到明色不会把用户的 `system` 偏好改成 `light`。同一 Provider 下的消费者和使用同一 store 的多个 Provider 自动同步。

```tsx
import { Button, Text, ThemeProvider, useTheme } from '@pivot-ui/react'

function ThemeSwitch() {
  const { preference, resolvedTheme, setPreference } = useTheme()
  return (
    <>
      <Text>
        Preference: {preference}; actual: {resolvedTheme}
      </Text>
      <Button onClick={() => setPreference('system')}>Follow system</Button>
    </>
  )
}

export function Example() {
  return (
    <ThemeProvider>
      <ThemeSwitch />
    </ThemeProvider>
  )
}
```

默认 Provider 使用浏览器主题存储、系统主题监听和文档 class 适配器。需要模拟或接入宿主时，创建 `createThemeStore({ initialPreference, storage, system, appearance })` 并传给 Provider。三个能力可分别省略或替换；读取快照不修改 DOM，连接/断开负责订阅和清理。组件不会自行接入 Qt。

| 层与组件                                                 | 职责                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| foundation：Text、Bold、Title、Link                      | HTML 语义通过 `as` 选择，视觉字号通过 `size` 选择                     |
| foundation：通用图标、文件图标、Arrow                    | 统一 SVG props、ref 和可访问名称；应用选择领域文件图标                |
| widgets/buttons：Button、ActionButton、ActionButtonGroup | 共享 disabled/loading/async 内核；图标按钮提供名称，Group 仅分组容器  |
| widgets/display：Badge、Tag                              | Badge 只展示；Tag 的原生移除按钮调用 `onRemove`，由父组件决定是否删除 |
| widgets/display：Kbd、KbdGroup                           | 使用纯快捷键格式化函数展示按键/手势，不注册快捷键                     |
| widgets/feedback：Callout、Progress、Spin                | 明确信息语义、进度范围和加载状态                                      |

Button 的 `async` 只是 Promise 便利回调；`onAsyncError` 接收失败，业务命令、持久化和撤销仍由应用处理。外部 `loading` 与内部等待状态共同禁用激活。`asChild` 的自定义子组件必须向真实 DOM 转发 props/ref；带 `href` 的子元素按链接处理，其余自定义包装按按钮处理并默认 `type="button"`，避免意外提交表单。

Callout 的 `severity` 选择视觉等级，`role` 决定普通说明、`status` 或 `alert`，不会把所有静态说明都设为实时告警。Progress 的 `max` 必须为正有限数，非法范围退回 100；空值表示不定进度，确定进度按 `value / max` 显示。Spin 支持名称或装饰用途，并尊重减少动态效果偏好。

全局 token 与预设继续以仓库 `panda/` 为唯一来源。包内直接导入生成的 `styled-system`；消费端使用 styling 子入口，并将统一包 `src` 加入 Panda 扫描。demo 和三个 Storybook 都使用相同预设，只加载一个 layer 入口，详见[接入说明](../../docs/CONSUMING.md)。

## 布局与字段结构

`Flex` 的五个布局属性各有唯一含义，不读取业务值：

| 属性        | 值与默认值                                                      | 含义                            |
| ----------- | --------------------------------------------------------------- | ------------------------------- |
| `direction` | `row`（默认）、`column`、`row-reverse`、`column-reverse`        | 主轴方向                        |
| `gap`       | `none`（默认）、`xxs`、`xs`、`sm`、`md`、`lg`                   | 间距分别为 0、2、4、8、12、16px |
| `align`     | `stretch`（默认）、`start`、`center`、`end`、`baseline`         | 交叉轴对齐                      |
| `justify`   | `start`（默认）、`center`、`end`、`between`、`around`、`evenly` | 主轴分布                        |
| `wrap`      | `nowrap`（默认）、`wrap`、`wrap-reverse`                        | 换行方式                        |

`orientation`、`flexDirection`、`spacing`、`justifyContent`、布尔 `wrap` 和 `align="v|h|both"` 只留在旧包适配器。新代码使用上述 API；宽高、边距等交给 `css` 或原生 `style`。旧适配器保持原来的默认换行行为。

`Separator` 是基础分隔线，支持 `orientation="horizontal|vertical"`，默认横向且具有 `separator` 语义；`decorative` 隐藏其辅助技术语义。竖线需要父容器提供高度。`SectionDivider` 是水平线与文字的组合，其 `children` 保持原有语义；需要章节标题时显式传入 `Title` 或原生 heading，不把文本塞进 `Separator`。

`PropertyRow` 只管理两列或纵向布局。`PropertyLabel`、`PropertyControl`、`PropertyDescription` 显式组合，不遍历子元素、不查找 DOM，也不推断哪个控件应获得标签。单控件的 `id` 和帮助文本 ID 放在真实控件上：

```tsx
import { useId, useState } from 'react'
import { PropertyRow, PropertyLabel, PropertyControl, PropertyDescription } from '@pivot-ui/react'

export function NameRow() {
  const id = useId()
  const [name, setName] = useState('Camera')
  return (
    <PropertyRow labelWidth="100px">
      <PropertyLabel htmlFor={id}>Name</PropertyLabel>
      <PropertyControl association="control">
        <input
          id={id}
          aria-describedby={`${id}-help`}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
      </PropertyControl>
      <PropertyDescription id={`${id}-help`}>Shown in the scene hierarchy.</PropertyDescription>
    </PropertyRow>
  )
}
```

多控件组使用 `<PropertyLabel id={labelId}>` 与 `<PropertyControl association="group" labelledBy={labelId}>`，并为每个输入提供自身名称，例如 X、Y、Z。组说明通过 `aria-describedby` 放在 `PropertyControl` 上；单控件说明放在输入本身。`association="none"` 仅布局，不生成 group 语义。`columns` 仅接受 1–4；颜色、资源、粒子等专用列定义由消费组件通过 `css` 显式配置。无标签时设置 `PropertyRow withoutLabel`；`direction="column"` 适合窄侧栏。行的 ref 指向外层 div，不会代替控件 ref。

`PropertyLabel` 的 `startSlot` / `endSlot` 可放独立动作，标签 ID 只命名文字，不把动作名称拼入字段名称。`ReadonlyValue` 展示已格式化的 children，支持 `code` 和 `emptyText`；null、undefined、空字符串使用占位，数值 0 保留。`ImagePreview` 保留原生 img 属性与 ref，要求显式 `alt`，默认 `objectFit="contain"`、最大宽度 100%；资源解析、加载与失败策略由消费端负责。

旧 `FormItem` 目前默认形成命名组。直接组合单控件并需要点击标签聚焦时，显式选择 `association="control"`，通过 render prop 把生成的 `id` 和 `aria-describedby` 传给真实控件；不再依赖自动 clone 或 DOM 扫描：

```tsx
import { FormItem } from '@pivot-ui/gui'

export function LegacyNameRow() {
  return (
    <FormItem label="Name" info="Shown in the scene hierarchy." association="control">
      {({ id, 'aria-describedby': describedBy }) => (
        <input id={id} aria-describedby={describedBy} defaultValue="Camera" />
      )}
    </FormItem>
  )
}
```

已有 `FormItemInput` 等适配器会完成单控件关联；组合字段负责各子控件名称。旧 `fieldColumn="color|number|asset|assetPreview|particle|particlePair"` 已移出通用行布局，专用网格在相应消费者中定义。

## ScrollArea：布局与滚动视口

`ScrollAreaRoot` 的 ref 指向外层布局 div，`ScrollAreaViewport` 的 ref 指向可执行 `scrollTo()` 的滚动元素。`onScroll` / `onScrollCapture` 属于 Viewport；Root 的类型不接受这两个事件。

| 入口     | 属性                                                           | 行为                                                                            |
| -------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Root     | `sizing`: `fill`、`content`                                    | 默认 `fill` 填满有明确高度的父容器；`content` 随内容增长，并受 `maxHeight` 约束 |
| Root     | `scrollbars`: `vertical`、`horizontal`、`both`                 | 启用原生滚动轴，默认 `both`                                                     |
| Root     | `type`: `hover`、`always`、`scroll`、`auto`；`scrollHideDelay` | 滚动条可见策略，默认 `hover`                                                    |
| Root     | `scrollbarVariant`: `subtle`、`track`；`shadows`               | 默认轻量滚动条、无边缘阴影；阴影按实际剩余内容更新                              |
| Viewport | `contentLayout`: `block`、`intrinsic`                          | 默认 `block` 适合视口内换行；`intrinsic` 用于横向内容的固有尺寸                 |
| Viewport | 原生事件、`tabIndex`、`css`、ref                               | 默认 `tabIndex=0`，保留浏览器键盘和滚动行为                                     |

```tsx
import { useRef, useState } from 'react'
import { ScrollAreaRoot, ScrollAreaViewport } from '@pivot-ui/react'

export function ScrollExample() {
  const viewport = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  return (
    <>
      <button type="button" onClick={() => viewport.current?.scrollTo({ top: 0 })}>
        Back to top
      </button>
      <div style={{ height: 220 }}>
        <ScrollAreaRoot scrollbars="vertical" type="always" shadows>
          <ScrollAreaViewport
            ref={viewport}
            aria-label="Properties"
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
            {Array.from({ length: 30 }, (_, index) => (
              <p key={index}>Property {index + 1}</p>
            ))}
          </ScrollAreaViewport>
        </ScrollAreaRoot>
      </div>
      <output>{scrollTop}</output>
    </>
  )
}
```

便利组件 `ScrollArea` 使用同一实现：外层属性直接传入，滚动属性放入 `viewportProps`，滚动 ref 放入 `viewportRef`。例如 `<ScrollArea sizing="content" css={{ maxHeight: '180px' }} viewportProps={{ 'aria-label': 'Details' }}>…</ScrollArea>`。横向或双向内容可设 `viewportProps={{ contentLayout: 'intrinsic' }}` 并给内容明确宽度。旧 `ScrollArea` 适配器把 `type/dir/scrollHideDelay` 送到 Root，其余旧事件与样式仍送到 Viewport，旧 ref 也指向 Viewport。

## 折叠与标题动作

`Accordion` 保留 Radix 的 `type="single|multiple"`、`value/defaultValue` 和 `onValueChange` 契约。每个 `AccordionItem` 需要稳定的 `value` 与非交互 `title`；按钮、复选框等标题动作放入 `actions`，与折叠 trigger 并列，点击动作不会隐式折叠。`headingLevel` 支持 2–6，默认 3；`triggerProps` 和 `contentProps` 分别承接对应部件的原生属性与 ref。

`Collapsible` 使用 `open/defaultOpen/onOpenChange`，默认收起。`Section` 是同一实现的布局入口，默认展开。两者支持 `triggerMode="title|icon"`、`triggerLabel`、`actions`、`size="sm|md"` 和 `variant="surface|subtle|transparent"`；`collapsible={false}` 固定展开并移除折叠按钮。`disabled` 禁用折叠 trigger，独立 actions 是否可用由调用方决定。标题只放静态内容，动作不嵌入按钮内部。

```tsx
import { Button, Section } from '@pivot-ui/react'

export function TransformSection() {
  return (
    <Section
      title="Transform"
      actions={
        <Button size="sm" onClick={() => console.log('Reset requested')}>
          Reset
        </Button>
      }>
      <p>Property rows belong here.</p>
    </Section>
  )
}
```

## ResizableSplit：像素尺寸与请求

`ResizableSplit` 的 `primary` 是可调整尺寸的主面板，`children` 是可选的剩余面板。`orientation="horizontal"` 调整主面板宽度，`vertical` 调整高度；`primarySide="start|end"` 决定主面板位置，横向遵循 RTL。外层 ref 指向布局根节点；`primaryRef` 指向主面板。

所有尺寸都是 CSS 像素：默认 `defaultSize=240`、`minSize=80`、`maxSize=960`、`minSecondarySize=80`，分隔条占 6px。有剩余面板时，上限同时受容器可用空间约束；空间不足以满足最小值时，有效最小值会降低到有效上限，避免把另一面板挤出容器。非有限数回退到内部或默认值，最小尺寸不低于 0，声明的上限不低于声明的下限。父容器应提供明确宽高。

```tsx
import { useState } from 'react'
import { ResizableSplit } from '@pivot-ui/react'

export function InspectorSplit() {
  const [width, setWidth] = useState(240)
  return (
    <div style={{ width: 720, height: 300 }}>
      <ResizableSplit
        primary={<aside>Inspector</aside>}
        size={width}
        minSize={160}
        maxSize={400}
        minSecondarySize={200}
        onSizeChange={setWidth}
        separatorLabel="Resize inspector">
        <main>Editor</main>
      </ResizableSplit>
    </div>
  )
}
```

受控 `size` 是显示值，`onSizeChange(next)` 只是尺寸请求，父组件需要回写才会改变显示。`onSizeCommit(next)` 在指针释放或一次键盘调整后报告最终请求值，即使父组件拒绝回写也不把它伪装为已接受的尺寸。非受控使用 `defaultSize` 并在内部保存请求值。

分隔条可聚焦：方向键按 `keyboardStep`（默认 10px）调整，Shift 放大 10 倍，Home/End 到有效边界。Escape、pointer-cancel、失去指针捕获、窗口失焦、拖动期间方向/范围/禁用等配置变化会取消操作，请求恢复拖动起点并调用 `onResizeCancel(reason)`；取消不调用 `onSizeCommit`。卸载清理指针捕获与监听，不调用业务回调。范围变化后的显示始终按最新有效边界裁剪。

省略 `children` 即独立区域模式，根节点沿调整轴占主面板尺寸加 6px，不使用剩余面板约束。`primaryAsChild` 省略额外主面板包装，但仍保留外层布局与分隔条；`primary` 必须是一个非 Fragment 元素，并转发原生 props/ref。尺寸由布局控制，子元素自己的 width/height 不覆盖调整结果。

旧 `ResizablePanel` 仅作适配，`range.min/max` 是明确像素边界，默认尺寸现在为 240px、范围为 80–960px，不再按首次测量值生成 ±50px 范围。旧 `asChild` 映射到 `primaryAsChild`，对应 ref 指向实际主面板元素。

## 浮层、菜单与应用服务

U24 的三个菜单家族位于 `widgets/menus`；U25–U27 的 Popover、Tooltip、HoverCard 位于 `widgets/overlays`；U28–U29 的 Dialog、AlertDialog 与确认服务位于 `widgets/dialogs`；U30 的通知服务、Provider、Toaster 和 ToastView 位于 `widgets/notifications`。从包根导入公开部件及对应 Props，旧 UI 入口继续作为适配层保留到 B11。

Popover、Tooltip、HoverCard 的便利版本用 `rootProps` 管开关行为、`triggerProps` 管触发元素、`portalProps` 管容器、`contentProps` 管定位/样式/原生内容事件。也可直接使用各自 Root、Trigger、Portal、Content、Arrow 等部件；Popover 另有 Anchor、Title、Description、Close。Dialog/AlertDialog 同样拆分配置，并提供 Overlay、Title、Description 和各自的关闭/确认部件。菜单的 DropdownMenu、ContextMenu、Menubar 保留不同触发和键盘行为，共享 item 的视觉及组合。

TooltipProvider 必须由应用或独立组合边界统一提供，新旧 Tooltip 均不自行创建 Provider。共享 Storybook 装配不代替实际应用装配。portaled 内容读取局部 ThemeProvider 的解析主题，容器位置不会使它退回文档的另一套主题。

`PopoverRoot keepMounted` 保留状态与 DOM，并在关闭时通过 React Activity 暂停子树 effects/ref，释放焦点层和 modal 滚动锁；重新打开恢复同一内容。旧 `forceRender` 映射到这个契约，不再切换到 DocumentFragment。保持挂载不代表后台 effects 持续运行；调用方应提供稳定的 portal container。

确认服务由应用创建：`createConfirmationService()` 配合一个 `<ConfirmationProvider service={service}>`，组件使用 `useConfirmation().request(options)`。结果为 confirmed/cancelled/closed/unmounted/unavailable，重复终结只产生同一个结果。**旧 `showAlert(props)` 必须改成 `showAlert(props, service)`**，返回 request 的 `result` 可等待；旧 zIndex/actionable 不再定制这个统一宿主。需要自定义展示时使用显式 AlertDialog 组合。

通知使用 `<NotificationProvider service={service} hostProps={...}>` 与 `useNotifications()`；service 可由应用显式创建并注入，也可由 Provider 自己拥有。相同 id 更新同一通知，同一 service 只展示一个宿主；clear/dismiss/卸载使过期异步 UI 更新失效，不取消业务 operation。旧 `toast`/`Toaster` 仅作第三方调度的兼容入口。

完整部件清单、依赖、配置示例、服务结果和破坏性迁移说明见 [B04 接入文档](../../docs/refactor/blender-5.2/B04_OVERLAYS.md)。

嵌套浮层使用共享层级上下文，跨 Portal 保留父子顺序；外部 Radix Content 可在 Portal 内使用 `OverlayLayer asChild` 接入主题与层级。它不额外创建 DOM，也不管理开关或焦点；数字 `style.zIndex` 可指定本层基准。

## 编辑会话

每个 `PropertyAccess<T>` 固定到一个 `{ objectId, propertyId }`。实现方提供稳定、不可变的 `getSnapshot()` 和 `subscribe()`；调用方可使用 React 的 `useSyncExternalStore`，契约本身不导入 React。

```ts
import type { PropertyAccess } from '@pivot-ui/react/contracts'

async function setNumber(access: PropertyAccess<number>, next: number) {
  const started = access.begin()
  if (started.status === 'unavailable') return started

  const changed = started.session.change(next)
  if (changed.status === 'invalid') {
    await started.session.cancel()
    return changed
  }
  return started.session.commit()
}
```

实际连续操作在开始时调用一次 `begin()`，操作中调用多次 `change()`，最后调用一次 `commit()` 或 `cancel()`。`getEditEndAction()` 固定事件语义：Enter、文本失焦、pointer-up、step 提交；Escape、pointer-cancel、拖动时窗口失焦、对象切换、卸载、禁用、只读等取消尚未提交的编辑。

- `snapshot.value/revision` 是权威状态；`snapshot.edit.previewValue` 是即时预览。延迟不会阻止预览更新。
- 会话捕获 target、初值和 baseRevision。一次成功提交只产生一笔事务，无变化不产生历史。
- 第一次终结请求生效，重复 commit/cancel 返回同一个 Promise。已经提交的请求继续针对原对象，取消或组件卸载不能撤回它。
- 编辑中收到外部新版本会取消草稿并接受外部状态。过期确认不能覆盖更新的权威版本或新会话。
- 拒绝与冲突结果携带当时的权威值和原因；不会盲目恢复旧的初值。

订阅者收到通知后应读取快照并更新展示，不应把通知当作一次新的用户操作。业务命令、持久化、真实撤销栈和 Qt 传输由未来应用适配层实现。

## 宿主能力

`HostCapabilities` 目前定义可选的 clipboard、preferences、files 接口。缺失表示不可用，调用方提供禁用或提示；组件不得自行调用浏览器或 Qt API 冒充已接入能力。文件引用是普通 `{ uri, name }` 数据，不携带 Qt 实例。Storybook 的剪贴板仅写入示例内存。

## Playground 与验证

```bash
pnpm dev:interface                    # http://localhost:6009
pnpm --filter @pivot-ui/react typecheck
pnpm --filter @pivot-ui/react build-storybook
pnpm verify                          # 完整仓库检查与三个 Storybook 构建
```

`Contracts / Property editing` 提供生命周期、延迟/拒绝、编辑中外部更新、过期确认、对象切换、可编辑状态/宿主能力、选择身份等场景。每个场景可 Reset，并展示快照与结果。使用原生 HTML 控件作为契约演示，不提前实现 B05/B06 的 PropertyField。

Mock 位于 `stories/support/mock-property-access.ts`，只服务示例与临时验证；包出口不包含它。它模拟订阅、会话、延迟、拒绝、外部更新及事务计数，不代表真实后端。

类型检查包含生产源码、全部 stories/support、Panda/PostCSS/Storybook 配置，以及仅 ES2022、无 React/DOM/Node 环境类型的 contracts/values 检查。Panda 在 dev、typecheck、build 前生成 `styled-system`；该目录与构建输出不提交。

进度与验证证据见 [实施台账](../../docs/refactor/blender-5.2/LEDGER.md)，架构边界见 [重构方案](../../docs/architecture/BLENDER_5_2_REFACTOR_PLAN.md)。
