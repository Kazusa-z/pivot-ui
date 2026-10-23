# Blender 5.2 LTS 对齐重构批次计划

更新日期：2026-10-23。工作分支：`feat-blender-5-2-refactor`。

本计划执行已采纳的 [重构方案](D:/QtProject/editor-ui-custom/docs/architecture/BLENDER_5_2_REFACTOR_PLAN.md)，将重构划分为 B00–B11 共 12 批。每批完成实现、验证和台账更新后再推进其依赖批次；当前进度以 [实施台账](D:/QtProject/editor-ui-custom/docs/refactor/blender-5.2/LEDGER.md) 为准。

U01–U42、G01–G23 沿用方案中的组件编号，每项只有一个主负责批次。辅助类型、hooks、内部零件和 stories 随主组件迁移；跨组件的共同事项单独登记。

## 1 执行规则

1. 开始一个批次前，核对前置批次和工作树；在台账写明本批实际范围、入口变化和验收场景。
2. 同一时间保持一个主推进批次。可并行处理已满足依赖且文件互不冲突的工作项，合入前统一验证。
3. 过渡期每项能力只有一个实现内核和一个状态所有者。旧入口可做薄适配，新模块禁止反向导入旧包或旧总入口。
4. 批次的迁移闭包包含必要的消费者：生产源码、stories、demo、类型和使用文档。没有完成消费者迁移时，台账不得填写“旧入口已移除”。
5. 发现新增问题先登记，再判断属于当前批次还是后续批次；影响当前验收的回归必须在本批解决。
6. 不新增独立测试文件。使用现有 stories、临时目录脚本及浏览器操作验证；临时脚本与输出放系统临时目录，不进入交付。
7. 每批验收完成后必须形成独立、可回退的 Git 提交并推送远程分支，提交信息写明批次编号、主要修改和验证结果；确认远程提交后再结束该批或推进下一批。提交前核对暂存范围、清理项目临时文件并更新台账；不得把其它批次或无关改动混入。台账分开记录验收、提交与推送状态，不使用预计提交号；当前提交可用唯一提交标题定位，下一批回填已存在的 SHA。
8. 当前中央 3D 视口仍由未来 Qt 集成负责；此次不开发业务页面、完整工作区、真实 C++ 后端或 Qt 桥实现。

## 2 批次总表

| 批次 | 内容             | 主负责组件                                | 前置批次      | 核心交付                                           |
| ---- | ---------------- | ----------------------------------------- | ------------- | -------------------------------------------------- |
| B00  | 启动与基线       | 继承修复、已采纳方案、分支与台账          | 无            | 当前工作树可追溯，检查结果和故事数量有记录。       |
| B01  | 契约与统一包骨架 | 跨域契约、基础值类型、最小 Mock           | B00           | 新包可构建；快照、订阅、编辑会话、能力接口可验证。 |
| B02  | 主题与视觉基础   | U01、U02、U13–U20、U42                    | B01           | 单一主题状态、token、按钮、图标和展示反馈。        |
| B03  | 布局与字段结构   | U21–U23、U31、U32、U37；G01、G19、G21     | B02           | PropertyRow、Section、滚动及可调整分隔布局。       |
| B04  | 浮层与菜单       | U24–U30                                   | B02、B03      | 明确的浮层组合、菜单适配、确认和通知宿主。         |
| B05  | 文本与选择       | U03、U04、U06–U10；G02、G03、G11–G14、G20 | B03、B04      | 文本草稿/提交、稳定选项身份、首个属性绑定交互。    |
| B06  | 数值与几何模板   | U05、U11、U12；G04–G10                    | B05           | 实时数值编辑、滑块、向量/矩形及连续编辑事务。      |
| B07  | 集合与拖放       | U33–U36；G22                              | B03、B04、B05 | 稳定集合标识、树状态、表格、集合模板和拖放适配。   |
| B08  | 颜色与渐变模板   | U38、U39；G15、G16                        | B04、B06      | 明确颜色值和转换边界，单色/渐变/分布组合。         |
| B09  | 曲线与数值分布   | U40；G17                                  | B04、B06      | 内联曲线、弹出组合、外部预设能力和数值分布模型。   |
| B10  | 资源引用与选择   | U41；G18、G23                             | B04、B05、B07 | AssetDescriptor、ResourcePicker 和模拟资源服务。   |
| B11  | 属性联调与收口   | 全量联调，不重复认领 U/G 主归属           | B03–B10       | 删除旧包、统一示例与文档、收紧类型、最终验收。     |

