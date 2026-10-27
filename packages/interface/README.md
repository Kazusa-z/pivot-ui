# @pivot-ui/react 组件速查

用于构建设置页、属性面板和编辑器工具的 React 组件库。这里按使用目标介绍组件、主要回调和接入方式。首次使用请先完成[使用与开发指南](../../docs/README.md)，然后运行 `pnpm dev` 查看可交互的 Storybook 示例。

## 选择需要的组件

| 你要实现的界面                   | 可选组件                                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 操作按钮、状态标签、进度提示     | Button、ActionButton、Badge、Tag、Callout、Progress、Spin                                                                     |
| 文字、布尔值或选项编辑           | Input、Textarea、EditableText、Checkbox、Select、Combobox、SegmentControl、ToggleGroup                                        |
| 数值、位置、尺寸和比例编辑       | InputNumber、Slider、NumericSlider、NumericTupleInput、Vector2/3/4Input、RectInput、DistributionSlider                        |
| 颜色、渐变和随机颜色             | ColorWidget、ColorInput、ColorPicker、HDRColorInput、ColorRamp、ColorRampChannels、ColorRampPicker、ColorDistributionTemplate |
| 曲线和数值分布                   | CurveWidget、CurvePicker、CurvePresets、NumericDistributionTemplate                                                           |
| 列表、树和表格                   | CollectionTemplate、TreeRoot、DataTable、Table                                                                                |
| 资源展示和选择                   | AssetItem、AssetName、AssetThumbnail、ResourcePicker、AssetReferenceInput                                                     |
| 字段排版和可折叠面板             | PropertyRow、Section、Accordion、Collapsible、Flex、ResizableSplit                                                            |
| 菜单、说明浮层、确认和通知       | DropdownMenuRoot、ContextMenuRoot、MenubarRoot、Popover、Tooltip、HoverCard、Dialog、AlertDialog、NotificationProvider        |
| 连接应用数据、显示保存状态与错误 | PropertyField、usePropertyBinding                                                                                             |

## 导入与样式

| 入口                                                             | 什么时候使用                               |
| ---------------------------------------------------------------- | ------------------------------------------ |
| `@pivot-ui/react`                                                | 导入组件、hooks 和常用类型                 |
| `@pivot-ui/react/values`                                         | 使用数值、颜色、曲线等数据类型与纯计算函数 |
| `@pivot-ui/react/contracts`                                      | 为应用实现属性访问、资源查询等服务接口     |
| `@pivot-ui/react/theme`                                          | 配置主题状态、Provider 或主题适配器        |
| `@pivot-ui/react/panda.css`                                      | 在应用入口加载 CSS layer 声明              |
| `@pivot-ui/react/fonts.css`                                      | 随包提供的 Geist 与 JetBrains Mono 字体    |
| `@pivot-ui/react/styling/css`、`/styling/jsx`、`/styling/tokens` | 为应用界面编写样式、使用设计 token         |
| `@pivot-ui/react/styling/types`                                  | 导入 Panda 样式类型                        |

应用需要通过 Panda 扫描自己的源码和 `packages/interface/src/**/*.{ts,tsx}`，生成实际使用的 CSS。首次链接源码或清理生成文件后，运行 `pnpm --filter @pivot-ui/react panda`。仓库中的示例应用和 Storybook 已配置生成步骤；详细配置见[使用与开发指南](../../docs/README.md)。

## 受控值与编辑回调

多数编辑组件可由 React 状态控制：把状态传给 `value`，在 `onValueChange` 中接收新值并更新状态。这样拖动、输入和按键操作会立即反映在界面上。

连续编辑组件还提供以下回调，适合将预览与保存分开：

| 回调            | 应用可以做什么                                       |
| --------------- | ---------------------------------------------------- |
| `onEditStart`   | 记录编辑开始时的值，或检查当前是否允许编辑           |
| `onValueChange` | 更新界面预览，例如拖动时实时显示数值或颜色           |
| `onValueCommit` | 保存一次完成的编辑，或记录一次撤销步骤               |
| `onEditCancel`  | 根据取消原因恢复编辑前的值，或显示应用接收到的最新值 |

受控模式下，父组件负责把回调结果写回 `value`，并在取消或保存失败时恢复合适的显示值。需要统一处理这些状态时，可使用下文的 `PropertyField`。各组件可接受的回调参数请查看对应指南或 TypeScript 提示。

## 主题、文字与常用反馈

`ThemeProvider` 为界面提供明暗主题。`useTheme()` 返回用户偏好 `preference`、实际主题 `resolvedTheme` 和切换函数 `setPreference`；`system` 表示跟随系统。默认 Provider 使用浏览器存储、系统主题和文档 class，同一 store 下的消费者会同步更新。

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

