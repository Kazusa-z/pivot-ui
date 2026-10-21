# Release archive: Panda CSS migration

| Field                     | Value                              |
| ------------------------- | ---------------------------------- |
| Archive                   | `pivot-ui-panda-2026-10-22`        |
| Archive tag               | `pivot-ui-panda-2026-10-22`        |
| Status                    | Closed                             |
| Archive date              | 2026-10-22                         |
| Workspace version         | `1.0.0`                            |
| `@pivot-ui/editor`        | `1.2.0`                            |
| `@pivot-ui/gui`           | `1.2.1`                            |
| Branch                    | `feat/panda-css-migration`         |
| Migration baseline commit | `925a7bf`                          |
| Distribution              | Source packages in this repository |

## Scope

This archive covers the complete move from Stitches to Panda CSS across the workspace:

- `@pivot-ui/editor` components, stories, reset, tokens and theme provider
- `@pivot-ui/gui` components and the imperative GUI class
- the demo application
- both Storybook documentation sites
- removal of the Stitches dependency and runtime

The migration was delivered in phases and batches. Every batch had an independent, revertible commit and a recorded exit criterion. The historical ledger is [migration/LEDGER.md](./migration/LEDGER.md).

## Final state

- Panda CSS owns component styling, reset, tokens and theme variables.
- `@stitches/react` is absent from the packages and lockfile.
- `ThemeProvider` uses plain `light-theme` / `dark-theme` classes.
- The runtime `resetStyle()` helper was removed.
- The generated token snapshot is `panda/designTokens.ts`; Panda no longer imports Stitches token modules at runtime.
- All tracked migration debt (TD-01 through TD-12) is resolved.
- The workspace remains a source-package monorepo; there is no published package artifact, CI pipeline, `dist` bundle or UMD build.

## Verification

The archive state passes:

```bash
pnpm verify
pnpm install --frozen-lockfile
pnpm dedupe --check
```

`pnpm verify` covers formatting, TypeScript, the demo app build and both Storybook builds.

### Visual regression

The migration was compared against the last Stitches version (`4c8b588`) using 111 stories shared by both builds:

| Result                                 | Count |
| -------------------------------------- | ----: |
| Compared stories                       |   111 |
| Pixel-identical                        |    94 |
| Subpixel/text antialias only (<= 0.2%) |    15 |
| Reviewed exceptions                    |     2 |
| Size changes                           |     0 |

The two reviewed exceptions are documented in [migration/VISUAL_REGRESSION.md](./migration/VISUAL_REGRESSION.md):

- `inputs-textarea--states`: an old Stitches CSS-injection-order inconsistency; Panda now renders deterministically and matches the larger `Matrix` fixture.
- `display-tree--overview`: an intentional story-content change from Batch 3, not a component regression.

## Integration notes

- A consuming application must configure Panda/PostCSS and load the package CSS layer entry. See [CONSUMING.md](./CONSUMING.md).
- Visual-regression screenshots are regenerated artifacts and are not stored in the repository; the per-story results are archived in `migration/visual-regression-report.json`.

## Archive provenance

- Archive tag: `pivot-ui-panda-2026-10-22`
- Migration ledger: [migration/LEDGER.md](./migration/LEDGER.md)
- Visual regression: [migration/VISUAL_REGRESSION.md](./migration/VISUAL_REGRESSION.md)

## Artifacts

- [Migration ledger](./migration/LEDGER.md)
- [Visual regression report](./migration/VISUAL_REGRESSION.md)
- [Visual regression raw results](./migration/visual-regression-report.json)
- [Panda infrastructure notes](../panda/README.md)
- [Repository README](../README.md)
