# Pivot UI 视觉统一改造计划

> 状态：草案，待确认  
> 范围：`packages/interface/src`、`packages/interface/stories`、`panda/`、相关文档  
> 原则：**代码级统一，不做截图比对**；两档密度；不改交互语义；组件与 Storybook 同批修改。  
> 依据：2026-10-26 的样式审计（176 个源文件、57 个 story 文件、明暗主题计算样式与 token 使用统计）。

## 1. 目标

改造完成后应满足：

1. 所有交互控件只使用两档高度：**紧凑档 20/24px**、**常规档 32/36px**。
2. 所有圆角、字号、间距、阴影、状态颜色都来自 token，不再出现新的裸 px。
3. 焦点、禁用、只读、选中、危险/成功/警告/信息状态各只有一套实现。
4. 浮层、面板、模态有明确的 surface 层级，不再和页面背景同色。
5. 57 个 story 文件全部使用统一的文档页结构，不再依赖 `ContractFrame`、原生表单控件或一次性 CSS。
6. `pnpm verify` 全绿，并新增样式/Story 结构检查脚本。

**验收以代码为准**：不要求视觉截图，但要求 token 使用、组件映射、Story 结构可检查、可重复。

## 2. 决策

### 2.1 两档密度

| 档位         | 高度               | 控件字号 | 圆角    | 图标      | 典型场景                                            |
| ------------ | ------------------ | -------- | ------- | --------- | --------------------------------------------------- |
| 紧凑 compact | 20（xs）/ 24（sm） | 12px     | 4px     | 12 / 14px | 工具栏、属性面板、菜单、树、表格、颜色/曲线内联控件 |
| 常规 regular | 32（md）/ 36（lg） | 14px     | 6 / 8px | 16 / 18px | 对话框、常规表单、Storybook 文档页、引导流程        |
| 微字号 micro | —                  | 11px     | 4px     | 12px      | Kbd、坐标轴标签、元信息；只在这些位置使用           |

- `20/24` 对应组件现有 `size="xs" | "sm"`；`32/36` 对应 `size="md" | "lg"`。
- 不再新增 22/27/28/30/34px 的控件高度。
- Checkbox、Kbd、Badge 这类**元素尺寸**不等于控件高度，保留独立 token，但必须落在明确的角色里：
  - Checkbox：14（sm）/ 18（md）/ 22（lg，触控/大尺寸）
  - Kbd：16（sm）/ 20（md）
  - Badge：16（xs）/ 20（sm）
- 内容尺寸例外（保留并写入 token 注释）：颜色平面 130、颜色预览 48、渐变条 64、AssetReferenceInput 48、竖向 Slider 160、树/表格拖拽指示 2。

### 2.2 组件选档规则

- 编辑器内的工具、面板、菜单、树、表格：**默认紧凑档**。
- 对话框、确认框、Storybook 文档页、独立表单：**常规档**。
- 核心控件同时支持两档；面板类组件通过现有 `size` 或新增 `density` 选择。
- 新增 `density?: 'compact' | 'regular'`：
  - `TreeRoot`、`Table`、`DataTable`、`CollectionTemplate`
  - `PropertyRow`、`PropertyField`
  - 默认 `compact`；不改变现有调用方的默认外观。
- 不新增第二套 `variant` 语义；现有 `variant` 保持不变，只统一取值。

### 2.3 不做的事

- 不修改交互逻辑、数据契约、组件 API 语义（`density` 是增量 API）。
- 不引入第二套 CSS 方案，不新增 styled-components/emotion。
- 不为了“好看”改组件结构；只统一视觉常量与状态实现。
- 不在本次改造中重写 Storybook 的信息架构；只统一页面结构、标题和内容层级。
- 不用截图做验收，不提交 `storybook-static` 或图片产物。

## 3. 统一规范

### 3.1 高度、字号、圆角、图标

| Token                    | 值     | 用途                       |
| ------------------------ | ------ | -------------------------- |
| `controlXs`              | 20px   | 紧凑档最小控件             |
| `controlSm`              | 24px   | 紧凑档默认控件             |
| `controlMd`              | 32px   | 常规档默认控件             |
| `controlLg`              | 36px   | 常规档大控件               |
| `fontSizes.micro`        | 11px   | Kbd、坐标轴、元信息        |
| `fontSizes.control`      | 12px   | 紧凑档控件、菜单、树、表格 |
| `fontSizes.controlLarge` | 14px   | 常规档控件、面板标题、正文 |
| `fontSizes.heading`      | 16px   | 对话框标题、区块标题       |
| `fontSizes.display`      | 24px   | 文档页标题                 |
| `radii.control`          | 4px    | 20/24px 控件               |
| `radii.controlMd`        | 6px    | 32px 控件、浮层内容、面板  |
| `radii.controlLg`        | 8px    | 36px 控件、Dialog、卡片    |
| `radii.pill`             | 9999px | Tag、Progress、圆形指示    |

规则：

