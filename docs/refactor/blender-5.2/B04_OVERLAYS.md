# B04 浮层、菜单与服务接入

> B11 收口说明：本文保留该批迁移记录；旧适配器、旧包与多 Storybook 指令已退出。当前属性联调和消费方式以 [B11 最终指南](./B11_INTEGRATION.md) 为准。历史验证数字不代表当前构建。

更新日期：2026-10-23。本文记录 B04 的实现归属与调用迁移，不代表批次已经验收、提交或推送；当前状态与验证证据以 [实施台账](./LEDGER.md) 为准。批次范围见 [BATCHES](./BATCHES.md)。

## 组件归属与依赖

| 编号 | 新归属                                                                        | 公开入口与职责                                                                                                                   | 过渡入口                                              |
| ---- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| U24  | `widgets/menus`                                                               | DropdownMenu、ContextMenu、Menubar 三类 Root/Trigger/Portal/Content 与各自菜单部件；共享视觉和 item 组合，保留各自触发与键盘行为 | 旧 `Menu` 目录适配器与相关深层入口                    |
| U25  | `widgets/overlays/Popover`                                                    | 可交互浮层，Root 管开关和保持挂载；Trigger/Anchor/Portal/Content/Close/Title/Description/Arrow 显式组合                          | `Popover`、`PopoverCloseTrigger`                      |
| U26  | `widgets/overlays/Tooltip`                                                    | 非交互提示；共享 Provider，Root 管开关/延迟，Content 管位置/样式                                                                 | `Tooltip`，调用边界补共享 Provider                    |
| U27  | `widgets/overlays/HoverCard`                                                  | 非必要信息的 hover/focus 预览；Root/Trigger/Portal/Content/Arrow                                                                 | `HoverCard`                                           |
| U28  | `widgets/dialogs/Dialog`                                                      | 对话框 Root/Trigger/Portal/Overlay/Content/Title/Description/Close 与便利组合                                                    | `Dialog`、`DialogTrigger`、`DialogCloseTrigger`       |
| U29  | `widgets/dialogs/AlertDialog`、`confirmation-service`、`ConfirmationProvider` | 确认语义与 Action/Cancel；应用拥有的确认队列和结果                                                                               | `AlertDialog`；`showAlert` 保留名称但必须注入 service |
| U30  | `widgets/notifications`                                                       | NotificationService 与 Provider/host，ToastView 拥有展示；第三方仅负责通知调度                                                   | `toast`、`Toaster`                                    |

这些入口从 `@pivot-ui/react` 导入，每个公开部件具有对应 `XxxProps`。目录路径表示内部归属，不新增任意源码深层包导出。旧 `@pivot-ui/editor` 及 `@pivot-ui/gui` 消费者仍可经过适配层，B11 才移除旧包；新包不反向依赖它们。

- 菜单分别依赖 Radix dropdown-menu、context-menu、menubar，复用 Kbd 展示、Tabler 图标和同一套菜单样式。
- 浮层分别依赖 Radix popover、tooltip、hover-card；Popover 通过现有 React Activity 和 use-controllable-state 管理保持挂载，不添加第二套定位或焦点引擎。
- Dialog/AlertDialog 分别依赖对应 Radix primitive，复用按钮和 surface。确认服务的 options 接受 ReactNode，因此属于 React widgets，不放入纯 `contracts`/`values`。
- 通知通过 react-hot-toast 调度适配层隔离第三方 API，自有 ToastView 负责主题和可访问展示，React portal 负责宿主内容，不逐条创建 React root。
- surface 通过 `useOverlayTheme` 读取当前 Provider 的解析主题，直接附加到 portaled 内容；Panda 继续扫描新源码，覆盖样式在生成 class 前合并。

## 浮层配置分层

Popover、Tooltip、HoverCard 的便利版本均使用 `trigger`、`children` 和四个配置对象：

