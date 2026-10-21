# Panda Migration Ledger

Last updated: 2026-10-21  
Branch: `feat/panda-css-migration`

This file tracks migration progress, temporary compromises, and the exit criteria for each batch. A temporary compromise is only acceptable if it has an ID, a resolution target, and a verifiable exit criterion here.

## Status

| Phase   | Scope                                                                                                             | State   |
| ------- | ----------------------------------------------------------------------------------------------------------------- | ------- |
| Phase 0 | Button / Dialog / FormItemColor pilots                                                                            | Done    |
| Phase 1 | Panda reset, fonts, token aliases, global CSS variables, `css` prop verification                                  | Done    |
| Batch 1 | Flex, Text/Title, Button, Input/InputNumber, Badge, Kbd, Progress, Separator, Spin                                | Done    |
| Batch 2 | Dialog, FormItemColor, ActionButton, EditableText, Popover, Tooltip, Menu, Select/Combobox, Checkbox, Collapsible | Done    |
| Batch 3 | Tree, Table, ColorPicker, BezierCurveEditor, ResizablePanel, AssetPicker                                          | Pending |
| Batch 4 | GUI components and native Panda theme/tokens                                                                      | Pending |
| Batch 5 | Remove Stitches, `resetStyle`, theme/provider and remaining compatibility code                                    | Pending |

## Temporary Compromises

| ID    | Compromise                                                                         | Location                                         | Why it exists                                                                       | Exit criterion                                                                      | Resolve by                   |
| ----- | ---------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------- |
| TD-01 | `css?: any` on migrated public components                                          | Button, Flex, Input, Badge, Separator, Progress  | Remaining consumers still passed Stitches `CSS` objects                             | No `css?: any` remains in migrated components                                       | **Resolved** in this pass    |
| TD-02 | Button passed explicit inline Spin width/height                                    | Button                                           | Spin used to be a Stitches component whose unlayered styles beat Panda utilities    | Spin is Panda; Button uses size-variant selectors again                             | **Resolved**                 |
| TD-03 | `ActionButton` still uses the Stitches `button` recipe                             | ActionButton                                     | Not included in Batch 1                                                             | ActionButton migrated; Stitches `button` recipe has no consumers                    | **Resolved**                 |
| TD-04 | Pilot duplicates remain                                                            | `panda-pilot/*`                                  | Used for visual comparison during the pilot phase                                   | Production Dialog/FormItemColor migrated; all pilot files and pilot stories removed | **Resolved**                 |
| TD-05 | Global CSS variables are generated from Stitches token sources                     | `panda/global.ts`                                | Keeps light/dark theme behavior while components migrate                            | Panda token snapshot owns values; no runtime dependency on Stitches token modules   | **Resolved**                 |
| TD-06 | `resetStyle`, `ThemeProvider` and `.light-theme` are still Stitches-backed         | design-system / app                              | Full theme migration is deferred                                                    | Panda owns reset, theme tokens and theme switching; Stitches reset exports removed  | Batch 5                      |
| TD-07 | Remaining Stitches components and stories still use `$token` CSS values            | Remaining `packages/ui` and `packages/gui` files | They have not been migrated yet                                                     | Each migrated component has no `$token` values in its own CSS paths                 | Per batch                    |
| TD-08 | Button cast `Slot`/`StyledButton` to `any`                                         | Button                                           | The two components have different prop shapes                                       | Typed `asChild` / `StyledButton` branches; only a DOM-boundary cast remains         | **Resolved**                 |
| TD-09 | Numeric `Text`/`Title` size props and boolean `Flex.wrap` are breaking API changes | Typography, Flex                                 | Panda variants are numeric/boolean                                                  | Document migration notes in package README; update local usages                     | **Resolved**; README updated |
| TD-10 | `EditableText` still types `css` as `any`                                          | EditableText                                     | It still wrapped a Stitches `Container`                                             | EditableText migrated; `css` is `SystemStyleObject`                                 | **Resolved**                 |
| TD-11 | Menu/Select style configs cast to `any`                                            | `Menu/menuStyles.ts`, `Select/selectStyles.ts`   | Panda's custom-component `styled` overload rejects config objects held in variables | Inline configs or a typed helper remove the casts while keeping static extraction   | Batch 5                      |
| TD-12 | ColorPicker injects react-colorful overrides at runtime                            | `ColorPicker/colorPickerOverrides.ts`            | Third-party CSS must stay unlayered; runtime injection is framework-agnostic        | **Resolved (accepted):** no Stitches dependency and works in app/Storybook/GUI      | **Resolved**                 |

