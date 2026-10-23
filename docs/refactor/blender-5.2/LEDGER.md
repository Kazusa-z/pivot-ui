# Blender 5.2 LTS 对齐重构实施台账

更新日期：2026-10-23。分支：`feat-blender-5-2-refactor`。

架构依据：[已采纳方案](D:/QtProject/editor-ui-custom/docs/architecture/BLENDER_5_2_REFACTOR_PLAN.md)。批次范围和退出条件：[批次计划](D:/QtProject/editor-ui-custom/docs/refactor/blender-5.2/BATCHES.md)。

**B08 颜色与渐变模板已验收**，累计 60/65。B00–B07 已提交并推送；B08 以第 9 节唯一提交标题定位本批 Git 交付，范围和验证记录见第 16 节。B09–B11 尚未开始。

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

| 批次 | 名称             | 状态   | 前置          | 验证/交付记录             | 提交            |
| ---- | ---------------- | ------ | ------------- | ------------------------- | --------------- |
| B00  | 启动与基线       | 已验收 | 无            | V00-01–V00-04 通过        | f2f2c98         |
| B01  | 契约与统一包骨架 | 已验收 | B00           | V01-01–V01-08；见第 8 节  | bb3847e         |
| B02  | 主题与视觉基础   | 已验收 | B01           | V02-01–V02-07；见第 10 节 | 60e12bb         |
| B03  | 布局与字段结构   | 已验收 | B02           | V03-01–V03-07；见第 11 节 | 4b2264a         |
| B04  | 浮层与菜单       | 已验收 | B02、B03      | V04-01–V04-07；见第 12 节 | 2da9813         |
| B05  | 文本与选择       | 已验收 | B03、B04      | V05-01–V05-07；见第 13 节 | ca7c7ee         |
| B06  | 数值与几何模板   | 已验收 | B05           | V06-01–V06-07；见第 14 节 | 0bab111         |
| B07  | 集合与拖放       | 已验收 | B03、B04、B05 | V07-01–V07-07；见第 15 节 | 3ec1d1d         |
| B08  | 颜色与渐变模板   | 已验收 | B04、B06      | V08-01–V08-07；见第 16 节 | 第 9 节唯一标题 |
| B09  | 曲线与数值分布   | 待开始 | B04、B06      | —                         | —               |
| B10  | 资源引用与选择   | 待开始 | B04、B05、B07 | —                         | —               |
| B11  | 属性联调与收口   | 待开始 | B03–B10       | —                         | —               |

## 3 组件迁移台账

每一行与方案保持同一编号、名称和动作。详细目标入口与理由以方案对应行为准；实现批次结束时补充实际新入口和验证记录。只创建了新文件不能标为已验证；仍有旧消费者时单独登记退出情况。

| 编号 | 当前公共模块/名称                                                                                                                                            | 计划动作                   | 主批次 | 实现进度 | 旧入口退出               | 证据/实际新入口                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ------ | -------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| U01  | Button：`Button`                                                                                                                                             | 保留                       | B02    | 已验证   | 薄适配保留；B11 删除     | widgets/buttons/Button；V02-03/04/05                                                              |
| U02  | ActionButton：`ActionButton`、`ActionButtonGroup`                                                                                                            | 合并内部实现，保留入口     | B02    | 已验证   | 薄适配保留；B11 删除     | widgets/buttons/ActionButton、ButtonBase、useButtonState；V02-03/04/05                            |
| U03  | Input：`Input`                                                                                                                                               | 保留                       | B05    | 已验证   | 薄适配保留；B11 删除     | widgets/inputs/Input；V05-03–V05-06                                                               |
| U04  | Textarea：`Textarea`                                                                                                                                         | 保留                       | B05    | 已验证   | 薄适配保留；B11 删除     | widgets/inputs/Textarea；V05-03–V05-06                                                            |
| U05  | InputNumber：`InputNumber`                                                                                                                                   | 拆分内部行为，保留完整控件 | B06    | 已验证   | 薄适配保留；B11 删除     | widgets/inputs/InputNumber + interaction/numeric + values/numeric；V06-03/04/06/07                |
| U06  | EditableText：`EditableText`                                                                                                                                 | 重写                       | B05    | 已验证   | 薄适配保留；B11 删除     | widgets/inputs/EditableText、useTextEdit；V05-03–V05-06                                           |
| U07  | Checkbox：`Checkbox`                                                                                                                                         | 保留并修订状态类型         | B05    | 已验证   | 薄适配保留；B11 删除     | widgets/choices/Checkbox；V05-03–V05-05                                                           |
| U08  | Select：`Select`、`SelectItem`                                                                                                                               | 拆分                       | B05    | 已验证   | 薄适配保留；B11 删除     | widgets/choices/Select、Combobox + values/choice-options；V05-03–V05-06                           |
| U09  | ToggleGroup：`ToggleGroup`、`ToggleGroupItem`                                                                                                                | 保留                       | B05    | 已验证   | 薄适配保留；B11 删除     | widgets/choices/ToggleGroup、Root、Item；V05-03–V05-05                                            |
| U10  | SegmentControl：`SegmentControl`、`SegmentControlItem`                                                                                                       | 保留                       | B05    | 已验证   | 薄适配保留；B11 删除     | widgets/choices/SegmentControl、Root、Item；V05-03–V05-05                                         |
| U11  | Slider：`Slider`                                                                                                                                             | 局部重写                   | B06    | 已验证   | 薄适配保留；B11 删除     | widgets/sliders/Slider、useSliderEdit；V06-03/04/06/07                                            |
| U12  | CascadeSlider：`CascadeSlider`                                                                                                                               | 保留能力，改名并拆模型     | B06    | 已验证   | 薄适配保留；B11 删除     | widgets/sliders/DistributionSlider + values/distribution；V06-03/04/06/07                         |
| U13  | Badge：`Badge`                                                                                                                                               | 拆分                       | B02    | 已验证   | 薄适配保留；B11 删除     | widgets/display/Badge、Tag；V02-03/04/05/06                                                       |
| U14  | Callout：`Callout`                                                                                                                                           | 保留                       | B02    | 已验证   | 薄适配保留；B11 删除     | widgets/feedback/Callout；V02-03/04                                                               |
| U15  | Progress：`Progress`                                                                                                                                         | 局部重写                   | B02    | 已验证   | 薄适配保留；B11 删除     | widgets/feedback/Progress；V02-03/04                                                              |
| U16  | Spin：`Spin`                                                                                                                                                 | 保留                       | B02    | 已验证   | 薄适配保留；B11 删除     | widgets/feedback/Spin；V02-03/04                                                                  |
| U17  | Typography：`Text`、`Bold`、`Link`、`Title`                                                                                                                  | 保留，收敛 API             | B02    | 已验证   | 薄适配保留；B11 删除     | foundation/typography；V02-03/04                                                                  |
| U18  | Kbd：`Kbd`、`KbdGroup`                                                                                                                                       | 保留，拆解析与展示         | B02    | 已验证   | 薄适配保留；B11 删除     | values/shortcut + widgets/display/Kbd；V02-03/04                                                  |
| U19  | Icons：19 个公开图标，见 5.8                                                                                                                                 | 合并去重并保留             | B02    | 已验证   | 薄适配保留；B11 删除     | foundation/icons；V02-03/04                                                                       |
| U20  | Triangle：`Triangle`                                                                                                                                         | 合并                       | B02    | 已验证   | 薄适配保留；B11 删除     | foundation/icons/common/Arrow；V02-03/04                                                          |
| U21  | Flex：`Flex`                                                                                                                                                 | 保留，收敛 API             | B03    | 已验证   | 薄适配保留；B11 删除     | layout/Flex；V03-03–V03-06                                                                        |
| U22  | Separator：`Separator`                                                                                                                                       | 拆分组合                   | B03    | 已验证   | 薄适配保留；B11 删除     | widgets/display/Separator + layout/SectionDivider；V03-03–V03-06                                  |
| U23  | ScrollArea：`ScrollArea`                                                                                                                                     | 拆分属性入口               | B03    | 已验证   | 薄适配保留；B11 删除     | widgets/display/ScrollArea、ScrollAreaRoot、ScrollAreaViewport；V03-03–V03-06                     |
| U24  | Menu：`Menubar`、`MenubarItem`、`DropdownMenu`、`ContextMenu`、`MenuItem`、`SubMenuItem`、`MenuSeparator`、`MenuCheckboxItem`、`MenuRadioGroup`、`MenuGroup` | 拆分                       | B04    | 已验证   | 薄适配保留；B11 删除     | widgets/menus：DropdownMenu*/ContextMenu*/Menubar*；V04-03–V04-07                                 |
| U25  | Popover：`Popover`、`PopoverCloseTrigger`                                                                                                                    | 拆分 API，重整生命周期     | B04    | 已验证   | 薄适配保留；B11 删除     | widgets/overlays：Popover*、OverlayLayer；V04-03–V04-07                                           |
| U26  | Tooltip：`Tooltip`                                                                                                                                           | 局部重写                   | B04    | 已验证   | 薄适配保留；B11 删除     | widgets/overlays：TooltipProvider、Tooltip*；V04-03–V04-07                                        |
| U27  | HoverCard：`HoverCard`                                                                                                                                       | 保留并拆属性层级           | B04    | 已验证   | 薄适配保留；B11 删除     | widgets/overlays：HoverCard*；V04-03–V04-07                                                       |
| U28  | Dialog：`Dialog`、`DialogTrigger`、`DialogCloseTrigger`                                                                                                      | 拆分                       | B04    | 已验证   | 薄适配保留；B11 删除     | widgets/dialogs：Dialog*；V04-03–V04-07                                                           |
| U29  | AlertDialog：`AlertDialog`、`showAlert`                                                                                                                      | 保留确认语义，重写服务入口 | B04    | 已验证   | 薄适配保留；B11 删除     | widgets/dialogs：AlertDialog*、ConfirmationProvider/service；V04-03–V04-07                        |
| U30  | Toast：`Toaster`、`toast`                                                                                                                                    | 保留并隔离适配             | B04    | 已验证   | 薄适配保留；B11 删除     | widgets/notifications：ToastView、Toaster、NotificationProvider/service；V04-03–V04-07            |
| U31  | Accordion：`Accordion`、`AccordionItem`                                                                                                                      | 保留，合并视觉实现         | B03    | 已验证   | 薄适配保留；B11 删除     | widgets/disclosure/Accordion、AccordionItem；V03-03–V03-06                                        |
| U32  | Collapsible：`Collapsible`                                                                                                                                   | 保留并整理组合             | B03    | 已验证   | 薄适配保留；B11 删除     | widgets/disclosure/Collapsible；V03-03–V03-06                                                     |
| U33  | Breadcrumbs：`Breadcrumbs`、`BreadcrumbItem`                                                                                                                 | 重写语义结构               | B07    | 已验证   | 薄适配保留；B11 删除     | widgets/navigation/Breadcrumbs；V07-03/04/06                                                      |
| U34  | Pagination：`Pagination`                                                                                                                                     | 保留，拆纯算法             | B07    | 已验证   | 薄适配保留；B11 删除     | widgets/navigation/Pagination + values/pagination；V07-03/04/06                                   |
| U35  | Table：`Table`                                                                                                                                               | 拆分并重写数据适配         | B07    | 已验证   | 薄适配保留；B11 删除     | widgets/collections/Table、DataTable；V07-03/04/06                                                |
| U36  | Tree：`TreeItemRoot`、`TreeItemContent`、`TreeItemIcon`、`TreeItemPreview`、`TreeGroup`、`DragPreview`、`InsertionIndicator`                                 | 重写组件族                 | B07    | 已验证   | 薄适配保留；B11 删除     | widgets/collections/tree + values/tree、collection；V07-03–V07-06                                 |
| U37  | ResizablePanel：`ResizablePanel`                                                                                                                             | 重写并改名                 | B03    | 已验证   | 薄适配保留；B11 删除     | layout/ResizableSplit；V03-03–V03-06                                                              |
| U38  | ColorPicker：`ColorPicker`                                                                                                                                   | 拆分                       | B08    | 已验证   | 薄适配保留；B11 删除     | widgets/color/ColorWidget + templates/color/ColorPicker、ColorInput、HDRColorInput；V08-03–V08-07 |
| U39  | ColorSlider：`GradientSlider`、`ParticleSlider`、`HDRSlider`                                                                                                 | 合并颜色模型，拆清职责     | B08    | 已验证   | 薄适配保留；B11 删除     | templates/color/ColorRamp、ColorRampChannels、HDRColorInput + values/color-ramp；V08-03–V08-07    |
| U40  | BezierCurveEditor：`BezierCurveEditor`                                                                                                                       | 拆分并改名                 | B09    | 未迁移   | 未退出；最迟 B11         | —                                                                                                 |
| U41  | AssetItem：`AssetItem`                                                                                                                                       | 保留，合并内部改名行为     | B10    | 未迁移   | 未退出；最迟 B11         | —                                                                                                 |
| U42  | ThemeProvider：`ThemeProvider`、`ThemeContext`、`useTheme`、`defaultThemes`、`addThemeChangeListener`、`removeThemeChangeListener`                           | 重写状态层                 | B02    | 已验证   | 薄适配保留；B11 删除     | foundation/theme；V02-03/04/05                                                                    |
| G01  | `FormItem`                                                                                                                                                   | 拆分并重写                 | B03    | 已验证   | 薄适配保留；B11 删除     | layout/PropertyRow、PropertyLabel、PropertyControl、PropertyDescription；V03-03–V03-06            |
| G02  | `FormItemInput`                                                                                                                                              | 删除包装并合并能力         | B05    | 已验证   | 实现/出口/专属故事已删除 | PropertyRow + Input；PropertyField string 绑定；V05-03–V05-07                                     |
| G03  | `FormItemTextarea`                                                                                                                                           | 删除包装                   | B05    | 已验证   | 实现/出口/专属故事已删除 | PropertyRow + Textarea；PropertyField textarea 绑定；V05-03–V05-07                                |
| G04  | `FormItemInputNumber`                                                                                                                                        | 合并，删除旧入口           | B06    | 已验证   | 实现/出口/专属故事已删除 | PropertyRow + widgets/inputs/InputNumber；属性绑定使用 PropertyField；V06-03/04/06/07             |
| G05  | `FormItemSlider`                                                                                                                                             | 重写为复合模板             | B06    | 已验证   | 实现/出口/专属故事已删除 | templates/numeric/NumericSlider；V06-03/04/06/07                                                  |
| G06  | `FormItemCascadeSlider`                                                                                                                                      | 删除包装                   | B06    | 已验证   | 实现/出口/专属故事已删除 | PropertyRow + widgets/sliders/DistributionSlider；V06-03/04/06/07                                 |
| G07  | `FormItemVector2`                                                                                                                                            | 合并实现，删除旧入口       | B06    | 已验证   | 实现/出口/专属故事已删除 | templates/numeric/Vector2Input（GeometryInputs） + NumericTupleInput；V06-03/04/06/07             |
| G08  | `FormItemVector3`                                                                                                                                            | 合并并拆比例策略           | B06    | 已验证   | 实现/出口/专属故事已删除 | templates/numeric/Vector3Input（GeometryInputs） + values/proportion；V06-03/04/06/07             |
| G09  | `FormItemVector4`                                                                                                                                            | 合并实现，删除旧入口       | B06    | 已验证   | 实现/出口/专属故事已删除 | templates/numeric/Vector4Input（GeometryInputs） + NumericTupleInput；V06-03/04/06/07             |
| G10  | `FormItemRect`                                                                                                                                               | 合并底层实现，保留矩形语义 | B06    | 已验证   | 实现/出口/专属故事已删除 | templates/numeric/RectInput（GeometryInputs） + values/geometry；V06-03/04/06/07                  |
| G11  | `FormItemToggle`                                                                                                                                             | 删除包装                   | B05    | 已验证   | 实现/出口/专属故事已删除 | PropertyRow + Checkbox；PropertyField boolean 绑定；V05-03–V05-07                                 |
| G12  | `FormItemToggleGroup`                                                                                                                                        | 删除包装并重整类型         | B05    | 已验证   | 实现/出口/专属故事已删除 | PropertyRow + ToggleGroup；V05-03–V05-07                                                          |
| G13  | `FormItemSegmentControl`                                                                                                                                     | 删除包装，重写值映射       | B05    | 已验证   | 实现/出口/专属故事已删除 | PropertyRow + SegmentControl；V05-03–V05-07                                                       |
| G14  | `FormItemSelect`                                                                                                                                             | 删除包装，合并选择适配     | B05    | 已验证   | 实现/出口/专属故事已删除 | PropertyRow + Select/Combobox；PropertyField enum 绑定；V05-03–V05-07                             |
| G15  | `FormItemColor`                                                                                                                                              | 拆分并合并到颜色模板       | B08    | 已验证   | 实现/出口/专属故事已删除 | PropertyRow + ColorInput/ColorPicker/HDRColorInput；V08-03–V08-07                                 |
| G16  | `FormItemGradient`                                                                                                                                           | 拆分并重写模式模型         | B08    | 已验证   | 实现/出口/专属故事已删除 | templates/color/ColorDistributionTemplate + values/color-distribution；V08-03–V08-07              |
| G17  | `FormItemParticleCurve`、别名 `FormItemParticle`                                                                                                             | 重写组合，删除别名和旧入口 | B09    | 未迁移   | 未退出；最迟 B11         | —                                                                                                 |
| G18  | `FormItemAssetPicker`                                                                                                                                        | 拆分并重写                 | B10    | 未迁移   | 未退出；最迟 B11         | —                                                                                                 |
| G19  | `FormItemDisplay`                                                                                                                                            | 拆分，删除旧包装           | B03    | 已验证   | 薄适配保留；B11 删除     | widgets/display/ReadonlyValue、ImagePreview；V03-03–V03-06                                        |
| G20  | `FormItemButton`                                                                                                                                             | 删除包装                   | B05    | 已验证   | 实现/出口/专属故事已删除 | PropertyRow + Button；Layout/Action row；V05-04/07                                                |
| G21  | `FormItemGroup`                                                                                                                                              | 合并到布局                 | B03    | 已验证   | 薄适配保留；B11 删除     | layout/Section；V03-03–V03-06                                                                     |
| G22  | `FormItemArray`                                                                                                                                              | 重写                       | B07    | 已验证   | 实现/出口/专属故事已删除 | templates/collections/CollectionTemplate；V07-03–V07-07                                           |
| G23  | `PickableAssetItem`                                                                                                                                          | 合并并删除旧入口           | B10    | 未迁移   | 未退出；最迟 B11         | —                                                                                                 |

