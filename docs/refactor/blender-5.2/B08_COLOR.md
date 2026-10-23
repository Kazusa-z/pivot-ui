# 颜色编辑

颜色组件用于编辑单色、透明度、HDR 和渐变。可以选择紧凑输入、弹出面板或始终显示的编辑面板；它们使用同一套颜色数据。

## 选择组件

| 组件                      | 界面                                  |
| ------------------------- | ------------------------------------- |
| ColorWidget               | 内联选色平面、Hue、RGB/HSV 和精确输入 |
| ColorPicker               | 颜色预览按钮，点击打开单色面板        |
| ColorInput                | 紧凑的颜色按钮、HEX 和透明度输入      |
| HDRColorInput             | ColorInput 加派生的 Peak RGB 调整     |
| ColorRamp                 | 带位置和颜色的渐变点                  |
| ColorRampChannels         | 独立的颜色轨和透明度轨                |
| ColorRampPicker           | 点击预览后打开单轨或双轨编辑器        |
| ColorDistributionTemplate | 在单色、渐变、双颜色和双渐变之间选择  |

## 单色值

`ColorValue` 使用 `{ space, r, g, b, a }`。space 为 `srgb` 或 `linear`；普通 RGB 和 alpha 都在 0–1 之间。

```tsx
import { useState } from 'react'
import { ColorInput, type ColorValue } from '@pivot-ui/react'

export function TintInput() {
  const [color, setColor] = useState<ColorValue>({ space: 'srgb', r: 0.2, g: 0.5, b: 0.8, a: 1 })
  return <ColorInput label="Tint" value={color} onValueChange={setColor} />
}
```

`onValueChange` 请求显示新颜色，应用应回传 value。选择点、切换显示编码和打开弹层不会修改颜色值。

RGB 字段的 `displaySpace/onDisplaySpaceChange` 只控制当前显示和编辑的编码，不会自动改写 `value.space`。HEX 和 HSV 按 sRGB 定义。需要转换存储值时，显式使用 `convertColorSpace`。

## HDR 与显示预览

设置 `hdr` 后，RGB 可以是大于 1 的有限非负数，alpha 仍在 0–1。HDRColorInput 自动使用 HDR 范围。

Peak RGB 是当前编码中最大 RGB 通道的派生值，调整它会按比率缩放通道；它不是额外存储的颜色字段，也不是曝光档位。`intensityMin/intensityMax/intensityStep` 控制该输入。纯黑没有色相可恢复，提升 Peak RGB 从中性灰开始。

`getColorCss/getDisplayColor` 会转换并裁剪到普通网页预览范围。不要把这种预览结果写回 HDR 数据。网页预览也不等同于渲染器的完整色彩管理或 HDR 输出。

## 渐变与透明度轨

`ColorRampValue` 包含 `interpolation` 和 `stops`；interpolation 为 `linear` 或 `constant`。每点为 `{id,position,color}`，position 在 0–1，id 非空且在轨道内唯一。同一轨道的颜色采用同一种 space。

```tsx
import { useState } from 'react'
import { ColorRamp, type ColorRampValue } from '@pivot-ui/react'

export function GradientInput() {
  const [value, setValue] = useState<ColorRampValue>({
    interpolation: 'linear',
    stops: [
      { id: 'start', position: 0, color: { space: 'srgb', r: 0, g: 0, b: 0, a: 1 } },
      { id: 'end', position: 1, color: { space: 'srgb', r: 1, g: 1, b: 1, a: 1 } },
    ],
  })
  return <ColorRamp aria-label="Gradient" value={value} onValueChange={setValue} />
}
```

点可以拖动、用键盘调整或输入精确位置。`activeStopId/onActiveStopIdChange` 单独控制选中点，选择不产生值修改。增删使用独立操作；空轨仍可新增点。

允许未排序和重合位置。采样会稳定排序，恰好位于重合位置时最后一个点生效。ID 不能用位置推导，否则移动或重合会丢失身份。

ColorRampChannels 的值为 `{ color: ColorRampValue, alpha: AlphaStop[] }`，alpha 点为 `{id,position,alpha}`。两个轨道独立选中和移动；最终透明度是颜色轨自身 alpha 与独立 alpha 轨采样值的乘积，空 alpha 轨按 1 处理。

ColorRampPicker 使用 `variant="ramp"` 或 `variant="channels"`，值和回调与对应编辑器匹配。

## 颜色分布

ColorDistributionTemplate 的 value 只包含当前模式的数据：

| mode         | 数据                            |
| ------------ | ------------------------------- |
| constant     | `color`                         |
| gradient     | `ramp`，为双轨渐变              |
| two-constant | `colors`，两个颜色组成的元组    |
| two-gradient | `ramps`，两个双轨渐变组成的元组 |

`cache/defaultCache/onCacheChange` 可以单独保存其它模式的数据。第一次切换时从当前值生成，之后恢复已接受的缓存；失败的请求不进入缓存。`resetKey` 变化清理当前编辑和模式缓存。受控 cache 需要应用接受相应更新。

## 取色和剪贴板

通过 `capabilities` 传入 `ColorCapabilities`：`clipboard.readText/writeText` 和 `eyeDropper.pick` 都是可选能力。没有提供时对应按钮不可用。组件不会自行读取用户剪贴板或启动屏幕取色。

应用可把这些接口连接浏览器或桌面功能。返回值需要遵循颜色数据格式；错误通过 Promise 拒绝反馈。切换目标、禁用或卸载后，过期能力结果不会覆盖当前界面。

## 提交与取消

`onEditStart/onValueChange/onValueCommit/onEditCancel` 分别表示开始、预览、完成和取消尚未提交的编辑。提交可以返回 Promise，失败后提供重试或取消路径。

受控组件不额外发送恢复起点的 change。应用若实时接受预览，需要自行决定取消后恢复什么值，或者使用[PropertyField](./B11_INTEGRATION.md)连接统一属性数据。对象或版本改变时更新稳定的 `resetKey`；已经发出的保存请求不能通过关闭弹层撤回。

`disabled` 禁止交互，`readOnly` 保留查看但禁止值修改。弹层尺寸受可用窗口限制，长内容可滚动。