需要保存到应用配置或嵌入其他宿主时，使用 `createThemeStore({ initialPreference, storage, system, appearance })` 并传入 Provider。三个适配器分别处理偏好读写、系统主题变化和界面主题应用，可以独立替换。

| 组件                    | 用途与使用方式                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Text、Bold、Title、Link | 展示正文、强调文字、标题和链接。`as` 选择 HTML 语义，`size` 选择视觉字号                                             |
| 图标与 Arrow            | 为动作、文件类型或方向提供图形提示。独立表达含义时提供可访问名称；旁边已有完整文字时可作为装饰                       |
| Button、ActionButton    | 触发操作；ActionButton 适合图标动作。`onClick` 接收点击，`async` 可等待 Promise，`onAsyncError` 接收失败             |
| ActionButtonGroup       | 将相关图标动作排在一起，每个按钮保留自己的回调和可用状态                                                             |
| Badge、Tag              | Badge 展示状态（gray/blue/green/amber/red）或分类（violet）；Tag 适合可移除的标签，`onRemove` 通知父组件更新标签列表 |
| Kbd、KbdGroup           | 展示快捷键或手势提示。应用通过键盘事件注册对应命令                                                                   |
| Callout                 | 显示说明、警告或错误；`severity` 选择外观，`role="status"` 或 `"alert"` 用于需要即时播报的变化                       |
| Progress、Spin          | 显示已知进度或等待状态。Progress 按 `value / max` 展示进度，空值表示进度未知；Spin 可提供加载名称                    |

Button 的 `loading` 和异步等待状态会禁用重复激活。保存、网络请求和撤销逻辑写在应用回调中。使用 `asChild` 时，自定义子组件需要将 props 和 ref 转发到实际 DOM 元素。Progress 的 `max` 应为正有限数，非法范围按 100 显示。

## 文本与选项

`Input` 和 `Textarea` 适合即时输入，提供原生事件、ref 和 `onValueChange(string)`。需要完成后再保存时，使用 `EditableText` 或 `useTextEdit`：Enter 或失焦提交，Escape 取消；多行输入的提交方式见[使用与开发指南](../../docs/README.md)。外部数据更新时，可通过 `resetKey` 重置当前草稿。

`Select` 适合固定选项的单选下拉，`Combobox` 增加搜索和多选。`SegmentControl` 将单选项直接排列在页面上，`ToggleGroup` 用于可切换的单个或多个选项；单选 ToggleGroup 允许取消当前选择。`Checkbox` 用于布尔值，`indeterminate` 可展示一组选项的混合状态。

选项使用 `ChoiceOption<T>[]`：`key` 标识列表中的选项，`value` 是回调返回的业务值。数字 `1` 与字符串 `'1'` 可以代表不同值；`null` 表示未选，空字符串也可以作为合法选项值。通过 `readOnly` 展示可阅读但暂不能编辑的值，通过 `disabled` 表示当前不可操作。

## 数值与几何

`InputNumber` 支持键入、拖动和步进调整。`Slider` 用滑块编辑一个或多个数值；`NumericSlider` 将单个数值输入和滑块组合起来，适合同时需要精确输入与快速调整的参数。

`NumericTupleInput` 编辑多个命名数值。`Vector2Input`、`Vector3Input`、`Vector4Input` 和 `RectInput` 接收对应形状的对象，适合位置、尺寸和矩形区域。`DistributionSlider` 编辑总量固定的分段长度，回调返回各段的长度数组。

这些组件提供编辑开始、实时变化、提交和取消回调。InputNumber 及其数值输入组合用 `min/max` 限制有效值，用 `softMin/softMax` 设置拖动和步进的常用范围；键入可覆盖常用范围并遵守有效值范围。`step`、`dragStep` 和 `precision` 分别设置步进、拖动增量和精度。Slider 使用 `min/max/step` 设置轨道范围和步长；DistributionSlider 使用 `total/minSegment` 设置总量和最小分段长度。比例联动及零值处理见[使用与开发指南](../../docs/README.md)。

## 颜色、渐变与曲线

`ColorWidget` 是内联颜色编辑器，`ColorPicker` 通过浮层节省空间，`ColorInput` 提供紧凑的颜色字段。`HDRColorInput` 适合包含高亮强度的颜色。回调返回 `ColorValue`，其中 `space` 指定 `srgb` 或 `linear`，RGB 通常使用 0–1 通道值，HDR 值可超过 1。

`ColorRamp` 编辑多个色标组成的渐变，`ColorRampChannels` 将颜色与透明度分开编辑，`ColorRampPicker` 提供浮层入口。`ColorDistributionTemplate` 在固定颜色、随机范围和渐变等模式间切换。它们通过编辑回调返回颜色数据；选择色标和切换显示方式用于辅助操作。需要取屏幕颜色或复制粘贴时，应用通过 `capabilities` 提供相应方法。显示偏好通过受控显示属性及应用存储保存。详见[使用与开发指南](../../docs/README.md)。

