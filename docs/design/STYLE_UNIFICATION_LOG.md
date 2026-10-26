# Pivot UI 视觉统一执行记录

> 配套文档：[STYLE_UNIFICATION.md](./STYLE_UNIFICATION.md)  
> 用途：记录每个 Phase 的完成状态、无法当场解决的问题、以及必须留到后续 Phase 的改动。  
> 规则：遇到跨阶段问题先登记，不为了“当场干净”提前改后面的组件；到目标 Phase 再一并处理。

## 阶段状态

| Phase                             | 状态   | 开始       | 完成       | 备注                                  |
| --------------------------------- | ------ | ---------- | ---------- | ------------------------------------- |
| 0 计划与决策                      | 已完成 | 2026-10-26 | 2026-10-26 | 用户确认两档与 4 个默认项             |
| 1 Tokens / Foundation / Story Kit | 已完成 | 2026-10-26 | 2026-10-26 | 12 个 story 已迁移，验收全绿          |
| 2 核心表单控件                    | 已完成 | 2026-10-26 | 2026-10-26 | 10 个 story 迁移，Control matrix 新增 |
| 3 Layout 与面板                   | 已完成 | 2026-10-26 | 2026-10-26 | 7 个 story 迁移，验收全绿             |
| 4 Overlays                        | 已完成 | 2026-10-26 | 2026-10-26 | 6 个 story 迁移，验收全绿             |
| 5 Collections 与 Navigation       | 已完成 | 2026-10-26 | 2026-10-26 | 7 个 story 迁移，验收全绿             |
| 6 Templates                       | 未开始 | —          | —          | —                                     |
| 7 Property                        | 未开始 | —          | —          | —                                     |
| 8 Storybook 收尾与审计            | 未开始 | —          | —          | —                                     |

## 跨阶段待解决项

