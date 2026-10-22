# Blender 5.2 LTS 对齐重构实施台账

更新日期：2026-10-22。分支：`feat-blender-5-2-refactor`。

架构依据：[已采纳方案](D:/QtProject/editor-ui-custom/docs/architecture/BLENDER_5_2_REFACTOR_PLAN.md)。批次范围和退出条件：[批次计划](D:/QtProject/editor-ui-custom/docs/refactor/blender-5.2/BATCHES.md)。

**B01 契约与统一包骨架已验收**。下一批为 B02 主题与视觉基础，B02–B11 尚未开始实施。实现进度、验证结果、旧入口退出和 Git 提交分别记录。

## 1 分支与继承基线

本节保留 B00 启动时的历史快照；启动时的“未提交”不代表当前状态。补交记录见第 9 节。

| 项目            | 实际状态                                                                  |
| --------------- | ------------------------------------------------------------------------- |
| 创建分支        | feat-blender-5-2-refactor，已创建并切换                                   |
| 来源分支与 HEAD | main；0742f10e8943cf83cea9788f0bc3bfaa9d89b6a0                            |
| 原提交说明      | fix: repair component interactions and restore theme stories              |
| 启动前工作树    | 51 个未提交路径：32 个已跟踪变更，19 个未跟踪文件；其中包含本次已采纳方案 |
| 本轮新增提交    | 无；分支创建未产生新提交                                                  |
| 推送状态        | 本轮未推送                                                                |
| 继承修复        | 原样保留；未混入已完成重构数量                                            |
| 原 HEAD 的含义  | 原提交基线，不包含继承的未提交修复；不能当作当前工作树的完整快照          |

### 继承事项

| 编号    | 启动前已经存在的修改                                                           | 状态                   | 后续关联                       |
| ------- | ------------------------------------------------------------------------------ | ---------------------- | ------------------------------ |
| BASE-01 | GUI、GUIRoot、旧 Panel、useDraggablePanel 及 stories 删除；出口和依赖清理      | 已在工作树完成，未提交 | 保持删除；B11 检查无恢复或残留 |
| BASE-02 | InputNumber 点击/拖动及受控状态修复，Vector3 拖动基线/零轴处理                 | 已在工作树完成，未提交 | B06 必须保留对应交互能力       |
| BASE-03 | FormItem 标签关联、SegmentControl disabled、AssetPicker 选择/清空/定位约束修复 | 已在工作树完成，未提交 | B03、B05、B10 迁移时验收       |
| BASE-04 | 22 组 FormItem、88 个故事、StoryFrame 值输出/Reset、stories 类型检查和相关文档 | 已在工作树完成，未提交 | 随组件迁移；B11 统一归档与文档 |
| BASE-05 | 完整重构方案及 65 个 U/G 处置项                                                | 用户已采纳，文档未提交 | 本批次计划的依据               |

本轮范围核对指纹为 `f1c2df2a329d77eba4cfe284a7632f0983f3c0d45a7623186c5f9b3708c19d26`：对 Git 跟踪与未忽略文件按路径排序，逐项组合路径和内容（删除项用标记）计算 SHA-256；排除本轮允许编辑的方案、文档索引与本台账目录。该指纹用于确认启动工作未修改其它文件，不代替 Git 提交或备份。

## 2 批次进度

| 批次 | 名称             | 状态   | 前置          | 验证/交付记录            | 提交              |
| ---- | ---------------- | ------ | ------------- | ------------------------ | ----------------- |
| B00  | 启动与基线       | 已验收 | 无            | V00-01–V00-04 通过       | f2f2c98           |
| B01  | 契约与统一包骨架 | 已验收 | B00           | V01-01–V01-08；见第 8 节 | 本提交；见第 9 节 |
| B02  | 主题与视觉基础   | 待开始 | B01           | —                        | —                 |
| B03  | 布局与字段结构   | 待开始 | B02           | —                        | —                 |
| B04  | 浮层与菜单       | 待开始 | B02、B03      | —                        | —                 |
| B05  | 文本与选择       | 待开始 | B03、B04      | —                        | —                 |
| B06  | 数值与几何模板   | 待开始 | B05           | —                        | —                 |
| B07  | 集合与拖放       | 待开始 | B03、B04、B05 | —                        | —                 |
| B08  | 颜色与渐变模板   | 待开始 | B04、B06      | —                        | —                 |
| B09  | 曲线与数值分布   | 待开始 | B04、B06      | —                        | —                 |
| B10  | 资源引用与选择   | 待开始 | B04、B05、B07 | —                        | —                 |
| B11  | 属性联调与收口   | 待开始 | B03–B10       | —                        | —                 |