| 配置           | 归属                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `rootProps`    | `open/defaultOpen/onOpenChange`，以及所属 primitive 的开关行为；Popover 的 `modal/keepMounted`、Tooltip 的延迟、HoverCard 的开关延迟 |
| `triggerProps` | 触发元素的属性和事件；trigger 必须是一个向真实 DOM 转发 props/ref 的元素                                                             |
| `portalProps`  | `container`，决定内容的 DOM 宿主                                                                                                     |
| `contentProps` | `side/align/sideOffset` 等定位、内容事件、`css/className/style`；便利组件的 ref 指向 Content                                         |

可以直接组合部件，不需要为了改变定位或 portal 容器而把所有属性放到 Root：

```tsx
import {
  Button,
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverTitle,
  PopoverClose,
} from '@pivot-ui/react'

export function PropertyPopover() {
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <Button>Properties</Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent side="bottom" align="start" sideOffset={6}>
          <PopoverTitle>Properties</PopoverTitle>
          <input aria-label="Name" defaultValue="Camera" />
          <PopoverClose asChild>
            <Button>Close</Button>
          </PopoverClose>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
}
```

`PopoverContent` 还支持 `compact` 与 `constrainSize`；前者去掉默认内边距，后者按 trigger 宽度与可用高度约束。一般表单使用 Popover；Tooltip 只提供补充提示，HoverCard 用于非必要预览，不能把关键动作或唯一说明藏进预览里。

### TooltipProvider 的边界

Tooltip 不再自行创建 Provider。应用根或一个独立组合边界提供共享 TooltipProvider，协调多个 trigger 的 delay/skip-delay；新旧 Tooltip 都需要这个边界。共享 Storybook decorator 已负责示例装配，实际应用应显式装配：

```tsx
import type { ReactNode } from 'react'
import { TooltipProvider } from '@pivot-ui/react'

export function TooltipBoundary({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={400} skipDelayDuration={300}>
      {children}
    </TooltipProvider>
  )
}
```

需要局部调整时，把 `delayDuration` 或 `disableHoverableContent` 放在具体 Tooltip 的 `rootProps`。位置、aria-label 和原生内容事件属于 Content，不再错误地转发给 Root。

### Popover 保持挂载

默认关闭会卸载内容。`PopoverRoot keepMounted` 或便利版本 `rootProps={{ keepMounted: true }}` 保留同一个 portal 目标中的 DOM 和 React state；React Activity 在隐藏时暂停子树 effects 并断开 ref，重新打开后恢复。隐藏内容不可点击或聚焦，焦点层、外部页面屏蔽和 modal 滚动锁不应继续生效。组件真正卸载仍会释放其内容和订阅。

这不是后台持续运行的 effect 宿主。依赖 effect 的后台任务应由应用拥有；不应把需要持续显示的外部 portal 内容放入隐藏子树。旧 Combobox 已把选中标签移回 trigger 区域，避免标签随隐藏浮层一起消失。

旧 `forceRender` 和 Popover 的兼容 `forceMount` 映射到该生命周期，不再在 document body 与 DocumentFragment 之间切换。新 API 不公开原始 `forceMount` 作为保持挂载开关。调用方主动更换 `portalProps.container` 不属于状态保持承诺，应尽量提供稳定容器。

## 菜单与对话框

### Portal 层级

各 Content 通过 React context 传递当前层级，默认首层为 50，子浮层增加 10；这一关系跨 Portal 保留。Dialog 内的菜单、子菜单、Popover，以及 Popover 内再打开 Dialog，都使用同一规则。局部主题也直接附加在内容节点上。

接入其它 Radix 或第三方浮层时，在其 Portal 内用 `OverlayLayer asChild` 包装实际 Content。它只负责层级和上下文，不创建 DOM 容器、不管理开关或焦点；必须传入单个能转发原生 props/ref 的真实元素，不能传 Fragment。例如旧 Select 在本批以此接入，新 Select 的业务重构仍属于 B05。