## 4 共享事项台账

| 编号 | 工作项                                                                    | 主批次                 | 状态               | 退出条件                                                                                                     |
| ---- | ------------------------------------------------------------------------- | ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| S01  | PropertyDescriptor/Access、EditSession、ChoiceOption、能力接口与最小 Mock | B01                    | 已验收             | 基础模型、会话、可选能力和 Mock 通过；专用模型留对应批次                                                     |
| S02  | Panda token、styling 子入口、主题与生成配置                               | B02；B11 收口          | B02 已验收         | 单一源配置及消费者样式已验证；B11 删除旧包后收口                                                             |
| S03  | 数值纯函数、拖动/草稿、round 与共享编辑行为                               | B05/B06                | 文本及数值已验收   | useTextEdit、useNumericInput/useNumericDrag 与 values/numeric 单一实现；V06-03–V06-05                        |
| S04  | 颜色值类型、公开 helpers/hooks 和转换                                     | B08                    | 已验证             | values/color、color-ramp、color-distribution；显式编码与宿主边界；V08-03/04/06                               |
| S05  | 曲线类型、插值/坐标/刻度工具与预设能力                                    | B09                    | 待开始             | 值与选中/视图状态分开；存储不在控件内                                                                        |
| S06  | DragContext、Provider、useDrag/useDrop 与模型                             | B07                    | 已验证             | interaction/drag-drop + values/drag-drop；公开只读快照和取消API，旧hook仅映射numeric layer；V07-03–V07-06    |
| S07  | PropertyField 的逐步联调                                                  | B05/B06 启动；B11 收口 | 基础标量绑定已验证 | string/boolean/enum/number 已接入 Mock；数值双通道、事务/拒绝/版本验证通过，复杂模板绑定与最终收口留后续批次 |
| S08  | 公共 Props、值类型、严格检查与旧 StitchesComponent 名称                   | 各主批次；B11 收口     | 部分迁移           | 完整可导入类型，无旧内部深层引用，类型检查范围完整                                                           |
| S09  | 空文件、重复图标/Picker/helper、旧包装/HOC/别名                           | 各主批次；B11 收口     | 部分迁移           | 消费者切换后删除；GUI/GUIRoot/旧 Panel 保持已删除                                                            |
| S10  | 全部 stories、StoryFrame、demo、文档、脚本、旧包与锁文件                  | 各主批次；B11 收口     | 部分迁移           | 只有统一入口，现有能力有故事对应，旧包引用清零                                                               |

内部零件、全部公共类型和非组件导出的逐项去向见方案 5.8、5.9 和第 6 节，不以主表只列组件为由遗漏它们。

B01 为 S02 建立 Panda 生成/扫描骨架，为 S08 补齐检查范围并启用新包 strict，为 S10 接入第三个 Storybook、命令和锁文件；这些准备工作不表示主题、旧类型或旧包迁移已经完成，上述为 B01 当时状态。B02 已验收 S02 的本批范围；B03 继续推进 S08/S09/S10，新增 17 个组件及完整 Props、删除重复布局内核、补充 28 个故事与消费说明。旧包、其余组件和兼容类型仍留对应主批次及 B11 收口。

B05 推进 S03 的文本草稿/终结行为及 S07 的 string/boolean/enum 属性绑定，复用 B01 会话契约；在 B05 当时，数值编辑、数组属性和复杂模板尚未实现。S08/S09/S10 同步补齐新 Props、唯一选项映射、七个旧 FormItem 包装退出与 34 个新故事（8 组）；UI 薄适配和旧包仍由 B11 清理。

B06 推进 S03 的纯数值规则、文本/拖动与滑块编辑内核，以及 S07 的 number 属性绑定；数值模板保留独立受控值，未把几何对象提前扩入 B01 标量契约。S08/S09/S10 增加 9 个数值控件/模板及 Props、纯模型与 33 个故事（覆盖 6 组），删除七个数值 FormItem 包装和专属故事。最终静态浏览器验收见 V06-05；B07–B11 在当时未开始。B07 现已完成 S06，并继续 S08/S09/S10 的集合类型、旧包装退出和故事迁移。

## 5 验证记录

