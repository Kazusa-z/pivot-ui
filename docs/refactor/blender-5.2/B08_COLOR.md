# B08 颜色、渐变与颜色分布

本批对应 U38、U39、G15、G16 和 S04。公共入口为 `@pivot-ui/react`，纯模型也从 `@pivot-ui/react/values` 导入；能力类型也从 `@pivot-ui/react/contracts` 导入。验收与 Git 交付记录见 [实施台账](./LEDGER.md)。

## 颜色值约定

`ColorValue = { space: 'srgb' | 'linear', r, g, b, a }`。RGB 和 alpha 使用归一化通道；普通 RGB 与 alpha 范围为 0–1。设置 `hdr` 后 RGB 可以是大于 1 的有限非负数，alpha 仍是 0–1。受控值不合约时报错；需要清洗输入时显式调用 `normalizeColor`。新 `normalizeColor` 是范围清洗，不是旧 UI 的除以 255。

`convertColorSpace` 保留 alpha 和 HDR，转换一次指定编码。`parseHexColor`/`formatColorHex` 的 HEX 固定为 sRGB；HSV 也以 sRGB 编码定义。`getDisplayColor`/`getColorCss` 仅为普通网页预览转换并裁剪，不能将预览值写回权威数据。这是有限的 sRGB/Linear 转换，不替代 Qt 渲染器的完整显示变换或 HDR 输出。

RGB 字段的 `displaySpace` 是显示/编辑编码，切换它不修改 `value.space` 或属性值。HDRColorInput 的 Peak RGB 是当前编码下最大 RGB 通道的派生值，按比率修改通道；它不是另一份颜色权威值，也不宣称等同渲染曝光。纯黑没有可恢复的色相，提升 Peak RGB 从中性灰开始。

## 职责与依赖

| 模块                          | 职责                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| values/color                  | 颜色类型、验证、归一化、sRGB/Linear、HEX、HSV、插值                                                              |
| values/color-ramp             | 稳定停靠点、排序、采样与双轨模型                                                                                 |
| values/color-distribution     | 当前模式判别联合、独立缓存、模式切换纯规则                                                                       |
| contracts/ColorCapabilities   | 可选剪贴板、取色能力接口                                                                                         |
| interaction/color、color-ramp | 编辑会话和指针手势，隔离迟到结果                                                                                 |
| widgets/color/ColorWidget     | 独立内联单色编辑主体                                                                                             |
| templates/color               | ColorPicker、ColorInput、HDRColorInput、ColorRamp、ColorRampChannels、ColorRampPicker、ColorDistributionTemplate |

依赖方向是 `ColorInput → ColorPicker → ColorWidget`；ColorRamp 使用单色 ColorPicker，单色控件不导入渐变。ColorRampPicker 只负责将单轨或双轨编辑器放入弹层。模板不读取引擎对象或建立 Qt 连接。

## 编辑与宿主能力

颜色控件通过 `onValueChange` 请求实时值，通过 `onValueCommit` 表示一次完成，`onEditCancel` 表示尚未提交的编辑被取消。受控宿主负责接受预览以及取消/拒绝后的权威值恢复；模板不会伪造一次回滚 change。异步提交拒绝可保留草稿，resetKey、目标或外部更新使旧界面结果失效；已提交命令不能再收到第二次 cancel。

`resetKey` 表示对象或版本身份。同值目标切换也应更新它。显示编码、选中停靠点和弹层开关均是 UI 状态，不产生颜色写入。`disabled` 禁止交互；`readOnly` 保留查看能力，禁止编辑。

`ColorCapabilities` 可提供 clipboard.readText/writeText 与 eyeDropper.pick。未提供能力时对应操作不可用，控件不直接访问浏览器全局。应用示例适配位于 `app/src/host/browser/color.ts`，由应用创建并在拥有者销毁时调用 dispose；它处理浏览器能力检测、取色取消和资源释放。Storybook 使用明确的模拟能力，不会读取用户剪贴板或启动真实屏幕取色。

## 渐变与双轨

