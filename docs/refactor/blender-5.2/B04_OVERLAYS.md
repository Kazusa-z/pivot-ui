# 浮层与消息

浮层让用户在当前页面完成临时操作；通知用于显示结果。先根据内容是否需要交互、是否需要明确决定来选组件。

| 组件                 | 什么时候用                         |
| -------------------- | ---------------------------------- |
| Tooltip              | 按钮或控件的补充提示，不放交互内容 |
| HoverCard            | 悬停或聚焦时展示非必要的预览信息   |
| Popover              | 小型表单、选项面板等可交互内容     |
| Dialog               | 需要单独标题和操作区的任务         |
| AlertDialog          | 需要用户明确确认或取消的决定       |
| DropdownMenu         | 点击按钮打开命令列表               |
| ContextMenu          | 右键或键盘打开上下文命令           |
| Menubar              | 一行可用方向键切换的菜单           |
| NotificationProvider | 操作结果、等待状态和非阻塞消息     |

## Popover：小型交互面板

便利组件使用 `trigger` 和 `children`。需要精确组合时，可以直接使用 Root、Trigger、Portal、Content 等部件。

```tsx
import {
  Button,
  Input,
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverTitle,
  PopoverClose,
} from '@pivot-ui/react'

export function NamePopover() {
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <Button>Details</Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent side="bottom" align="start" sideOffset={6}>
          <PopoverTitle>Details</PopoverTitle>
          <Input aria-label="Name" defaultValue="Camera" />
          <PopoverClose asChild>
            <Button>Close</Button>
          </PopoverClose>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
}
```

打开状态可用 `open/onOpenChange` 控制；只设置初始值时用 `defaultOpen`。关闭面板不等于保存里面的表单，保存时机由你决定。

Popover、Tooltip、HoverCard 的便利组件按以下对象分配参数：

| 参数           | 控制什么                                            |
| -------------- | --------------------------------------------------- |
| `rootProps`    | `open/defaultOpen/onOpenChange`，以及开关延迟等行为 |
| `triggerProps` | 触发元素的属性和事件                                |
| `portalProps`  | 渲染容器 `container`                                |
| `contentProps` | `side/align/sideOffset`、尺寸、内容事件和样式       |

`PopoverContent` 的 `compact` 去掉默认内边距，`constrainSize` 根据触发元素和可用空间限制尺寸。嵌套样式建议用 `css.raw()`，示例见[样式配置](../../migration/README.md)。

### 关闭后保留表单状态

默认关闭会卸载内容。`PopoverRoot keepMounted` 保留 React 状态和 DOM，但隐藏期间暂停 effects、断开 ref，并释放焦点和滚动限制。重新打开后恢复显示。

需要在后台继续运行的任务应放在面板外。保持 `portalProps.container` 稳定；切换容器不保证保留内容状态。

## Tooltip 与 HoverCard

应用或独立区域需要外层 `TooltipProvider`。它统一管理多个提示之间的延迟；具体提示仍可通过 `rootProps.delayDuration` 调整。

HoverCard 适合显示缩略信息。关键说明应放在页面可见位置，必需动作应使用按钮、Popover 或 Dialog，避免只能通过悬停才能完成操作。

## 菜单

三个菜单家族分别使用 `DropdownMenuXxx`、`ContextMenuXxx` 和 `MenubarXxx` 部件。常用部件包括 Root、Trigger、Portal、Content、Item、CheckboxItem、RadioGroup、RadioItem、Separator、Sub、SubTrigger 和 SubContent。Menubar 还用 `MenubarMenu` 分组。

菜单项的 `onSelect` 表示用户请求执行动作；调用 `event.preventDefault()` 可以让菜单暂时不关闭。CheckboxItem 和 RadioGroup 的选中值需要父组件回传。`shortcuts` 仅显示按键提示，不注册快捷键。

ContextMenu 支持右键、ContextMenu 键和 Shift+F10，开关接口以它的 Root 类型为准，不支持 `defaultOpen`。Menubar 通过菜单 value 表示当前打开项。`size` 支持 `xs/sm/md`。

## Dialog 与确认

Dialog 便利组件需要 `title`，可用 `titleHidden` 隐藏视觉标题，同时保留可访问名称。直接组合部件时也要提供 Title。没有 Description 时，按 Content 接口显式处理 `aria-describedby`。

AlertDialog 的 `onConfirm/onCancel` 通知动作，不会自动等待异步业务完成再关闭。需要“保存成功才关闭”时，控制 `open` 并提供自己的操作按钮；保存失败时保留对话框和错误提示。

应用中多个位置需要确认时，可以使用确认服务：

```tsx
import { useState } from 'react'
import { Button, ConfirmationProvider, createConfirmationService, useConfirmation } from '@pivot-ui/react'

function ConfirmDelete({ onDelete }: { onDelete: () => void }) {
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
          if (result.status === 'confirmed') onDelete()
        })
      }}>
      Delete
    </Button>
  )
}

export function DeleteAction({ onDelete }: { onDelete: () => void }) {
  const [service] = useState(createConfirmationService)
  return (
    <ConfirmationProvider service={service}>
      <ConfirmDelete onDelete={onDelete} />
    </ConfirmationProvider>
  )
}
```

结果为 `confirmed`、`cancelled`、`closed`、`unmounted` 或 `unavailable`。一次请求只决定一次结果；确认只表示用户同意，实际删除和失败处理由应用执行。一个确认服务需要一个已连接的 Provider，没有 Provider 时请求返回 `unavailable`。

## 通知

在需要显示通知的区域使用 `NotificationProvider`，通过 `useNotifications()` 调用 `info/success/error/loading`。`dismiss` 关闭一条，`clear` 清空该服务的通知。相同 id 更新同一条消息。

```tsx
import { Button, NotificationProvider, useNotifications } from '@pivot-ui/react'

function ExampleButton() {
  const notifications = useNotifications()
  return <Button onClick={() => notifications.info('A message from this area')}>Show message</Button>
}

export function NotificationExample() {
  return (
    <NotificationProvider>
      <ExampleButton />
    </NotificationProvider>
  )
}
```

`notifications.promise(operation, { loading, success, error })` 根据 Promise 更新消息，并保留原来的成功值或失败原因。你仍然需要处理该 Promise 的 rejection。关闭通知不会取消业务操作。

## 焦点、层级与自定义元素

库的浮层跨 Portal 保留主题和父子层级。外部浮层可以用 `OverlayLayer asChild` 接入层级与主题；它不负责开关或焦点。数字 `style.zIndex` 可设置明确层级基准。

`asChild` 要求一个能转发 props/ref 的元素，不能使用 Fragment。不要嵌套 button。对话框和菜单关闭后应释放交互限制；保留隐藏内容使用 Popover 的 `keepMounted`，不要自己把强制挂载的交互层仅用 CSS 隐藏。