| 记录   | 批次/日期        | 验证内容                                | 结果               | 证据或范围                                                                                                                                                                                                                                                                                   |
| ------ | ---------------- | --------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V00-01 | B00 / 2026-10-22 | 启动时运行 pnpm verify                  | 通过，退出码 0     | Prettier、当前类型检查、demo、UI 与 GUI Storybook 构建；见下方日志                                                                                                                                                                                                                           |
| V00-02 | B00 / 2026-10-22 | 读取两个静态 Storybook 索引             | 通过               | UI：107 stories / 40 组 / 28 docs；GUI：88 stories / 22 组 / 1 docs                                                                                                                                                                                                                          |
| V00-03 | B00 / 2026-10-22 | 文档格式、链接、65 项唯一归属、批次依赖 | 通过               | 65/65 项无遗漏/重复；12 批依赖无环；本地链接有效；Prettier 通过                                                                                                                                                                                                                              |
| V00-04 | B00 / 2026-10-22 | 本轮文件范围与生产代码不变              | 通过               | 第 1 节指纹一致，仅新增/更新约定的 4 份文档                                                                                                                                                                                                                                                  |
| V01-01 | B01 / 2026-10-22 | 补齐旧 UI stories 类型检查的首次结果    | 失败后修复         | 5 文件共 19 条诊断：Accordion 7、CascadeSlider 2、ColorSlider 2、Select 7、Slider 1；V01-03 复验通过                                                                                                                                                                                         |
| V01-02 | B01 / 2026-10-22 | Mock 边界与纯类型临时验证               | 通过               | 29 组运行时验证、非法类型断言检查；含重入错误返回修复、会话幂等、过期确认、Reset、revision 上限                                                                                                                                                                                              |
| V01-03 | B01 / 2026-10-22 | pnpm verify                             | 通过，退出码 0     | 全仓格式/类型、demo、UI/GUI/interface Storybook 构建；日志无警告或错误                                                                                                                                                                                                                       |
| V01-04 | B01 / 2026-10-22 | 冻结锁文件安装、pnpm dedupe --check     | 通过，退出码 0     | 安装使用 --frozen-lockfile --ignore-scripts；无新增依赖版本；生成命令由 verify 实际执行                                                                                                                                                                                                      |
| V01-05 | B01 / 2026-10-22 | tsc 文件覆盖、显式出口与依赖审计        | 通过               | 预期 TS/TSX/CJS 源/示例/support/config 零遗漏；4 个出口有效；纯模块无 React/DOM/Node/Qt/旧包导入，无环                                                                                                                                                                                       |
| V01-06 | B01 / 2026-10-22 | 开发预览 6009 浏览器实测                | 通过               | 7 个契约场景，preview/authority 分离、取消/拒绝/旧响应、对象切换、能力缺失、选项类型身份；明暗主题、控制台正常                                                                                                                                                                               |
| V01-07 | B01 / 2026-10-22 | 静态预览 6010 浏览器实测与索引          | 通过               | 7/7 场景加载无警告/错误；数值提交和选项 0 提交通过，明暗主题有样式；旧 UI 107、GUI 88 stories 数量不变                                                                                                                                                                                       |
| V01-08 | B01 / 2026-10-22 | 5 组旧 UI 示例浏览器回归                | 通过               | Accordion 单/多开、Cascade 51/49/100 与 Reset、Select 多选与受控更新、颜色三组/HDR 同步、Slider 20/24px 与键盘 50→51                                                                                                                                                                         |
| V02-01 | B02 / 2026-10-22 | 中途失败与构建警告                      | 修复后复验通过     | 详见第 10 节：Panda 类型/跨文件 raw 抽取、旧 as=div、Slot Fragment、样式覆盖、原型键、嵌套按钮、ES2020 API 兼容；保留各次日志                                                                                                                                                                |
| V02-02 | B02 / 2026-10-22 | pnpm verify；冻结安装及去重             | 通过，退出码 0     | 最终 verify-accepted.log：全仓格式/类型、demo、三套 Storybook，无构建警告/错误；--frozen-lockfile --ignore-scripts 与 dedupe --check 通过，未新增依赖版本                                                                                                                                    |
| V02-03 | B02 / 2026-10-22 | TEMP 单元级/SSR 探针及架构审计          | 通过               | 主题 14 项、按钮/反馈 23 项、排版/图标/快捷键 23 项及 3 个特殊键名；50 源文件/104 依赖边、6 个纯层文件、9 个出口、零循环和旧包反向导入                                                                                                                                                       |
| V02-04 | B02 / 2026-10-22 | 开发浏览器与主题生命周期                | 通过               | 24 个新故事：主题同步/系统/存储/多 Provider/StrictMode 清理，按钮异步/键盘/ref/asChild，受控 Tag，Progress 范围，图标命名、排版语义、快捷键、8 方向 Arrow；组件控制台无新增告警/错误                                                                                                         |
| V02-05 | B02 / 2026-10-22 | 静态预览与 demo 浏览器                  | 通过               | 31/31 故事交替明暗加载，组件控制台无告警/错误；实测主题同步、按钮尺寸与 18px 覆盖、Tag 接受/拒绝删除、公共 styling 提取、demo 计数和主题切换                                                                                                                                                 |
| V02-06 | B02 / 2026-10-22 | 旧消费者浏览器回归                      | 通过               | FormItemArray 重命名/删除/新增及焦点恢复；Combobox 无嵌套 button、受控拒绝、禁用、Enter/Space 删除、ArrowDown/Enter 选择、Escape 恢复与浮层定位                                                                                                                                              |
| V02-07 | B02 / 2026-10-22 | 静态索引与交付范围                      | 通过               | UI 108 stories / 40 组 / 28 docs；GUI 88 / 22 / 1；interface 31 / 10 / 1（本批新增 24）；无独立测试、日志、截图或临时脚本进入项目                                                                                                                                                            |
| V03-01 | B03 / 2026-10-23 | 中途失败与交叉审查                      | 修复后复验通过     | 首次格式检查两处失败；修复可选 id 覆盖、说明 ID 合并、asChild 分隔引用；详见第 11 节                                                                                                                                                                                                         |
| V03-02 | B03 / 2026-10-23 | pnpm run verify、冻结安装、去重         | 通过，退出码 0     | verify-final-independent.log：全仓格式/类型、demo、三套 Storybook；构建告警/错误 0；offline frozen ignore-scripts 安装与 dedupe --check 通过                                                                                                                                                 |
| V03-03 | B03 / 2026-10-23 | TEMP SSR/事件探针与架构审计             | 通过               | PropertyRow/适配 13 项，布局/展示 10 项，Disclosure/Section 21 项，split ID 3 项，模拟 DOM 指针清理/取消 11 项；新包 63 文件、101 去重依赖边、环 0、新→旧依赖 0                                                                                                                              |
| V03-04 | B03 / 2026-10-23 | 28 个新故事的开发浏览器                 | 通过               | 单控件/组/说明、禁用、窄栏长文本、折叠模式/独立动作/键盘/RTL、ref/滚动事件/缩短内容、尺寸受控拒绝/拖动/边界/RTL/standalone；组件控制台无告警/错误                                                                                                                                            |
| V03-05 | B03 / 2026-10-23 | 生产 Storybook 预览                     | 通过               | 59/59 故事交替明暗加载；实际验证 PropertyRow 名称/只读、拖动实时更新与单次结束、受控拒绝、独立动作、滚动 ref/事件与复位；组件控制台无告警/错误                                                                                                                                               |
| V03-06 | B03 / 2026-10-23 | 旧消费者浏览器回归                      | 通过               | GUI 22 组概览无悬空标签引用/嵌套按钮；输入标签聚焦/回写、Select 选项提交、Vector3 键盘、Array 重命名/焦点恢复/折叠/新增；旧 UI 12 故事加载，滚动及尺寸边界通过                                                                                                                               |
| V03-07 | B03 / 2026-10-23 | 交付范围、出口与静态索引                | 通过               | UI 108 stories / 40 组 / 28 docs；GUI 88 / 22 / 1；interface 59 / 20 / 1（新增 28/10）；17 组件 + 17 Props + 4 辅助类型公开；无独立测试或临时产物进入项目                                                                                                                                    |
| V04-01 | B04 / 2026-10-23 | 中途失败与交叉审查                      | 修复后复验通过     | 格式、forceMount 锁、首次通知/重入、窄屏按钮、跨 Portal 层级、Fragment 标签、曲线删除边界、嵌套 css 抽取；见第 12 节                                                                                                                                                                         |
| V04-02 | B04 / 2026-10-23 | 完整 verify、冻结安装与去重             | 通过，退出码 0     | verify-final-accepted.log：全仓格式/类型、Demo、三套 Storybook；告警/错误匹配 0。offline frozen ignore-scripts、dedupe --check 通过，检查前后 manifests/lock 哈希不变                                                                                                                        |
| V04-03 | B04 / 2026-10-23 | TEMP 行为/类型/SSR 探针                 | 通过               | 菜单 13 DOM + 7 SSR、100 非法 Slot、9 forceMount 类型；浮层 5；确认服务 11、Dialog DOM 14、forceMount/长内容；通知 10 与交叉复验；层级 7、旧 Select 5、曲线删除 7；另有 Fragment 与样式提取探针                                                                                              |
| V04-04 | B04 / 2026-10-23 | 新组件开发浏览器                        | 通过               | 30 新故事加载与 2 个层级场景；实际覆盖菜单键盘/禁用/单选/勾选/RTL/局部主题、Popover 保留/释放、Tooltip focus/Escape、HoverCard 受控开关、嵌套 Dialog、确认 FIFO/幂等、通知宿主交接/清理/隔离                                                                                                 |
| V04-05 | B04 / 2026-10-23 | 生产 Storybook 预览                     | 通过               | 91/91 故事交替 light/dark 加载；样式修复后另验受影响层级故事。实际 zIndex 200→210→220、嵌套动作只执行一次、Popover 状态保持与关闭 effects=0、确认 FIFO、320px 可见 Cancel、通知主题与隔离；最终组件 console warn/error 0                                                                     |
| V04-06 | B04 / 2026-10-23 | 旧消费者浏览器回归                      | 通过               | 旧 Popover forceRender、showAlert 注入/回调一次、Toast 关闭/Undo；Dialog 内 Select 鼠标选择与 50→60 层级；Fragment 标签键盘移除/受控拒绝；GUI 资源搜索/选择/清空、颜色回写；曲线删除边界修复后无崩溃                                                                                         |
| V04-07 | B04 / 2026-10-23 | 架构、出口、索引、清理                  | 通过               | 87 源文件/156 依赖边，环 0、新→旧 0，pure 6 无 React/DOM；90 组件 + 90 Props + 5 函数 + 12 类型，23 package targets、8 薄适配。UI 109/40/28、GUI 88/22/1、interface 91/26/1；本批新增 32/6；无独立测试或临时源码入库                                                                         |
| V05-01 | B05 / 2026-10-23 | 中途失败与交叉审查                      | 修复后复验通过     | 类型边界、提交回执、mixed 草稿、change invalid、动态选项现值丢失、异步接受后二次取消；保留首次失败日志及第 13 节修复记录                                                                                                                                                                     |
| V05-02 | B05 / 2026-10-23 | 完整 verify、冻结安装与去重             | 通过，退出码 0     | verify-accepted.log：格式、全仓类型、Demo 与三套 Storybook；冻结锁文件安装与 dedupe --check 通过                                                                                                                                                                                             |
| V05-03 | B05 / 2026-10-23 | TEMP 文本/选择/属性事件探针             | 通过               | text-events 16、text-consumers 15、text-terminal-after 8、boolean-choice-probe 16、choice-probe 15、property-field-final 16；invalid-change-after 复验通过。使用真实 ReactDOM/jsdom 与模拟事件，不替代实际浏览器/Qt 验收                                                                     |
| V05-04 | B05 / 2026-10-23 | 新组件交互浏览器                        | 通过               | 新增 34 故事/8 组；实测文本草稿与终结、键盘/搜索、多选受控拒绝、typed values/空字符串、mixed checkbox；PropertyField 拒绝重试、目标/外部更新、多行和 change validation                                                                                                                       |
| V05-05 | B05 / 2026-10-23 | 生产故事与最终终结/窄窗口复验           | 通过               | 125/125 故事交替 light/dark 加载；最终 hook 修复后重验 15 个文本/属性故事。接受仅 request+accepted，无 cancel；开发 Enter/Tab 仅 history=1。320×640 字段 scrollWidth=viewport=317，选项弹层 left=117/right=270，选择 One(number) 得 number 1/history=1；静态/开发 console warn/error 均为 [] |
| V05-06 | B05 / 2026-10-23 | 旧消费者浏览器回归                      | 通过               | Array、Tree、Asset 改名与 Particle Select 实际操作通过；旧选择入口的 Fragment、多选受控拒绝/禁用、原始值身份与浮层主题/层级另有 TEMP 探针                                                                                                                                                    |
| V05-07 | B05 / 2026-10-23 | 架构、出口、索引与交付范围              | 通过               | 102 源文件/202 依赖边、7 pure 文件；零循环、反向依赖、未声明依赖及独立测试。七个旧 FormItem 无活跃引用；interface 125 stories/34 组/3 docs（新增 34/8），UI 109/40/28，GUI 62/15/1                                                                                                           |
| V06-01 | B06 / 2026-10-23 | 交叉审查与边界修复                      | 修复后定向复验通过 | slider 拒绝后的模板锁定、软范围无移动误写、多 thumb 越界/焦点、原生 reset、pending Escape 迟到错误及属性拒绝重复 alert；见第 14 节                                                                                                                                                           |
| V06-02 | B06 / 2026-10-23 | 完整 verify、冻结安装与去重             | 通过，退出码 0     | verify-final.log：全仓格式/类型、Demo 与三套 Storybook，warning/error=0；frozen install 与 dedupe --check 通过，锁文件不变                                                                                                                                                                   |
| V06-03 | B06 / 2026-10-23 | TEMP 数值/模板/属性事件探针             | 通过               | InputNumber 25 项、native reset 15 项、错误归属 4 项；Slider/Distribution 28 项（原 26 项 + 错误归属 2 项）；数值模板 24 项及 reset/迟到结果 15 项；PropertyField number 24 项与 B05 text 回归 16 项。各脚本分别计数，复跑不作新增覆盖                                                       |
| V06-04 | B06 / 2026-10-23 | 新组件开发浏览器                        | 通过               | 数值拖动 2→7 仅一次 history；负号/小数/Enter-blur；分布 Home/End 得 [10,80,10]；受控拒绝、多 thumb 换序焦点；联动 [4,8,-12]、零轴 [3,4,6]、Rect width 负值→0 且位置不变；320px 无溢出；NumericSlider 拒绝后重试接受；开发 console=[]                                                         |
| V06-05 | B06 / 2026-10-23 | 最终生产 Storybook 浏览器               | 通过               | 本批 33/33 故事交替 light/dark 加载无 error，最终 console=[]；拒绝 draft=6/authority=2/history=0 且仅 1 alert、aria-errormessage 关联该节点；重试/目标切换通过；实际拖动 2→7/history=1；320px 窗口 clientWidth=scrollWidth=317                                                               |
| V06-06 | B06 / 2026-10-23 | 旧消费者浏览器回归                      | 通过               | GUI Group scale=2.5、Array weight=0.6、旧 HDR 2→1.9、Color R=220；数值旧入口只做薄适配，未来颜色/曲线模型仍按原批次推进                                                                                                                                                                      |
| V06-07 | B06 / 2026-10-23 | 架构、出口、索引与交付范围              | 通过               | 118 生产源文件/254 依赖边/11 pure 文件，无环、新→旧导入、未声明依赖、纯层污染或独立测试；新增 9 控件/模板及 Props；新增 33 stories 覆盖 6 组。interface 158/39/5、UI 109/40/28、GUI 37/8/1；七个旧数值 FormItem 无活跃出口/专属故事                                                          |
| V07-01 | B07 / 2026-10-23 | 基线与批次范围                          | 通过               | B06 本地/远程 0bab111 完整 SHA 一致；启动工作树干净；本批 U33–U36/G22 与 S06。                                                                                                                                                                                                               |
| V07-02 | B07 / 2026-10-23 | 格式、全仓类型、Demo/三套 Storybook     | 通过               | 最终 verify-final.log 退出 0；生产、stories/support、tooling、pure 与跨包消费端全通过；warning/error=0。                                                                                                                                                                                     |
| V07-03 | B07 / 2026-10-23 | 架构/出口/退出审计                      | 通过               | 133 个生产文件、300 条依赖边、15 个纯层文件；无环、旧包反向导入、未声明依赖或纯层 DOM/React；FormItemArray 和可变 DragContext 退出。                                                                                                                                                         |
| V07-04 | B07 / 2026-10-23 | 临时纯值与 ReactDOM 探针                | 通过               | Tree 28 组、CollectionTemplate 25 组、导航/表格 14 组（包含168组分页组合）、共享拖放 20 组、旧面包屑适配 3 组；console=0；无独立测试文件进项目。                                                                                                                                             |
| V07-05 | B07 / 2026-10-23 | 拖放隔离与终结                          | 通过               | 原生 marker/typed payload、跨Provider与type拒绝、Escape/reset/disabled/unmount/blur、同步drop移除源、替换拖动重入；浏览器确认成功/拒绝/跨provider均一次终结。                                                                                                                                |
| V07-06 | B07 / 2026-10-23 | 浏览器实际交互与样式                    | 通过               | 最终构建本批26故事交替明暗加载；键盘导航、Tree/Collection原生拖放、异步改名拒绝重试、增删焦点、DataTable草稿身份、分页越界/零结果、320px四组宽度及旧Asset/Table适配。                                                                                                                        |
| V07-07 | B07 / 2026-10-23 | 交付清理与依赖                          | 通过               | frozen-lockfile offline安装、dedupe --check 通过且锁文件不变；最终构建索引与源码一致；临时探针/日志/截图在系统TEMP，Git依正常hooks提交与推送。                                                                                                                                               |