B08 与 B09 满足前置后可并行；B10 与颜色/曲线工作无共同实现文件时也可并行。批次编号表示默认推进顺序，实际开始日期与并行情况写入台账。

## 3 每批范围与退出条件

### B00 启动与基线

创建并切换新分支，记录原 HEAD、继承的未提交修复、当前公开组件清单和 Storybook 数量。建立批次计划、实施台账和文档入口，执行当前 `pnpm verify` 作为新的构建基线。

退出条件：分支、组件归属和验证记录完整；全部 U/G 项恰好分配一次；原有生产代码不因启动工作改变。已删除的 GUI、GUIRoot、旧 Panel 单列为继承完成项。本批不启动生产重构。

### B01 契约与统一包骨架

建立 `@pivot-ui/react` 源码包及显式导出、Panda、TypeScript、Storybook 检查骨架。先定义基础 PropertyDescriptor/PropertyAccess、EditSession、ChoiceOption、NumericConstraints 和宿主能力类型；颜色、曲线、资源的专用值模型由对应批次完善。

最小 Mock 支持快照、订阅、begin/change/commit/cancel、延迟、拒绝和外部更新。使用临时脚本或示例验证方案中固定的会话终结与版本冲突规则。契约和值模块不依赖 React、DOM 或 Qt；Mock 不假装具有真实宿主能力。

退出条件：新包检查通过，旧包仍可构建；新包无旧包 import；完整 stories/support/config 类型检查已纳入；示例可展示会话结束与过期响应处理。尚未迁移的旧组件继续由旧包提供。

### B02 主题与视觉基础

迁移 token、排版、图标、视觉反馈和按钮族，统一 ThemeProvider/store。区分主题偏好与解析后的主题；浏览器存储和系统监听通过适配接口接入。

必验：light/dark/system、系统主题变化、多个消费者同步、禁用与 loading、按钮焦点、徽章移除语义、Progress 的 max/indeterminate、图标与排版。旧按钮适配转向唯一实现，不能维护第二套异步状态。

退出条件：主题无重复状态源，新组件的 CSS 能被消费端提取；U01、U02、U13–U20、U42 的公共类型和 stories 均有去向。

### B03 布局与字段结构

完成 Flex、ScrollArea、Accordion、Collapsible、ResizableSplit、PropertyRow、ReadonlyValue/ImagePreview 与 Section。PropertyRow 采用显式 label/control/description 关联，不携带值或业务列规则；帮助文本可直接呈现，悬浮提示由后续浮层组合提供。

必验：单控件标签、多控件组名称、折叠和动作焦点、窄宽度、长文本、滚动 ref/事件、受控尺寸、键盘分隔条和取消。G01 的旧入口在其余 FormItem 尚未迁移时可留薄适配，并登记到 B11 删除。

退出条件：新布局不扫描 DOM 或猜测控件类型；字段数据与布局完全分开；过渡入口只有一份布局实现。

### B04 浮层与菜单

拆开 Root、Trigger、Content、Portal 与样式/定位 props。保留 Tooltip、HoverCard、Popover、Dialog、AlertDialog 各自语义。Menu 的三类行为适配共享视觉；确认和通知统一到应用装配的宿主。

本批实现落点与迁移约定见 [B04 浮层、菜单与服务接入](./B04_OVERLAYS.md)。U24 进入 `widgets/menus`；U25–U27 进入 `widgets/overlays`；U28–U29 进入 `widgets/dialogs`；U30 进入 `widgets/notifications`。各目录通过统一包公开组件及对应 Props，旧 UI 目录保留薄适配到 B11。

