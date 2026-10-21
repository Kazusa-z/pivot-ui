# Panda Migration Ledger

Last updated: 2026-10-21  
Branch: `feat/panda-css-migration`

This file tracks migration progress, temporary compromises, and the exit criteria for each batch. A temporary compromise is only acceptable if it has an ID, a resolution target, and a verifiable exit criterion here.

## Status

| Phase   | Scope                                                                                                             | State |
| ------- | ----------------------------------------------------------------------------------------------------------------- | ----- |
| Phase 0 | Button / Dialog / FormItemColor pilots                                                                            | Done  |
| Phase 1 | Panda reset, fonts, token aliases, global CSS variables, `css` prop verification                                  | Done  |
| Batch 1 | Flex, Text/Title, Button, Input/InputNumber, Badge, Kbd, Progress, Separator, Spin                                | Done  |
| Batch 2 | Dialog, FormItemColor, ActionButton, EditableText, Popover, Tooltip, Menu, Select/Combobox, Checkbox, Collapsible | Done  |
| Batch 3 | Tree, Table, ColorPicker, BezierCurveEditor, ResizablePanel, AssetPicker                                          | Done  |
| Batch 4 | GUI components and native Panda theme/tokens                                                                      | Done  |
| Batch 5 | Remove Stitches, `resetStyle`, theme/provider and remaining compatibility code                                    | Done  |

## Temporary Compromises

| ID    | Compromise                                                                         | Location                                                          | Why it exists                                                                     | Exit criterion                                                                                                                               | Resolve by                   |
| ----- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| TD-01 | `css?: any` on migrated public components                                          | Button, Flex, Input, Badge, Separator, Progress                   | Remaining consumers still passed Stitches `CSS` objects                           | No `css?: any` remains in migrated components                                                                                                | **Resolved** in this pass    |
| TD-02 | Button passed explicit inline Spin width/height                                    | Button                                                            | Spin used to be a Stitches component whose unlayered styles beat Panda utilities  | Spin is Panda; Button uses size-variant selectors again                                                                                      | **Resolved**                 |
| TD-03 | `ActionButton` still uses the Stitches `button` recipe                             | ActionButton                                                      | Not included in Batch 1                                                           | ActionButton migrated; Stitches `button` recipe has no consumers                                                                             | **Resolved**                 |
| TD-04 | Pilot duplicates remain                                                            | `panda-pilot/*`                                                   | Used for visual comparison during the pilot phase                                 | Production Dialog/FormItemColor migrated; all pilot files and pilot stories removed                                                          | **Resolved**                 |
| TD-05 | Global CSS variables are generated from Stitches token sources                     | `panda/global.ts`                                                 | Keeps light/dark theme behavior while components migrate                          | Panda token snapshot owns values; no runtime dependency on Stitches token modules                                                            | **Resolved**                 |
| TD-06 | `resetStyle`, `ThemeProvider` and `.light-theme` were Stitches-backed              | design-system / app                                               | Full theme migration was deferred                                                 | Panda owns reset/tokens; ThemeProvider uses plain theme classes; `resetStyle` export removed                                                 | **Resolved**                 |
| TD-07 | Remaining Stitches components and stories still use `$token` CSS values            | Remaining `packages/ui` and `packages/gui` files                  | They have not been migrated yet                                                   | No migrated component/story CSS uses `$token`; token sources remain only for the snapshot generator                                          | **Resolved**                 |
| TD-08 | Button cast `Slot`/`StyledButton` to `any`                                         | Button                                                            | The two components have different prop shapes                                     | Typed `asChild` / `StyledButton` branches; only a DOM-boundary cast remains                                                                  | **Resolved**                 |
| TD-09 | Numeric `Text`/`Title` size props and boolean `Flex.wrap` are breaking API changes | Typography, Flex                                                  | Panda variants are numeric/boolean                                                | Document migration notes in package README; update local usages                                                                              | **Resolved**; README updated |
| TD-10 | `EditableText` still types `css` as `any`                                          | EditableText                                                      | It still wrapped a Stitches `Container`                                           | EditableText migrated; `css` is `SystemStyleObject`                                                                                          | **Resolved**                 |
| TD-11 | Menu/Select style configs cast to `any`                                            | `Menu/Menu.tsx`, `Select/Combobox.tsx`, `Select/SingleSelect.tsx` | Panda custom-component `styled` overload rejects config objects held in variables | **Resolved:** configs were inlined at the call sites; no `as any` remains; static extraction and all Select/Menu stories are pixel-identical | **Resolved**                 |
| TD-12 | ColorPicker injects react-colorful overrides at runtime                            | `panda/global.ts`                                                 | Third-party CSS must beat the unlayered library styles                            | **Resolved:** overrides live in Panda global CSS with `!important`; runtime injector removed; picker measures 220x180                        | **Resolved**                 |

## Resolution Schedule

## Resolution notes

- TD-01: Button/Flex/Input/Badge/Separator/Progress now accept `SystemStyleObject`.
- TD-02: Button Spin sizing is CSS-driven again.
- TD-04: pilots removed; Dialog and FormItemColor are production implementations.
- TD-08: Button uses explicit typed branches instead of `as any`.
- TD-09: package migration notes added.
- TD-10: EditableText migrated and its `css` prop narrowed.
- TD-11: Menu/Select configs were inlined; `menuStyles.ts` and `selectStyles.ts` were removed. No `as any` remains, and Menu/Select stories are pixel-identical.
- TD-12: react-colorful overrides live in Panda global CSS with `!important`; the runtime injector was removed. The picker measures 220x180.
- Batch 3: Table, Tree, ResizablePanel, ColorPicker, BezierCurveEditor and AssetPicker migrated.
- Batch 4: GUI local styles are Panda; ResizablePanel and AssetPicker have runtime stories; the Panda token snapshot owns token values.
- Batch 5: `@stitches/react` and the Stitches design-system runtime were removed. ThemeProvider uses plain `light-theme` / `dark-theme` classes; reset is loaded through Panda CSS.

### Visual regression

- All 111 stories shared by the Stitches baseline and the Panda branch were captured and compared.
- 94 pixel-identical; 15 subpixel/text-antialias-only differences (<= 0.2%); 2 reviewed exceptions.
- Full details: `panda/VISUAL_REGRESSION.md` and `panda/visual-regression-report.json`.

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
- ActionButton no longer exposes the unused `as` prop.
- `resetStyle` was removed; consumers must load the Panda CSS entry.
- `styled` / `css` exported by `@pivot-ui/editor` now come from Panda.
- GUI `FormItem.fieldColumn` numeric variants use numbers (`fieldColumn={1}`), not strings.