| V08-01 | B08 / 2026-10-23 | 基线、范围与首次失败 | 修复后复验通过 | 起点3ec1d1d本地远程一致且干净；U38/U39/G15/G16/S04；HEX异步拒绝、嵌套pending、窄屏弹层和旧HDR零值转换的首次失败及修复见第16节。 |
| V08-02 | B08 / 2026-10-23 | 格式、全仓类型、Demo/三套Storybook | 通过，退出码0 | 最终verify-final.log：production/stories/support/tooling/pure及消费者类型全部通过；构建warning/error=0。 |
| V08-03 | B08 / 2026-10-23 | 架构、出口和退出审计 | 通过 | 155生产文件/403依赖边/19纯层文件；无环、反向依赖、未声明依赖或纯层污染。旧GUI两项及旧UI颜色内核删除，新包公开8个颜色控件/模板及Props。 |
| V08-04 | B08 / 2026-10-23 | TEMP模型与真实ReactDOM探针 | 通过 | 单色43、渐变21、分布DOM17/模型9、宿主DTO9、旧DTO/浏览器能力13；另有旧HDR与嵌套能力定向回归。共享内核最后修改后重新bundle三组DOM探针，console=0。 |
| V08-05 | B08 / 2026-10-23 | 生产故事与浏览器交互 | 通过 | 本批28/28故事交替明暗加载；SV/Hue、HEX Enter-blur、延迟拒绝重试、重合点选择不写值、渐变拖动/删除焦点、双轨/HDR、分布缓存/Reset和宿主time回写通过。 |
| V08-06 | B08 / 2026-10-23 | 窄屏与旧入口浏览器 | 通过 | 四组320px窗口clientWidth=scrollWidth=317；嵌套弹层左右12/308且可滚动编辑，Escape逐层恢复焦点。旧HDR 0→1回显1；旧渐变0.5→127.5仅边界换算一次。 |
| V08-07 | B08 / 2026-10-23 | 依赖、索引与交付清理 | 通过 | frozen安装、dedupe通过；移除colord/react-colorful唯一消费者。interface212/49/6，UI109/40/26，GUI24/5/1；无独立测试或临时产物入库。 |

构建日志：[baseline-verify.log](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b00-20261022/baseline-verify.log)。

B00 的构建结果对应当时配置：UI 类型检查尚未包含全部 stories；该范围已在 B01 补齐。B00 不修改生产实现，因此未重复浏览器交互检查。此前的浏览器验证属于继承记录，不能记作 B01 执行结果。临时日志可能被系统清理，后续提交仍应在本表保留命令、退出码和范围摘要。

B01 日志：[完整 verify](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b01-20261022/verify.log)、[29 组 Mock 验证](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b01-20261022/mock-verification.log)、[依赖检查](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b01-20261022/dedupe.log)、[静态明色截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b01-20261022/static-light.png)。

### 后续批次记录格式

每批记录：开始/完成日期、实际修改文件与入口、值转换规则、命令与结果、浏览器 story 与操作结果、未退出的旧引用、风险处理、提交 SHA 和推送状态。遇到失败时增加一条记录，修复后另记复验。

## 6 风险与迁移债务

| 编号 | 事项                                                          | 处理规则                                                                                                                  | 负责批次           | 当前状态                     |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------- |
| R01  | 启动时继承修复未提交，原 HEAD 不包含完整工作树                | 继承修复已单独归档到 2c4638f，保留启动记录                                                                                | B00 记录，持续关注 | 已归档                       |
| R02  | 过渡期新旧入口造成双实现或反向依赖                            | 旧入口只做薄适配，新模块不导入旧包；每批记录剩余消费者                                                                    | 全部；B11 清零     | B07 无反向依赖；旧适配待退出 |
| R03  | Panda 路径/导出变化导致生产样式遗漏                           | 更新扫描；验证 consumer、开发预览与无缓存静态构建                                                                         | B01/B02/B11        | B02 开发/静态/消费者通过     |
| R04  | 当前 stories 检查范围和严格类型不足                           | B01 已补齐 stories/support/config；新包 strict，旧包随迁移收紧；MDX 由构建覆盖                                            | B01–B11            | 范围已补齐；旧类型待迁移     |
| R05  | 数值、颜色、曲线或资源的值语义在迁移中改变                    | 迁移前定义类型与转换，临时适配集中；不随目录移动隐式改变单位/范围/标识                                                    | B06/B08/B09/B10    | 待跟踪                       |
| R06  | Qt 后端与原生视口尚不存在                                     | 用 Mock 验证语义；真实平台行为在后续 Qt 集成阶段验收，不用网页占位冒充原生接入                                            | B01/B11 及后续集成 | 已记录                       |
| R07  | Storybook 管理界面提示 PopoverProvider 在 11 将强制 ariaLabel | 提示来自 storybook 10.6.3 的 sb-manager/globals-runtime.js，组件预览无此提示；不屏蔽、不修改 node_modules，依赖更新时复核 | B11/依赖维护       | 已记录，非组件告警           |

## 7 B00 执行记录

- 已从 main 的原 HEAD 创建并切换 feat-blender-5-2-refactor。
- 已保留继承修复及方案，建立本批次计划、组件台账和共享事项。
- 已重新执行当前完整 verify，并读取静态故事索引作为数量基线。
- 当前生产实现没有进入重构；B01 为下一批。

B00 已完成文档格式、链接、清单覆盖、依赖和文件范围验收。下一批仅推进契约、统一包骨架和最小 Mock，不同时展开主题、颜色、曲线或资源重写。

## 8 B01 执行记录

开始及完成日期：2026-10-22。验收完成，本记录随 B01 实现一并提交；分支为 `feat-blender-5-2-refactor`。继承修复与 B00 已分别提交，65 个 U/G 项仍为未迁移。提交引用见第 9 节；已于 B02 开始前补推远程。

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

用户要求每批结束后提交 Git 并推送远程，已写入批次执行规则。补交时按继承基线、B00、B01 分开；后续批次必须在验收与台账更新后完成独立提交和远程推送，再结束该批或推进下一批。

| 范围                     | 提交引用                                 | 主要内容                                                   |
| ------------------------ | ---------------------------------------- | ---------------------------------------------------------- |
| 继承修复 BASE-01–BASE-04 | 2c4638f49b481aa87e88fc7e5e0339288b90ce84 | 删除旧 GUI 容器、修复数值及表单交互、补齐 FormItem stories |
| B00                      | f2f2c98321cdcfe54d32b5f32dce6a453e352777 | Blender 术语/架构、批次、组件台账和必须提交的执行规则      |
| B01                      | bb3847eb604e14e837514537556f12ad83a05340 | 新统一包、契约和 Mock、7 个故事、完整类型检查及旧示例修正  |

当前批次用唯一提交标题指向包含本记录的提交，避免预测或自引用自身 SHA。可用 git log 按上表标题查找；下一批回填已存在的 SHA。提交钩子执行暂存文件格式检查；项目中不加入临时脚本、日志、截图、生成目录或测试文件。以上三次提交已于 B02 开始前推送，远程分支 origin/feat-blender-5-2-refactor 的 SHA 已核对为 bb3847eb604e14e837514537556f12ad83a05340。

B02 验收：已通过。提交：60e12bbf3773a47ee158fb1068e7ab953e70cbf0，标题 `feat(B02): unify theme and visual foundations`；已推送 origin/feat-blender-5-2-refactor，收尾时远程 SHA 与本地 HEAD 一致，工作树干净。

B03 验收：已通过。提交 4b2264a18c66c433c0bbeb4ac4ca738f0fd2c968，标题 `feat(B03): rebuild layout and explicit property rows`；已推送 origin/feat-blender-5-2-refactor，本地/远程 HEAD 一致，工作树干净。

B04 验收：已通过。提交 `2da9813e1a4c4eabc3a86e0b4226501add6a6869`（`feat(B04): unify overlays, menus and application-owned services`）通过正常 hooks 并推送。B05 启动时使用 git ls-remote 核对远程分支 SHA 一致，工作树干净。

B05 验收：已通过。提交 `ca7c7ee6d55aa445bf0c976aec85bb6e1d9a92fa`（feat(B05): unify text editing, typed choices and property bindings）已推送；B06 启动时再次核对远程完整 SHA 与本地一致，工作树干净。

B06 验收：已通过。提交 `0bab111d28b39495f3f596cc35bd10dc509c63d8`（`feat(B06): unify numeric editing, sliders and geometry templates`）已推送；B07 启动时 git ls-remote 核对远程与本地 HEAD 一致，工作树干净。

B07 验收：已通过。提交 `3ec1d1d442fd600bc67c544cb3815905e371369f`（`feat(B07): rebuild collections, navigation and scoped drag and drop`）已推送；B08 启动时核对本地与远程一致，工作树干净。

B08 验收：已通过。本批唯一提交标题为 `feat(B08): unify color editing, ramps and color distributions`；通过正常提交/推送钩子交付。实际 SHA、远程一致性与工作树状态记录在系统 TEMP 的 B08 `git-delivery.json`，下一批启动时回填 SHA。

## 10 B02 执行记录

开始日期：2026-10-22，前置 B01 已验收、提交并推送。范围为 U01、U02、U13–U20、U42 及 S02 样式基础，不展开后续布局或业务页面。

新实现位于 `packages/interface/src/foundation` 与 `widgets`；旧 UI 入口改为薄适配，旧包的删除归 B11。共享 Panda 配置与 token 保持单一来源，消费端扫描新增统一包源码；styling 子入口直接指向生成模块。验收包含主题偏好/系统变化/多消费者、按钮加载与焦点、Tag 移除、Progress 范围及不定进度、图标排版、开发/静态与旧消费者样式提取。

### B02 实际交付与旧入口