- 高度 20/24 → 圆角 4；高度 32 → 圆角 6；高度 36+ → 圆角 8。
- 浮层内容（Menu/Select/Popover/Tooltip）统一 6px；Dialog/AlertDialog 8px；卡片 8px。
- 删除 2px、3px 圆角；颜色色块也统一 4px。
- 控件字号只有 12/14 两档；11px 只用于 micro 角色；删除 10px、13px。
- 图标随控件：20→12、24→14、32→16、36→18；24px 行的图标用 14，32px 行用 16。

### 3.2 间距

只使用：`2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32`。

| 位置                | 紧凑档                   | 常规档         |
| ------------------- | ------------------------ | -------------- |
| 控件水平内边距      | 6 / 8px                  | 12 / 16px      |
| 控件垂直内边距      | 由固定高度控制，不再叠加 | 由固定高度控制 |
| 菜单/选项项内边距   | 2×8px                    | 4×12px         |
| 面板内边距          | 8px                      | 12 / 16px      |
| 面板区块间距        | 8 / 12px                 | 16 / 24px      |
| 标签与控件间距      | 4px                      | 6px            |
| 文档页 section 间距 | —                        | 32px           |

删除 1/3/5/7/10/14px 的 layout 间距；颜色/曲线内部原来的 3px、10px 改为 4/8/12px。

### 3.3 状态

| 状态                 | 规则                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 焦点                 | 统一 `outline: 2px solid var(--colors-focusRing)` + `outline-offset: 2px`；整行内嵌的 Menu/Tree 行可用 `-2px`，这是唯一例外 |
| 禁用                 | 统一 `opacity: 0.5` + `cursor: not-allowed`；不再同时换背景/文字颜色                                                        |
| 只读                 | 保持正常颜色，仅 `cursor: default`；不得使用禁用透明度                                                                      |
| 错误                 | `dangerBorder` + `dangerText`；输入框不再整块填 `dangerBg`，只保留边框与文字                                                |
| 成功                 | `successBorder` + `successText`；同上，不填底色                                                                             |
| 选中（行/选项/勾选） | `selectionBg` + `selectionText` 实心                                                                                        |
| 选中（卡片/磁贴）    | `selectionSubtleBg` + `selectionBorder` + `textStrong` 浅底                                                                 |
| 悬停                 | 中性项 `softBgHover`；选中项 `selectionBgHover`；不再用“仅下划线”作为唯一反馈                                               |
| 忙碌                 | `aria-busy` + 行内小号 Spin/文字；不改变布局高度                                                                            |

### 3.4 Surface 与层级

| 角色                               | Dark                | Light               |
| ---------------------------------- | ------------------- | ------------------- |
| `appBg`                            | `$gray1`（#111113） | `$gray2`（#f9f9fb） |
| `surface`                          | `$gray2`（#18191b） | `$gray1`（#fcfcfd） |
| `surfaceRaised` / `surfaceOverlay` | `$gray3`（#212225） | `white`             |
| `panelBg`                          | `$gray3`            | `$gray3`            |
| `surfaceSubtle`                    | `$grayA3`           | `$gray2`            |

- Menu/Select/Popover/Tooltip/Notification 使用 `surfaceRaised` + 1px border + `shadows.overlay`。
- Dialog/AlertDialog 使用 `surfaceRaised` + `shadows.modal` + 8px 圆角。
- 恢复 `appBg` 与 `surface` 的层次，解决暗色下页面、输入框、浮层同色的问题。
- 删除/停用未使用的 `tooltipBg`、`tooltipColor`、`toastBg`、`sidebar*`、`focusRingMuted`；保留一个版本周期后再从 token 源移除。

### 3.5 状态色

所有状态颜色统一走语义 token：

| 语义                                                     | 组件用法                                         |
| -------------------------------------------------------- | ------------------------------------------------ |
| `infoBg / infoText / infoBorder / infoSolid`             | Callout、Badge、提示条                           |
| `successBg / successText / successBorder / successSolid` | Callout、Badge、Valid、Positive                  |
| `warningBg / warningText / warningBorder / warningSolid` | Callout、Badge                                   |
| `dangerBg / dangerText / dangerBorder / dangerSolid`     | Callout、Badge、Invalid、Critical、Menu critical |

- Callout 不再直接写 `blue3/amber3/red3/green3`。
- Badge 的 solid 是“实心 tint”：`*Bg + *Text`；surface 再加 `*Border`；`active` 用 `primarySolid + 白字`。
- Menu 的 critical 项使用 `dangerText`，高亮使用 `dangerSolid`。
- `orange/gold/violet` 属于分类色而非状态色，保留但标注为 categorical；不得用于错误/成功语义。

### 3.6 动效

| 场景                      | 时长  | 缓动                            |
| ------------------------- | ----- | ------------------------------- |
| hover/按下/颜色变化       | 120ms | `ease-out`                      |
| Menu/Popover/Tooltip 进入 | 150ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Dialog/AlertDialog 进入   | 180ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| 折叠/展开                 | 180ms | `cubic-bezier(0.16, 1, 0.3, 1)` |

