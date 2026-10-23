# B09 曲线与数值分布

本批对应 U40、G17 和 S05。统一入口为 `@pivot-ui/react`，纯模型也从 `@pivot-ui/react/values` 导入，预设能力类型也从 `@pivot-ui/react/contracts` 导入。验收和 Git 交付记录见 [实施台账](./LEDGER.md)。

## 模型与术语

CurveWidget 是属性曲线编辑控件，不是完整的 Blender Graph Editor。坐标单位由属性和宿主定义，不把横轴固定解释为时间，也不把纵轴固定解释为粒子倍率。

`CurveValue = { interpolation: 'linear' | 'bezier', points }`。每个点有稳定的非空 `id`、有限 `x/y`，以及可选 `inHandle/outHandle`。控制柄使用绝对坐标；同一曲线的点 ID 唯一，x 严格递增。重复或乱序 x 属于不合法输入，不暗中合并点。控制柄的 x 落在相邻锚点之间，y 可以超出锚点范围；两个控制柄独立编辑。

`sampleCurve(value, x)` 在相邻点之间分段求值：linear 为直线，bezier 先求参数再按横坐标采样三次曲线。缺少控制柄时该柄落在锚点上。空曲线返回 null，单点或定义域外以端点值延拓。它不是将整个点数组视为一条高阶 Bezier 的旧算法。

`CurveViewport` 定义 `xMin/xMax/yMin/yMax`。viewport 控制当前视图，bounds 限制后续坐标编辑；二者不裁剪已存在的合法权威值。修改坐标时仅限制该次编辑的轴，不重写另一个轴。极窄的相邻浮点间距也保持严格顺序；没有可用横坐标区间时拒绝该轴移动，纵轴仍可编辑。

## 职责与依赖

| 模块                                        | 职责                                                      |
| ------------------------------------------- | --------------------------------------------------------- |
| values/curve                                | 点/控制柄模型、验证、分段采样、SVG 路径、视图与刻度纯函数 |
| values/numeric-distribution                 | 当前模式判别联合、独立模式缓存和切换规则                  |
| contracts/curve                             | 预设列表、读取、可选保存/删除能力                         |
| interaction/value                           | 颜色和曲线组合共用的编辑归属、提交/取消及迟到结果处理     |
| widgets/curve/CurveWidget                   | 内联曲线、点和控制柄编辑、数值输入、选择、视图及可选动画  |
| templates/curve/CurvePicker                 | 预览触发器、浮层及 CurveWidget/CurvePresets 组合          |
| templates/curve/CurvePresets                | 内置/注入预设和异步预设服务 UI                            |
| templates/curve/NumericDistributionTemplate | 常量、曲线、双常量、双曲线的组合                          |
| app/src/host/browser/curve-presets          | 显式注入 Storage 的应用侧存储适配                         |

依赖方向为 `NumericDistributionTemplate → CurvePicker → CurveWidget`；CurvePicker 组合 CurvePresets。模型与契约不依赖 React、DOM、存储或 Qt。模板不导入旧 ui/gui 包。

## 编辑与视图

`value` 是必填受控值。`onValueChange` 请求实时预览，`onValueCommit` 表示完成一次编辑，`onEditCancel` 通知尚未提交的编辑取消。宿主接受预览并负责取消/拒绝后的权威值恢复。`resetKey` 表示对象或版本身份；切到同值的不同对象也应更新它。已发出提交的会话不会再次通知 cancel，过期结果不能覆盖新对象或新编辑。

`selectedPointIds/defaultSelectedPointIds/onSelectedPointIdsChange`、`viewport/defaultViewport/onViewportChange` 与属性值分开。单击选点、平移、缩放、Fit、切换动画和标签格式不生成属性历史。点/控制柄支持指针与键盘编辑，精确坐标复用 InputNumber；Escape 取消尚未提交的编辑。`showAnimation` 显式开启采样动画。

`xLabel/yLabel` 表示轴名称；`formatXTick/formatYTick` 只格式化刻度文字，不转换值。默认允许选择插值方式，兼容入口可通过 `showInterpolationSelector={false}` 固定它。`disabled` 禁用交互，`readOnly` 可查看但不能修改值。弹层在窄屏中限制宽高并滚动。