- 主题位于 `foundation/theme`：纯 store 区分 preference 与 resolvedTheme，React Provider/hooks 共享快照；storage、system、appearance 三个适配接口可独立替换。创建/读快照无浏览器副作用，connect 引用计数，最后断开清理监听并恢复原 DOM。拒绝持久化时保留会话内存偏好。旧 hook/context/listener 均转向新核心；旧全局 listener 只监听默认 store 的偏好变化，局部 store 直接 subscribe。
- 按钮位于 `widgets/buttons`：Button 与 ActionButton 共用 ButtonBase/useButtonState；外部 loading 与异步 pending 合并，激活锁防止重复请求。asChild 保留真实子元素的 class/ref/事件，禁用时阻断激活但允许 Tab 移出；透明包装必须转发 props/ref，默认不提交表单。ActionButtonGroup 仅视觉分组。删除已无引用的旧 useAsyncStatus。
- 展示与反馈：Badge 纯展示、Tag 由父级决定移除；Callout severity 与 note/status/alert 分离；Progress 统一 value/max 与 ARIA，支持未知进度及非法范围回退；Spin 与 Pending 图标适配减少动态效果。旧 Badge 的自隐藏仅留兼容入口，B11 删除；生产多选消费者已直接使用受控 Tag。
- 排版与图标：Text/Title 的 HTML 语义和视觉字号分开；19 个原公开图标统一 SVG props/ref/名称，新增正确 Atlas 拼写并保留旧别名；ConstrainIcon 两份实现合并。Triangle 由新 Arrow 装饰实现，旧入口仅方向/占位适配。Kbd 解析进入纯 values/shortcut，统一字符串/数组、别名、空白、大小写和手势，未知键名安全退回文本。
- 样式以 `panda/` 为唯一 token/预设来源，未复制第二套主题数据。公开 styling/css、styling/jsx、styling/tokens 直接指向生成模块，styling/types 仅类型；importMap 同时识别公共入口和包内直接生成路径。css 覆盖先合并样式对象，避免同属性原子类排序改变优先级。UI/GUI 扫描新源码；demo 已只依赖新包。各消费者启动/检查/构建的前置脚本负责所需 codegen，根类型检查串行，避免并发覆盖相同生成目录。
- 必要消费者修正：旧 AccordionItem 提供与折叠按钮同级的 actions 槽，FormItemArray 的重命名/删除恢复原生按钮和可访问名称，提交/取消后焦点回到重命名动作。旧 Combobox 的 Tag 移到原生触发按钮旁边，保留 Popover 的 ref/定位，受控拒绝不隐藏，禁用不移除。这些是 B02 接入闭包，U08/U31/G22 的主重构仍归 B05/B03/B07。
- 新包增加 24 个故事（主题 3、Tokens 1、Typography 3、Kbd 4、Icons 3、Arrow 2、Buttons 4、Badge/Tag 1、Feedback 3）；新包总计 31。旧 Select 增加受控标签移除故事，原示例均保留。

### B02 中途发现与修复

1. 初始定向类型检查发现 `_hover` 与当前 Panda 条件不匹配、importMap readonly 数组不匹配；改为显式选择器及满足 Config 的配置。首次全仓 typecheck 发现 FormItemArray 两个旧 as="div" 入口，与上述 actions 消费者修正一并解决。
2. 浏览器发现 asChild 的 Slot 将 className 传入 Fragment；改为直接组合真实子元素，并重新验证样式、父/子回调、ref、disabled/loading 和 Tab。追加包装 button/link 的表单案例，避免自定义组件被误判后恢复原生 submit 默认行为。
3. 交叉审查发现原子 CSS 覆盖顺序不保证、快捷键表读取原型键，以及 Combobox 的原生移除按钮嵌套在触发按钮内；均补充临时探针或现有 story 并修复。`constructor`、`__proto__`、`toString` 的 SSR 与浏览器输入已通过。
4. 手动运行旧 GUI tsc 时，其 noEmit=false 产生 47 个未跟踪 JS 文件；已按 Git 未跟踪清单和同名 TS 源核对后精准清除，并统一 noEmit=true。项目不保留这些产物，也不新增独立测试文件。

5. 最终消费者检查发现 Object.hasOwn 超出 app 的 ES2020 lib；改为 Object.prototype.hasOwnProperty.call，保留原型键保护且不提高消费者运行基线。修复后特殊键名探针与全仓检查通过。
6. CSS 覆盖修正引出 5 处 Panda imported_recipe_raw_dynamic 构建警告；将 raw 与 css 的组合函数移到各 recipe 定义文件，保留强类型和覆盖优先级。定向构建与最后完整 verify 均无此警告，静态按钮尺寸及覆盖实测通过。

### B02 验证记录

验收完成日期：2026-10-22。验证脚本、日志和截图全部位于系统 TEMP 的 `pivot-blender-refactor-b02-20261022`，项目没有新增独立测试文件。命令、浏览器、索引和架构结果见 V02-01–V02-07。

最终日志：[全量 verify](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b02-20261022/verify-accepted.log)、[架构与静态索引](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b02-20261022/architecture-audit-final.log)、[31 个静态故事](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b02-20261022/static-all-stories.json)、[静态按钮截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b02-20261022/static-buttons-final.png)。中途 ES2020 失败留在 verify-final.log，跨文件 recipe 告警留在 verify-complete.log。

主题测试中的系统与存储事件使用注入适配器；浏览器监听、拒绝存储和 StrictMode 另有临时应用验证。减少动态效果规则已核对构建 CSS，本轮未切换操作系统的减少动画设置。浏览器控制台结论针对组件预览；Storybook 管理端上游提示仍按 R07 记录。

旧 UI/GUI 开发入口保留，B02 的 11 项旧入口均为薄适配，尚未删除旧包。U08/U31/G22 只做本批接入所需的消费者修正，不计入其主迁移完成。B03 是下一批。

## 11 B03 执行记录

开始日期：2026-10-23。前置 B02 已验收、提交并推送。实际范围 U21–U23、U31、U32、U37、G01、G19、G21：Flex、Separator/SectionDivider、ScrollArea、Accordion/Collapsible/Section、ResizableSplit、PropertyRow 组合、ReadonlyValue/ImagePreview。

新字段布局显式关联 label/control/description，不扫描 DOM、不递归修改 children，不承载字段值或业务列模板。旧 FormItem 消费者同步显式关联；旧入口只留薄适配。验证单控件/多控件组、折叠动作与焦点、窄宽/长文、Viewport ref/事件、受控尺寸/键盘分隔/取消，并执行完整 verify、开发与静态浏览器复验。验证文件位于系统 TEMP 的 pivot-blender-refactor-b03-20261023，不新增独立测试文件。

### B03 实际交付与兼容边界

- PropertyRow、PropertyLabel、PropertyControl、PropertyDescription 只负责结构与显式关联。单控件使用 htmlFor/id；多控件用具名 group，内部各控件仍有自己的名称；动作与标签平级，帮助文本直接显示。没有 DOM 扫描、递归克隆或值状态。旧 FormItem 改为显式 render prop 适配，所有生产消费者同步接入；业务列模板下放各颜色、曲线、资源消费者，不留在通用布局。
- Flex 统一 direction/gap/align/justify/wrap；旧别名和默认换行仅在薄适配中转换。Separator 负责横/竖线及装饰语义，SectionDivider 组合文本与装饰线；ReadonlyValue 保留空值、0、换行/长文本，ImagePreview 保留原生图片属性与 contain/cover。
- ScrollAreaRoot 管理尺寸、滚动轴、滚动条和阴影，ScrollAreaViewport 承接滚动事件/ref/可聚焦内容。便捷 ScrollArea 明确 viewportProps/viewportRef；支持内容高度上限和内容缩短后阴影复位。旧 css/events/ref 仍转给 Viewport，旧默认 tabIndex=-1 保留菜单焦点行为。
- Accordion、Collapsible 共用视觉内核，保留单/多项、受控/非受控和键盘语义。动作槽与触发按钮平级；Collapsible 支持标题/图标触发和固定展开；Section 只是通用组合，不继承 FormItem 值契约。旧 FormItemArray 使用同一 Accordion，主重构仍属于 B07。
- ResizableSplit 统一可调区域与双区域布局，尺寸单位 CSS px。受控值由父级决定是否接受请求；onSizeCommit 表示最终请求而非权威确认。支持指针捕获、方向键/Shift/Home/End、RTL、有效空间钳制，以及 Escape、pointercancel、capture loss、window blur、配置变化取消。卸载清理捕获，不触发迟到回调。旧 ResizablePanel 转到同一核心；默认尺寸明确为 240，默认范围 80–960，显式 range 优先，不再使用挂载测量 ±50 的隐式范围。
- 新包根导出 17 个组件、17 个 Props 和 4 个辅助类型。新增的 4 个 Radix 依赖沿用仓库已有版本，锁文件只调整新工作区依赖映射。pure 层仍为 6 个文件，无 React/DOM 依赖。旧包保留 10 个对应薄适配文件，不存在新包反向导入或布局双实现。
- 文档同步根 README、统一包 README、文档索引、消费和开发指南。UI/GUI 仍是过渡入口，本批只迁移 9 个主项；为显式字段关联做的 Select/其他 FormItem 消费者变更不提前计入 B05–B10。

### B03 中途发现与修复

1. 首次完整检查在 Accordion、Collapsible 两文件格式处停止；整理后第二轮通过，最后代码冻结后重新完整运行 verify。
2. 交叉审查发现旧 Input/通用包装的 id={undefined} 可覆盖自动 ID，自定义 aria-describedby 可覆盖行内说明。修复 ID 优先级，并合并、去重自定义与生成的说明 ID；13 项 SSR 覆盖并验证无 React 警告。
3. primaryAsChild 子元素已有 id 时，Slot 的最终 ID 可能与分隔条 aria-controls 不一致；统一 ID 选择并补 3 项 SSR。动态 dir/style.direction 纳入拖动配置取消。11 项 TEMP 模拟 DOM 事件探针覆盖取消、捕获释放、卸载、动态边界、禁用、受控拒绝及指针身份。

### B03 验证记录与交接

完成日期：2026-10-23。最终执行 bundled pnpm 11.25.0（pm_on_fail=ignore），仓库 packageManager 声明未改。冻结安装、去重与完整 verify 均退出 0，最终日志告警/错误匹配 0；依赖检查前后 manifests/lock 哈希无变化。

开发浏览器覆盖新增 28 个故事；生产构建 59 个故事交替 light/dark 加载。实测生产拖动 220→280，连续 8 次尺寸请求、松开 1 次结束；父级拒绝后键盘请求 290、视觉仍为 280。滚动到底的 Viewport ref 与事件一致，内容缩短后 scrollTop 归零。静态字段组 X 修改为 30，锁定后 X/Y 只读，组名称与控件名称独立。旧入口回归见 V03-06。

指针取消、捕获丢失和卸载边界使用 TEMP jsdom 及模拟 pointer capture 验证，不宣称等同真实硬件/Qt 事件；实际鼠标拖动、键盘和滚动另外在浏览器验证。控制台结论针对组件 iframe；管理端上游提示仍按 R07 登记。无真实 C++/Qt 后端或工作区业务开发。

证据均在系统 TEMP： [最终 verify](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b03-20261023/verify-final-independent.log)、[架构审计](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b03-20261023/architecture-audit.json)、[59 个静态故事](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b03-20261023/static-all-stories.json)、[旧 GUI 概览](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b03-20261023/legacy-gui-overviews.json)、[指针取消探针](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b03-20261023/split-events-probe.log)、[生产字段截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b03-20261023/static-property-row.png)。项目没有新增独立测试、日志、截图或临时脚本；开发入口 6007/6008/6009 保留，临时静态预览 6010 验收后停止。

B04 是下一批；旧适配与剩余消费者留在各主批次及 B11 清理。此次未启动 B04。

## 12 B04 执行记录

开始日期：2026-10-23。前置 B02/B03 已验收、提交并推送，工作树干净。范围为 U24–U30：三类菜单适配、Popover/Tooltip/HoverCard、Dialog/AlertDialog、注入式确认服务与通知宿主。统一 Root/Trigger/Content/Portal 责任，局部主题随 portal 保留；旧入口仅薄适配，必要生产消费者同步接入。

必验：受控/非受控、重复开关、卸载、嵌套、Escape、焦点恢复、portal 主题与容器、StrictMode、确认队列幂等、通知重复宿主。验证脚本与输出使用系统 TEMP 的 pivot-blender-refactor-b04-20261023，不新增独立测试文件；本批不推进文本选择或数值业务重构。

### B04 实际交付与兼容边界