- 删除 `overlayFadeOut`、`contentFadeIn/Out`、`slideDown/Up/Right/LeftAndFade`、`breathing`；保留并接线 `overlayFadeIn`（遮罩）与 `contentShow`（内容）给 Dialog/Popover。
- 所有动画在 `prefers-reduced-motion: reduce` 下关闭。
- Menu 已有 `scaleIn`；Dialog/Popover 补齐，不能“菜单有动画、弹窗直接闪出”。

### 3.7 颜色对比度底线

以下组合必须达到 4.5:1（12px/14px 正常文字）：

- `textMuted` on `surface`（亮/暗）
- 白字 on `selectionBg`（实心按钮、树/菜单选中、表格选中）
- `successText` on `successBg`、`warningText` on `warningBg`、`infoText` on `infoBg`（亮色主题）
- 当前审计值：3.26–4.43，均低于或贴近 4.5；Phase 1 必须调整 token。
- 建议：`textMuted` 在亮色用约 `#6b7078`、暗色用约 `#8b909a`；`primarySolid` 在暗色用 `blue8`、亮色用 `blue11`（亮色 `blue8` 只有 2.33:1），hover 再深一档；`primary`（blue9）保留给 focus/accent；solid 状态色按钮同样检查白字对比度。具体值在 Phase 1 用一次性脚本验证并记录；Phase 8 再决定是否固化为 `audit:contrast`。

## 4. 组件映射

| 组件族        | 组件                                                              | 紧凑档             | 常规档                          | 默认    | 圆角     | 字号                |
| ------------- | ----------------------------------------------------------------- | ------------------ | ------------------------------- | ------- | -------- | ------------------- |
| 按钮          | Button、ActionButton、ActionButtonGroup                           | xs 20 / sm 24      | md 32 / lg 36                   | sm      | 4/4/6/8  | 12/12/14/14         |
| 文本输入      | Input、Textarea、EditableText                                     | xs 20 / sm 24      | md 32 / lg 36                   | sm      | 4/4/6/8  | 12/12/14/14         |
| 数字输入      | InputNumber、NumericSlider                                        | xs 20 / sm 24      | md 32 / lg 36                   | sm      | 4/4/6/8  | 12/12/14/14         |
| 选项          | Checkbox、Select、Combobox、SegmentControl、ToggleGroup           | 20 / 24            | 32（Checkbox lg 22 为元素尺寸） | sm      | 4/6/8    | 12/14               |
| 滑块          | Slider、DistributionSlider                                        | 20 / 24            | 32                              | sm      | 4        | 11/12               |
| 面板          | Section、Collapsible、Accordion                                   | 24 头部            | 32 头部                         | sm      | 6        | 12/14               |
| 属性行        | PropertyRow、PropertyField                                        | 24                 | 32                              | compact | 4/6      | 12/14               |
| 菜单/选择浮层 | Menu、Select option、Combobox option                              | 20 / 24            | 32                              | sm      | 4/4/6    | 12/12/14            |
| 浮层          | Popover、Tooltip、HoverCard                                       | 24 内容            | 32 内容                         | regular | 6        | 12/14               |
| 模态          | Dialog、AlertDialog                                               | —                  | 32/36 控件                      | regular | 8        | 标题 16，正文 14    |
| 通知          | Notification/Toast                                                | —                  | 32                              | regular | 6        | 标题 12/14，正文 12 |
| 集合          | Tree、Table、DataTable、CollectionTemplate                        | 24 行              | 32 行                           | compact | 4/6      | 12/14               |
| 导航          | Breadcrumbs、Pagination                                           | 20 / 24            | 32                              | compact | 4/6      | 12/14               |
| 资源          | AssetItem、AssetThumbnail                                         | —                  | —                               | compact | 4/6      | 12/14，meta 11/12   |
| 颜色/曲线     | ColorWidget、ColorPicker、RampControls、CurveWidget、CurvePresets | 24                 | 32（浮层/对话框）               | compact | 4/6      | 12/14，标签 11/12   |
| 资源模板      | ResourcePicker、AssetReferenceInput                               | 24 工具栏          | 32 对话框/字段                  | compact | 4/6      | 12/14               |
| 反馈          | Callout、Progress、Spin、Badge、Kbd                               | 16/20（Badge/Kbd） | —                               | —       | 4/6/9999 | 11/12               |

补充：

- Section 头部 27/30、Tree 行 28、ColorPicker 触发器 28、ResourcePicker 工具栏 30 全部删除。
- `ActionButton lg` 圆角从 6 改 8；`ActionButtonGroup` 外角跟随本体 4/6/8。
- `Input` 的 md slot 字号从 13 改 14。
- `Menu` md 字号从 13 改 14；xs 从 10 改 12。
- `Checkbox` 禁用不再同时降透明度和换色。
- `Dialog` 标题从 18 改 16；Modal 与 Popover 的层级差保留但写进规范。
- 颜色、曲线、资源模板里的 9 处原生 `<select>` 全部替换为 `Select`/`Combobox`。
- Storybook 的 `ContractFrame` 34px 控件、13px 文字和独立的一套面板圆角全部废弃；面板圆角按 6/8 规范重新选。

## 5. Storybook 文档规范

