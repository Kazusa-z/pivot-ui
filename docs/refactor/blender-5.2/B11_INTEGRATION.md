# B11 属性联调与最终接入

B11 是本轮组件库重构的最后一批。最终验收与 Git 记录见 [LEDGER](./LEDGER.md)。范围是 65 项组件处置和 S01–S10 共性事项收口；真实 C++ / Qt 传输、业务页面、应用命令/撤销及完整编辑器工作区由后续应用开发完成。

## 最终结构

| 层          | 拥有的职责                                           | 可以依赖                        |
| ----------- | ---------------------------------------------------- | ------------------------------- |
| values      | 数据类型、校验、数值/颜色/曲线/集合等纯算法          | 其他纯值模块                    |
| contracts   | 描述符、PropertyAccess、会话、宿主能力与资源服务接口 | values                          |
| foundation  | token、图标、排版、主题 store 与显式浏览器适配器     | 纯模型与 React（纯 store 除外） |
| interaction | 拖动、编辑生命周期、ref 组合等 React 行为            | contracts/values、foundation    |
| widgets     | 独立控件、键盘和焦点行为                             | 下层基础与交互                  |
| layout      | 属性行、区域、滚动与尺寸布局                         | 基础、必要结构控件              |
| templates   | 几何、颜色、曲线、资源与集合的明确组合               | widgets/layout 和纯模型         |
| property    | 一个属性和一个控件组合的会话连接                     | contracts 与上述展示层          |
| application | 数据、对象选择、命令、历史、真实服务与 Qt bridge     | 公开包入口                      |

仅 `packages/interface` 与 `app` 为 workspace 包。`pnpm dev` / `dev:interface` 运行端口 6009；`build:storybook` 仅构建统一 Storybook。旧 UI/GUI 源码、适配器、旧包命令和 lockfile importer 已删除。`GUI`、`GUIRoot`、旧 `Panel` 不恢复，也不建立空 Qt 或业务目录。

## 泛型数据契约

`PropertyAccess<T>`、`PropertySnapshot<T>`、`EditSession<T>`、结果类型和 `PropertyField<T>` 共享同一个 T。省略 T 时仍默认标量 `PropertyValue`（string/number/boolean），没有将默认值放宽成 any/unknown。

`PropertyDescriptor<T>` 是数据描述，不能包含 React 元素、函数、DOM 或引擎实例。`PropertyDescriptorSchema` 是运行时判别联合。已知 kind 包括：

- number、string、boolean、enum、multi-enum；
- vector2、vector3、vector4、rect、numeric-tuple、distribution；
- color、color-ramp、color-ramp-channels、color-distribution；
- curve、numeric-distribution、resource（ID 或 null）、collection；
- custom（明确 schema 名及可选纯数据 metadata）。

数值 axes/constraints、选项和资源筛选是元数据。复杂 renderer 显式把这些配置传给相应控件；PropertyField 不猜测页面结构或复制一套控件配置协议。可选宿主操作通过独立能力/服务参数注入。

`PropertyValueAdapter<T>` 的 clone/equals/validate 函数属于宿主策略，不进入描述符。Mock 的 custom kind 必须显式提供 adapter；默认克隆只接受普通数据，拒绝循环、类实例、函数、symbol、稀疏数组、访问器和隐藏字段，并递归冻结。公开 `clonePropertyData` / `arePropertyDataEqual` 可用于已校验普通数据；结构相等不依赖对象键顺序。真实宿主可实现自己的快照策略，但必须保持稳定、不可变、无引擎实例泄漏的契约。

## PropertyField 的两种接法

标量沿用内置 renderer：

```tsx
import { PropertyField, type PropertyAccess } from '@pivot-ui/react'

export function ScalarFields({ name, strength }: { name: PropertyAccess<string>; strength: PropertyAccess<number> }) {
  return (
    <>
      <PropertyField access={name} />
      <PropertyField access={strength} widget="numeric-slider" />
    </>
  )
}
```

复杂值用同一个 PropertyField 的 typed render：

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