- 菜单分为 DropdownMenu、ContextMenu、Menubar 三套明确的 Root/Trigger/Portal/Content 与条目部件，复用视觉 recipe，保留各自开关、键盘和选择语义。ContextMenu 支持 Shift+F10/ContextMenu 键；禁用单选项正确透传。旧 Menu 只做命名和结构转换，BezierCurveEditor 的菜单使用明确的 ContextMenu 组合。
- Popover、Tooltip、HoverCard 分离 rootProps、triggerProps、portalProps、contentProps。TooltipProvider 放在应用边界共享延迟。Popover keepMounted 用 React Activity 保留 DOM/state，隐藏时断开 effects/ref、焦点层和滚动锁。旧 forceRender 映射到同一实现；旧 Combobox 标签移出隐藏浮层，支持 Fragment 内选项。
- Dialog/AlertDialog 提供组合部件和便捷入口，保留标题、可选说明、初始焦点、遮罩行为和 Escape 差异。长确认内容在独立区域滚动，标题与操作按钮保持可见。Dialog、AlertDialog 和菜单不公开原始 forceMount，运行时也拦截该参数。
- createConfirmationService/ConfirmationProvider 实现注入式 FIFO 队列与幂等结果。无宿主立即 unavailable，真实卸载结束为 unmounted；StrictMode 重连不误结束。旧 showAlert 必须显式接收 service，不再创建独立 React root，也不清空 body.pointerEvents。此调用方式是明确的破坏性迁移，详见 B04_OVERLAYS.md。
- ToastView 负责展示，Toaster 适配第三方调度；NotificationProvider 注入隔离服务并选出单一可见宿主。相同 ID 更新一条通知，clear/dismiss/最后卸载/后续同 ID 写入会使迟到完成失效。多个作用域互不清理，业务 Promise 不因 UI 卸载而被取消。
- Portal 主题直接继承局部 ThemeProvider；浮层通过 React context 传递层级，子浮层高于父层。数字 style/css.zIndex 参与基准计算；动态 CSS 表达式无法作为静态数字基准，调用方需显式给定数字层级。UI/GUI 仍是过渡入口，本批不开始 B05–B11，也不接入真实 C++/Qt 后端。

### B04 中途发现与修复

1. 两次完整 verify 的首次格式阶段分别发现尚在编辑的 LEDGER/DropdownMenu 和 B04_OVERLAYS 文档格式；格式化后类型和 Demo/三套 Storybook 构建通过。最终冻结后另行完整复验，不以中途构建代替验收。
2. 原始 Radix forceMount 会让关闭的模态内容继续渲染、锁滚动或屏蔽页面；TEMP 前后对比后移除新 API 的该参数并拦截运行时透传，Popover 用 Activity 单独实现安全保留状态。
3. 通知 Provider 的 passive effect 晚于子组件首次通知，导致通知丢失；改为 SSR 安全的 layout effect。Promise 文案回调中的 clear/dismiss/同 ID 更新可能被旧完成覆盖，增加回调后的有效性复查。临时交叉探针复验通过。
4. 320×640 浏览器发现长确认框 Cancel 已获焦但落在屏幕外；便捷 AlertDialog 改为独立正文滚动，标题和按钮固定在容器内，原始组合 Content 保持自由布局。
5. 实际嵌套检查发现 Dialog 中的浮层层级不完整；新增共享的层级传递与正反向嵌套故事，旧 Select 的独立 Radix Content 也纳入必要消费者适配。
6. Combobox 选项改从 trigger 渲染标签后，一层 Children.map 漏掉合法 Fragment；改为递归展开 Fragment，选项、可选项索引和标签共用同一列表。保留禁用项、全选、受控拒绝和移除后的焦点行为。
7. 曲线菜单回归暴露基线已有的 2→1 关键帧崩溃：序列化后被解析成无控制点的线性数据，Bezier 预览读取 null.x。按现有可播放曲线模型保留最少两个关键帧，并统一菜单、键盘和内部删除守卫；不提前扩展 B09 的单点/空曲线模型。
8. 生产预览发现嵌套 contentProps.css 的数字层级对象未被 Panda 抽取，虽然运行时有原子 className，实际 zIndex 仍为 auto。故事改用显式 css.raw，文档同步嵌套样式的抽取要求，重新构建后验证实际计算样式。

### B04 验证记录与交接

完成日期：2026-10-23。使用 bundled pnpm 11.25.0（pm_on_fail=ignore），仓库 packageManager 声明不变。最终完整 verify、冻结安装、去重与架构审计全部退出 0，最终构建日志警告/错误匹配 0。

生产预览 91 个故事均加载成功；新增 32 个故事覆盖 6 组。实际验证默认层级 50→60→70 及数字覆盖 200→210→220，局部浅色菜单及子菜单在深色页面保持浅色；Popover 关闭后 effects=0，输入和计数再次打开保持；确认队列结果依次 confirmed/cancelled，焦点回到原按钮。320×640 下确认框宽 288、高 608，Cancel 位于可视区域内；通知作用域分别使用 light/dark，清理一个后只保留另一个。

旧 UI 保留 109 个故事，GUI 保留 88 个故事。实际回归范围见 V04-06。旧 HoverCard 没有已有故事或生产消费者，因此其视觉使用新包 HoverCard 故事，兼容入口通过类型检查与薄适配审查；不宣称检查了不存在的旧故事。曲线删除到一个点的首次错误保留在 browser-intermediate-errors.json，修复后新浏览器会话无 warning/error。控制台结论针对组件 iframe，Storybook 管理端上游提示仍按 R07 登记。

证据均在系统 TEMP： [最终完整验证](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b04-20261023/verify-final-accepted.log)、[最终架构与出口审计](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b04-20261023/architecture-audit.json)、[91 个生产故事](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b04-20261023/static-all-stories.json)、[数字层级计算样式](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b04-20261023/static-layers.json)、[320px 确认框](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b04-20261023/static-dialog-narrow.png)、[旧 Select 层级修复](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b04-20261023/legacy-dialog-select-fixed.png)。项目没有新增独立测试、日志、截图或临时验证脚本；临时静态预览 6010 验收后停止，开发服务 6007/6008/6009 保留。

累计完成 27/65 个主迁移项，B05 是下一批。本批只为现有浮层消费者补必要兼容与删除边界；文本/选择、曲线纯模型及其它业务重构仍归原主批次。

## 13 B05 执行记录

启动日期：2026-10-23。前置 B03/B04 已验收并推送；起点 `2da9813`，启动工作树干净。本批认领 U03、U04、U06–U10 与 G02、G03、G11–G14、G20，共 14 项。

实现范围：文本控件与唯一草稿编辑内核；Select/Combobox 分离与稳定 ChoiceOption 身份；Checkbox、SegmentControl、ToggleGroup 保留不同语义；删除七个 FormItem 包装及迁移消费者；新增 PropertyField 文本/布尔/单选绑定，直接接入 B01 Mock。资源和集合只迁改名行为，完整模型仍留 B07/B10。

验收覆盖：中间草稿、Enter/blur 一次提交、Escape 取消、外部更新和过期响应、异步拒绝、键盘/搜索、单/多选、001 字符串与数字值、空值、mixed、disabled/readOnly；格式、全仓类型、Demo 与三套 Storybook 构建、依赖与浏览器验证。临时脚本和证据放系统 TEMP，不新增独立测试文件。

### B05 实际交付与兼容边界

- 新增 Input、Textarea、EditableText、Checkbox、Select、Combobox、SegmentControl、ToggleGroup；公开 Root/Item 仅支持已有稳定组合。Input/Textarea 保留原生事件/ref，新增字符串值回调；useTextEdit 负责唯一草稿、IME、提交/取消、pending 和失败重试。
- Select 单选与 Combobox 搜索/多选分离；ChoiceCollection 将稳定 key 映回原始值，字符串 001、字符串 1、数字 1 与合法空字符串各自独立。Checkbox、radio 分段单选与可取消 ToggleGroup 的语义独立。
- PropertyField 在 property 层绑定 string/boolean/enum，复用真实控件和 B01 EditSession；Mock 仍只在 stories/support。mixed 文本未修改时不提交空串，输入有效变更后可有意清空。数值和多选数组属性不提前扩入 B01 标量模型。
- 七个 G02/G03/G11/G12/G13/G14/G20 包装、出口及专属 stories 删除，全部活跃引用和文档迁移。按钮行使用 PropertyRow + Button。旧 UI 控件入口只适配新实现，B11 删除；旧 SelectProvider 删除。AssetName、Tree、FormItemArray 改名共用内核，异步回调返回 Promise，不吞掉拒绝。
- 原生表单序列化原始值，JS 回调保留类型。SegmentControl options 保留 required 的组校验；低阶 Root/Item 使用 key。新 Select/Combobox 未承诺原生 required 校验；旧 Select required 降为 aria-required，旧非公开 SelectGroup 只透传子项，不保留旧布局内核。自定义函数组件内的 SelectItem 不执行提取；现有消费者没有此用法。详见 [B05 文本、选择与属性绑定](./B05_TEXT_CHOICES.md)。

### B05 中途发现与修复

1. 初次新包类型检查发现 SegmentControl null 边界与 ToggleGroup 回调隐式 any，修复后完整检查通过；文本新路径及 InputNumber 继承的新字符串 onValueChange 冲突在定向类型检查中收敛，数值逻辑未改。
2. PropertyField 同步提交推进 revision 后，本地失效会吞掉 onEditResult；保留已提交请求的回执引用后一次接受只通知一次。mixed 空草稿只有实际输入过才可提交，防止仅聚焦/失焦改写属性。
3. PropertyAccess.change 返回 invalid 时曾被当作成功完成，导致草稿丢失且宿主会话残留。交叉探针保留首次失败，修复后保留草稿/错误，修改重试与 Escape 清理均通过，新增 ChangeValidation 故事。
4. ToggleGroup options 动态过滤时曾丢弃当前未显示的已选值；合并可见项变更时保留未知现值，并通过临时探针复验。
5. 静态异步编辑故事暴露“接受提交后又调用 onCancel”的终结语义错误，可能触发调用方回滚。修复为 pending 保留终结权；本地失效不再发送第二个终结通知。同步/异步 ACK、真正外部更新、同值目标切换、拒绝后取消和 pending Escape/卸载全部复验。
6. 开发预览曾在类型/构建的 Panda codegen 热更新时重置故事，导致一次等待拒绝提示超时；改为无热更新的静态预览验收，并在最终冻结后重验开发入口。浏览器按实际可访问名称重新定位旧粒子选项 two-constant，未把定位失败记为产品异常。

### B05 验证记录与交接

验收完成日期：2026-10-23。最新完整 verify-accepted.log 退出 0，覆盖全仓格式、类型、Demo 与 UI/GUI/interface 三套 Storybook；冻结锁文件安装及 dedupe --check 通过。架构审计检查 102 个生产源文件、202 条依赖边和 7 个 pure 文件，无依赖环、新包反向导入、未声明依赖或纯层 React/DOM 污染。七个退出 FormItem 的生产出口、专属故事和活跃引用均已删除。

本批新增 34 个故事、8 组；静态索引为 interface 125 stories / 34 组 / 3 docs，UI 109 / 40 / 28，GUI 62 / 15 / 1。125 个静态故事交替 light/dark 加载无 error；实际交互覆盖见 V05-04/V05-06。最新文本终结修复后，15 个文本/属性故事再次交替明暗加载通过；AsyncCommit 的实际接受事件只有 request、accepted，没有 cancel。开发入口 Enter 后 Tab 得 authoritative=B05 verified、history=1、result=committed。静态/开发组件控制台 warn/error 均为空；Storybook 管理端的上游提示仍按 R07 登记。

320×640 窄窗口中，字段 viewport 与 scrollWidth 均为 317，无横向溢出；选择弹层 left=117、right=270，选择 One(number) 后输出 number 1、history=1。深色输入样式截图已目视检查。首次按 Number 1 定位没有匹配，按实际可访问名称 One(number) 完成交互，这是验证定位问题，不记作产品缺陷。

临时 ReactDOM/jsdom 探针覆盖文本事件 16 项、旧改名消费者 15 项、终结行为 8 项、布尔/分段/切换选择 16 项、Select/Combobox 15 项、PropertyField 16 项，change invalid 独立复验通过。模拟事件证明本批约定，不代表真实 Qt/C++ 后端、平台 IME 或全部辅助技术已验收；真实键盘、搜索、选择和改名另有浏览器操作。

证据均位于系统 TEMP 的 pivot-blender-refactor-b05-20261023：[完整 verify](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/verify-accepted.log)、[架构与出口审计](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/architecture-audit.json)、[125 个生产故事](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/static-all-stories.json)、[文本终结复验](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/text-terminal-after.log)、[Select/Combobox 探针](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/choice-probe.log)、[属性最终探针](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/property-field-final.log)、[change invalid 首次失败](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/invalid-change-before.log)、[修复复验](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/invalid-change-after.log)。终结错误首次记录保留在 text-terminal-before.log。最终浏览器证据：[15 个文本/属性故事复验](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/static-text-final.json)、[异步接受终结事件](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/static-editable-async-final.txt)、[控制台记录](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/browser-final-logs.json)、[窄字段截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/static-property-narrow.png)、[窄选择截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/static-choice-narrow.png)、[开发属性绑定](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b05-20261023/B05-property-field-verified.png)。项目不加入这些脚本、日志、截图或独立测试文件。临时静态服务 6010 已停止，6007/6008/6009 开发服务保留。已核对新增文件清单，项目未留下临时验证文件；提交后工作树及远程状态由交付结果另行确认。

