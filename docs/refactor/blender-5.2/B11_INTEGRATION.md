# 属性数据与提交

普通 React 状态足以驱动组件。当应用需要统一处理预览、校验、保存、失败和撤销时，可以使用 `PropertyAccess<T>` 和 `PropertyField<T>`。

`PropertyAccess` 是应用实现的数据接口；`PropertyField` 订阅这个接口，并把一个属性连接到一个控件。用普通 React 组合多个 PropertyField、Section 和布局组件，就能安排页面中的字段和编辑器。

## 先认识三个值

| 名称                         | 含义                                                   |
| ---------------------------- | ------------------------------------------------------ |
| `snapshot.value`             | 应用已经接受的值，例如保存成功的值                     |
| `snapshot.edit.previewValue` | 用户正在编辑的预览，还没有成为保存结果                 |
| 控件的文本草稿               | 输入中的文字，可以暂时不是有效值，例如数字输入里的 `-` |

拖动时可以不断更新 preview，让界面立即响应；拖动结束再保存一次。应用决定一次成功保存如何加入撤销记录。

## 内置字段

字符串、数字、布尔和枚举有内置控件。需要不同显示时指定 widget。

```tsx
import { PropertyField, type PropertyAccess } from '@pivot-ui/react'

export function BasicFields({ name, strength }: { name: PropertyAccess<string>; strength: PropertyAccess<number> }) {
  return (
    <>
      <PropertyField access={name} />
      <PropertyField access={strength} widget="numeric-slider" />
    </>
  )
}
```

默认 string 使用 Input，number 使用 InputNumber，boolean 使用 Checkbox，enum 使用 Select。可选 widget 包括 textarea、numeric-slider 和 combobox；不相容的类型与控件组合会报错。

标签、说明、只读状态、禁用原因和错误由数据快照提供，也可以通过 PropertyField 的 label/description 等显示参数调整。

## 复杂值由 render 组合

几何、颜色、曲线等值明确选择对应编辑器。`field.editProps` 包含当前显示值、编辑回调、可用状态、resetKey 和可访问性关联。

```tsx
import { PropertyField, Vector3Input, type PropertyAccess, type Vector3 } from '@pivot-ui/react'

export function PositionField({ access }: { access: PropertyAccess<Vector3> }) {
  return (
    <PropertyField
      access={access}
      render={(field) => <Vector3Input {...field.editProps} label="Position" step={0.1} />}
    />
  )
}
```

复杂组合默认作为一个有名称的 group。只包含一个可关联标签的输入时，可以设置 `association="control"`。`field.controlProps` 只提供 ID、标签、说明、错误和等待状态关联，供你手动组合时使用；把它放在真正的控件或控件组上。

在 render 中把范围、轴、单位、资源筛选和能力参数传给相应组件。这样可以直接使用各编辑器的完整 props，例如 Vector3Input 的 axes 或 ColorInput 的 capabilities。

## 资源、集合和多选的完整赋值

这类操作通常一次给出完整新值，用 `field.submit(nextValue)`。它在成功或无变化时返回 true，不可编辑、过期或未接受时返回 false，校验和保存失败时抛出错误。

```tsx
import { AssetReferenceInput, PropertyField, type PropertyAccess, type ResourceProvider } from '@pivot-ui/react'

export function MaterialField({
  access,
  provider,
}: {
  access: PropertyAccess<string | null>
  provider: ResourceProvider
}) {
  return (
    <PropertyField
      access={access}
      render={(field) => (
        <AssetReferenceInput
          {...field.controlProps}
          provider={provider}
          value={field.snapshot.value}
          resetKey={field.resetKey}
          disabled={field.snapshot.disabled}
          readOnly={field.snapshot.readOnly || field.pending}
          onValueChange={field.submit}
        />
      )}
    />
  )
}
```

集合改名、增删和重排都构造完整的新数组再提交。选中、展开、翻页和浏览不需要提交属性。自定义多选的事件处理应捕获 submit 的 rejection；字段会从 snapshot 展示保存错误。

## 实现 PropertyAccess