当前 57 个 story 文件中，43 个使用 `ContractFrame`，22 个仍含原生 `<input>`/`<select>`。它们更像测试工装，不是公开组件说明书。

### 5.1 共享 Story Kit

新增 `packages/interface/stories/support/StoryPage.tsx`，只使用库组件与 token：

| 组件            | 作用                                                            |
| --------------- | --------------------------------------------------------------- |
| `StoryPage`     | 页面外壳：eyebrow、标题、摘要、meta、分隔线、最大宽度、页面间距 |
| `StorySection`  | 区块：标题 16/24、说明 12/18、内容间距 16                       |
| `StoryGrid`     | `repeat(auto-fit, minmax(220px, 1fr))` + 16px gap               |
| `StoryCard`     | `surface` + 1px border + 6px 圆角 + 16px padding                |
| `StoryRow`      | 控件行，flex wrap + 8/12px gap                                  |
| `StoryField`    | label 12/16 + hint 12/18 + control                              |
| `StoryDensity`  | 紧凑/常规两档的左右对照，带 `Badge` 标签                        |
| `StoryCode`     | `surfaceSubtle` + 6px 圆角 + mono 12/18，最大高度 320           |
| `StoryState`    | `<details>` + code；默认收起长状态，不再把 JSON 放在首屏        |
| `StoryKeyboard` | Kbd + 行为说明的表格                                            |
| `StoryProps`    | 关键 props 表（prop/type/default/description），只用于核心组件  |

页面尺度：

- 最大宽度 1040px；padding 32px（窄屏 24/16）；section 间距 32px。
- 背景 `appBg`；卡片 `surface`；分隔线 `border`。
- 标题 24/32；正文 14/22；说明/标签 12/18；代码 12/18。
- 不出现 13px、34px、20px 标题等一次性值。

### 5.2 单个组件页结构

```tsx
<StoryPage eyebrow="Widgets / Inputs" title="InputNumber" summary="…">
  <StorySection title="Variants">…</StorySection>
  <StorySection title="Density">
    <StoryDensity tier="compact">…</StoryDensity>
    <StoryDensity tier="regular">…</StoryDensity>
  </StorySection>
  <StorySection title="States">…</StorySection>
  <StorySection title="Usage">
    <StoryCode code={…} />
    <StoryProps rows={…} />
  </StorySection>
  <StorySection title="Keyboard">…</StorySection>
</StoryPage>
```

- `Overview` 只放“是什么、何时用、变体、尺寸、状态、用法、键盘”。
- 行为演示（异步、受控、外部更新、拒绝）放到独立的 `Behavior` story，不进 Overview。
- 状态面板只展示关键值；复杂对象用 `StoryState` 折叠，不把 JSON 放在首屏。
- 不再写 `CSS override: 18px` 这种故意破坏规范的示例；自定义样式放到 `Customization` 区块，并用 token 说明。

### 5.3 标题与分类

统一为 `Category/Component`，不允许再出现描述性句子作为 title：

| 旧                              | 新                                         |
| ------------------------------- | ------------------------------------------ |
| `Widgets/Badge and Tag`         | `Widgets/Display/Badge`                    |
| `Widgets/Text Inputs`           | `Widgets/Inputs/Text`                      |
| `Widgets/Input Number`          | `Widgets/Inputs/Number`                    |
| `Widgets/OverlayLayers`         | `Widgets/Overlays/Layers`                  |
| `Widgets/Color`                 | `Widgets/Color/ColorWidget`                |
| `Widgets/Curve`                 | `Widgets/Curve/CurveWidget`                |
| `Widgets/Tree`                  | `Widgets/Collections/Tree`                 |
| `Widgets/AssetItem`             | `Widgets/Collections/AssetItem`            |
| `Widgets/Dialogs`               | `Widgets/Overlays/Dialogs`                 |
| `Widgets/Overlays`              | `Widgets/Overlays/Popover`                 |
| `Widgets/Menus`                 | `Widgets/Overlays/Menus`                   |
| `Widgets/Confirmation`          | `Widgets/Overlays/Confirmation`            |
| `Overlays/Notifications`        | `Widgets/Overlays/Notifications`           |
| `Layout/Action row`             | `Layout/ActionRow`                         |
| `Templates/CollectionTemplate`  | `Templates/Collections/CollectionTemplate` |
| `Templates/ColorRamp`           | `Templates/Color/ColorRamp`                |
| `Templates/ColorRampChannels`   | `Templates/Color/ColorRampChannels`        |
| `Templates/ColorDistribution`   | `Templates/Color/ColorDistribution`        |
| `Templates/NumericSlider`       | `Templates/Numeric/NumericSlider`          |
| `Templates/NumericTupleInput`   | `Templates/Numeric/NumericTupleInput`      |
| `Templates/CurvePicker`         | `Templates/Curve/CurvePicker`              |
| `Templates/NumericDistribution` | `Templates/Curve/NumericDistribution`      |
| `Templates/ResourcePicker`      | `Templates/Resources/ResourcePicker`       |
| `Interaction/Drag and drop`     | `Interaction/DragDrop`                     |

