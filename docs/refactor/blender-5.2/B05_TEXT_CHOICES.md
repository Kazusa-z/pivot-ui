# 文本和选项

文本控件适合名称、说明和普通字符串；选项控件适合从明确列表中选择值。它们使用 React 受控模式，不会自动保存数据。

## Input 与 Textarea

`Input` 是单行输入，`Textarea` 是多行输入。两者保留原生属性、`onChange` 和 ref，同时提供 `onValueChange(string)`。只需要字符串时使用后者，不必从事件中取值。

```tsx
import { useState } from 'react'
import { Input, Textarea } from '@pivot-ui/react'

export function TextFields() {
  const [name, setName] = useState('Camera')
  const [description, setDescription] = useState('')
  return (
    <>
      <Input aria-label="Name" value={name} onValueChange={setName} />
      <Textarea aria-label="Description" value={description} onValueChange={setDescription} />
    </>
  )
}
```

Input 的 `startSlot/endSlot` 放输入两侧内容，ref 指向输入本身，`rootRef` 指向外层容器。提供标签和说明时，把 ID 关联到真实输入。

普通输入每次键入都会请求新值。它不解析数字，也不等待保存；数值使用 [InputNumber](./B06_NUMERIC.md)，需要确认后保存文字时使用 EditableText。

## EditableText：点击后改名

EditableText 平时显示文字，激活后进入编辑。`value` 是应用接受的文字，`onCommit` 接收提交草稿，可返回 Promise。

```tsx
import { useState } from 'react'
import { EditableText } from '@pivot-ui/react'

export function RenameExample() {
  const [name, setName] = useState('Camera')
  return (
    <EditableText
      label="Object name"
      value={name}
      onCommit={(draft) => {
        if (!draft.trim()) throw new Error('Name cannot be empty.')
        setName(draft)
      }}
    />
  )
}
```

Enter 或失焦提交，紧接着发生的 Enter 与失焦不会重复提交；Escape 取消尚未提交的草稿。中文等输入法组合期间 Enter 不提交。提交失败会保留草稿并显示错误，用户可以修改后重试。

`onBegin` 可以返回 false 阻止编辑；`onDraftChange` 观察草稿；`onCancel` 处理未提交编辑的取消。`resetKey` 用于目标或数据版本改变，即使文字一样也能清理过期草稿。正在等待的保存请求不会因关闭控件而被撤销。

需要自己组合输入与操作按钮时，使用 `useTextEdit`。它返回 `draft/phase/error`、编辑方法和 `inputProps`。多行模式下普通 Enter 换行，Ctrl/⌘+Enter 提交。

## 选项控件怎么选

| 控件           | 适用场景                   | 值                                                  |
| -------------- | -------------------------- | --------------------------------------------------- |
| Checkbox       | 一个开关或混合开关         | `boolean` 或显示用的 `indeterminate`                |
| Select         | 无搜索的单选下拉           | `T` 或 `null`                                       |
| Combobox       | 可搜索的单选或多选         | 单选 `T/null`；`multiple` 为 true 时 `readonly T[]` |
| SegmentControl | 少量互斥选项，始终选中一项 | `T` 或尚未选择的 `null`                             |
| ToggleGroup    | 可再次点击取消的选项组     | single 为 `T/null`；multiple 为数组                 |

```tsx
import { useState } from 'react'
import { Combobox, Select, type ChoiceOption } from '@pivot-ui/react'

const options: readonly ChoiceOption<string | number>[] = [
  { key: 'text-code', label: 'Code 001', value: '001' },
  { key: 'numeric-id', label: 'Number 1', value: 1 },
]

export function ChoiceFields() {
  const [single, setSingle] = useState<string | number | null>(null)
  const [multiple, setMultiple] = useState<readonly (string | number)[]>([])
  return (
    <>
      <Select aria-label="Primary value" options={options} value={single} onValueChange={setSingle} />
      <Combobox aria-label="Included values" multiple options={options} value={multiple} onValueChange={setMultiple} />
    </>
  )
}
```

`ChoiceOption.key` 是非空且唯一的 UI 身份，`value` 是返回给应用的原值。值只能是字符串或有限数字，并且在选项中唯一。`'001'`、`'1'`、`1` 彼此不同；空字符串可以是选项值，`null` 才表示没有选择。不要通过 DOM 字符串猜测数字。

每个选项可以设置 `disabled/disabledReason`。`renderOption/renderValue` 等显示回调属于控件配置，基础选项数据不保存 React 元素。

## 只读、禁用和原生表单

`readOnly` 允许读取和获得焦点，但不请求修改；`disabled` 停用相关交互。忽略 `onValueChange` 只是拒绝受控更新，不会自动赋予只读语义。

提供 `name/form` 时，选项值按 HTML 表单规则序列化为字符串；JS 回调仍保留原类型。多选提交同名的多个值，null 不提交值。只读值可以提交，禁用值不提交。Select/Combobox 不提供浏览器 `required` 校验，请在应用数据处理中校验。

需要统一标签、说明、异步错误和保存逻辑时，参见[属性数据与提交](./B11_INTEGRATION.md)。