## 3 组件迁移台账

每一行与方案保持同一编号、名称和动作。详细目标入口与理由以方案对应行为准；实现批次结束时补充实际新入口和验证记录。只创建了新文件不能标为已验证；仍有旧消费者时单独登记退出情况。

| 编号 | 当前公共模块/名称                                                                                                                                            | 计划动作                   | 主批次 | 实现进度 | 旧入口退出       | 证据/实际新入口 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ------ | -------- | ---------------- | --------------- |
| U01  | Button：`Button`                                                                                                                                             | 保留                       | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| U02  | ActionButton：`ActionButton`、`ActionButtonGroup`                                                                                                            | 合并内部实现，保留入口     | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| U03  | Input：`Input`                                                                                                                                               | 保留                       | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| U04  | Textarea：`Textarea`                                                                                                                                         | 保留                       | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| U05  | InputNumber：`InputNumber`                                                                                                                                   | 拆分内部行为，保留完整控件 | B06    | 未迁移   | 未退出；最迟 B11 | —               |
| U06  | EditableText：`EditableText`                                                                                                                                 | 重写                       | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| U07  | Checkbox：`Checkbox`                                                                                                                                         | 保留并修订状态类型         | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| U08  | Select：`Select`、`SelectItem`                                                                                                                               | 拆分                       | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| U09  | ToggleGroup：`ToggleGroup`、`ToggleGroupItem`                                                                                                                | 保留                       | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| U10  | SegmentControl：`SegmentControl`、`SegmentControlItem`                                                                                                       | 保留                       | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| U11  | Slider：`Slider`                                                                                                                                             | 局部重写                   | B06    | 未迁移   | 未退出；最迟 B11 | —               |
| U12  | CascadeSlider：`CascadeSlider`                                                                                                                               | 保留能力，改名并拆模型     | B06    | 未迁移   | 未退出；最迟 B11 | —               |
| U13  | Badge：`Badge`                                                                                                                                               | 拆分                       | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| U14  | Callout：`Callout`                                                                                                                                           | 保留                       | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| U15  | Progress：`Progress`                                                                                                                                         | 局部重写                   | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| U16  | Spin：`Spin`                                                                                                                                                 | 保留                       | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| U17  | Typography：`Text`、`Bold`、`Link`、`Title`                                                                                                                  | 保留，收敛 API             | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| U18  | Kbd：`Kbd`、`KbdGroup`                                                                                                                                       | 保留，拆解析与展示         | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| U19  | Icons：19 个公开图标，见 5.8                                                                                                                                 | 合并去重并保留             | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| U20  | Triangle：`Triangle`                                                                                                                                         | 合并                       | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| U21  | Flex：`Flex`                                                                                                                                                 | 保留，收敛 API             | B03    | 未迁移   | 未退出；最迟 B11 | —               |
| U22  | Separator：`Separator`                                                                                                                                       | 拆分组合                   | B03    | 未迁移   | 未退出；最迟 B11 | —               |
| U23  | ScrollArea：`ScrollArea`                                                                                                                                     | 拆分属性入口               | B03    | 未迁移   | 未退出；最迟 B11 | —               |
| U24  | Menu：`Menubar`、`MenubarItem`、`DropdownMenu`、`ContextMenu`、`MenuItem`、`SubMenuItem`、`MenuSeparator`、`MenuCheckboxItem`、`MenuRadioGroup`、`MenuGroup` | 拆分                       | B04    | 未迁移   | 未退出；最迟 B11 | —               |
| U25  | Popover：`Popover`、`PopoverCloseTrigger`                                                                                                                    | 拆分 API，重整生命周期     | B04    | 未迁移   | 未退出；最迟 B11 | —               |
| U26  | Tooltip：`Tooltip`                                                                                                                                           | 局部重写                   | B04    | 未迁移   | 未退出；最迟 B11 | —               |
| U27  | HoverCard：`HoverCard`                                                                                                                                       | 保留并拆属性层级           | B04    | 未迁移   | 未退出；最迟 B11 | —               |
| U28  | Dialog：`Dialog`、`DialogTrigger`、`DialogCloseTrigger`                                                                                                      | 拆分                       | B04    | 未迁移   | 未退出；最迟 B11 | —               |
| U29  | AlertDialog：`AlertDialog`、`showAlert`                                                                                                                      | 保留确认语义，重写服务入口 | B04    | 未迁移   | 未退出；最迟 B11 | —               |
| U30  | Toast：`Toaster`、`toast`                                                                                                                                    | 保留并隔离适配             | B04    | 未迁移   | 未退出；最迟 B11 | —               |
| U31  | Accordion：`Accordion`、`AccordionItem`                                                                                                                      | 保留，合并视觉实现         | B03    | 未迁移   | 未退出；最迟 B11 | —               |
| U32  | Collapsible：`Collapsible`                                                                                                                                   | 保留并整理组合             | B03    | 未迁移   | 未退出；最迟 B11 | —               |
| U33  | Breadcrumbs：`Breadcrumbs`、`BreadcrumbItem`                                                                                                                 | 重写语义结构               | B07    | 未迁移   | 未退出；最迟 B11 | —               |
| U34  | Pagination：`Pagination`                                                                                                                                     | 保留，拆纯算法             | B07    | 未迁移   | 未退出；最迟 B11 | —               |
| U35  | Table：`Table`                                                                                                                                               | 拆分并重写数据适配         | B07    | 未迁移   | 未退出；最迟 B11 | —               |
| U36  | Tree：`TreeItemRoot`、`TreeItemContent`、`TreeItemIcon`、`TreeItemPreview`、`TreeGroup`、`DragPreview`、`InsertionIndicator`                                 | 重写组件族                 | B07    | 未迁移   | 未退出；最迟 B11 | —               |
| U37  | ResizablePanel：`ResizablePanel`                                                                                                                             | 重写并改名                 | B03    | 未迁移   | 未退出；最迟 B11 | —               |
| U38  | ColorPicker：`ColorPicker`                                                                                                                                   | 拆分                       | B08    | 未迁移   | 未退出；最迟 B11 | —               |
| U39  | ColorSlider：`GradientSlider`、`ParticleSlider`、`HDRSlider`                                                                                                 | 合并颜色模型，拆清职责     | B08    | 未迁移   | 未退出；最迟 B11 | —               |
| U40  | BezierCurveEditor：`BezierCurveEditor`                                                                                                                       | 拆分并改名                 | B09    | 未迁移   | 未退出；最迟 B11 | —               |
| U41  | AssetItem：`AssetItem`                                                                                                                                       | 保留，合并内部改名行为     | B10    | 未迁移   | 未退出；最迟 B11 | —               |
| U42  | ThemeProvider：`ThemeProvider`、`ThemeContext`、`useTheme`、`defaultThemes`、`addThemeChangeListener`、`removeThemeChangeListener`                           | 重写状态层                 | B02    | 未迁移   | 未退出；最迟 B11 | —               |
| G01  | `FormItem`                                                                                                                                                   | 拆分并重写                 | B03    | 未迁移   | 未退出；最迟 B11 | —               |
| G02  | `FormItemInput`                                                                                                                                              | 删除包装并合并能力         | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| G03  | `FormItemTextarea`                                                                                                                                           | 删除包装                   | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| G04  | `FormItemInputNumber`                                                                                                                                        | 合并，删除旧入口           | B06    | 未迁移   | 未退出；最迟 B11 | —               |
| G05  | `FormItemSlider`                                                                                                                                             | 重写为复合模板             | B06    | 未迁移   | 未退出；最迟 B11 | —               |
| G06  | `FormItemCascadeSlider`                                                                                                                                      | 删除包装                   | B06    | 未迁移   | 未退出；最迟 B11 | —               |
| G07  | `FormItemVector2`                                                                                                                                            | 合并实现，删除旧入口       | B06    | 未迁移   | 未退出；最迟 B11 | —               |
| G08  | `FormItemVector3`                                                                                                                                            | 合并并拆比例策略           | B06    | 未迁移   | 未退出；最迟 B11 | —               |
| G09  | `FormItemVector4`                                                                                                                                            | 合并实现，删除旧入口       | B06    | 未迁移   | 未退出；最迟 B11 | —               |
| G10  | `FormItemRect`                                                                                                                                               | 合并底层实现，保留矩形语义 | B06    | 未迁移   | 未退出；最迟 B11 | —               |
| G11  | `FormItemToggle`                                                                                                                                             | 删除包装                   | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| G12  | `FormItemToggleGroup`                                                                                                                                        | 删除包装并重整类型         | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| G13  | `FormItemSegmentControl`                                                                                                                                     | 删除包装，重写值映射       | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| G14  | `FormItemSelect`                                                                                                                                             | 删除包装，合并选择适配     | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| G15  | `FormItemColor`                                                                                                                                              | 拆分并合并到颜色模板       | B08    | 未迁移   | 未退出；最迟 B11 | —               |
| G16  | `FormItemGradient`                                                                                                                                           | 拆分并重写模式模型         | B08    | 未迁移   | 未退出；最迟 B11 | —               |
| G17  | `FormItemParticleCurve`、别名 `FormItemParticle`                                                                                                             | 重写组合，删除别名和旧入口 | B09    | 未迁移   | 未退出；最迟 B11 | —               |
| G18  | `FormItemAssetPicker`                                                                                                                                        | 拆分并重写                 | B10    | 未迁移   | 未退出；最迟 B11 | —               |
| G19  | `FormItemDisplay`                                                                                                                                            | 拆分，删除旧包装           | B03    | 未迁移   | 未退出；最迟 B11 | —               |
| G20  | `FormItemButton`                                                                                                                                             | 删除包装                   | B05    | 未迁移   | 未退出；最迟 B11 | —               |
| G21  | `FormItemGroup`                                                                                                                                              | 合并到布局                 | B03    | 未迁移   | 未退出；最迟 B11 | —               |
| G22  | `FormItemArray`                                                                                                                                              | 重写                       | B07    | 未迁移   | 未退出；最迟 B11 | —               |
| G23  | `PickableAssetItem`                                                                                                                                          | 合并并删除旧入口           | B10    | 未迁移   | 未退出；最迟 B11 | —               |