分类固定为：`Foundation`、`Layout`、`Widgets/*`、`Templates/*`、`Contracts/*`、`Property/*`、`Interaction/*`。

### 5.4 Autodocs 策略

- 每个组件文件只在 docs 页面展示 `Overview`。
- `States`、`Behavior`、`Accessibility`、`Customization` 用 `tags: ['!autodocs']` 排除出 docs；侧边栏仍可访问。
- 如果 Storybook 10 的 `!autodocs` 行为不符合预期，退化为 `parameters.docs.disable` 或把行为 story 拆到独立文件；在 Phase 1 验证一次并记录。
- docs 页面的 component description 只写 2–3 句定位说明，不重复 Overview 文案。

### 5.5 Story 迁移检查单

每个 story 文件完成以下项才算完成：

- [ ] meta title 符合 `Category/Component`。
- [ ] `tags: ['autodocs']`；`layout: 'fullscreen'`。
- [ ] `Overview` 使用 `StoryPage`，含 Variants/Density/States/Usage/Keyboard（按组件取舍）。
- [ ] 不再使用 `ContractFrame`、`contractStyles`、`ControlButton/Input/Select`。
- [ ] 不再使用原生 `<input>`/`<select>` 作为演示控件。
- [ ] 状态面板只在 Behavior 中使用，且使用 `StoryState`。
- [ ] 没有 34px、13px、10px 等一次性值；8px 只用于卡片/Dialog 圆角。
- [ ] 窄屏（约 360px）下不横向溢出。
- [ ] `pnpm typecheck` 与 `pnpm build:storybook` 通过。

### 5.6 文案约定

- 组件名、示例标签、状态名、section 标题用英文：`Variants`、`Density`、`States`、`Usage`、`Keyboard`、`Accessibility`、`Behavior`。
- 说明段落保留中文，一句话说清“是什么/何时用/边界”。
- 不在 story 中混用“Text Inputs”和“Input Number”这类分类；统一按 5.3 的命名。
- 示例值用真实编辑器语义（Position、Material、Opacity），不用 `foo/bar`。

## 6. 执行顺序

每个 Phase 一个独立 commit（大 Phase 可拆成 2–3 个），每个 commit 都必须通过 `pnpm verify:quick`；涉及 Storybook 的 Phase 额外跑 `pnpm build:storybook`。

### Phase 0 — 计划与决策（文档，0.5 天，已完成）

- [x] 新增本文档。
- [x] 确认第 2 节的两档密度、第 3.7 节的对比度处理、第 5.6 节的中英文约定。
- [x] 确认 `density` 增量 API 与 Checkbox/Kbd/Badge 的例外尺寸。

**产出**：本文件。**不改代码。**

### Phase 1 — Tokens、Surface、Foundation、Story Kit（已完成 2026-10-26）

**1a Token 与主题**

- [x] `panda/token-source/sizes.ts`：新增 `fontSizes.micro/control/controlLarge/heading/display`、语义圆角（`control/controlMd/controlLg/overlay/modal/card/pill`）、`shadows.overlay/modal`；保留并注释两档高度。
- [x] `panda/token-source/colors.ts`：暗色 `appBg: $gray1`、`surfaceOverlay/surfaceRaised: $gray3`；亮色 `surfaceOverlay/surfaceRaised: white`；新增 `primarySolid`（暗 blue8 / 亮 blue11）、`selectionSubtleBg/selectionSubtleBorder`；调整 `textMuted` 与实心蓝对比度；清理未使用 token（先标记 deprecated）。
- [x] `panda/global.ts`：`body` 背景从 `surface` 改为 `appBg`，否则改 token 后页面仍和 surface 同色。
- [x] `panda/generate-tokens.mjs` + `node panda/generate-tokens.mjs` 重新生成 `panda/designTokens.ts`。
- [x] `panda/base.ts`：删除 8 个未使用 keyframes；保留 `overlayFadeIn`/`contentShow`（接线见 D03 / Phase 4）；保留 reduced-motion。
- [x] 用一次性对比度脚本验证 `textMuted`、`primarySolid`、状态色 solid 组合，记录数值；Phase 8 决定是否固化为 `audit:contrast`。
- [x] `panda/README.md`：写清两档、surface、状态 token。

**1b Foundation/Display/Feedback 组件**

- [x] `foundation/typography/index.tsx`：11/12/14/16/24 字阶；Link 圆角 4；focus outline 2。
- [x] `widgets/display/Kbd.tsx`：16/18/20 高度、11/12 字号、4px 圆角。
- [x] `widgets/display/Badge.tsx`、`badge.styles.ts`：16/20、11/12、4/pill；solid/surface 改用语义状态色。
- [x] `widgets/feedback/Callout.tsx`：12/14 字号、6px 圆角、8/12 padding；改用 `info*/warning*/success*/danger*`。
- [x] `widgets/feedback/Progress.tsx`、`Spin.tsx`：尺寸 token；Progress 4/6/8。
- [x] `widgets/display/ScrollArea.tsx`、`Separator.tsx`、`ReadonlyValue.tsx`、`ImagePreview.tsx`：圆角/字号/状态统一。