```tsx
<SelectPrimitive.Portal>
  <OverlayLayer asChild>
    <SelectPrimitive.Content>{children}</SelectPrimitive.Content>
  </OverlayLayer>
</SelectPrimitive.Portal>
```

数字 `style.zIndex` 可作为明确基准，内建 Content 的数字 `css.zIndex` 同样参与计算；子层继续在该基准上增加 10。`var()`、`calc()` 或响应式 CSS 对象无法静态推导数值，使用此类覆盖时需要另外提供明确的数字层级基准。

Panda 样式必须能被静态抽取。把样式藏在 `contentProps` 等嵌套对象中时，使用 `css.raw({ zIndex: 200 })`，再把结果赋给 `contentProps.css`；运行时变化的数字可直接使用原生 `style`。仅生成了原子 className 不代表对应 CSS 已进入生产构建。

### 语义与组合

菜单使用三套名字清晰的部件，例如 `DropdownMenuRoot/Trigger/Portal/Content/Item`、对应的 `ContextMenuXxx` 和 `MenubarXxx`。共有部件包含 CheckboxItem、RadioGroup/RadioItem、Group/Label、Separator、Sub/SubTrigger/SubContent；Menubar 另有 `MenubarMenu`。`size` 为 xs/sm/md，默认 sm。

DropdownMenu 由触发按钮打开；ContextMenu 支持右键、ContextMenu 键和 Shift+F10，根开关没有 `defaultOpen`；Menubar 的根使用菜单 value 管理当前激活项。checkbox/radio 的值由调用方回写。菜单项通过 `onSelect` 请求业务动作，`preventDefault()` 可阻止此次选择关闭；`shortcuts` 只展示快捷键，不注册键盘命令。`asChild` 的单个元素需要转发原生属性和 ref。

Dialog 和 AlertDialog 继续保留各自语义。Dialog 的便利版本要求 `title`，支持 `titleHidden`、`description`、`closable/closeLabel`；AlertDialog 提供默认 Cancel/Confirm 和 `actions` 自定义区。直接组合时必须提供 Title；没有 Description 时，显式把 Content 的 `aria-describedby` 设为 undefined。Root 的开关、Portal 的容器、Overlay 和 Content 的样式分别配置。

Dialog、AlertDialog 和菜单的 Portal/Content（以及 Dialog 的 Overlay）不开放原始 `forceMount`。关闭时按照各 primitive 的正常卸载生命周期释放交互层，不能仅把 force-mounted 内容用 CSS 隐藏后继续保留滚动锁。当前明确的保持挂载契约仅由 Popover 的 `keepMounted` 提供。

AlertDialog 的 `onConfirm/onCancel` 是动作回调，不承诺等待异步业务完成再关闭。需要等待、失败提示或提交校验时，使用受控 Root 与自定义 actions，在业务条件满足后回写 open。确认服务只返回用户的决定，也不代替业务事务或撤销。

## 确认服务与 showAlert 迁移

应用创建稳定的 `createConfirmationService()`，交给一个 ConfirmationProvider。服务通过 `request(options)` 返回 `ConfirmationRequest`，包含 id、options、result，以及 confirm/cancel/close 三个终结方法。重复或竞争调用返回同一个 result Promise，结果只确定一次。队列每次显示首个请求。

```tsx
import { useState } from 'react'
import { Button, ConfirmationProvider, createConfirmationService, useConfirmation } from '@pivot-ui/react'

function DeleteButton() {
  const confirmations = useConfirmation()
  return (
    <Button
      onClick={() => {
        const request = confirmations.request({
          title: 'Delete item?',
          description: 'This removes the selected item.',
          critical: true,
        })
        void request.result.then((result) => {
          if (result.status === 'confirmed') console.log('Delete requested')
        })
      }}>
      Delete
    </Button>
  )
}

export function ConfirmationBoundary() {
  const [service] = useState(createConfirmationService)
  return (
    <ConfirmationProvider service={service}>
      <DeleteButton />
    </ConfirmationProvider>
  )
}
```