## 4 共享事项台账

| 编号 | 工作项                                                                    | 主批次                 | 状态   | 退出条件                                                 |
| ---- | ------------------------------------------------------------------------- | ---------------------- | ------ | -------------------------------------------------------- |
| S01  | PropertyDescriptor/Access、EditSession、ChoiceOption、能力接口与最小 Mock | B01                    | 已验收 | 基础模型、会话、可选能力和 Mock 通过；专用模型留对应批次 |
| S02  | Panda token、styling 子入口、主题与生成配置                               | B02；B11 收口          | 待开始 | 单一源配置，开发/静态预览和消费者均能提取样式            |
| S03  | 数值纯函数、拖动/草稿、round 与共享编辑行为                               | B05/B06                | 待开始 | 消费者共享一个内核，字段不重复计算                       |
| S04  | 颜色值类型、公开 helpers/hooks 和转换                                     | B08                    | 待开始 | 纯模型独立；颜色/渐变/宿主转换边界明确                   |
| S05  | 曲线类型、插值/坐标/刻度工具与预设能力                                    | B09                    | 待开始 | 值与选中/视图状态分开；存储不在控件内                    |
| S06  | DragContext、Provider、useDrag/useDrop 与模型                             | B07                    | 待开始 | 稳定类型和受控 API；Tree/Asset 适配不泄漏可变上下文      |
| S07  | PropertyField 的逐步联调                                                  | B05/B06 启动；B11 收口 | 待开始 | 文本/数值先贯通 Mock；最终覆盖复杂模板和异步情况         |
| S08  | 公共 Props、值类型、严格检查与旧 StitchesComponent 名称                   | 各主批次；B11 收口     | 待开始 | 完整可导入类型，无旧内部深层引用，类型检查范围完整       |
| S09  | 空文件、重复图标/Picker/helper、旧包装/HOC/别名                           | 各主批次；B11 收口     | 待开始 | 消费者切换后删除；GUI/GUIRoot/旧 Panel 保持已删除        |
| S10  | 全部 stories、StoryFrame、demo、文档、脚本、旧包与锁文件                  | 各主批次；B11 收口     | 待开始 | 只有统一入口，现有能力有故事对应，旧包引用清零           |