| ID  | 发现于   | 目标 Phase | 问题                                                                                                                                   | 处理方式                                                                     | 状态   |
| --- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| D01 | Phase 1a | —          | `ActionButton` 仍使用 `var(--shadows-prepend)`（值为透明阴影），且去掉后无视觉影响                                                     | Phase 2 已删除该引用                                                         | 已解决 |
| D02 | Phase 1a | —          | `Button variant="solid"` 仍使用 `primary`（blue9）配白字，对比度不足                                                                   | Phase 2 改用 `primarySolid`；critical/positive solid 使用加深的 status solid | 已解决 |
| D03 | Phase 1a | —          | 保留 `overlayFadeIn`/`contentShow` keyframes，但 Dialog/Popover 还没有接线                                                             | Phase 4 在 Overlay/Dialog 样式中接入进入动画                                 | 已解决 |
| D04 | Phase 1a | —          | `surfaceOverlay/surfaceRaised` 已抬到 gray3/white，但 Menu/Popover/Dialog 的 padding、圆角、shadow 仍是旧值                            | Phase 4 统一 overlay surface 的 padding/radius/shadow                        | 已解决 |
| D05 | Phase 1a | —          | Section/Collapsible 仍是 27/30px 头部和 3px trigger 圆角                                                                               | Phase 3 统一到 24/32 与 4/6                                                  | 已解决 |
| D06 | Phase 1a | —          | Menu 仍是 3px item 圆角、13px md 字号、10px xs 字号                                                                                    | Phase 4 统一到 4/6、12/14                                                    | 已解决 |
| D07 | Phase 1a | Phase 5    | Tree 仍是 28px 行高、实心 primary 选中                                                                                                 | Phase 5 统一到 24/32，并用 `selectionBg/selectionText`                       | 待处理 |
| D08 | Phase 1a | —          | Input md slot 仍是 13px，InputNumber stepper 仍是 18px/2px 圆角                                                                        | Phase 2 已改为 14px、16/20、4px                                              | 已解决 |
| D09 | Phase 1a | Phase 6    | ColorWidget/RampControls/ColorRampChannels/CurveWidget/CurvePresets/ResourcePicker 仍使用 9 处原生 `<select>`                          | Phase 6 替换为 `Select`/`Combobox`                                           | 待处理 |
| D10 | Phase 1a | Phase 8    | 旧 token（`tooltipBg`、`tooltipColor`、`toastBg`、`sidebar*`、`focusRingMuted`、`shadows.prepend`）先保留，避免 Phase 1 破坏未迁移组件 | Phase 8 无引用后删除                                                         | 待处理 |
| D11 | Phase 1a | —          | `overlayFadeOut` 已删除，若后面需要退场动画，需在 Phase 4 重新引入并接 Radix forceMount                                                | Phase 4 评估：不引入退场动画，依赖 Radix unmount；保留现状                   | 已接受 |
| D12 | Phase 1a | —          | Checkbox 仍是 14/18/22 三档元素尺寸；Kbd 已先改为 16/18/20                                                                             | Phase 2 已用 `sizes.iconSm/iconLg/5_5` token 化                              | 已解决 |
| D13 | Phase 1c | —          | `!autodocs` 已在 SB10 验证：`foundation-theme--shared-providers` 与 `storage-and-cleanup` 的 index tags 不再包含 autodocs              | 已确认可用；后续 Phase 沿用该方式                                            | 已解决 |
| D14 | Phase 1c | Phase 6–7  | 43 个 `ContractFrame` story 中，Phase 1–5 共迁移 30 个；当前实际剩 13 个按组件 Phase 迁移                                              | 各 Phase 跟随组件修改                                                        | 进行中 |
| D15 | Phase 1b | —          | Badge 的 `solid` 改为 filled tint（`*Bg + *Text`），surface 加 `*Border`，active 用 `primarySolid + 白字`；状态文字改用 12 阶          | 已按语义 token 迁移；orange/gold/violet 保留 categorical A 色，Phase 8 复核  | 已解决 |
| D16 | Phase 1a | —          | Radix 亮色 blue8 只有 2.33:1，无法承载白字                                                                                             | 暗色 `primarySolid = blue8`，亮色 `primarySolid = blue11`，对比 5.07 / 4.77  | 已解决 |
| D17 | Phase 1a | —          | `generate-tokens.mjs` 使用 `/tmp`，Windows 下生成到仓库 `tmp/` 且 file URL 失败                                                        | 改为 `node_modules/.cache` + `pathToFileURL`；`.gitignore` 增加 `tmp/`       | 已解决 |
| D18 | Phase 1a | —          | 状态文字用 11 阶时低于 4.5:1                                                                                                           | `info/success/warning/danger Text` 改用 12 阶；实测 10.47–12.98:1            | 已解决 |
| D19 | Phase 1b | —          | Kbd 原为 14/18/22 + 10/12 字；与两档控件不一致                                                                                         | 改为 16/18/20、11/11/12 字；保留 3 档 inline 尺寸并在 Tokens 页说明          | 已接受 |
| D20 | Phase 1c | —          | 旧 story 依赖 `ContractFrame` / 原生控件 / 34px 控件                                                                                   | 新增 `StoryPage` 套件；12 个 Foundation/Display/Feedback story 已迁移        | 已解决 |
| D21 | Phase 1c | —          | `Foundation/Tokens` 的 density 示例使用当前 Button/Input/Select，视觉仍是 Phase 2 之前的尺寸                                           | Phase 2 后自动反映新尺寸，已在 Control matrix 复核                           | 已解决 |
| D22 | Phase 1a | Phase 3–6  | `appBg` 已改为 gray1、`surfaceRaised` 已抬层级；未迁移组件仍使用旧的 padding/radius/字体，预览会有过渡态                               | 按 Phase 3–6 正常推进                                                        | 已知   |
| D23 | Phase 2a | Phase 8    | `warningSolid`（amber9）配白字仅 1.8:1；当前 Button 的 critical/positive 只用 danger/success，warning solid 未使用                     | Phase 8 若引入 warning solid，改用深色文字或专用 dark amber solid            | 待处理 |
| D24 | Phase 2a | —          | `ActionButtonGroup` 新增 additive `size` prop；默认 sm，现有调用不受影响                                                               | 已记录为新 API                                                               | 已解决 |
| D25 | Phase 2e | —          | Buttons 与 Control matrix 已迁移；TextInputs/InputNumber/Checkbox/Select/Combobox/Segment/Toggle/Slider/Distribution 的 story 已重写   | 已全部通过 typecheck 与 build                                                | 已解决 |
| D26 | Phase 2c | —          | SegmentControl/ToggleGroup 没有 xs/20 档，档位是 24/32/36；Slider 没有 lg/36；DistributionSlider 类型上无 compact                      | 已在 stories 中按真实 API 说明，不新增无依据的档位                           | 已记录 |
| D27 | Phase 2b | Phase 8    | InputNumber 没有暴露内部 phase/draft/error，story 的 StoryState 只能记录宿主可见的 value/mixed/events                                  | 保持 API 不变；Phase 8 再决定是否增加只读状态接口                            | 待处理 |
| D28 | Phase 3  | Phase 7    | `PropertyRow` 已支持 density，但 `PropertyField` 内置控件仍按默认 size 渲染，未随 density 变成 sm/md                                   | Phase 7 在 PropertyField 内透传 size                                         | 待处理 |
| D29 | Phase 3  | —          | `ResizableSplit` 的 handle 保持 6px 命中区，而不是计划里的 4px                                                                         | 保留 6px 以兼顾可点击性；视觉/命中区一致                                     | 已接受 |
| D30 | Phase 4  | —          | Overlay surface 基础字号 14；Tooltip 局部 12，Popover padding 12、HoverCard 8                                                          | 按信息密度保留局部差异，radius/shadow/surface 已统一                         | 已接受 |
| D31 | Phase 4  | —          | Dialog 关闭按钮默认 24；新增 `closeSize` 可切到 32                                                                                     | 默认紧凑，常规/触控场景可显式切 32                                           | 已解决 |
| D32 | Phase 5  | —          | `Table` 默认 regular 32；旧 `compact` 保留并映射到 compact 24                                                                          | 保持现有调用不突变，新代码用 `density`                                       | 已接受 |
| D33 | Phase 5  | —          | `AssetItem` 新增 `density`，AssetName/meta 跟随 12/14 与 11/12                                                                         | 已实现                                                                       | 已解决 |
| D34 | Phase 5  | —          | `space` 增加 `2_5=10px`，用于 Tooltip/Toast 的 6×10 padding                                                                            | 已生成 token                                                                 | 已解决 |
| D35 | Phase 5  | —          | `AssetItem` 的 density 控制 12/14 文字和列表名称密度，不是固定的 24/32 行高                                                            | 已在 story 中按真实 API 标注为 12/14                                         | 已接受 |
| D36 | Phase 5  | Phase 8    | `TreeDragPreview` 是独立预览组件，TreeRoot 的拖拽仍使用浏览器默认 drag image                                                           | 保持现有 API；Phase 8 评估是否接入                                           | 待处理 |