**1c Story Kit + Foundation Stories**

- [x] 新增 `stories/support/StoryPage.tsx`（`StoryPage/StorySection/StoryGrid/StoryCard/StoryRow/StoryField/StoryDensity/StoryCode/StoryState/StoryKeyboard/StoryProps`）。
- [x] 迁移 `Tokens`、`Theme`、`Typography`、`Icons`、`Arrow`、`Kbd`、`ScrollArea`、`Separator`、`ReadonlyValue`、`ImagePreview`、`Feedback`、`Badge`。
- [x] 重写 `Tokens` 为最终规范页：两档高度、圆角、字号、间距、surface、状态、阴影。
- [x] 验证 `!autodocs` 行为并记录。

**验收**：`pnpm verify` 全绿；Foundation stories 不再使用 `ContractFrame`；Tokens 页面与代码一致。

### Phase 2 — 核心表单控件（已完成 2026-10-26）

**2a Buttons**

- [x] `widgets/buttons/button.styles.ts`：20/24/32/36、4/4/6/8、12/12/14/14；focus 改 outline；disabled 统一 opacity .5；ActionButton lg 圆角 8；Group 外角跟随；outline 字号跟随 size；inverted 补 hover/active；solid 背景改用 `primarySolid`。
- [x] `Button.tsx`/`ActionButton.tsx`/`ActionButtonGroup`：不改变行为，仅样式与 slot 尺寸。

**2b Text inputs**

- [x] `widgets/inputs/text.styles.ts`：两档高度/字号/内边距；md slot 13→14；focus 改 root outline；disabled opacity；valid/invalid 改边框+文字，不填底色。
- [x] `Input.tsx`、`Textarea.tsx`、`EditableText.tsx`：应用新样式。
- [x] `InputNumber.tsx`：stepper 16/20、圆角 4；错误/等待 12；高度跟随 Input。

**2c Choices**

- [x] `widgets/choices/choice.styles.ts`：20/24/32（minHeight→height）、12/12/14、4/4/6；option 3→4/6、13→14、10→12；search 24/32；highlight 用 `selectionBg/selectionText`。
- [x] `Checkbox.tsx`：14/18/22 保留但 token 化；disabled 只 opacity；focus outline 2/2。
- [x] `Select.tsx`、`Combobox.tsx`：触发器/选项/内容圆角/字号统一；tag 尺寸。
- [x] `SegmentControl.tsx`、`ToggleGroup.tsx`：24/32/36；选中改实心 `selectionBg`；容器 2px padding 保留。

**2d Sliders**

- [x] `Slider.tsx`、`DistributionSlider.tsx`、`useSliderEdit.ts`：root 20/24/32；range 用 `selectionBg` 不透明；thumb 尺寸随档；focus outline；disabled opacity。
- [x] `slotClass` 10→11；tooltip 11；错误 12。

**2e Stories**

- [x] `Buttons`、`TextInputs`、`InputNumber`、`Checkbox`、`Select`、`Combobox`、`SegmentControl`、`ToggleGroup`、`Slider`、`DistributionSlider`。
- [x] 新增 `Foundation/Control matrix`：两档 × 控件 × 状态的代码矩阵。
- [x] 删除 Buttons 里 `CSS override: 18px` 的示例，改为 `Customization` 说明。

**验收**：核心控件只出现 20/24/32/36；ActionButton/Group 圆角一致；Input slot 字号一致；无原生 demo 控件；`pnpm verify` 通过。

### Phase 3 — Layout 与面板（已完成 2026-10-26）

- [x] `layout/PropertyRow.tsx`：label 12/14、`textMuted`、minHeight 24/32、gap 4/8；新增 `density`。
- [x] `widgets/disclosure/disclosure.styles.ts`：头部 24/32；3px 圆角→4/6；`grayA2`→`surfaceSubtle`；hover `softBgHover`；focus -2。
- [x] `Accordion.tsx`、`Collapsible.tsx`、`Section.tsx`：连接/嵌套样式统一；actions 间距 4/8。
- [x] `SectionDivider.tsx`：12/14 字号、8px gap。
- [x] `Flex.tsx`：gap 只用 0/2/4/6/8/12/16。
- [x] `ResizableSplit.tsx`：handle 6px 命中区（见 D29）、focus ring、hover 颜色。
- [x] Stories：`PropertyRow`、`Section`、`SectionDivider`、`Disclosure`、`Flex`、`ResizableSplit`、`ActionRow`。

**验收**：27/28/30 头部消失；Section 头部与 24/32 控件对齐；PropertyRow 标签色不再用 `gray10`；`pnpm verify` 通过。

### Phase 4 — Overlays（已完成 2026-10-26）

