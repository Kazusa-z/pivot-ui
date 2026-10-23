# 曲线编辑

曲线编辑器通过点和控制柄表达一个随横坐标变化的数值。横纵轴的含义由应用决定，可以是时间与数值，也可以是其它两个量。

## CurveWidget 与 CurvePicker

CurveWidget 始终内联显示，适合编辑区域；CurvePicker 显示预览按钮，点击后打开编辑面板。两者都使用受控 `value/onValueChange`。

```tsx
import { useState } from 'react'
import { CurveWidget, type CurveValue } from '@pivot-ui/react'

export function ResponseCurve() {
  const [curve, setCurve] = useState<CurveValue>({
    interpolation: 'linear',
    points: [
      { id: 'start', x: 0, y: 0 },
      { id: 'end', x: 1, y: 1 },
    ],
  })
  return <CurveWidget label="Response" value={curve} onValueChange={setCurve} xLabel="Input" yLabel="Output" />
}
```

界面支持点和控制柄拖动、键盘微调、精确坐标输入、增删点和插值选择。`showInterpolationSelector={false}` 可以隐藏插值选择；`showAnimation` 显示采样动画。

## 数据格式

`CurveValue` 是 `{ interpolation: 'linear' | 'bezier', points }`。每个点有非空且唯一的 id、有限 x/y，以及可选 `inHandle/outHandle`。

控制柄使用绝对坐标。按 x 严格递增排列点，并为每个点提供不同的 x。入柄的 x 位于前一段，出柄的 x 位于后一段，y 可以超出端点范围。加载外部数据时先用 `assertCurveValue` 校验，再传给编辑器。

`sampleCurve(value, x)` 按相邻点分段采样。linear 使用直线；bezier 按横坐标求三次曲线值。缺少控制柄时该柄位于锚点。空曲线返回 null，单点和范围外采样使用端点值。

## 选择与视图独立控制

| 参数                                                                | 作用                     |
| ------------------------------------------------------------------- | ------------------------ |
| `selectedPointIds/defaultSelectedPointIds/onSelectedPointIdsChange` | 选中哪些点               |
| `viewport/defaultViewport/onViewportChange`                         | 当前可见坐标范围         |
| `bounds`                                                            | 限制后续坐标编辑         |
| `xStep/yStep/precision`                                             | 精确输入与键盘步长、精度 |
| `xLabel/yLabel`                                                     | 轴名称                   |
| `formatXTick/formatYTick`                                           | 格式化刻度文字           |

用选点定位编辑对象，用平移、缩放和 Fit 检查不同范围，再按需开启动画查看采样结果。通过选中点和 viewport 的回调保存这些显示状态；修改坐标或增删点时，通过 `onValueChange` 接收完整 CurveValue。

viewport 使用 `{xMin,xMax,yMin,yMax}` 指定可见范围，bounds 指定后续编辑可到达的范围，已有点继续按原坐标显示。编辑某一坐标轴时只应用该轴的限制。相邻点间没有可用 x 区间时保持该 x，仍可编辑 y。`formatXTick/formatYTick` 适合显示单位或百分比；需要改变保存的坐标时，在应用中转换 value。

CurvePicker 没有指定初始视图时，会在打开编辑器时根据曲线适配视图，之后保留用户调整的缩放。应用需要控制视图时，传入 viewport 和 onViewportChange。

## 预设

CurvePresets 提供内置只读预设，也可以接收 `presets` 或 `CurvePresetService`。服务至少提供 `list/load`，`save/remove` 可选。缺少保存或删除能力时，对应操作不可用。

列表项包含 id 和 label，load 返回完整 CurveValue。save 接收 `{label,value}`，由应用分配 ID 并决定同名处理。应用预设时通过编辑回调更新当前曲线；保存或删除预设时更新预设列表，当前曲线保持显示。

在应用中实现 CurvePresetService，把 list/load/save/remove 连接到浏览器存储、服务器或桌面接口。关闭面板、切换服务或目标后，界面忽略过期请求的返回结果；服务已经执行的保存继续有效，需要撤销时由应用提供相应操作。

## NumericDistributionTemplate

需要在常量和曲线之间选择时使用 NumericDistributionTemplate。value 是明确的模式联合：

| mode         | 数据                                        |
| ------------ | ------------------------------------------- |
| constant     | `value: number`                             |
| curve        | `curve: CurveValue`                         |
| two-constant | `values: readonly [number, number]`         |
| two-curve    | `curves: readonly [CurveValue, CurveValue]` |

`cache/defaultCache/onCacheChange` 保存非当前模式的数据。再次进入模式时优先恢复已接受的缓存；首次进入时从当前数据推导。空曲线转常量使用 0，常量转曲线生成 x=0/1 的水平线；其它转换按端点采样，应用可在需要时自行提供缓存。

普通数值约束作用于常量字段。曲线单独使用 `curveBounds/curveViewport/curveXStep/curveYStep/curvePrecision`，预设通过 `curvePresets/curvePresetService` 注入。

## 保存和只读

`onEditStart/onValueChange/onValueCommit/onEditCancel` 分别表示开始、预览、完成和取消尚未提交的编辑。受控应用接受预览，并决定取消或保存失败后恢复的值。需要统一保存行为时，使用[PropertyField](./B11_INTEGRATION.md)。

`resetKey` 表示对象或版本身份，同值的新对象也应改变它。过期异步结果不再更新当前界面，但已提交请求仍需由应用判断目标和版本。`readOnly` 允许查看和调整视图，禁止值修改；`disabled` 禁用交互。