内部零件、全部公共类型和非组件导出的逐项去向见方案 5.8、5.9 和第 6 节，不以主表只列组件为由遗漏它们。

B01 为 S02 建立 Panda 生成/扫描骨架，为 S08 补齐检查范围并启用新包 strict，为 S10 接入第三个 Storybook、命令和锁文件；这些准备工作不表示主题、旧类型或旧包迁移已经完成，主批次状态保持待开始。

## 5 验证记录

| 记录   | 批次/日期        | 验证内容                                | 结果           | 证据或范围                                                                                                           |
| ------ | ---------------- | --------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------- |
| V00-01 | B00 / 2026-10-22 | 启动时运行 pnpm verify                  | 通过，退出码 0 | Prettier、当前类型检查、demo、UI 与 GUI Storybook 构建；见下方日志                                                   |
| V00-02 | B00 / 2026-10-22 | 读取两个静态 Storybook 索引             | 通过           | UI：107 stories / 40 组 / 28 docs；GUI：88 stories / 22 组 / 1 docs                                                  |
| V00-03 | B00 / 2026-10-22 | 文档格式、链接、65 项唯一归属、批次依赖 | 通过           | 65/65 项无遗漏/重复；12 批依赖无环；本地链接有效；Prettier 通过                                                      |
| V00-04 | B00 / 2026-10-22 | 本轮文件范围与生产代码不变              | 通过           | 第 1 节指纹一致，仅新增/更新约定的 4 份文档                                                                          |
| V01-01 | B01 / 2026-10-22 | 补齐旧 UI stories 类型检查的首次结果    | 失败后修复     | 5 文件共 19 条诊断：Accordion 7、CascadeSlider 2、ColorSlider 2、Select 7、Slider 1；V01-03 复验通过                 |
| V01-02 | B01 / 2026-10-22 | Mock 边界与纯类型临时验证               | 通过           | 29 组运行时验证、非法类型断言检查；含重入错误返回修复、会话幂等、过期确认、Reset、revision 上限                      |
| V01-03 | B01 / 2026-10-22 | pnpm verify                             | 通过，退出码 0 | 全仓格式/类型、demo、UI/GUI/interface Storybook 构建；日志无警告或错误                                               |
| V01-04 | B01 / 2026-10-22 | 冻结锁文件安装、pnpm dedupe --check     | 通过，退出码 0 | 安装使用 --frozen-lockfile --ignore-scripts；无新增依赖版本；生成命令由 verify 实际执行                              |
| V01-05 | B01 / 2026-10-22 | tsc 文件覆盖、显式出口与依赖审计        | 通过           | 预期 TS/TSX/CJS 源/示例/support/config 零遗漏；4 个出口有效；纯模块无 React/DOM/Node/Qt/旧包导入，无环               |
| V01-06 | B01 / 2026-10-22 | 开发预览 6009 浏览器实测                | 通过           | 7 个契约场景，preview/authority 分离、取消/拒绝/旧响应、对象切换、能力缺失、选项类型身份；明暗主题、控制台正常       |
| V01-07 | B01 / 2026-10-22 | 静态预览 6010 浏览器实测与索引          | 通过           | 7/7 场景加载无警告/错误；数值提交和选项 0 提交通过，明暗主题有样式；旧 UI 107、GUI 88 stories 数量不变               |
| V01-08 | B01 / 2026-10-22 | 5 组旧 UI 示例浏览器回归                | 通过           | Accordion 单/多开、Cascade 51/49/100 与 Reset、Select 多选与受控更新、颜色三组/HDR 同步、Slider 20/24px 与键盘 50→51 |