`field.editProps` 包含 value、resetKey、disabled/readOnly、编辑生命周期回调和实际控件的 ARIA 关联。它适用于现有数值、颜色、曲线模板，不另建各族 PropertyField 包装。`field.controlProps` 只含 ID/名称/说明/错误/等待关联，用于手动组合；不要只把它放在与控件无关的 wrapper 上。复杂组合默认 group，单个 labelable input 可设 association="control"。

资源、集合、多选是明确的原子请求：

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
          readOnly={field.snapshot.readOnly}
          onValueChange={field.submit}
        />
      )}
    />
  )
}
```

`submit(next)` 在成功/无变化时返回 true；不可编辑、过期或未接受时返回 false；校验/宿主拒绝抛出原始错误供控件保留草稿和重试。集合重命名/增删/排序构造完整下一份集合值；视图选中、展开与浏览不调用 submit。普通多选 renderer 应自行处理 Promise rejection，字段错误仍由 access snapshot 展示。

更自由的布局可直接使用 `usePropertyBinding<T>`，复用相同的会话、预览和身份逻辑。不要在 renderer 中重新实现 begin/change/commit 协议。

## 编辑与异步边界

1. snapshot.value/revision 是权威状态，snapshot.edit.previewValue 是即时预览。控件只显示 preview，不能把每次拖动都变成命令。
2. 连续操作开始一次、变化多次、终结一次；相等的复杂值不生成历史。已提交请求仍属于捕获的 target；卸载和切换不能假装撤销它。
3. `committedSessionId` 可选地标记“当前权威 revision 由此会话接受”。自身成功 ACK 不轮换 resetKey，从而保留分布模式缓存；外部更新/reset 清除该标记并推进 revision，即使值相同也使旧 UI 草稿/缓存失效。未提供标记的适配器按 revision 变化安全地重置。
4. 本地尚未处理完的提交回执阻止同一轮重复提交；异步拒绝不报告成功，过期回执不覆盖新对象和新会话。
5. pending 自身操作由正在编辑的控件处理，不能因 pending 反过来使自身会话失效。其他控件/动作不能开启第二个并发写入。
6. PropertyField 拥有宿主错误展示。模板接收到 aria-errormessage 时不重复展示同一拒绝；独立模板本地校验仍有自己的提示。ARIA 指向实际可见消息。
7. mixed 是应用聚合状态，不是普通空值；应用在成功接受后清除。标量支持相应占位，复杂值的替换策略由 renderer 明确表达，`Mixed geometry` 故事给出示例。

## 能力保留和兼容退出

`clamp` 位于纯 values 并从包根导出；保留既有数学裁剪语义。`mergeRefs` 位于 React interaction，支持对象 ref、普通 callback ref 和 React 19 cleanup。图集图标使用正确名称 `IconSpriteAtlasFile`，移除旧错拼别名。Panda runtime styling 使用明确子入口，CSS/VariantProps 类型仍可从根导入；StitchesComponent、旧 deep imports 与旧 DTO 适配器退出。

`Foundation / Tokens` 保留旧 Design System 的完整语义颜色、双主题面板、控件/图标尺寸、间距、字体、圆角和阴影展示。`Foundation / Theme` 保留主题 store 行为。布局、浮层、各控件/模板原有统一故事继续保留；新增 `Property / Complex bindings` 覆盖 18 个绑定场景。

B01–B10 文档和原架构表保留当时名称与验证数字，供追溯；当前使用方式以本文件、根文档及包 README 为准。不要按历史文档重新引入旧包。

## 验收与范围

运行格式、生产/stories/tooling/纯层/app 严格类型检查、demo 与统一 Storybook 生产构建、frozen install 和 dedupe。临时模型/ReactDOM/类型探针位于系统 TEMP；在浏览器验证实际编辑、拒绝、恢复、外部更新和主题，生产构建另行验证。最终结果与证据编号集中记录在台账，不以源码存在代替通过。

B11 的完成意味着这轮组件库改造结束。之后可以按真实业务启动 UI 驱动开发，先实现应用内存适配器，再接 C++ / Qt；不需要再保留一层旧 GUI 表单包装。