## Phase 1 执行明细

### 1a Token / Surface / Global

- [x] `panda/token-source/sizes.ts`：新增 micro/control 字阶、语义圆角、overlay/modal shadow。
- [x] `panda/token-source/colors.ts`：暗色 appBg/raised、亮色 raised、`primarySolid`、`selectionSubtle*`、`textMuted` 对比度。
- [x] `panda/global.ts`：body 背景改用 `appBg`。
- [x] `panda/base.ts`：删除 8 个未使用 keyframes，保留 `overlayFadeIn`/`contentShow`。
- [x] 重新生成 `panda/designTokens.ts`。
- [x] 用一次性对比度脚本检查 `textMuted`、`primarySolid`、状态色。
- [x] `panda/README.md` 更新。

### 1b Foundation / Display / Feedback

- [x] `foundation/typography/index.tsx`
- [x] `widgets/display/Kbd.tsx`
- [x] `widgets/display/Badge.tsx` + `badge.styles.ts`
- [x] `widgets/feedback/Callout.tsx`
- [x] `widgets/feedback/Progress.tsx` + `Spin.tsx`
- [x] `widgets/display/ScrollArea.tsx` / `Separator.tsx` / `ReadonlyValue.tsx` / `ImagePreview.tsx`

### 1c Story Kit + Stories