TooltipProvider 由应用或组合边界共享提供。Popover 的 `keepMounted` 使用 React Activity 保留状态与 DOM，关闭时暂停子树 effects/ref 和交互层；旧 `forceRender` 映射到该契约，Combobox 已选展示独立于浮层子树。隐藏状态不能仅靠 Radix `forceMount` 维持焦点层或滚动锁。

`showAlert(props, service)` 是本批明确的调用迁移：服务由应用创建并交给一个 ConfirmationProvider，返回可等待且幂等结束的 request；不再创建独立 React root 或清空全局 body 样式。通知使用 NotificationProvider/useNotifications 或显式注入的 NotificationService；同一 service 的宿主去重，清理只影响自身作用域。旧 `toast`/`Toaster` 暂作调度兼容入口，不替代新服务注入方式。

必验：受控/非受控开关、重复打开和关闭、卸载、嵌套、Escape、焦点恢复、portal 主题、StrictMode、确认服务幂等、通知重复创建。检查 console，不把独立新容器的 createRoot 与同容器重复创建混为一谈。

退出条件：无 root 泄漏或全局样式误清理；旧菜单消费者迁向新适配器；未迁的旧入口只转发。

### B05 文本与选择

统一 Input、Textarea、EditableText 的值与编辑接口；拆单选 Select 与搜索 Combobox，保留 Checkbox、SegmentControl、ToggleGroup 的语义差异。删除对应 FormItem 薄包装，迁移按钮行。

从本批开始实现 PropertyField 的文本/布尔/选项适配，用真实控件连接 B01 Mock；属性绑定不拖到最后才验证。

本批接口与迁移约定见 [B05 文本、选择与属性绑定](./B05_TEXT_CHOICES.md)。文本控件和 useTextEdit 位于 widgets/inputs；Checkbox、Select、Combobox、SegmentControl、ToggleGroup 位于 widgets/choices；稳定选项映射位于 values/choice-options；PropertyField 位于 property。七个对应 FormItem 包装删除，旧 UI 入口只保留转发/形状转换，B11 清理。

文本提交遵循一个会话只终结一次：pending 后的外部更新、切换目标和卸载只能使本地结果失效，不能再通知取消已发出的提交。PropertyField 本批只绑定 string/boolean/enum；number 留 B06，多选数组不提前扩入 B01 标量模型。原始选项类型在 JS 回调中保留，name/form 仅在 HTML 序列化边界转为字符串。

必验：中间草稿、Enter/blur 只提交一次、Escape 取消、外部值更新、单/多选键盘与搜索、字符串 `001` 与数字值身份、空值、混合状态、disabled/readOnly。资源和集合中的旧改名消费者同时接入唯一编辑内核。

退出条件：选项 key 到值只映射一次；没有两套编辑状态；G02、G03、G11–G14、G20 的实现、出口和专属故事退出，活跃消费者已迁移。类型、完整构建、临时事件探针与开发/静态浏览器交互通过；异步接受后不得再发取消，拒绝与 change invalid 保留草稿并可重试。

### B06 数值与几何模板

接口、状态归属与旧入口迁移约定见 [B06 数值与几何指南](./B06_NUMERIC.md)。

拆 InputNumber 的文本草稿、拖动行为与纯数值规则；统一 Slider、DistributionSlider、NumericSlider 和 NumericTupleInput。Vector2/3/4 共用内核，Rect 保持位置/尺寸含义，比例锁定独立建模。

数值 PropertyField 验证一次拖动一次事务、取消、版本冲突和对象切换。必验中间 `-`/小数、点击与拖动区分、实时显示、软/硬范围、step/dragStep、细调、零轴比例、受控冻结值、多 thumb、分段总量和 Reset。

退出条件：数字的更新入口唯一；旧字段无重复精度处理；所有元组消费者通过验证，旧形状转换只留一层。

### B07 集合与拖放

重建 TreeRoot/collection/state，拆 Table 结构和 DataTable 适配；完成 Breadcrumbs、Pagination、CollectionTemplate 与共享拖放。移出 prefab 等领域含义，行内改名复用 B05。

必验：稳定 key、增删后的焦点和选择、展开与选中独立、空态、重排、拖放取消、改名失败/成功、可聚焦行操作、页码越界和零结果。