B05 验收时累计已验证 41/65 个 U/G 主迁移项，B06 在当时尚未开始；数值、颜色、曲线、集合与资源模型保持原主批次边界，真实后端/Qt 接入和旧包最终删除留后续集成及 B11。当前提交与推送状态以第 9 节为准。

## 14 B06 执行记录

启动日期：2026-10-23。前置 B05 已验收并推送；起点 ca7c7ee，工作树干净。本批认领 U05、U11、U12 与 G04–G10，共 10 项。

实现范围：values/numeric 纯规则、interaction/numeric 共享编辑语义、InputNumber 文本/拖动拆分、Slider/DistributionSlider、NumericSlider、NumericTupleInput 与 Vector2/3/4Input、RectInput；数值 PropertyField 直接连接 B01 Mock。对应七个 GUI 包装及消费者迁移，旧 UI 只留薄适配。比例联动独立建模，Rect 保留位置/尺寸语义。

验收场景：中间负号/小数、IME、点击/拖动区分、实时预览、软/硬范围、step/dragStep/细调、一次手势一次事务、取消/丢失捕获/失焦/卸载、拒绝/外部更新/目标切换、固定受控值、多 thumb、分段总量/零值、零轴比例和 Reset。临时探针与证据放系统 TEMP 的 pivot-blender-refactor-b06-20261023；不新增独立测试文件，不开展真实 C++/Qt 或业务页面。

### B06 实际实现与迁移闭包

本批公开 9 个控件/模板：InputNumber、Slider、DistributionSlider、NumericSlider、NumericTupleInput、Vector2Input、Vector3Input、Vector4Input、RectInput。接口与使用约定见 [B06 数值与几何指南](./B06_NUMERIC.md)。InputNumber 的文本草稿、pointer 拖动和数值规则分别落在 widgets/inputs、interaction/numeric 和 values/numeric；旧 UI InputNumber/Slider/CascadeSlider 只转发新内核，兼容转换集中在旧入口。对应七个 GUI FormItem 的实现、公开 Props 和专属故事删除，Group/Array、颜色及粒子等现存数值消费者已接入新控件，完整领域重构仍归 B07–B10。

数值编辑区分实时 onValueChange、一次 onValueCommit 和未提交的 onEditCancel。受控取消不伪造回滚 change，宿主拥有权威值；非受控恢复会话起点。pending 后的界面失效不撤回已提交的宿主命令，也不再次通知取消。InputNumber 和模板可通过 reset、目标身份或 Escape 清理本地结果；独立 Slider 的 pending Escape 保持 pending，不发送第二次终结。PropertyField 的 number 默认 InputNumber，可选 NumericSlider；沿用 B01 Mock 的版本、preview 与事务边界，没有真实后端依赖。

DistributionSlider 的公开值是段长，内部一次转换到累计边界；保留总量、零段、最小段长与边缘间距。Geometry 保留向量对象及 Rect 的 x/y/width/height，Rect 位置与尺寸约束独立。linked/onLinkedChange 由外部控制；比例始终从本次编辑起点计算，零主轴仅更新自身，共同可达比例由所有轴硬范围求交，派生轴不重复量化。

### B06 发现的问题与修复

1. NumericSlider 的滑块异步拒绝曾保留组合 owner，阻止下一次手势；改为滑块拒绝释放 owner，文本拒绝保留草稿以 Enter 重试。两条入口都有拒绝/重试临时验证。
2. 软范围外的合法数值在仅按下并松开边界 thumb 时，可能被裁到视觉范围。组合记录是否实际产生请求，无移动时提交原始值，避免仅聚焦就写入截断值。
3. 多 thumb 的受控初值不满足最小间距时，lower > upper 曾生成 [-10,0] 越出硬范围；忽略不可达请求，保留权威值，并允许其它合法 thumb 修复间距。跨序键盘操作同步焦点到正在编辑的值。
4. 原生 form reset 曾忽略 React onReset.preventDefault，InputNumber 与组合非受控值还缺少默认值恢复。现通过所属 form、微任务及 defaultPrevented/连接身份检查处理；外部 authority/resetKey 改变淘汰排队的旧 reset。模板只恢复一次完整标量/元组，通过子编辑身份清理草稿，active 只取消一次、pending 不二次终结；Vector2/3/4 与 Rect 共用该路径。
5. NumericSlider 的 pending Escape 曾只释放组合 owner，旧滑块拒绝可能在新输入完成后显示。现在同步失效子编辑身份；旧结果不污染新通道，宿主的已提交命令和终结次数不变。

6. 静态拒绝场景出现数值控件本地错误与 PropertyDescription 同时声明 alert，造成重复播报。PropertyField 现通过 aria-errormessage 声明外部错误归属；InputNumber/Slider 保留 invalid 状态并抑制重复本地 alert/ID，NumericSlider 同时传给副控件，独立使用仍显示本地错误。InputNumber 新增 4 项、Slider 新增 2 项归属探针通过且 console=0；最终生产预览实际确认 host 拒绝只有 1 个 alert，aria-errormessage 指向该节点，组合滑块重试也通过。

7. 根临时属性探针 property-number-first.log 前 20 项通过后，因为 JSDOM setup 缺少 HTMLFormElement 全局而触发 Radix form 错误。补齐验证环境后 property-number-after-setup.log 的 24 项通过，最终 property-number-final.log 再次 24 项通过；这是测试环境缺项，不记作产品缺陷或生产修复。

以上失败的触发和实际结果保留在本节；临时交叉探针日志记录修复后的复验，不把后来的通过写成从未发现问题。验证中的模拟 DOM 不代替真实浏览器、平台 IME、辅助技术或 C++/Qt 集成。

### B06 验证与交接

验收完成日期：2026-10-23。最终完整 verify-final.log 退出 0，覆盖格式、全仓生产/stories/support/tooling/pure 类型、Demo 与三套 Storybook，warning/error=0；此前 verify-first.log 的通过记录仍保留。冻结锁文件安装及 dedupe --check 退出 0，锁文件未变。架构审计覆盖 118 个生产源文件、254 条依赖边及 11 个纯层文件，没有依赖环、新包反向导入旧包、未声明依赖、纯层 React/DOM 污染或独立测试文件。

新增 33 个故事分布于 6 组（含扩展既有 PropertyField 组）；统一包总计 158 stories / 39 组 / 5 docs，旧 UI 109 / 40 / 28，GUI 37 / 8 / 1。10 个主迁移项已实现并通过完整验收，当时累计 51/65；B06 已验收，B07–B11 在当时未开始。当前状态见第 2、9、15 节。

临时验证分别为 InputNumber 25 项、InputNumber 原生 reset 15 项、数值错误归属 4 项、Slider/Distribution 28 项（原 26 项及错误归属 2 项）、模板 24 项、模板 reset/迟到结果 15 项、number PropertyField 24 项、B05 text PropertyField 回归 16 项；相同脚本的复跑不重复计作覆盖。模板 reset 15 项在 InputNumber 最后实现落盘后重新 bundle 运行通过；受控取消、拒绝、外部版本、零轴、联动范围和原生表单均有对应断言。

开发浏览器实际完成数值拖动 2→7 且 history=1、中间负号/小数、Enter 紧随 blur；Distribution Home/End 得 [10,80,10]、受控拒绝、多 thumb 换序焦点跟随；Vector 联动 [4,8,-12]、零主轴 [3,4,6]、Rect width 的负值钳到 0 且位置不变。320px 窄窗口无横向溢出，NumericSlider 拒绝后第二次接受。旧 GUI Group scale=2.5、Array weight=0.6、HDR 2→1.9、Color R=220 的消费者操作通过，开发 console 为空。

静态 6010 第一轮已完成本批 33 个故事加载；实测延迟拒绝时 draft=6、authority=2、history=0，Enter 重试后接受 6、history=1；pending 提交 cube=5 后切到 sphere=8，完成时 cube=5/history=1、sphere=8/history=0。该轮发现并修复重复 alert（见上文第 6 项），随后在最终 verify 生成的生产预览上再次验收。

最终 static-all-stories-final.json 记录本批 33/33 故事交替 light/dark 加载，无 error；browser-final-logs.json 为空数组。最终拒绝场景 draft=6、authority=2、history=0，仅 1 个 alert，aria-errormessage 指向同一节点。NumericSlider 拒绝后再次 ArrowRight 接受 3、history=1，拒绝时也只有 1 个 alert。实际指针拖动由 2 到 7，只有一条 history；320px 窄窗口 document.clientWidth 与 scrollWidth 均为 317，无横向溢出。已有静态拒绝重试和 pending 对象切换记录均通过。

项目扫描未发现临时脚本、日志、截图或独立测试文件。临时静态服务 6010 已停止，开发示例保留；暂存范围和 Git 提交/推送状态由收尾时的实际回执核对，不提前声明已经推送。

证据位于系统 TEMP 的 pivot-blender-refactor-b06-20261023：[最终完整 verify](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/verify-final.log)、[冻结安装](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/frozen-install.log)、[依赖去重](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/dedupe.log)、[架构审计](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/architecture-audit.json)、[InputNumber 最终回归](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/number-events-after-reset.log)、[InputNumber reset](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/number-reset.log)、[Slider/Distribution](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/slider-probe.log)、[模板回归](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/numeric-template-probe.log)、[模板 reset 与迟到结果](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/numeric-slider-reset-probe.log)、[数值 PropertyField](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/property-number-final.log)、[文本绑定回归](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/property-text-regression.log)、[开发控制台](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/browser-dev-logs.json)、[Rect 窄窗口截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/dev-rect-narrow.png)。最终浏览器证据：[本批 33 个生产故事](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/static-all-stories-final.json)、[最终控制台](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/browser-final-logs.json)、[错误归属记录](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/static-error-owner.txt)、[错误归属截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/static-error-owner.png)、[组合滑块拒绝重试](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/static-slider-retry.txt)、[真实指针拖动](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/static-drag.txt)、[数值验收截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/B06-numeric-verified.png)、[窄窗口截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/static-numeric-narrow.png)。验证环境首次失败：[property-number-first.log](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/property-number-first.log)，补齐后：[property-number-after-setup.log](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b06-20261023/property-number-after-setup.log)。这些脚本、日志、截图不进入项目交付。

## 15 B07 执行记录

启动日期：2026-10-23。前置 B03/B04/B05 与 B06 均已验收并推送；本地/远程起点 0bab111d28b39495f3f596cc35bd10dc509c63d8，工作树干净。本批认领 U33–U36、G22 共 5 项及 S06 共享拖放。

范围：稳定 collection key 与树集合/selection/expansion/focus；TreeRoot 组件族与拖放适配；Table 结构和 DataTable 泛型组合；Breadcrumbs、Pagination 纯算法与导航；CollectionTemplate 增删改名/重排；有类型、不可直接突变的拖放状态与显式 Provider。旧 UI 只留薄适配，GUI FormItemArray 实现/出口/故事退出，必要 Tree/Array/Asset 消费者迁移。领域资源模型仍留 B10。

必验：稳定键（含数值/字符串身份）、增删重排后的焦点与选择、独立展开、空态、拒绝/异步改名、拖放取消/源卸载/目标禁用、可独立聚焦的行操作、页码越界/零结果、明暗主题及窄宽度。临时脚本和证据放系统 TEMP 的 pivot-blender-refactor-b07-20261023，不新增独立测试文件，不实现业务页面或真实 C++/Qt 接入。

### B07 实际交付

新纯模型为 values/collection、tree、pagination、drag-drop；TreeRoot 将 selection/expansion/focus 分开，TreeItemContent 复用 B05 改名行为。Table 拆原生结构部件和泛型 DataTable，Breadcrumbs 使用 nav/ol/li，Pagination 拆纯算法。CollectionTemplate 接收纯 items/getKey/getLabel/renderItem，增删改名与重排交给父级；取代旧 FormItemArray。

DragDropProvider 仅拥有局部拖放会话；useDragSource/useDropTarget/useDragDropState/useDragDropCancel 不公开可变 context。原生 DataTransfer 只传不透明标记，外部文件另经 onFilesDrop；Tree 和 Collection 使用同一实现，AssetPicker 的旧 numeric layer hooks 仅做映射。旧 Tree 的领域状态不进入通用控件，低层消费者改为新 collection/itemKey 组合。资源领域模型仍由 B10 负责。公共接口、键盘约定与迁移说明见 [B07 集合指南](./B07_COLLECTIONS.md)。