`ColorRampValue = { interpolation: 'linear' | 'constant', stops }`，每个 stop 为 `{id, position, color}`。同轨 ID 必须非空且唯一，position 范围 0–1。同一色轨采用统一编码；插值在该编码内进行。数组允许未排序与重合位置，采样采用稳定排序；恰好落在重合位置时最后一个 stop 生效。

`activeStopId/onActiveStopIdChange` 与值分离。选择、键盘切换选中点不调用 onValueChange。支持位置拖动、键盘和精确数字输入，增删通过明确按钮进行；空轨可以新增点。点 ID 不由位置或可编辑颜色推导。

`ColorRampChannelsValue = { color: ColorRampValue, alpha: AlphaStop[] }`，AlphaStop 为 `{id, position, alpha}`。alpha 轨另有 `activeAlphaStopId/onActiveAlphaStopIdChange`，ID 在各自轨道内唯一。最终 alpha 为色轨自身 alpha 与独立 alpha 采样值的乘积；空 alpha 轨采样为 1。颜色与 alpha 位置独立。ColorRampPicker 使用 `variant='ramp'|'channels'` 对应明确的值和回调类型。

## 分布模式与缓存

ColorDistributionTemplate 的必填受控 value 只有一个生效分支：

| mode         | 当前有效数据          |
| ------------ | --------------------- |
| constant     | color                 |
| gradient     | ramp（双轨）          |
| two-constant | colors（两项元组）    |
| two-gradient | ramps（两项双轨元组） |

`cache/defaultCache/onCacheChange` 单独保存非当前模式的已接受值。首次访问某个模式从当前值推导，再次访问恢复缓存。宿主拒绝的请求不会变成已接受缓存；resetKey 清理缓存和旧操作状态，受控缓存由宿主接受清空请求。模式切换是一项明确编辑，选择渐变点不是模式或数据编辑。

引擎 `time ↔ position`、颜色范围和存储编码转换在宿主边界完成。`stories/support/color-host-adapter.ts` 和 HostAdapterRoundTrip 故事演示带稳定引擎 ID 的归一化 DTO 往返；模板本身不理解引擎数据。

## 旧入口迁移

| 旧入口                                               | 本批处置                                                  |
| ---------------------------------------------------- | --------------------------------------------------------- |
| UI ColorPicker constant/hdr                          | 单次 DTO 转换后调用新单色 ColorPicker                     |
| UI ColorPicker gradient/particle                     | 转为 ColorRampPicker 对应的单/双轨变体                    |
| UI GradientSlider/ParticleSlider                     | 薄适配 ColorRamp/ColorRampChannels                        |
| UI HDRSlider                                         | 薄适配 HDRColorInput；范围对应派生 Peak RGB               |
| UI Color、HDRColor、helpers、useColorSpaceConversion | 仅兼容旧 0–255 与 base/intensity 形状，转换复用新纯模型   |
| GUI FormItemColor/FormItemGradient                   | 实现、出口及专属故事删除；用 PropertyRow + 新颜色模板组合 |

旧 HDR 强度在适配边界转成线性 RGB 倍率；新组件只接收实际 RGB。旧 Particle 的色轨 alpha 历史上不生效，适配时设为 1，由其独立 alpha 轨控制透明度。旧 stop 支持可选 id，回调会附带生成 ID；接收方应保留它。缺失 ID 的外部全量重建只能按数组位置映射，需稳定外部重排时直接迁到新模型。旧入口在 B11 删除。

旧 ColorPicker 内部面板、透明图案、Thumb/Range 和浏览器取色 hook 已退出；不保留第二套颜色交互内核。原 colord/react-colorful 依赖随唯一消费者退出而删除。

## 验证

本批故事覆盖单色/HDR、编码、alpha、异步能力、单轨/双轨、重合点、受控拒绝、分布缓存、Reset 与宿主 DTO 适配。按台账运行格式、全仓类型、Demo/三套 Storybook 构建、依赖审计及浏览器键盘/指针/明暗/窄屏验证。临时探针和截图放系统 TEMP，不新增独立测试文件。
