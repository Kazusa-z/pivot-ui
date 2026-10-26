# Pivot UI 视觉统一执行记录

> 配套文档：[STYLE_UNIFICATION.md](./STYLE_UNIFICATION.md)  
> 用途：记录每个 Phase 的完成状态、无法当场解决的问题、以及必须留到后续 Phase 的改动。  
> 规则：遇到跨阶段问题先登记，不为了“当场干净”提前改后面的组件；到目标 Phase 再一并处理。

## 阶段状态

| Phase                             | 状态   | 开始       | 完成       | 备注                         |
| --------------------------------- | ------ | ---------- | ---------- | ---------------------------- |
| 0 计划与决策                      | 已完成 | 2026-10-26 | 2026-10-26 | 用户确认两档与 4 个默认项    |
| 1 Tokens / Foundation / Story Kit | 已完成 | 2026-10-26 | 2026-10-26 | 12 个 story 已迁移，验收全绿 |
| 2 核心表单控件                    | 未开始 | —          | —          | —                            |
| 3 Layout 与面板                   | 未开始 | —          | —          | —                            |
| 4 Overlays                        | 未开始 | —          | —          | —                            |
| 5 Collections 与 Navigation       | 未开始 | —          | —          | —                            |
| 6 Templates                       | 未开始 | —          | —          | —                            |
| 7 Property                        | 未开始 | —          | —          | —                            |
| 8 Storybook 收尾与审计            | 未开始 | —          | —          | —                            |

## 跨阶段待解决项

| ID  | 发现于   | 目标 Phase | 问题                                                                                                                                         | 处理方式                                                                    | 状态   |
| --- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| D01 | Phase 1a | Phase 2    | `ActionButton` 仍使用 `var(--shadows-prepend)`（值为透明阴影），且去掉后无视觉影响                                                           | Phase 2 与按钮状态一起删除该 token 引用                                     | 待处理 |
| D02 | Phase 1a | Phase 2    | `Button variant="solid"` 仍使用 `primary`（blue9）配白字，对比度不足；Phase 1 只新增 `primarySolid`（暗 blue8 / 亮 blue11），不提前改 Button | Phase 2 将 solid 背景切到 `primarySolid`，并复核 critical/positive          | 待处理 |
| D03 | Phase 1a | Phase 4    | 保留 `overlayFadeIn`/`contentShow` keyframes，但 Dialog/Popover 还没有接线                                                                   | Phase 4 在 Overlay/Dialog 样式中接入进入动画                                | 待处理 |
| D04 | Phase 1a | Phase 4    | `surfaceOverlay/surfaceRaised` 已抬到 gray3/white，但 Menu/Popover/Dialog 的 padding、圆角、shadow 仍是旧值                                  | Phase 4 统一 overlay surface 的 padding/radius/shadow                       | 待处理 |
| D05 | Phase 1a | Phase 3    | Section/Collapsible 仍是 27/30px 头部和 3px trigger 圆角                                                                                     | Phase 3 统一到 24/32 与 4/6                                                 | 待处理 |
| D06 | Phase 1a | Phase 4    | Menu 仍是 3px item 圆角、13px md 字号、10px xs 字号                                                                                          | Phase 4 统一到 4/6、12/14                                                   | 待处理 |
| D07 | Phase 1a | Phase 5    | Tree 仍是 28px 行高、实心 primary 选中                                                                                                       | Phase 5 统一到 24/32，并用 `selectionBg/selectionText`                      | 待处理 |
| D08 | Phase 1a | Phase 2    | Input md slot 仍是 13px，InputNumber stepper 仍是 18px/2px 圆角                                                                              | Phase 2 统一到 14px、16/20、4px                                             | 待处理 |
| D09 | Phase 1a | Phase 6    | ColorWidget/RampControls/ColorRampChannels/CurveWidget/CurvePresets/ResourcePicker 仍使用 9 处原生 `<select>`                                | Phase 6 替换为 `Select`/`Combobox`                                          | 待处理 |
| D10 | Phase 1a | Phase 8    | 旧 token（`tooltipBg`、`tooltipColor`、`toastBg`、`sidebar*`、`focusRingMuted`、`shadows.prepend`）先保留，避免 Phase 1 破坏未迁移组件       | Phase 8 无引用后删除                                                        | 待处理 |
| D11 | Phase 1a | Phase 4    | `overlayFadeOut` 已删除，若后面需要退场动画，需在 Phase 4 重新引入并接 Radix forceMount                                                      | Phase 4 评估是否需要退场                                                    | 待处理 |
| D12 | Phase 1a | Phase 2    | Checkbox 仍是 14/18/22 三档元素尺寸；Kbd 已先改为 16/18/20                                                                                   | Phase 2 统一 Checkbox 的元素尺寸 token                                      | 待优化 |
| D13 | Phase 1c | —          | `!autodocs` 已在 SB10 验证：`foundation-theme--shared-providers` 与 `storage-and-cleanup` 的 index tags 不再包含 autodocs                    | 已确认可用；后续 Phase 沿用该方式                                           | 已解决 |
| D14 | Phase 1c | Phase 2–7  | 43 个 `ContractFrame` story 中，Phase 1 已迁移 12 个 Foundation/Display/Feedback，剩余 31 个按组件 Phase 迁移                                | 各 Phase 跟随组件修改                                                       | 进行中 |
| D15 | Phase 1b | —          | Badge 的 `solid` 改为 filled tint（`*Bg + *Text`），surface 加 `*Border`，active 用 `primarySolid + 白字`；状态文字改用 12 阶                | 已按语义 token 迁移；orange/gold/violet 保留 categorical A 色，Phase 8 复核 | 已解决 |
| D16 | Phase 1a | —          | Radix 亮色 blue8 只有 2.33:1，无法承载白字                                                                                                   | 暗色 `primarySolid = blue8`，亮色 `primarySolid = blue11`，对比 5.07 / 4.77 | 已解决 |
| D17 | Phase 1a | —          | `generate-tokens.mjs` 使用 `/tmp`，Windows 下生成到仓库 `tmp/` 且 file URL 失败                                                              | 改为 `node_modules/.cache` + `pathToFileURL`；`.gitignore` 增加 `tmp/`      | 已解决 |
| D18 | Phase 1a | —          | 状态文字用 11 阶时低于 4.5:1                                                                                                                 | `info/success/warning/danger Text` 改用 12 阶；实测 10.47–12.98:1           | 已解决 |
| D19 | Phase 1b | —          | Kbd 原为 14/18/22 + 10/12 字；与两档控件不一致                                                                                               | 改为 16/18/20、11/11/12 字；保留 3 档 inline 尺寸并在 Tokens 页说明         | 已接受 |
| D20 | Phase 1c | —          | 旧 story 依赖 `ContractFrame` / 原生控件 / 34px 控件                                                                                         | 新增 `StoryPage` 套件；12 个 Foundation/Display/Feedback story 已迁移       | 已解决 |
| D21 | Phase 1c | Phase 2    | `Foundation/Tokens` 的 density 示例使用当前 Button/Input/Select，视觉仍是 Phase 2 之前的尺寸                                                 | Phase 2 完成后自动反映；无需提前改 Token 页                                 | 待观察 |
| D22 | Phase 1a | Phase 3–6  | `appBg` 已改为 gray1、`surfaceRaised` 已抬层级；未迁移组件仍使用旧的 padding/radius/字体，预览会有过渡态                                     | 按 Phase 3–6 正常推进                                                       | 已知   |

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
