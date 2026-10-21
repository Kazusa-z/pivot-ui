# Panda Migration Ledger

Last updated: 2026-10-21  
Branch: `feat/panda-css-migration`

This file tracks migration progress, temporary compromises, and the exit criteria for each batch. A temporary compromise is only acceptable if it has an ID, a resolution target, and a verifiable exit criterion here.

## Status

| Phase   | Scope                                                                                | State   |
| ------- | ------------------------------------------------------------------------------------ | ------- |
| Phase 0 | Button / Dialog / FormItemColor pilots                                               | Done    |
| Phase 1 | Panda reset, fonts, token aliases, global CSS variables, `css` prop verification     | Done    |
| Batch 1 | Flex, Text/Title, Button, Input/InputNumber, Badge, Kbd, Progress, Separator, Spin   | Done    |
| Batch 2 | Dialog, Popover, Tooltip, Menu, Select/Combobox, Checkbox, Collapsible, ActionButton | Next    |
| Batch 3 | Tree, Table, ColorPicker, BezierCurveEditor, ResizablePanel, AssetPicker             | Pending |
| Batch 4 | GUI components                                                                       | Pending |
| Batch 5 | Remove Stitches, `resetStyle`, theme/provider and remaining compatibility code       | Pending |

## Temporary Compromises

| ID    | Compromise                                                                         | Location                                                                          | Why it exists                                                                    | Exit criterion                                                                                                              | Resolve by                   |
| ----- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| TD-01 | `css?: any` on migrated public components                                          | Button, Flex, Input, Badge, Separator, Progress                                   | Remaining consumers still pass Stitches `CSS` objects and `$token` values        | All consumers use Panda-compatible values; types compile against `SystemStyleObject`; no `css?: any` in migrated components | Start of Batch 2             |
| TD-02 | Button passed explicit inline Spin width/height                                    | Button                                                                            | Spin used to be a Stitches component whose unlayered styles beat Panda utilities | Spin is Panda; Button uses size-variant selectors again                                                                     | **Resolved** in this cleanup |
| TD-03 | `ActionButton` still uses the Stitches `button` recipe                             | ActionButton                                                                      | Not included in Batch 1                                                          | ActionButton migrated; Stitches `button` recipe has no consumers                                                            | Batch 2                      |
| TD-04 | Pilot duplicates remain                                                            | `panda-pilot/PandaButton`, `panda-pilot/PandaDialog`, `panda-pilot/FormItemColor` | Used for visual comparison during the pilot phase                                | Production Dialog/FormItemColor migrated; all pilot files and pilot stories removed                                         | Batch 2                      |
| TD-05 | Global CSS variables are generated from Stitches token sources                     | `panda/global.ts`                                                                 | Keeps light/dark theme behavior while components migrate                         | Panda theme/tokens own the values; no dependency on Stitches token config                                                   | Batch 4                      |
| TD-06 | `resetStyle`, `ThemeProvider` and `.light-theme` are still Stitches-backed         | design-system / app                                                               | Full theme migration is deferred                                                 | Panda owns reset, theme tokens and theme switching; Stitches reset exports removed                                          | Batch 5                      |
| TD-07 | Remaining Stitches components and stories still use `$token` CSS values            | Remaining `packages/ui` and `packages/gui` components                             | They have not been migrated yet                                                  | Each migrated component has no `$token` values in its own CSS paths                                                         | Per batch                    |
| TD-08 | Button casts `Slot`/`StyledButton` to `any`                                        | Button                                                                            | The two components have different prop shapes                                    | A typed polymorphic wrapper replaces the cast                                                                               | Batch 2                      |
| TD-09 | Numeric `Text`/`Title` size props and boolean `Flex.wrap` are breaking API changes | Typography, Flex                                                                  | Panda variants are numeric/boolean                                               | Document migration notes in package README; update all local usages                                                         | Batch 2                      |

## Resolution Schedule

### Now

- TD-02: resolved by removing the inline Spin sizing and restoring `.button-spin` size selectors.
- This ledger is the source of truth for the remaining debt.

### Batch 2

- Promote Dialog and FormItemColor; delete their pilots and the obsolete Button pilot.
- Migrate ActionButton and remove the Stitches `button` recipe if unused.
- Run a `css`/`$token` audit and narrow TD-01/TD-08 types.
- Update README migration notes for the API changes in TD-09.

### Batch 3–4

- Continue removing `$token` usage component by component (TD-07).
- Replace the Stitches-token-derived global variables with native Panda theme values (TD-05).

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