`CurveWidget` 用曲线图编辑随输入变化的数值，支持移动点和控制柄。`CurvePicker` 在浮层中提供同样的编辑体验，`CurvePresets` 用于选择并应用预设。编辑回调返回 `CurveValue`；选点、缩放和平移用于查看曲线。曲线点需要稳定 ID 和递增的 x 坐标。保存与加载个人预设时，应用提供 `CurvePresetService`。

`NumericDistributionTemplate` 将固定值、范围、曲线等模式组合成一个字段，适合随时间变化或带随机性的参数。应用接收带模式标记的值，并按需保存模式切换时的缓存。详见[使用与开发指南](../../docs/README.md)。

## 列表、树、表格与拖放

`Breadcrumbs` 展示当前位置，`Pagination` 切换分页；回调交给应用更新路由或加载数据。`TreeRoot`、`TreeItem`、`TreeItemContent` 和 `TreeGroup` 组合层级列表。`Table` 的结构部件适合自定义单元格，`DataTable` 适合按列配置展示数据。

`CollectionTemplate` 为列表提供选中、展开、添加、移除和排序入口。应用传入稳定的项目 key，并在回调中更新数据。异步添加完成后可返回新项目的 key，使组件将焦点移到新项目。

需要应用内拖放时，在相关区域外放置 `DragDropProvider`，通过 `useDragSource` 和 `useDropTarget` 配置拖动项及接收回调。系统文件拖入通过 `onFilesDrop` 返回文件数组；应用可使用 File API 读取内容或将文件交给上传服务。详细用法见[使用与开发指南](../../docs/README.md)。

## 资源引用与选择

`AssetItem` 展示资源缩略图、名称和状态，支持选择与改名；`AssetName` 和 `AssetThumbnail` 可用于自定义资源布局。`ResourcePicker` 提供搜索、筛选、分页以及列表/网格视图，适合选择项目资源。`AssetReferenceInput` 展示当前引用，并提供更换、清空和定位入口。

应用通过 `ResourceProvider` 提供 `query` 与 `get`，返回用于展示的资源描述。选中资源时，回调返回资源 ID；AssetReferenceInput 通过 `onValueChange` 接收引用更新并回写 `value`，独立 ResourcePicker 通过 `onSelect` 处理选择请求，再用 `onSelectedIdChange` 回写 `selectedId`。`rename`、`locate` 和 `chooseFile` 等可选方法用于接入改名、定位与文件选择。详见[使用与开发指南](../../docs/README.md)。

## 字段与面板布局

`Flex` 用于排列内容，`direction` 控制主轴，`align` 和 `justify` 控制对齐，`wrap` 控制换行。`gap` 的 `none/xxs/xs/sm/md/lg` 对应 0/2/4/8/12/16px。宽高和边距通过 `css` 或 `style` 设置。

`PropertyRow` 将标签、控件和说明排成字段行，适合自定义表单。使用 `PropertyLabel`、`PropertyControl` 和 `PropertyDescription` 组合，并把标签及说明的 ID 关联到输入：

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

多个输入共用标签时，使用 `PropertyControl association="group" labelledBy={labelId}`，并为每个输入提供各自的名称。`direction="column"` 适合窄面板；`withoutLabel` 用于无标签行。`ReadonlyValue` 展示格式化后的只读内容，`emptyText` 设置空值占位。`ImagePreview` 展示图片，传入 `src` 和有意义的 `alt`；应用负责解析资源地址及处理加载失败。

`Separator` 分隔相邻内容，`SectionDivider` 在分隔线中加入文字。需要章节语义时，向 SectionDivider 传入 `Title` 或原生标题元素；竖向 Separator 需要容器提供高度。

`Section` 将相关字段放在有标题的区域内，默认展开。`Collapsible` 用于默认收起的内容；两者通过 `open/onOpenChange` 控制展开状态。`Accordion` 用于多个可折叠区域，支持单项或多项展开。标题旁的操作按钮放入 `actions`，用户可独立操作按钮和折叠入口。`collapsible={false}` 适合始终显示的 Section。

## 滚动与调整面板尺寸

`ScrollArea` 为受限空间提供滚动内容、滚动条和可选边缘阴影。固定高度面板使用默认 `sizing="fill"`；随内容增长的浮层可用 `sizing="content"` 配合 `maxHeight`。`scrollbars` 选择滚动轴，`type` 选择滚动条显示策略。

需要读取滚动位置或调用 `scrollTo()` 时，将事件传给 `viewportProps`，将 ref 传给 `viewportRef`。也可以组合 `ScrollAreaRoot` 和 `ScrollAreaViewport`：Root 负责外层布局，Viewport 接收滚动事件和 ref。横向内容可使用 `contentLayout="intrinsic"` 并提供内容宽度。

