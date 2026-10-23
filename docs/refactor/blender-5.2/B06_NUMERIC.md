# B06 数值编辑、滑块与几何模板

> B11 收口说明：本文保留该批迁移记录；旧适配器、旧包与多 Storybook 指令已退出。当前属性联调和消费方式以 [B11 最终指南](./B11_INTEGRATION.md) 为准。历史验证数字不代表当前构建。

新入口来自 `@pivot-ui/react`，纯值函数也可从 `@pivot-ui/react/values` 导入。本批对应 U05/U11/U12、G04–G10；验收和提交状态以 [实施台账](./LEDGER.md) 为准。

## 分层与唯一状态所有者

`values/numeric` 负责有限数解析、精度、硬/软范围、步进和网格量化；`values/distribution` 负责分段长度与累计边界；`values/geometry` 定义对象和元组转换；`values/proportion` 负责一次编辑起点上的比例策略。以上模块不依赖 React、DOM 或宿主实现。

`interaction/numeric` 将数值草稿、指针拖动和生命周期分开。InputNumber 是完整控件，Slider 是一组数值的轨道，DistributionSlider 在 Slider 上表达固定总量的分段长度。`templates/numeric` 组合 NumericSlider、NumericTupleInput、Vector2/3/4Input 和 RectInput；模板不创建自己的后端或撤销栈。

`PropertyField` 绑定一个数值 PropertyAccess。默认 number 使用 InputNumber，指定 `widget="numeric-slider"` 使用复合输入。`descriptor.constraints` 与 `unit` 传给控件；快照的 preview 用于实时显示，权威 value 与 history 只在宿主接受 commit 后变化。

## 公共编辑接口

控件使用 `value/defaultValue/onValueChange`；受控值由调用者回传，固定 value 不会伪装接受拖动请求。文本草稿允许暂时不同于数值，但并不代表宿主已经接受它。

| 接口                         | 含义                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| onEditStart(source)          | 第一次输入或手势开始；返回 false 可拒绝开始。source 为 text、drag、step 或 slider。             |
| onValueChange(value)         | 当前有效预览请求；连续拖动可以多次触发。                                                        |
| onValueCommit(value, reason) | 一次编辑的最终请求；reason 为 enter、blur、pointer-up 或 step。可返回 Promise；拒绝会显示错误。 |
| onEditCancel(reason)         | 未提交编辑被取消。pending 已发出的提交不能再由取消回调撤回。                                    |
| resetKey                     | 同值新版本、目标切换或重置的身份；变化后旧本地编辑失效。                                        |

受控取消只发送 onEditCancel，不额外伪造 onValueChange(initialValue)。使用本地状态模拟预览时，应用在 onEditStart 保存起点，在用户取消时回滚；external-update、reset、target-change 等外部状态替换应保留新权威值。非受控组件恢复内部起点。PropertyField 直接调用原 EditSession.cancel，由宿主恢复 preview。

原生 form reset 遵守 preventDefault：未阻止时，非受控控件和模板恢复首次默认值（InputNumber 按当前硬约束规范化）；受控值仍由应用决定，本地草稿与手势被清理。pending 的旧界面结果失效，不向已提交操作发送第二次终结通知。

Enter 与紧随其后的 blur 只提交一次；pending 时不允许第二次写入。拒绝后文本草稿可修改或 Enter 重试；滑块可开始新的手势。外部更新和对象切换使旧界面结果失效，已提交操作仍绑定原目标。卸载清理监听和捕获；它不会撤回已提交的宿主命令。

## 数值规则与交互

InputNumber 使用文本输入保存 `-`、小数点和指数的中间草稿；只接受有限十进制数，不执行表达式。完整文本产生数值预览，非法或不完整文本提交时显示错误，Escape 可取消。IME 组合期间 Enter 不提交。

`min/max` 是硬范围；`softMin/softMax` 限制拖动与步进。文本可以超出软范围，但不能超出硬范围。软范围外的合法起点纳入本次手势的有效范围：例如起点 25、softMax 10，向内一步可到 24，向外保持 25，不突然跳到 10。

`step` 用于键盘和可选 `stepper` 按钮，默认 1；`dragStep` 是每像素拖动增量，默认 0.1。Ctrl/⌘ 细调到十分之一，Shift 加速到十倍，细调优先。精度默认 12，根据更小的 step/dragStep 最多提升到 15；显式 precision 为 0–15。最终有效数值只走共享数值规则，不通过伪造 React change 事件。

未聚焦时按下并移动超过阈值才开始拖动；点击进入文本编辑，聚焦后支持原生文本选择。拖动使用 pointer capture，Escape、pointercancel、捕获丢失、窗口失焦及不可用状态终止未提交手势。数值 mixed 为空占位，单纯聚焦/离开不会写入 0；明确输入 0 仍是有效编辑。

Slider 使用 `number[]`，支持多 thumb、水平/垂直、RTL、键盘、最小 thumb 间距和保序。minStepsToEdges 限制端点间距而不改变视觉轴，无法满足的间距请求被忽略。轨道范围必须有限；刻度有明确上限，不按巨大范围逐整数循环。NumericSlider 的轨道显示软范围，文本仍可输入硬范围内的值；两部分共享一个标量值与同一组编辑回调。

DistributionSlider 的数组表示每段长度，不能与累计边界混用。使用 `total`、`minSegment` 和 `step`；模型校验总量、有限非负分段与可达间隔，保留零段及总量。N 个分段最多对应 N−1 个可调边界。旧 CascadeSlider 的 max/onChange 只在适配边界映射为 total/onValueChange。

## 元组、向量和矩形

NumericTupleInput 接收数值数组与 axes；每轴有稳定 key、名称、单位和约束。Vector2/3/4Input 保留 `{ x, y, z, w }` 中对应维度的数据形状，内部只转换一次。`axes` 可对单轴配置范围和精度。

比例锁定使用受控 `linked/onLinkedChange`。比例始终从一次编辑的起始元组计算；主轴为零时只改变主轴，其他轴保持原值。非零主轴的共同缩放比例受所有轴硬范围交集限制，不分别钳制派生轴而破坏比例；派生轴也不重复做精度舍入。不可达的联动约束不产生写入。

RectInput 保留 `{ x, y, width, height }`。`positionConstraints` 与 `sizeConstraints` 分别作用于位置和尺寸，单轴 axes 可覆盖；它不是带四个通用轴名的 Vector4，也不把位置和尺寸一起比例缩放。

## 旧入口退出与验证

删除 FormItemInputNumber、FormItemSlider、FormItemCascadeSlider、FormItemVector2/3/4、FormItemRect 的实现、Props 出口和专属故事。使用 PropertyRow 组合新控件/模板；需要属性事务时使用 PropertyField。旧 UI InputNumber、Slider、CascadeSlider 留一层适配直到 B11，不保留旧数值状态 hook 或精度函数。颜色、曲线、集合和资源完整重构仍归后续批次。

统一 Storybook 位于 6009 的 Widgets、Templates 和 Property/PropertyField；现有 GUI Group/Array 示例同步使用新数值组件。故事覆盖受控结果、编辑记录、Reset 和可用性状态。临时事件探针、浏览器操作和完整检查的结果见台账；没有新增独立测试文件。