构建日志：[baseline-verify.log](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b00-20261022/baseline-verify.log)。

B00 的构建结果对应当时配置：UI 类型检查尚未包含全部 stories；该范围已在 B01 补齐。B00 不修改生产实现，因此未重复浏览器交互检查。此前的浏览器验证属于继承记录，不能记作 B01 执行结果。临时日志可能被系统清理，后续提交仍应在本表保留命令、退出码和范围摘要。

B01 日志：[完整 verify](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b01-20261022/verify.log)、[29 组 Mock 验证](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b01-20261022/mock-verification.log)、[依赖检查](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b01-20261022/dedupe.log)、[静态明色截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b01-20261022/static-light.png)。

### 后续批次记录格式

每批记录：开始/完成日期、实际修改文件与入口、值转换规则、命令与结果、浏览器 story 与操作结果、未退出的旧引用、风险处理、提交 SHA 和推送状态。遇到失败时增加一条记录，修复后另记复验。

## 6 风险与迁移债务

| 编号 | 事项                                                          | 处理规则                                                                                                                  | 负责批次           | 当前状态                 |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------ |
| R01  | 启动时继承修复未提交，原 HEAD 不包含完整工作树                | 继承修复已单独归档到 2c4638f，保留启动记录                                                                                | B00 记录，持续关注 | 已归档                   |
| R02  | 过渡期新旧入口造成双实现或反向依赖                            | 旧入口只做薄适配，新模块不导入旧包；每批记录剩余消费者                                                                    | 全部；B11 清零     | 待跟踪                   |
| R03  | Panda 路径/导出变化导致生产样式遗漏                           | 更新扫描；验证 consumer、开发预览与无缓存静态构建                                                                         | B01/B02/B11        | 待跟踪                   |
| R04  | 当前 stories 检查范围和严格类型不足                           | B01 已补齐 stories/support/config；新包 strict，旧包随迁移收紧；MDX 由构建覆盖                                            | B01–B11            | 范围已补齐；旧类型待迁移 |
| R05  | 数值、颜色、曲线或资源的值语义在迁移中改变                    | 迁移前定义类型与转换，临时适配集中；不随目录移动隐式改变单位/范围/标识                                                    | B06/B08/B09/B10    | 待跟踪                   |
| R06  | Qt 后端与原生视口尚不存在                                     | 用 Mock 验证语义；真实平台行为在后续 Qt 集成阶段验收，不用网页占位冒充原生接入                                            | B01/B11 及后续集成 | 已记录                   |
| R07  | Storybook 管理界面提示 PopoverProvider 在 11 将强制 ariaLabel | 提示来自 storybook 10.6.3 的 sb-manager/globals-runtime.js，组件预览无此提示；不屏蔽、不修改 node_modules，依赖更新时复核 | B11/依赖维护       | 已记录，非组件告警       |