- [x] `widgets/overlays/shared.ts`：`surfaceRaised`、6px 圆角、`shadows.overlay`、12/14 字号。
- [x] `Popover.tsx`、`Tooltip.tsx`、`HoverCard.tsx`：padding 8/12；Tooltip 6×10；进入动画 150ms。
- [x] `widgets/dialogs/*`：padding 20、圆角 8、标题 16、正文 14、footer gap 8/12、modal shadow、180ms 动画；close 24/32。
- [x] `widgets/menus/menu.styles.ts`：item 20/24/32、12/12/14、4/4/6、gap 4/8；label 11/12；content 6px + overlay shadow；critical 用 danger token。
- [x] `widgets/notifications/*`：Toast 320 宽、12/14 字号、6px 圆角、overlay shadow、status 图标 16。
- [x] Stories：`Menus`、`Dialogs`、`Overlays`、`Notifications`、`Confirmation`、`OverlayLayers`。

**验收**：浮层与页面背景分离；Dialog 标题 16；Menu 不再 3px/13px；所有 overlay 共用一个 surface/shadow；`pnpm verify` 通过。

### Phase 5 — Collections 与 Navigation（已完成 2026-10-26）

- [x] `widgets/collections/tree/Tree.tsx`：新增 `density`；行 24/32；字号 12/14；选中实心；focus -2；拖拽指示 2px；rename 输入跟随档位。
- [x] `widgets/collections/Table.tsx`、`DataTable.tsx`：`density`；表头/行 24/32；cell padding 2×6 / 6×8；选中实心。
- [x] `widgets/collections/asset/*`：列表 4px / 网格 6px；选中改 `selectionSubtleBg` + border；hover `softBgHover`；name 12/14，meta 11/12。
- [x] `widgets/navigation/Breadcrumbs.tsx`：hover 改背景+textStrong，去掉下划线；20/24；12/14。
- [x] `widgets/navigation/Pagination.tsx`：24/32；4/6；选中实心。
- [x] `templates/collections/CollectionTemplate.tsx`：`density`；行 24/32；gap 4/8；按钮 sm/md。
- [x] `interaction/drag-drop/*`：预览 6px + overlay shadow；指示线 2px。
- [x] Stories：`Tree`、`Table`、`AssetItem`、`Breadcrumbs`、`Pagination`、`CollectionTemplate`、`DragDrop`。

**验收**：Tree 28 消失；行高只有 24/32；选中只有实心行 + 浅底卡片两种；`pnpm verify` 通过。

### Phase 6 — Templates（已完成 2026-10-26）

**6a Numeric**

- [x] `templates/numeric/numeric-template.styles.ts`：11/12 标签、4/6 gap；删除 3px/10px。
- [x] `NumericSlider.tsx`、`NumericTupleInput.tsx`、`GeometryInputs.tsx`：紧凑/常规两档；轴标签 11/12。

**6b Color**

- [x] `widgets/color/*`：ColorWidget 的 2 个原生 `<select>`→`Select`；gap 8/12；预览/平面 4px；通道标签 12；HEX 12。
- [x] `templates/color/*`：ColorPicker 触发器 24/32、色块 4；RampControls 原生 `<select>`→`Select`；28/30→24/32；3px→4/6；`#fff` 保留为棋盘格功能色；stop 18/20。
- [x] `ColorDistributionTemplate`：模式控制用 SegmentControl compact；面板 6px。

**6c Curve**

- [x] `widgets/curve/CurveWidget.tsx`：原生 `<select>`→`Select`；工具按钮 24/32；标签 11/12；错误 12；面板 6px。
- [x] `templates/curve/*`：CurvePicker/CurvePresets/NumericDistribution 原生 `<select>`→`Select`；控件 24/32；preset 行 24/32。

**6d Resources**

- [x] `templates/resources/ResourcePicker.tsx`：工具栏 24/32；搜索用 `Input`；kind 多选→`Combobox` multiple；group→`Select`；分页/网格间距统一。
- [x] `templates/resources/AssetReferenceInput.tsx`：字段 48 例外、6px；padding 8/12；name 12/14；meta 11/12；按钮 sm；Popover 12。
- [x] Stories：`NumericSlider`、`NumericTupleInput`、`ColorWidget`、`ColorRamp`、`ColorRampChannels`、`ColorDistribution`、`CurveWidget`、`CurvePicker`、`NumericDistribution`、`ResourcePicker`、`AssetReferenceInput`。

**验收**：组件源码中 0 个原生 `<select>`；颜色/曲线/资源控件只有 24/32；无 2/3px 圆角（文档化的功能色除外）；`pnpm verify` 通过。

### Phase 7 — Property（2 天）

- [ ] `property/PropertyField.tsx`：新增 `density`；内置控件按 compact=sm、regular=md 传入；label/description/error 12/14；只读/禁用/混合/pending 统一。
- [ ] `layout/PropertyRow.tsx` 的 `density` 透传/对齐。
- [ ] Stories：`PropertyField`、`PropertyFieldComplex`、`PropertyContracts`、`ResourceHost`。
- [ ] `PropertyContracts` 的标题/说明保持 `Contracts/Property editing`；状态面板改为 `StoryState`，不再首屏 JSON。

**验收**：属性表单在两档下高度、标签、错误展示一致；build 通过。

### Phase 8 — Storybook 收尾与清理（4 天）