- [x] 新增 `stories/support/StoryPage.tsx`。
- [x] 迁移 Foundation/Display/Feedback 12 个 story。
- [x] 重写 `Foundation/Tokens` 为规范页。
- [x] 验证 `!autodocs` 行为。

### 验收

- [x] `pnpm verify`（prettier + typecheck + demo build + storybook build）
- [x] 更新本文件与计划文档的 Phase 1 复选框

## Phase 1 结果

Phase 1 已完成。`pnpm verify` 全绿；12 个迁移 story 用 headless Chrome 做了 DOM smoke test，均能渲染。

**已完成**

- 两档高度、语义字阶、语义圆角、overlay/modal shadow 已进入 `panda/token-source` 并重新生成。
- 暗色 `appBg` 回到 gray1，浮层抬到 gray3；亮色浮层使用 white；`body` 背景改用 `appBg`。
- `textMuted` 对比度：暗色 5.49:1，亮色 4.86:1。
- `primarySolid`：暗色 5.07:1，亮色 4.77:1；状态文字 10.47–12.98:1。
- Typography/Kbd/Badge/Callout/Progress/Spin/ScrollArea/ReadonlyValue/ImagePreview 已按新 token 调整。
- 新增 `StoryPage` 套件；12 个 Foundation/Display/Feedback story 全部迁移，不再使用 `ContractFrame` 或原生演示控件。
- `Foundation/Tokens` 重写为两档、颜色、字阶、圆角、间距、elevation 的规范页。
- `!autodocs` 已验证可用：Theme 的两个行为 story 不进入 docs 页。

**偏差 / 记录**

- 亮色 `blue8` 对比度不足，因此 `primarySolid` 改为按主题取值（暗 blue8 / 亮 blue11），见 D16。
- Badge 的 `solid` 语义按现有组件定义为 filled tint，而不是饱和实心；见 D15。
- Kbd 保留 16/18/20 三档 inline 尺寸，而不是严格两档；见 D19。
- `Foundation/Tokens` 的 density 示例在 Phase 2 前仍显示旧 Button/Input/Select 尺寸；Phase 2 后自然更新，见 D21。

## Phase 2 前置

Phase 2 开始前先处理/确认：

- D01 `ActionButton` 的 `shadows.prepend`。
- D02 Button solid 改 `primarySolid`，并复核 critical/positive。
- D08 Input slot md 13→14、InputNumber stepper 16/20 + 4px。
- D12 Checkbox 14/18/22 的元素尺寸 token 化。
- 31 个尚未迁移的 story 中，Phase 2 负责 10 个核心控件 story。

## Phase 2 执行明细

### 2a Buttons

- [x] `button.styles.ts`：两档高度/字号/圆角、outline focus、disabled opacity、solid 用 `primarySolid`。
- [x] `ActionButton`：删除 `shadows.prepend`、lg 圆角 8、outline 不再固定 12px。
- [x] `ActionButtonGroup`：新增 `size`，外角跟随 4/6/8。
- [x] `Buttons.stories.tsx` 迁移到 StoryPage。
- [x] status solid token 加深：danger red8/red11、success green8/green11；白字对比 5.37/5.21 与 5.07/4.72。

### 2b Inputs