## 预设能力

CurvePresets 默认提供只读内置预设；也可传入 `presets`。`CurvePresetService` 必须有 `list/load`，`save/remove` 可选。列表只传 id/label，load 返回完整 CurveValue。保存传 `{label,value}`，由服务产生 ID 和决定同名策略。缺少能力时相应操作不可用；控件不读取 localStorage，也不假装保存成功。

保存/删除预设是库操作，不修改当前曲线或属性历史；应用预设才进行曲线编辑。不同目标、服务、值、只读状态和卸载会使旧请求的 UI 结果失效。这不能撤销服务已经执行的外部写入，宿主服务自行决定事务或取消语义。

`createBrowserCurvePresetService(storage, key?, createId?)` 是应用侧可选适配。调用方显式提供 Storage；每次操作重新读取并校验版本、ID、名称和曲线。返回值复制隔离，损坏数据报错而不覆盖，配额/权限异常直接上抛。默认 key 为 `pivot.curve-presets.v1`，允许同名不同 ID；旧 `_bezier_curve_presets` 不会被读取、覆盖或自动迁移，需要时由应用执行显式导入。

## 数值分布与引擎边界

| mode         | 当前有效数据                              |
| ------------ | ----------------------------------------- |
| constant     | value: number                             |
| curve        | curve: CurveValue                         |
| two-constant | values: readonly [number, number]         |
| two-curve    | curves: readonly [CurveValue, CurveValue] |

`cache/defaultCache/onCacheChange` 单独保存各模式已接受值；首次进入模式从当前值推导，再次进入恢复缓存。被宿主拒绝的值不当成已接受缓存；resetKey 清理缓存与旧编辑状态，受控缓存由宿主接受清空请求。空曲线转换为常量回退到 0；单曲线在 x=0/1 采样生成双常量，双曲线各取 x=0，转为单常量取第一项。常量生成 x=0/1 的水平曲线，双常量生成单曲线时连接两端值，生成双曲线时各自水平。曲线与双曲线互转分别复制当前曲线或取第一条；已有缓存优先恢复。

普通 NumericConstraints 只影响常量字段及切换时推导的常量。`curveBounds/curveViewport/curveXStep/curveYStep/curvePrecision` 单独配置曲线；预设通过 `curvePresets/curvePresetService` 注入。引擎 time、控制柄、稳定 ID 和 multiplier 转换见 `stories/support/numeric-curve-host-adapter.ts`：multiplier 是宿主元数据，不反复乘进曲线 y。

PropertyValue 当前仍是 string/number/boolean/enum；复杂曲线/分布的 PropertyField 绑定留 B11。B09 通过受控回调和模拟宿主验证，未建立真实 C++/Qt 连接。

## 旧入口

`FormItemParticleCurve`、`FormItemParticle` 别名及其专属故事和出口删除。新代码将 NumericDistributionTemplate 与 PropertyRow 显式组合。

旧 UI BezierCurveEditor 保留至 B11，只转发 CurvePicker，并集中转换旧点形状。未标注的旧数组 `P0,C0,C1,P1,C2,P2,...` 将中间点的出柄按入柄镜像解释；短数组按 linear 处理。输出保留旧成对排列，同时携带稳定 id、interpolation 和可选独立控制柄元数据，保证受控回传不丢失新编辑能力；调用方须原样保留这些字段。interpolation 标记优先于旧 algo 提示，避免四个 linear 锚点被误解成两点 Bezier。丢弃扩展字段后会恢复旧镜像含义，不能精确表达独立控制柄。

旧空数组没有携带 interpolation 的位置，因此删空后按 algo 回退插值方式；重新新增和取消仍可用。需要空曲线也保留插值方式时使用新 CurveValue。linear 曲线中的暂存控制柄元数据同样完整往返，供后续切回 bezier 使用。

旧 yTickScale 只转换刻度文字，其修改不写曲线。旧 onChange 入口只在 Escape、指针取消、失焦、禁用或只读中断时恢复编辑前快照；外部更新、目标切换和卸载不会回写旧快照。原有图形、预设存储和动画实现已删除，不保留第二套编辑内核。