### B07 发现与修复

1. drop 回调同步重排/卸载源会先触发源清理，导致成功误记取消；现先占有终结操作再调用宿主，成功只发一次 dropped。替换旧拖动的 onEnd 可 reset/禁用/卸载新源，begin 重新核对 epoch 和 source 身份，避免旧完成回调后复活新会话。首次失败与最终20组复验均在 TEMP 保留。
2. 图标按钮拖动有两个边界：源按钮内 SVG 不应被当成子行操作；按钮 all:unset 还会覆盖浏览器 draggable 对应样式。先修 interactive guard，浏览器复验发现后者，再显式维护 -webkit-user-drag 并恢复原样式。实际 Collection number:1 从0移到2；jsdom仅验证样式写入/还原契约，不冒充浏览器拖放。
3. 异步新增不返回 key 时，父级 items 可能尚未渲染，导致漏交接焦点；新增与删除的接受后整理移到 layout effect。返回 key/void、异步删除、多选、拒绝/过期结果均有最终探针。
4. Tree 受控 focusedKey 改变原先只改tabIndex，不同步正在树行上的DOM焦点；现在仅树行持焦点时跟随，不抢改名/行操作/树外焦点。首次 Shift+方向键以当前焦点作为范围锚点，非法受控keys纠正请求去重。
5. 删除 DataTable 聚焦行后跳过没有可用控件的行，优先后继再前驱；保留数字/字符串key差异。AssetPicker 的路径片段可重名，Breadcrumb ID改为累计路径。
6. 全仓类型暴露 consumer 的 ES lib 不支持 Array.at，Tree End 导航改为下标访问。Panda曾将新旧Table故事的columns元数据解释为CSS，改为useMemo数据边界；没有屏蔽告警或改Panda提取配置。失败的verify-first.log、含告警的verify-build-warning.log及定向CSS零告警复验保留。
7. 320px浏览器发现Tree故事默认centered布局把root撑到432px；该组ContractFrame切换fullscreen，内容加载后clientWidth/scrollWidth均317。组件API不变，最终静态再复验。

8. 收尾复查发现旧 BreadcrumbItem 的 onClick 仍会在 current/disabled 状态冒泡触发；适配层同步屏蔽导航与点击。临时验证复现后，正常项键盘等价激活只回调一次、当前项与禁用项均不回调，共3组通过。

### B07 验证与交付范围

主迁移5项已验证，累计56/65；新增26个故事/6组。统一包184 stories/45组/6 docs，旧UI109/40/26，GUI34/7/1。架构审计无发现；全量verify、冻结安装、dedupe通过。90组临时探针按Tree28、集合25、导航表格14、拖放20、旧面包屑适配3分别记录；重跑不重复计数，分页组合168在14组内。

生产浏览器实测：集合拒绝Base revised保持旧authority，Enter重试接受一次，删除后焦点到Detail、新增后聚焦并选择Layer4；表格数字1草稿Metal draft在反序后保留，删除Glass后聚焦Delete Metal；分页25缩至3页仅显示钳制，父page保持25，零结果无页码；Breadcrumb键盘返回Materials。Tree Notes拖入Archive后仍按notes身份选中、状态回idle且单次dropped；F2改名拒绝保稿，允许后Enter重试并回到行焦点。Provider隔离的放下仅outside，拒绝目标仅rejected，同步卸载源的接受只有received/dropped。旧AssetPicker拖动brick_normal选中且路径弹层正常，旧Table Open 2的Enter显示Kevin。

最终浏览器26个故事交替light/dark加载；窄窗口集合/分页 clientWidth=scrollWidth=320，Tree/表格=317。生产预览6010的浏览器warning/error为空；开发6009热更新期间记录过一次Tree故事动态模块拉取失败（browser-dev-logs.json），最终生产26/26加载与交互未复现，不把开发诊断删除或混入生产零消息结论。浏览器验证和模拟DOM不替代真实Qt嵌入、系统文件拖入或平台辅助技术验收。只增加库组件、故事与文档；未增加业务页面、真实宿主桥接或独立测试文件。

证据目录为系统 TEMP `pivot-blender-refactor-b07-20261023`：

- [最终完整验证](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/verify-final.log)、[架构审计](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/architecture-audit.json)、[冻结安装](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/frozen-install.log)、[依赖去重](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/dedupe.log)。
- [Tree 28组](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/tree-probe.log)、[Collection 25组](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/collection-final.log)、[导航/表格14组](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/navigation-table-probe.log)、[拖放20组](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/drag-hook-audit.log)、[旧面包屑3组](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/breadcrumb-adapter-after.log)。
- [生产故事加载](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/static-all-stories-final.json)、[浏览器控制台](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/browser-final-logs.json)、[窄窗口数据](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/static-narrow-final.json)、[Tree拖放](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/static-tree-drag.txt)、[集合拒绝重试](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/static-collection-retry.txt)、[拖放终结](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b07-20261023/static-drag-terminal.txt)。

代码/文档验收后正常运行提交、推送钩子；实际Git SHA、远程核对和clean状态以git-delivery.json为准，不提前声明已经推送。B08–B11未开始。

## 16 B08 执行记录

启动日期：2026-10-23。前置 B04/B06 已验收并推送；起点为 B07 的 3ec1d1d442fd600bc67c544cb3815905e371369f，本地/远程一致，工作树干净。本批认领 U38、U39、G15、G16 共 4 项及 S04。

范围：明确 normalized RGB、alpha、sRGB/Linear 与 HDR 颜色值，ColorWidget → ColorPicker → ColorInput 单向组合；稳定 stop ID 的 ColorRamp、RGB/alpha 双轨、HDR 编辑及判别联合 ColorDistributionTemplate。旧 UI 入口仅做形状适配；删除 GUI FormItemColor/FormItemGradient 和专属故事。引擎 time/position 与范围转换放宿主/示例适配层，宿主取色和剪贴板能力显式注入。

必验：颜色往返、编码转换、HDR/alpha、重合停靠点、双轨与独立选择、键盘/拖动/取消、受控拒绝、内联与弹出一致、能力缺失/过期结果、模式缓存与 Reset；格式、全仓类型、Demo/三套 Storybook 构建及浏览器明暗/窄屏实际验证。临时脚本与证据放系统 TEMP 的 pivot-blender-refactor-b08-20261023，不新增独立测试文件、不实现业务页面或真实 Qt/C++ 桥。

### B08 实际交付

8个公共组件/模板为 ColorWidget、ColorPicker、ColorInput、HDRColorInput、ColorRamp、ColorRampChannels、ColorRampPicker、ColorDistributionTemplate。模型与使用约定见 [B08颜色指南](./B08_COLOR.md)。颜色、渐变与分布纯值层不依赖React/DOM；ColorInput组合Picker/Widget，ColorRamp只单向复用单色Picker。RGB编码和alpha/HDR范围显式声明，转换发生在命名边界；选中停靠点、显示编码及缓存与当前属性值分开。

保留SV图形拖动、Hue滑条、RGB/HSV/HEX精确输入；Peak RGB从实际RGB派生，纯黑提高峰值从中性灰开始。渐变支持重合点稳定ID、独立alpha轨、键盘/指针/精确位置、空轨增删；分布使用四分支判别联合。clipboard/eyeDropper通过可选能力注入，浏览器适配由应用拥有并释放。引擎time/position、存储编码映射仅在示例宿主适配，不进入模板。

FormItemColor/FormItemGradient的实现、出口与专属故事实际删除。旧UI ColorPicker/GradientSlider/ParticleSlider/HDRSlider只转换旧DTO并调用新实现，内部面板、Range/Thumb、透明图案和浏览器取色hook删除；colord/react-colorful无消费者后退出依赖。复杂颜色PropertyField绑定仍留B11，不扩展本批业务页面或真实C++/Qt连接。

### B08 发现与修复

1. 组合回调曾捕获过期owner，取消未传到宿主；改为稳定共享cancel。父pending被下传为当前子编辑器readOnly时会清掉数字草稿；改为只锁兄弟owner，当前子编辑器自己管理pending。
2. 拒绝后重试相同值曾被共享内核去重，宿主收不到第二次预览。现比较回滚后的权威值并重新发出请求。pending外部更新采用resetToken失效子编辑，迟到错误不污染新值；已提交命令不收到第二个cancel。
3. 第一轮完整构建虽然通过，实际浏览器延迟HEX拒绝仍清掉草稿。真实timer探针复现：宿主rollback与Promise拒绝被React合并渲染，依赖瞬时pending判断产生external-update。改为按本次提交身份识别初始值回滚，保留草稿和单条错误；第二次Enter重试成功。首次浏览器/临时失败记录均保留。
4. 能力提交拒绝曾留下无出口的owner；现在Pick/Paste可重试并提供明确Cancel。HDR SV指示点曾因逐帧重算最大值一直贴顶；改为稳定视图范围，数据及拖动位置同步。
5. 旧HDR零强度恢复曾将sRGB峰值直接当线性倍率，输入1回显0.50196；移除特殊换算并统一黑→灰规则，最终输入/回显均1。旧渐变/双轨Picker补传注入能力，嵌套Copy/Paste/Pick验证通过。
6. 320×640实际浏览器中嵌套单色弹层top=-184，标题/SV越界。两层Picker按Radix可用空间与视口限制宽高、默认12px碰撞边距和可滚动内容。最终单色弹层top=12，所有输入滚动可达，Escape分别回到Color picker和Edit particle ramp。
7. 首次offline冻结安装因本机缺少node-releases供应链元数据失败；联网冻结安装完成477项检查后，再次offline frozen与dedupe通过。未绕过供应链检查、未升级依赖，仅删本批退出的两个包。首次日志保留。

### B08 验证与交接

验收日期2026-10-23。最终完整verify-final.log退出0，格式、全仓类型、Demo、UI/GUI/interface Storybook通过，日志warning/error匹配0；verify-first.log也保留。最终架构覆盖155个生产文件、403条依赖边和19个纯层文件，未发现依赖环、新→旧导入、未声明依赖、纯层污染或独立测试文件。

新增28个故事/4组；生产索引interface为212 stories/49组/6 docs，UI109/40/26，GUI24/5/1。临时验证：单色43项、渐变21项、分布DOM17项/纯值9项、宿主DTO9项、旧DTO与浏览器能力13项；另有共享拒绝重试、旧HDR峰值和两个旧入口嵌套能力定向验证。复跑不重复计作覆盖，模拟DOM不等于真实Qt/平台屏幕取色验收。

生产28/28故事交替light/dark加载。实际浏览器验证SV实时多次preview后一次pointer-up、Hue键盘、显示编码只改UI、HEX Enter+blur一次提交；最终异步拒绝草稿#00FF00保留且只有一个alert，Enter后重新preview并accepted，无重复cancel；能力Paste拒绝也可再次接受。分布嵌套HEX拒绝保留#12AB34并重试成功。重合green选择仅select事件，键盘和真实拖动保持ID，Delete后焦点回blue。双轨alpha改0.4不改色轨，HDR红通道2.2回写保留。模式往返恢复第二个绿色，Reset清空缓存；引擎red的position0.3只对应time0.3，独立alpha0.25对应同一稳定ID。

最终四组320px布局clientWidth与scrollWidth均317。嵌套弹层左右12/308，外层top199/bottom627.8、内层top12/bottom393.7；内容可以滚动，HEX编辑后逐层Escape和焦点恢复通过。旧UI开发入口HDR经0→1得到回显1，渐变R=0.5在旧DTO中为127.5且带稳定ID。组件控制台结果按browser-final-logs.json保留，Storybook管理端既有提示仍按R07区分。

临时脚本、日志、截图全部放系统TEMP的pivot-blender-refactor-b08-20261023，不新增独立测试。验收后停止临时6010，保留6007/6008/6009开发服务；最终Git依正常hooks提交推送并另存回执。U38/U39/G15/G16及S04完成，累计60/65，B09–B11未开始。

证据：[最终verify](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/verify-final.log)、[架构审计](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/architecture-audit.json)、[单色43项](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/color-timing-after.log)、[渐变21项](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/ramp-after-hex-timing.log)、[分布17项](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/distribution-after-hex-timing.log)、[28个生产故事](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/static-all-stories-final.json)、[最终拒绝重试](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/static-hex-retry-final.txt)、[最终窄屏截图](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/static-nested-narrow-final.png)。首次证据：[HEX浏览器失败](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/browser-hex-reject-before.txt)、[真实timer复现](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/color-timing-before.log)、[窄屏越界](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/static-nested-narrow-dark.png)、[旧HDR换算失败](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/legacy-hdr-cross-before.log)、[离线元数据缺失](C:/Users/74053/AppData/Local/Temp/pivot-blender-refactor-b08-20261023/frozen-install-offline-first.log)。