结果状态为 `confirmed`、`cancelled`、`closed`、`unmounted` 或 `unavailable`。没有已连接 Provider 时请求立即 unavailable；实际卸载时未完成请求结束为 unmounted。一个 service 只允许一个挂载中的 Provider，重复宿主会报错；独立应用创建独立 service。StrictMode 的临时 effect 重连不会当成真实卸载。

**旧 `showAlert` 的调用是破坏性迁移，不能只替换 import。** 旧 `showAlert(props)` 自行建立 React root；现在必须调用 `showAlert(props, confirmations)`，其中 confirmations 来自应用注入或 `useConfirmation()`：

```tsx
import { showAlert } from '@pivot-ui/editor'
import type { ConfirmationService } from '@pivot-ui/react'

export function askToDelete(confirmations: ConfirmationService) {
  const request = showAlert({ title: 'Delete item?', confirmText: 'Delete' }, confirmations)
  return request.result
}
```

旧返回对象的 `close()` 仍可调用，现在会返回同一个结果 Promise；调用方还可等待 `result`。兼容回调只在终结后调用一次：confirmed 调用 onConfirm，其余结果调用 onClose。旧 standalone root 的 `zIndex/actionable` 不再决定此服务宿主的展示，确认宿主始终提供明确的确认/取消路径；需要自定义内容或 actions 时使用显式 AlertDialog 组合。调用方不应清空全局 body 的 pointerEvents，也不需要自行删除 portal 节点。

## 通知服务与宿主

推荐在应用边界使用 NotificationProvider，并通过 `useNotifications()` 或显式传入的 `NotificationService` 发通知。Provider 可接收稳定的外部 service，也可创建自己拥有的 service；`hostProps` 配置位置、容器等宿主属性，service id 由 Provider 管理。

```tsx
import { useState } from 'react'
import { Button, NotificationProvider, createNotificationService, useNotifications } from '@pivot-ui/react'

function SaveButton() {
  const notifications = useNotifications()
  return <Button onClick={() => notifications.success('Saved', { id: 'save-result' })}>Save</Button>
}

export function NotificationBoundary() {
  const [service] = useState(createNotificationService)
  return (
    <NotificationProvider service={service} hostProps={{ position: 'bottom-right' }}>
      <SaveButton />
    </NotificationProvider>
  )
}
```

服务提供 info/success/error/loading、dismiss、clear 和 promise。无已连接 Provider 时展示方法返回 null。相同 id 更新同一条通知；多个 Provider 共享 service 时只选出一个可见宿主，独立 service 互不清理。最后一个连接实际卸载会清理该 service 的通知；StrictMode 的临时重连不会误清理。

`notifications.promise(operation, { loading, success, error }, options)` 返回保留原操作成功值/失败原因的 Promise；调用方仍应处理 rejection。clear、dismiss、后续同 id 更新或 Provider 卸载会使过期的 UI 完成更新失效，不会取消调用方的 operation。通知状态不是业务提交状态。

`ToastView` 只负责视觉、信息语义和关闭动作；`Toaster` 将调度数据交给 ToastView 并通过 React portal 渲染。同 id 的宿主自动去重。旧 `toast`/`Toaster` 保留作为第三方调度兼容入口；新代码优先使用隔离的 service，避免依赖全局默认通知作用域。

## 验收入口

本批场景分布在新包的 Menus、Overlays、Dialogs、Notifications stories，以及旧菜单、Popover/Tooltip/AlertDialog/Toast 和相关消费者故事。必验受控/非受控、重复开关、嵌套 Escape、焦点恢复、卸载、局部 light/dark portal、StrictMode、幂等确认和通知作用域。Popover keepMounted 另验状态/DOM 保持与关闭后 effects/ref/页面交互恢复。

类型、构建、Panda 提取、console、浏览器结果和首次失败后的修复记录只写入台账，不在接入文档中提前宣称通过。