- [x] `text.styles.ts`：两档高度/字号/圆角；focus 改 outline；valid/invalid 不再填底色；disabled opacity。
- [x] Input slot md 13→14。
- [x] `EditableText`：tokens、focus offset、disabled opacity、Saving/error 12px。
- [x] `InputNumber`：stepper 16/20、4px、错误/等待 12px。
- [x] `TextInputs.stories.tsx`、`InputNumber.stories.tsx`（subagent 完成）。

### 2c Choices

- [x] `choice.styles.ts`：height 20/24/32、12/14、4/6/8；option 3→4/6、13→14、10→12；search 24。
- [x] `choice-group.styles.ts`：select 实心 `selectionBg`，去掉 inset 描边；24/32/36。
- [x] `Checkbox`：14/18/22 → sizes token；disabled 只 opacity；label 12。
- [x] `Select`/`Combobox`：option 尺寸随触发器档位。
- [x] `Checkbox`/`Select`/`Combobox`/`SegmentControl`/`ToggleGroup` stories（subagent 完成）。

### 2d Sliders

- [x] `Slider`：root 20/24/32、track/range 实心 selectionBg、focus offset 2、slot 11、error 12。
- [x] `DistributionSlider`：segment 文字 11。
- [x] `Slider`/`DistributionSlider` stories（subagent 完成）。

### 2e 验收

- [x] `Foundation/Control matrix` story。
- [x] 9 个 subagent story 完成并 typecheck。
- [x] `pnpm verify`（prettier + typecheck + demo build + storybook build）。
- [x] 更新计划文档 Phase 2 复选框。

## Phase 2 结果

Phase 2 已完成。`pnpm verify` 全绿；Buttons + 9 个核心控件 story 已迁移，Control matrix 新增。

**已完成**

- Button/ActionButton/ActionButtonGroup 两档尺寸、outline focus、disabled opacity、solid `primarySolid`；Group 新增 `size`，外角跟随本体。
- status solid token 加深，critical/positive solid 白字对比达到 5.21/4.72（light）与 5.37/5.07（dark）。
- Input/Textarea/EditableText/InputNumber 两档、focus outline、disabled opacity、valid/invalid 不再填底色；slot md 14、stepper 16/20。
- Choice/Select/Combobox/Checkbox/Segment/Toggle 统一 20/24/32 与 4/6/8；选项实心选中；option 尺寸跟随触发器。
- Slider/DistributionSlider 实心 range、20/24/32、focus offset 2、slot 11、error 12。
- 10 个 story 全部使用 StoryPage；新增 `Foundation/Control matrix`。

**偏差 / 记录**

- SegmentControl/ToggleGroup 实际档位是 24/32/36，没有 xs/20；Slider 没有 lg/36；已在 story 中按真实 API 展示，见 D26。
- Checkbox 的元素尺寸仍是 14/18/22，但已 token 化；它不等于控件高度档位。
- InputNumber 不暴露内部 phase/draft/error，StoryState 只记录宿主可见值，见 D27。
- `warningSolid` 白字仍只有 1.8:1，但当前 Button 未使用；见 D23，Phase 8 处理。

## Phase 3 执行明细

### 3a PropertyRow

- [x] 新增 `density?: 'compact' | 'regular'`；compact 24 / regular 32。
- [x] 标签/说明改用 `textMuted`、12/14；gap 4/8；通过 CSS 变量向下传递。
- [x] 删除 `gray10/gray11` 直接引用。

### 3b Section / Disclosure

- [x] Section/Collapsible 头部 24/32；radius 3→4/6；hover `softBgHover`。
- [x] 头部背景 `grayA2`→`surfaceSubtle`；connected surface radius 6。
- [x] static heading 使用 size 变量；icon-only 宽度随 24/32。
- [x] `Accordion`/`Collapsible` header 传递 size。

### 3c SectionDivider / Flex / ResizableSplit