## Resolution Schedule

### Resolved in this batch pass

- TD-01: Button/Flex/Input/Badge/Separator/Progress now accept `SystemStyleObject`.
- TD-02: Button Spin sizing is CSS-driven again.
- TD-04: pilots removed; Dialog and FormItemColor are production implementations.
- TD-08: Button uses explicit typed branches instead of `as any`.
- TD-09: package migration notes added.
- Dialog animations moved to Panda keyframes; FormItemColor production implementation owns the Panda badge.
- TD-03: ActionButton migrated; Stitches `button` recipe removed.
- TD-10: EditableText migrated and its `css` prop narrowed.
- Batch 3: Table, Tree, ResizablePanel, ColorPicker, BezierCurveEditor and AssetPicker migrated. ColorPicker’s react-colorful overrides are injected at runtime and tracked as TD-12.

### Batch 4 closed

- GUI local styles are Panda; FormItem, Label, Panel, GUIRoot wrapper, FormItemArray and AssetPicker content migrated.
- ResizablePanel and AssetPicker now have runtime stories.
- FormItemColor production screenshot hash is unchanged after the GUI style migration.

- All local GUI `styled` usages were migrated to Panda; GUIRoot still calls the shared Stitches-backed `resetStyle` (TD-06).
- ResizablePanel and AssetPicker have runtime stories.
- `panda/designTokens.ts` is a generated, Panda-owned snapshot; `panda/global.ts` no longer imports Stitches token modules.
- TD-12 is accepted as a deliberate third-party CSS injection; TD-11 is carried to Batch 5.

### Batch 4 closed

- Native Panda token snapshot and global theme variables are in place.
- TD-11 (Menu/Select config casts) remains for Batch 5.

### Batch 3 closed

- All Batch 3 components are migrated; Table/Tree/ColorPicker/Bezier have runtime checks, ResizablePanel is covered by type/build checks pending a story.

### Batch 2 closed

- All Batch 2 components are migrated and covered by runtime checks.
- TD-07 remains for Batch 3/4 components and the remaining Stitches stories.

### Batch 3–4

- Continue removing `$token` usage component by component (TD-07).
- Replace the Stitches-token-derived global variables with native Panda theme values (TD-05).
- Replace Menu/Select `as any` style configs with a typed helper (TD-11).

### Batch 5

- Remove Stitches `resetStyle`, `ThemeProvider`, theme classes and `createStitches` usage (TD-06).
- Remove Stitches dependencies and any compatibility types.

## Batch Definition of Done

A batch is complete only when:

1. The migrated components have no `styled`/`css` imports from the Stitches design system.
2. Their public `css` values are Panda-compatible, or the remaining debt has a TD entry.
3. `pnpm verify` passes.
4. Representative components have computed-style checks against the previous implementation.
5. Unchanged GUI surfaces that depend on the migrated components keep an identical screenshot hash at the same viewport.
6. No new `$token` values are introduced in migrated code.
7. The batch commit is independently revertible.

## Verification Commands

```bash
pnpm verify
pnpm install --frozen-lockfile
pnpm dedupe --check
```

For a component batch, also run a Storybook computed-style check and, where the GUI is affected, the same-size screenshot hash comparison.

## Known API Changes

- `Text` / `Title` numeric sizes are numbers: `size={2}`, not `size="2"`.
- `Flex.wrap` is boolean (`true` / `false`) or `"reverse"`, not `"false"`.
- Migrated components accept Panda `css` props; `$token` values must be replaced with raw CSS variables or `token(...)` calls.
- Custom `css` on Button `asChild` is intentionally not forwarded; style the slotted child directly.
- ActionButton no longer exposes the unused `as` prop; its DOM `as`/polymorphic behavior was not in use.
- GUI `FormItem.fieldColumn` numeric variants use numbers (`fieldColumn={1}`), not strings.