## 7 B00 执行记录

- 已从 main 的原 HEAD 创建并切换 feat-blender-5-2-refactor。
- 已保留继承修复及方案，建立本批次计划、组件台账和共享事项。
- 已重新执行当前完整 verify，并读取静态故事索引作为数量基线。
- 当前生产实现没有进入重构；B01 为下一批。

B00 已完成文档格式、链接、清单覆盖、依赖和文件范围验收。下一批仅推进契约、统一包骨架和最小 Mock，不同时展开主题、颜色、曲线或资源重写。

## 8 B01 执行记录

开始及完成日期：2026-10-22。验收完成，本记录随 B01 实现一并提交；分支为 `feat-blender-5-2-refactor`。继承修复与 B00 已分别提交，65 个 U/G 项仍为未迁移。提交引用见第 9 节，未推送远程。

### 实际交付

- 新建 `packages/interface`（`@pivot-ui/react` 0.1.0），显式根、contracts、values、panda.css 入口；复用共享 Panda 和 Storybook theme/Vite 配置。源码只有 values/contracts，后续层不预建空实现。
- 基础模型包含 string/number/boolean/enum、稳定选项 key/value、硬软数值范围元数据；契约包含固定目标的属性访问、稳定不可变快照、订阅、编辑会话和可选 clipboard/preferences/files 能力。
- Mock 位于 stories/support，不是包出口。预览不推进权威版本；一次成功提交只有一条事务；第一次终结请求生效；已提交请求继续绑定原目标；外部新版本、后续会话及 Reset 防止旧确认覆盖当前状态。拒绝保留权威值；缺失能力不伪装真实 Qt 接口。
- 新增 7 个 `Contracts/Property editing` 故事，使用原生 HTML 与 Panda 作为契约演示，不提前开发 PropertyField 或业务页面。
- 根命令增加 `dev:interface`（6009），`build:storybook` 包含全部三个包；补齐 UI/GUI stories/support/tooling 与 app 的 Panda/PostCSS 检查。修改旧 UI 5 个 story 文件以修正类型检查揭示的真实 API 用法；旧生产组件没有因 B01 改写。
- 更新根/包 README、开发与消费说明、文档索引及台账。锁文件仅新增新工作区依赖映射，沿用已有版本；原 nanoid 删除属于继承修复。