退出条件：数据模型不混 React children 或引擎实例；共享拖放只有一个状态入口；旧 Tree/Array 消费者完成迁移。

### B08 颜色与渐变模板

先固定颜色编码、范围、alpha、HDR 和转换边界，再实现 ColorWidget → 被 ColorPicker 包装 → 被 ColorInput 组合的关系。ColorRamp 独立使用单色 Picker，不形成反向依赖；颜色分布模板使用明确判别联合。

必验：RGB 范围往返、sRGB/Linear、alpha、HDR、重合停靠点、双轨编辑、内联/弹出一致、能力缺失、模式缓存与 Reset。选中停靠点不触发属性写入。

退出条件：每个边界只转换一次；颜色模型不依赖 Picker；引擎 time/position 或颜色结构转换进入适配层；G15/G16 消费者全部切换。

### B09 曲线与数值分布

拆纯点/插值模型、CurveWidget、CurvePicker 与预设服务；重写 NumericDistributionTemplate，删除 Particle 别名。模式缓存与当前生效属性值分开。

必验：linear/bezier、点拖动、坐标范围、缩放与刻度、内联/弹出、取消、无存储能力、保存/加载预设、模式切换恢复值。选中点与视图变化不产生属性历史。

退出条件：控件不固定读写 localStorage；同一曲线只有一份有效值；旧点形状适配集中；G17 旧入口和别名完成退出。

### B10 资源引用与选择

本批接口、职责、宿主边界与旧入口迁移见 [B10 资源指南](./B10_RESOURCES.md)。

先实现 AssetDescriptor 与旧引擎对象的单一转换，再迁移 AssetItem、ResourcePicker、AssetReferenceInput 和 MockResourceProvider。定位、选择文件、缩略图解析与显示偏好由宿主提供。

必验：搜索、过滤、列表/网格、选择/清空/定位、disabled、未就绪、拖放、改名失败、过期查询、当前引用不在结果列表中、宿主能力缺失。

退出条件：通用控件中引擎方法和直接持久化清零；BasicAssetType、重复 Picker 和 PickableAssetItem 旧入口移除。

### B11 属性联调与收口

完成已逐步建立的 PropertyField 适配，统一 Storybook、demo、文档和命令；删除旧 ui/gui 包、过渡入口及空文件。核对全部公共类型、样式提取、锁文件和严格类型设置。

退出条件：U/G 与共享事项全部销账；所有旧入口退出；生产源码、全部 stories、support 与 Storybook 配置类型检查通过；完整格式、构建、冻结锁文件安装与依赖检查通过；开发和静态生产预览均完成浏览器验收。

## 4 每批验收与留痕

台账分别记录以下状态：`待开始`、`进行中`、`待验证`、`已验收`、`受阻`。组件进度记录 `未迁移`、`已实现`、`已验证`、`已销账`，同时单列旧入口退出情况。批次通过验收不自动表示已提交或已推送。

每批必须留下范围、实际修改点、命令/结果、浏览器场景及结果、残留旧入口、风险和提交信息。失败的检查保留首次结果及修复后的复验结果，不以新的成功记录覆盖失败原因。

文档批次检查格式、链接、清单覆盖、依赖无环和工作树范围；生产批次检查相关类型、demo/Storybook 构建及浏览器。公共基础或配置变化执行完整验证。只迁移文档时不重复无关的浏览器场景。

### 统一完成条件

- 本批目标入口和必要消费者可运行，继承功能没有未登记回归。
- 命名、状态和依赖遵循已采纳方案；兼容适配有明确删除批次。
- 格式、类型、构建和相关浏览器场景达到本批约定，日志/证据可追溯。
- 台账状态与实际代码、验证和 Git 状态一致。
- 临时验证文件未加入项目，旧实现或临时兼容债务有清理归属。

### 回退原则

已提交批次通过新的回退提交处理，不重写公共历史。未提交批次先核对实际差异，只处理该批涉及的文件/修改；继承修复与其它工作不能被整体重置。基线尚未包含继承改动的提交时，不将原 HEAD 当作完整工作树备份。