- [ ] 迁移剩余 story；确保 57/57 文件使用 `StoryPage`。
- [ ] 规范所有 meta title；docs 页面只展示 Overview。
- [ ] 删除 `stories/support/ContractFrame.tsx`、`contractStyles`、`ControlButton/Input/Select`（若已无引用）。
- [ ] 删除所有 story 中的原生 `<input>`/`<select>` demo 控件；如确需，使用 `StoryField` + 库控件。
- [ ] 清理未使用 token/keyframes/deprecated 别名；更新 `panda/README`、`packages/interface/README`、`docs/DEVELOPMENT`、`docs/CONSUMING`。
- [ ] 新增 `scripts/audit-styles.mjs`：扫描裸 px 的 height/minHeight/borderRadius/fontSize，允许内容尺寸白名单；先 report，再 fail。
- [ ] 新增 `scripts/audit-stories.mjs`：扫描 `ContractFrame|contractStyles|ControlButton|<select|<input`、meta title 格式；失败即报错。
- [ ] `package.json` 增加 `audit:styles`、`audit:stories`，并接入 `verify`。
- [ ] 最终 `pnpm verify`（prettier + typecheck + demo build + storybook build）。

**验收**：57/57 story 文件统一；0 `ContractFrame`；0 原生 demo select；样式审计 0 违规；`pnpm verify` 全绿。

## 7. 防回归

- `pnpm verify:quick` 在每次 commit 前运行。
- `pnpm build:storybook` 在 Phase 1/2/3/4/5/6/7/8 运行。
- `Foundation/Control matrix` 作为人工代码检查页：两档 × 全部控件 × 默认/禁用/只读/错误/选中。
- `audit:styles` 允许白名单：
  - 图标 width/height
  - 颜色平面 130、预览 48、渐变条 64、AssetReferenceInput 48、竖 Slider 160
  - Checkbox 14/18/22、Kbd 16/20、Badge 16/20
  - 1px 分隔线、2px 指示线
- 任何新增控件尺寸必须使用 `var(--sizes-control*)` / `var(--radii-*)` / `var(--fontSizes-*)`，否则审计失败。

## 8. 风险与待确认

| 项                 | 风险                           | 默认决策                                                                                                      |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| 实心蓝底白字对比度 | 变深会影响品牌观感             | 暗色 `primarySolid` 用 `blue8`，亮色用 `blue11`（亮色 blue8 仅 2.33:1）；accent/focus 保留 `primary`（blue9） |
| `textMuted` 调整   | 亮/暗两端都要 ≥4.5             | 亮色约 `#6b7078`，暗色约 `#8b909a`；以脚本结果为准                                                            |
| Dialog 标题        | 18→16 会显得更紧凑             | 采用 16；与 Section 16 标题、14 正文形成层级                                                                  |
| Checkbox 22px      | 与两档控件不一致               | 保留为 `lg` 触控尺寸，token 化并写注释                                                                        |
| Segment 选中       | 实心蓝 vs 抬升描边             | 统一实心 `selectionBg`；容器仍为 softBg                                                                       |
| 原生多选 kind      | `Select` 不支持多选            | 用 `Combobox` multiple；若过宽，改为单 select + “All kinds”                                                   |
| Autodocs 排除      | SB10 的 `!autodocs` 行为需验证 | Phase 1 验证；不行则拆分 behavior 文件                                                                        |
| 旧 token 删除      | 可能影响外部消费者             | 先标 deprecated，Phase 8 无引用后删除                                                                         |

## 9. 当前违规基线（供验收对照）

- 源文件 176 个，story 文件 57 个；`ContractFrame` 43 个，原生控件 story 22 个。
- `var(--colors-*)` 530 处；`var(--radii-*)` / `var(--space-*)` / `var(--sizes-*)` 0 处。
- 手写 `fontSize: 'Npx'` 121 处；手写 `borderRadius: 'Npx'` 72 处。
- 焦点实现 38 处：4 处 boxShadow、34 处 outline；offset 1/2/3/-2。
- 禁用：opacity .5 ×20、.6 ×2、.65 ×1；另有按钮/输入/菜单/树用换色表达。
- 选中：primary + white、selectionBg + white、border + softBg、surfaceOverlay + inset border 四种。
- 未使用语义色 token 19 个；未使用 keyframes 10 个。
- 原生 `<select>` 9 处（ColorWidget、RampControls、ColorRampChannels、CurveWidget、CurvePresets、ResourcePicker）。

---

## 附：提交顺序

1. `docs(design): add style unification plan`
2. `refactor(tokens): add density, surfaces, states and motion tokens`
3. `refactor(foundation): unify typography, display and feedback`
4. `docs(storybook): add story kit and migrate foundation stories`
5. `refactor(inputs): unify core form controls`
6. `docs(storybook): rewrite core input stories`
7. `refactor(layout): unify panels and property rows`
8. `refactor(overlays): unify surfaces, dialogs and menus`
9. `refactor(collections): unify tree, table, asset and navigation`
10. `refactor(templates): unify numeric, color, curve and resource editors`
11. `refactor(property): add density-aware fields`
12. `chore(storybook): migrate remaining stories and remove demo scaffolding`
13. `chore(design): remove dead tokens, add audits, update docs`