### 验证细节与边界

`tsc --listFilesOnly` 对比实际文件清单无遗漏：interface 生产 5、stories 1、support 2、工具 4；UI 生产 139、stories 40、工具 4；GUI 生产 40、stories 22、support 1、工具 4；app 生产 3、工具 3。共享 Storybook 2 文件和 Panda 5 文件也进入相应检查。两个 Introduction.mdx 由 Storybook 构建覆盖。

pure 项目实际输入为 4 个契约/值源码和 57 个 TypeScript 标准库文件；配置为 ES2022、types 空数组。另以 AST 检查 5 个生产源码、6 条导入边，确认无外部/旧包导入、未解析边或环。`types: []` 只排除自动环境类型，不是长期禁止显式导入 React 的架构门禁，后续批次继续检查边界。

运行时临时脚本覆盖 29 组场景。交叉审查曾复现：非法 change 发布通知后，订阅者外部更新清空 error，导致返回 invalid/error:null；已用局部不可变错误返回修复并复验。另处理版本号达到安全整数上限时返回终结 rejected，避免 Promise 悬挂。所有验证脚本、日志和截图均在系统 TEMP，没有新增独立测试文件。

开发和静态浏览器实测均检查了可见状态与控制台。静态 Storybook 索引为 UI 107 stories / 40 组 / 28 docs，GUI 88 / 22 / 1，新包 7 / 1 / 0。旧故事修复没有减少原有示例。

上述控制台无警告/错误的结论针对组件 iframe 预览。最后打开完整 Storybook 管理界面时，出现一条来自 `sb-manager/globals-runtime.js` 的 `PopoverProvider` ariaLabel 未来版本提示；已在本地 `node_modules/storybook/dist/components/index.js` 与 manager bundle 确认其依赖来源，登记 R07，未隐藏该提示。原有 6007/6008 标签保留，6009 开发服务与新入口保留；6010 静态验收服务已停止。

本机检查执行器为 Node 配合捆绑 pnpm 11.25.0（pm_on_fail=ignore），仓库声明仍为 pnpm 12.14.0；未因本地执行器差异改写 packageManager 或依赖版本。首次 dev 命令多传了一层 `--` 导致 CLI 拒绝，改为 `pnpm --filter @pivot-ui/react dev --ci` 后正常启动。

### 后续交接

B02 从主题状态、token、按钮、图标和展示反馈开始。旧包、旧消费者与旧类型仍按原主批次迁移；S02/S08/S10 只完成骨架和检查准备，未销账。真实 Qt/C++ 传输、宿主能力和撤销栈尚未实现，Mock 结果只验证当前约定。

## 9 Git 提交记录

用户要求每批结束后提交 Git，已写入批次执行规则。补交时按继承基线、B00、B01 分开；后续批次必须在验收与台账更新后完成独立提交，再结束该批或推进下一批。

| 范围                     | 提交引用                                                               | 主要内容                                                   |
| ------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| 继承修复 BASE-01–BASE-04 | 2c4638f49b481aa87e88fc7e5e0339288b90ce84                               | 删除旧 GUI 容器、修复数值及表单交互、补齐 FormItem stories |
| B00                      | f2f2c98321cdcfe54d32b5f32dce6a453e352777                               | Blender 术语/架构、批次、组件台账和必须提交的执行规则      |
| B01                      | 本提交：feat(B01): add unified interface contracts and mock playground | 新统一包、契约和 Mock、7 个故事、完整类型检查及旧示例修正  |

当前批次用唯一提交标题指向包含本记录的提交，避免预测或自引用自身 SHA。可用 git log 按上表标题查找；下一批回填已存在的 SHA。提交钩子执行暂存文件格式检查；项目中不加入临时脚本、日志、截图、生成目录或测试文件。未推送远程。
