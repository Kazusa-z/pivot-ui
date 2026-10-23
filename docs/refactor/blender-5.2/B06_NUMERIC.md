# 数值和几何

InputNumber 适合精确输入和拖动微调；Slider 适合直接调整范围；向量和矩形输入把相关数字作为一个值编辑。所有数值都使用有限 number，不执行字符串表达式。

## InputNumber

```tsx
import { useState } from 'react'
import { InputNumber } from '@pivot-ui/react'

export function StrengthInput() {
  const [value, setValue] = useState(2)
  return (
    <InputNumber
      aria-label="Strength"
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      softMax={10}
      step={0.1}
      dragStep={0.01}
      precision={2}
      stepper
    />
  )
}
```

点击进入文本编辑；未聚焦时按下并拖动可微调数字。已经聚焦的输入保留普通文本选择行为。方向键和可选 stepper 按钮按 `step` 调整，拖动按 `dragStep` 调整。

| 参数              | 含义                                             |
| ----------------- | ------------------------------------------------ |
| `min/max`         | 硬范围，所有有效请求都受它限制                   |
| `softMin/softMax` | 拖动和步进使用的范围，文本可输入硬范围内的其它值 |
| `step`            | 键盘及 stepper 增量，默认 1                      |
| `dragStep`        | 每像素拖动增量，默认 0.1                         |
| `precision`       | 小数精度，0–15                                   |
| `mixed`           | 多对象值不一致时显示占位，不代表数字 0           |
| `resetKey`        | 目标或版本身份，变化后清理当前编辑               |

没有显式 precision 时通常使用 12，并根据较小步长最多提升到 15。Ctrl/⌘ 将微调量缩小到十分之一，Shift 放大到十倍，两者同时按下时细调优先。

软范围外的合法起点不会突然跳到端点。例如当前值 25、softMax 10，向内一步可以到 24，向外保持 25。输入中的 `-`、小数点或未完成指数可以暂时显示；只有完整有限数值才触发有效预览。Enter 或失焦提交时，非法文本显示错误。输入法组合期间 Enter 不提交。

## Slider 与 NumericSlider

Slider 的值是 `number[]`。一个元素表示单滑块，两个或更多表示多个有顺序的滑块。使用有限 `min/max`、正 `step`，可以配置水平/垂直、RTL、`thumbLabels`、刻度及最小间距。

```tsx
import { useState } from 'react'
import { Slider, NumericSlider } from '@pivot-ui/react'

export function RangeInputs() {
  const [range, setRange] = useState([20, 80])
  const [amount, setAmount] = useState(0.5)
  return (
    <>
      <Slider
        aria-label="Range"
        thumbLabels={['Start', 'End']}
        value={range}
        onValueChange={setRange}
        min={0}
        max={100}
      />
      <NumericSlider label="Amount" value={amount} onValueChange={setAmount} min={0} max={1} step={0.01} />
    </>
  )
}
```

`minStepsBetweenThumbs` 限制相邻滑块间隔，`minStepsToEdges` 限制端点间隔。无法满足间距的请求不会改变值。NumericSlider 组合一个数字输入和滑块，两部分共用同一个标量；轨道可以使用软范围，文本仍可输入硬范围内的值。

DistributionSlider 用于固定总量的分段。数组元素是每一段的长度，不是累计边界；配置 `total/minSegment/step`。N 段最多有 N−1 个可调分界，零长度段可以保留。输入数据必须有限、非负且满足总量要求。

## 向量、矩形与自定义轴

Vector2Input、Vector3Input、Vector4Input 分别使用 `{x,y}`、`{x,y,z}`、`{x,y,z,w}`。RectInput 使用 `{x,y,width,height}`。它们返回完整对象，不要求应用自行拼装其它轴。

```tsx
import { useState } from 'react'
import { Vector3Input, RectInput } from '@pivot-ui/react'

export function GeometryInputs() {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 5 })
  const [rect, setRect] = useState({ x: 0, y: 0, width: 100, height: 60 })
  return (
    <>
      <Vector3Input label="Position" value={position} onValueChange={setPosition} axes={{ z: { min: 0, unit: 'm' } }} />
      <RectInput label="Bounds" value={rect} onValueChange={setRect} sizeConstraints={{ min: 0 }} />
    </>
  )
}
```

几何控件的 `axes` 是按字段名配置的对象，允许只配置部分轴。RectInput 的 `positionConstraints/sizeConstraints` 分别作用于位置和尺寸，单轴配置可覆盖它们。

NumericTupleInput 适合自定义多个数值，使用数值数组和对应的 `axes` 数组。每轴有唯一 key、label、可选 unit、范围、精度、readOnly 和 disabled。数组顺序表示轴顺序。

`linked/onLinkedChange` 控制比例锁定。主轴非零时按本次编辑起点保持比例，缩放受各轴硬范围共同限制；主轴为零时只改变主轴。RectInput 不提供把位置和尺寸一起缩放的比例锁定。

## 预览、提交和取消

| 回调                           | 什么时候发生                           |
| ------------------------------ | -------------------------------------- |
| `onEditStart(source)`          | 编辑开始；返回 false 可以拒绝开始      |
| `onValueChange(value)`         | 请求显示一个有效预览值，拖动可触发多次 |
| `onValueCommit(value, reason)` | 一次编辑结束；可返回 Promise 等待保存  |
| `onEditCancel(reason)`         | 尚未提交的编辑被取消                   |

source 包括 `text/drag/step/slider`；提交原因包括 `enter/blur/pointer-up/step`。元组和几何回调还提供编辑轴。Enter 后紧随的失焦不会重复提交。等待保存时阻止再次写入；失败后文本可重试，滑块可开始新手势。

受控组件不会额外发送一个恢复起点的 `onValueChange`。如果应用把预览立即写入状态，需要在开始时保存起点，并在用户取消时恢复；外部数据更新或对象切换时应保留新数据。使用 PropertyField 可以把这部分连接到统一的属性接口，见[属性数据与提交](./B11_INTEGRATION.md)。

原生 form reset 未被 `preventDefault()` 阻止时，非受控组件恢复默认值，受控值仍由应用决定；本地草稿和手势会被清理。关闭或卸载不能撤回已经发送的保存请求。