每个 access 固定到 `{objectId, propertyId}`，并在同一对象的正常渲染间保持实例稳定。应用提供以下三个方法：

| 方法                  | 要求                                          |
| --------------------- | --------------------------------------------- |
| `getSnapshot()`       | 返回不可变快照；没有变化时返回同一个对象      |
| `subscribe(listener)` | 数据变化时通知 listener，返回取消订阅函数     |
| `begin()`             | 开始一次编辑，或返回只读/禁用导致的不可用结果 |

快照包含 target、descriptor、value、revision、readOnly、disabled、unavailableReason、edit 和 error。revision 是数据版本号；外部数据替换时应推进，即使值相等，也能让正在编辑的控件识别新版本。

begin 成功返回 session，session 保存本次目标、初值和开始版本，并提供：

- `change(value)`：校验并更新预览，返回 changed、unchanged、invalid 或 ignored。
- `commit()`：请求接受本次预览，返回 Promise。
- `cancel(reason)`：取消尚未提交的预览，返回 Promise。

第一次 commit/cancel 决定本次编辑的结果，重复调用返回同一个 Promise。commit 开始后，保存请求继续针对本次目标执行；界面取消或卸载时，应用仍需处理它的返回结果。提交结果为 committed、unchanged、cancelled、rejected 或 superseded；每个结果带目标、会话 ID、当时的接受值和版本。

可以先在应用内存中实现这些方法，再接入服务器或桌面程序。Storybook 的模拟实现仅用于展示接口，不从公开包导出。

## 描述符与值类型

`PropertyDescriptor<T>` 说明属性类型、标签和数据约束，不放 React 元素或函数。省略泛型时，PropertyAccess 的值默认为 string/number/boolean；复杂数据显式写 T。

| kind                                                       | 值或用途                           |
| ---------------------------------------------------------- | ---------------------------------- |
| number、string、boolean、enum                              | 基本值；enum 带 options            |
| multi-enum                                                 | 选项值数组                         |
| vector2、vector3、vector4、rect                            | 对应几何对象                       |
| numeric-tuple、distribution                                | 多轴数值数组、固定总量分段         |
| color、color-ramp、color-ramp-channels、color-distribution | 对应颜色数据                       |
| curve、numeric-distribution                                | 曲线或数值分布                     |
| resource                                                   | 非空资源 ID 或 null                |
| collection                                                 | 有稳定 key 的数组                  |
| custom                                                     | 应用自己的数据类型及明确 schema 名 |

几何 descriptor 的 axes 是带 key 的可选数组，允许部分配置和任意顺序，约束按字段 key 匹配；tuple 的 axes 按数组位置对应数值。几何控件本身接受按字段名配置的 axes 对象，因此 renderer 要按组件接口映射元数据。

`PropertyValueAdapter<T>` 可以提供 clone/equals/validate，用于应用自己的复制、比较和校验策略，函数不放在 descriptor 中。`clonePropertyData` 复制并冻结普通数据，拒绝类实例、函数、循环和访问器；`arePropertyDataEqual` 比较已校验的普通数据。控件数据不要携带 DOM 或引擎实例。

## 外部更新、等待与错误

对象或外部版本改变时，当前草稿和过期异步结果会失效。`committedSessionId` 可选地标记当前 revision 来自哪次成功提交；提供它后，PropertyField 能保留这次编辑自身的模式缓存。没有标记时，revision 变化会安全地重置编辑状态。

一个提交尚未完成时，不应再开始第二次写入。保存失败后，应用保留已接受的值，编辑器可以保留草稿供重试。字段负责展示应用错误，子编辑器通过 `aria-errormessage` 关联同一条消息。

`mixed` 表示多个对象的值不一致，不是空字符串或 0。应用负责计算这个状态，并在成功赋值后清除。复杂值如何覆盖多个对象，由 renderer 和应用明确决定。

需要更自由的布局时，可以直接使用 `usePropertyBinding<T>`，取得同一组 value、begin、change、commit、submit 和 cancel 方法，再组合自己的字段。不要同时在多个地方保存独立草稿和重复提交同一修改。