`ResizableSplit` 用可拖动分隔条调整面板大小，适合属性侧栏或上下分区。`primary` 是调整尺寸的面板，`children` 是剩余内容；`orientation` 选择横向宽度或纵向高度，尺寸单位为 CSS 像素。

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

`onSizeChange` 返回拖动中的尺寸，`onSizeCommit` 返回释放指针或键盘调整后的尺寸，`onResizeCancel` 报告取消原因。受控模式把尺寸写回 `size`；非受控模式使用 `defaultSize`。分隔条支持方向键、Shift 加速和 Home/End。父容器提供明确宽高；空间不足时尺寸会受容器可用空间限制。省略 `children` 可调整独立区域；`primaryAsChild` 的子元素需要转发 props 和 ref。

## 菜单、浮层、确认与通知

`DropdownMenu` 适合按钮触发的菜单，`ContextMenu` 适合右键操作，`Menubar` 适合顶部多组菜单。`Popover` 承载交互内容，`Tooltip` 展示简短说明，`HoverCard` 展示悬停预览；操作项通过各自的选择或点击回调通知应用。

Popover、Tooltip、HoverCard、Dialog 和 AlertDialog 的便利组件使用 `rootProps` 设置开关行为、`triggerProps` 设置触发元素、`portalProps` 设置容器、`contentProps` 设置内容与定位。需要更自由的结构时，可直接组合 Root、Trigger、Portal、Content 等部件。菜单使用各自的 Root、Trigger、Portal 和 Content 等部件。应用根部提供 `TooltipProvider`，以统一提示延迟。

`Dialog` 适合表单或详细操作，`AlertDialog` 适合需要明确确认的决定。也可以创建 `createConfirmationService()` 并用 `ConfirmationProvider` 提供给界面，通过 `useConfirmation()` 取得服务后调用 `request(options)`。等待返回请求的 `result` Promise，再根据结果的 `status`（`confirmed`、`cancelled`、`closed`、`unmounted` 或 `unavailable`）决定后续动作。

`NotificationProvider` 和 `useNotifications()` 用于显示任务状态、成功信息和错误。可通过 `createNotificationService()` 共享服务，同一个 id 可更新同一条通知。关闭通知会结束该条通知的展示；需要取消上传或保存时，由应用回调调用对应任务的取消接口。

浮层会继承所在 ThemeProvider 的主题。`PopoverRoot keepMounted` 可保留关闭时的局部状态，关闭期间 effects 会暂停；再次打开恢复内容。需要持续运行的任务请放在应用服务或浮层外。更多示例见[使用与开发指南](../../docs/README.md)。

## 连接应用数据

`PropertyField` 是带标签、帮助文字、错误提示和编辑状态的属性字段，适合需要校验、异步保存或撤销的面板。传入 `PropertyAccess<T>` 后，文本、布尔、枚举和数值属性可直接使用内置控件；复杂值通过 `render` 组合，`editProps` 可传给数值、颜色或曲线组件。

应用实现 `PropertyAccess<T>`：`getSnapshot()` 提供当前值及状态，`subscribe()` 通知变化，`begin()` 开始一次编辑。连续操作期间使用 `change()` 更新预览，完成后 `commit()`，取消时 `cancel()`。`onEditResult` 返回提交、取消或拒绝等结果，可用于业务反馈。

快照中的 `value/revision` 表示已接受的值和版本，`edit.previewValue` 表示正在编辑的预览。保存确认、持久化和撤销记录由应用服务实现；在后端准备好之前，可以用内存数据实现同样的接口。详情与复杂字段示例见[使用与开发指南](../../docs/README.md)。

`HostCapabilities` 为剪贴板、偏好保存和文件选择定义可选接口。应用将浏览器或桌面环境中的实现传入；缺少能力时，界面可显示不可用原因并提供应用自己的替代操作。

## 工具与更多示例

`clamp` 将数值限制到指定上下界，调用方提供有效范围。`mergeRefs` 可将组件的多个对象 ref 或函数 ref 连接到同一元素，支持 React 19 的 ref 清理回调。数值、颜色和曲线计算函数可从 `/values` 使用。

运行 `pnpm dev:interface` 后，在 Storybook 中查看每个组件的操作说明和状态反馈。`Property` 展示实际控件的数据连接，`Contracts / Property editing` 展示保存延迟、拒绝、外部更新等数据场景。示例数据在浏览器内模拟，生产应用通过上述接口连接自己的服务。

完整导航见[文档索引](../../docs/README.md)。修改组件后运行 `pnpm verify`，会依次检查格式、类型、`audit:styles`、`audit:stories` 和构建；也可单独运行 `pnpm audit:styles` 或 `pnpm audit:stories`。