- [x] `SectionDivider` gap/字号/线宽 token 化。
- [x] `Flex` gap 全部改用 `space-*`。
- [x] `ResizableSplit` handle 6px 命中区、focus/disabled token。
- [x] 7 个 story（PropertyRow/Section/SectionDivider/Disclosure/Flex/ResizableSplit/ActionRow，subagent 完成）。

### 3d 验收

- [x] stories 完成并 typecheck。
- [x] `pnpm verify`。
- [x] 更新计划文档 Phase 3 复选框。

## Phase 3 结果

Phase 3 已完成。`pnpm verify` 全绿；7 个 layout/disclosure story 已迁移，并用 headless Chrome 做了 DOM smoke test。

**已完成**

- `PropertyRow` 新增 `density`（24/32），标签/说明改 `textMuted` 12/14，gap 4/8 通过 CSS 变量向下传递。
- Section/Collapsible/Accordion 头部 24/32，radius 3→4/6，header 背景 `surfaceSubtle`，hover/focus/disabled 统一。
- `staticHeading` 跟随 size 变量；icon-only 触发宽度 24/32。
- SectionDivider/Flex/ResizableSplit 的间距、字号、handle/focus 全部 token 化。
- 7 个 story 全部使用 StoryPage；无 ContractFrame/native 演示控件。

**偏差 / 记录**

- `PropertyField` 的内置控件还没随 `PropertyRow` density 变成 sm/md，留到 Phase 7，见 D28。
- `ResizableSplit` 保留 6px handle 命中区，而不是计划里的 4px，见 D29。
- 剩余 25 个 ContractFrame story 按 Phase 4–7 迁移，见 D14。

## Phase 4 执行明细

### 4a Overlay surface

- [x] `surfaceOverlay`→`surfaceRaised`，radius 6，shadow `overlay`，基础字号 14。
- [x] 新增 `overlayEnterStyles`：150ms `overlayFadeIn`，reduced-motion 关闭。
- [x] Popover/HoverCard/Tooltip arrow 改用 `surfaceRaised`。

### 4b Popover / Tooltip / HoverCard

- [x] Popover padding 12；compact 0；minWidth 160。
- [x] Tooltip 6×10、字号 12/16。
- [x] HoverCard padding 8、maxWidth 360。
- [x] 三者接入 150ms 进入动画。

### 4c Dialogs

- [x] Dialog padding 20、radius `modal`(8)、modal shadow、宽 440。
- [x] 标题 16/24；描述 14/20；footer gap 8、marginTop 20；close 8/8。
- [x] `closeSize` 可切 24/32；overlay 150ms + contentShow 180ms。

### 4d Menus

- [x] item 20/24/32、12/12/14、4/4/6；hover/selected 用 `selectionBg/selectionText`。
- [x] critical 用 `dangerText` / `dangerSolid`；option indicator 12。
- [x] content padding 4、radius 6、overlay shadow、150ms；label 11。

### 4e Notifications

- [x] Toast 宽 320、padding 8×10、minHeight 32；图标 16；关闭 24。
- [x] 状态色 info/success/danger/primary；surface/shadow 统一。

### 4f 验收

- [x] 6 个 story（Menus/Dialogs/Overlays/Notifications/Confirmation/OverlayLayers，subagent 完成）。
- [x] `pnpm verify`。
- [x] 更新计划文档 Phase 4 复选框。

## Phase 4 结果

Phase 4 已完成。`pnpm verify` 全绿；6 个 overlay story 已迁移，并用 headless Chrome 做了 DOM smoke test。

**已完成**

- Overlay surface 统一 `surfaceRaised`、6px 圆角、`shadows.overlay`、14px 基础字号；非模态浮层 150ms `overlayFadeIn`。
- Popover padding 12 / compact 0；Tooltip 6×10、12px；HoverCard padding 8。
- Dialog padding 20、radius 8、modal shadow、标题 16/24、正文 14/20、footer gap 8、close 24/32；overlay 150ms、content 180ms。
- Menu item 20/24/32、12/12/14、4/4/6，hover 用 `selectionBg/selectionText`；critical 用 danger token；content 6px + overlay shadow + 150ms。
- Toast 宽 320、图标 16、关闭 24；info/success/danger/primary 状态色。
- 6 个 story 全部使用 StoryPage；无 ContractFrame/native 演示控件。

**偏差 / 记录**

- Overlay 基础字号 14，Tooltip 局部 12；Popover 12、HoverCard 8，见 D30。
- Dialog 关闭按钮默认 24，新增 `closeSize` 可切 32，见 D31。
- Dialog 只有 regular surface，没有 compact variant；Confirmation 没有独立 size/variant。
- 剩余 19 个 ContractFrame story 按 Phase 5–7 迁移，见 D14。

## Phase 5 执行明细

### 5a Tree

- [x] `density` compact 24 / regular 32；字号 12/14；`TreeItemState` 暴露 density。
- [x] 选中改 `selectionBg/selectionText`；hover `softBgHover`；focus -2。
- [x] rename Input 跟随 sm/md；展开按钮/缩进用 token。
- [x] 拖放预览改 `surfaceRaised` + 6px + `shadows.overlay`；插入指示 2px。

### 5b Table / DataTable

- [x] Table `density` compact 24 / regular 32；保留 `compact` 兼容。
- [x] cell padding 2×6 / 6×8；header/body 行高 24/32。
- [x] selected 实心；hover 排除 selected；DataTable 透传。

### 5c Asset

- [x] grid gap 6 / list gap 4；padding 6；radius 6。
- [x] selected `selectionSubtleBg/Border`；hover `softBgHover`。
- [x] name 12/14、meta 11/12；新增 `density`。
- [x] thumbnail 36 / radius 4。

### 5d Navigation / CollectionTemplate / Drag

- [x] Breadcrumbs 20/24、12/14；hover 背景+textStrong，无下划线。
- [x] Pagination 24/32、4/6；current 实心。
- [x] CollectionTemplate `density`、gap 4/8、Section/Buttons/Input 跟随。
- [x] DragDrop 预览 6px + overlay shadow；指示线 2px。
- [x] 7 个 story（Tree/Table/AssetItem/Breadcrumbs/Pagination/CollectionTemplate/DragDrop，subagent 完成）。

### 5e 验收

- [x] stories 完成并 typecheck。
- [x] `pnpm verify`。
- [x] 更新计划文档 Phase 5 复选框。

## Phase 5 结果

Phase 5 已完成。`pnpm verify` 全绿；7 个 collection/navigation story 已迁移，并用 headless Chrome 做了 DOM smoke test。

**已完成**

- Tree 新增 `density`（24/32、12/14），选中改实心 `selectionBg`，rename 输入随档位，预览 6px + `shadows.overlay`。
- Table/DataTable 新增 `density`（24/32、2×6/6×8 padding），old `compact` 兼容；选中行实心。
- AssetItem 新增 `density`（文字 12/14、meta 11/12），grid/list gap 6/4，选中 `selectionSubtleBg/Border`。
- Breadcrumbs 20/24、hover 背景无下划线；Pagination 24/32、current 实心。
- CollectionTemplate 支持 density，Section/Buttons/Input 跟随；DragDrop 预览/指示线统一。
- 7 个 story 全部使用 StoryPage；无 ContractFrame/native 演示控件。

**偏差 / 记录**

- Table 默认 regular 32，旧 `compact` 保留映射，见 D32。
- AssetItem 的 density 控制文字，不是固定行高，见 D35。
- 新增 `space.2_5=10px`，见 D34。
- TreeDragPreview 仍是独立预览组件，未自动接入 TreeRoot，见 D36。
- 剩余 13 个 ContractFrame story 按 Phase 6–7 迁移，见 D14。
