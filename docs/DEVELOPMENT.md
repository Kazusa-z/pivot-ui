# Development guide

This guide covers repository setup, the Panda CSS pipeline, verification and documentation conventions.

## Environment

- Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0`
- pnpm `12.14.0`
- pnpm workspace with a hoisted node linker

```bash
pnpm install
```

## Repository layout

```text
app/                 @pivot-ui/demo Vite application
packages/ui/         @pivot-ui/editor
packages/gui/        @pivot-ui/gui
packages/interface/  @pivot-ui/react (unified package under refactor)
panda/               shared Panda configuration, tokens and reset
docs/                integration, development and archive documentation
```

Library packages are source packages. They are consumed through `workspace:*` or a package link; the repository does not produce a `dist` bundle or an npm release. `@pivot-ui/react` provides property contracts, B02 visual foundations and B03 layouts, property-row parts, display, disclosure, scrolling and resizable panes. B04 adds overlays, menus, dialogs and scoped confirmation/notification services. B05 adds text and choice widgets, shared text-edit sessions and text/boolean/enum `PropertyField` bindings. B06 adds numeric rules, input and slider lifecycles, geometry templates and number property bindings. B07 adds collection models, Tree, native Table/DataTable, Breadcrumbs/Pagination and scoped drag/drop. Migrated `ui` entries forward to the unified implementation; eighteen GUI FormItem wrappers from B05–B09 are removed in favor of explicit composition. Other controls remain in the transitional packages until their migration batch. The ledger records acceptance status separately from the available API.

## Commands

| Command                | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `pnpm dev`             | Editor Storybook                                                 |
| `pnpm dev:gui`         | GUI Storybook                                                    |
| `pnpm dev:interface`   | Unified components, layouts and contract Storybook               |
| `pnpm dev:demo`        | Demo application                                                 |
| `pnpm typecheck`       | Type-check all packages and the app                              |
| `pnpm build:demo`      | Build the demo application                                       |
| `pnpm build:storybook` | Build all three Storybook sites                                  |
| `pnpm verify:quick`    | Prettier check + typecheck                                       |
| `pnpm verify`          | Full verification: formatting, types, demo build, all Storybooks |
| `pnpm clean`           | Remove generated builds and caches                               |

The Editor Storybook runs on port `6007`; the GUI Storybook runs on `6008`; the unified package Storybook runs on `6009`.

All explorers share the **Theme** toolbar in `storybook/theme.tsx`. It switches the actual document theme, including portaled menus and dialogs. The editor's **Foundations / Design System / Overview** story compares light and dark surfaces and documents colors, sizes, spacing, typography, radii and shadows using the current Panda tokens.

The toolbar uses the unified theme store and Provider. It supplies its own appearance adapter without browser persistence, so changing a story does not overwrite the application's theme preference. Theme examples use scoped appearance adapters to demonstrate system changes and shared consumers without competing for the document theme.

The shared decorator also provides TooltipProvider for all three Storybooks. This is an explorer composition boundary; actual applications still provide their own boundary. B04 surfaces attach the inherited resolved theme directly to portaled content, so local providers can differ from the document theme. Confirmation and notification stories create/inject their own services and clean up their own hosts.

All explorers share `storybook/vite.ts`. Their prebundled preview and docs runtimes use a 1200 kB chunk warning budget; the demo keeps Vite's default budget. Only the irrelevant `use client` module-directive warnings are filtered in these browser-only explorers. Other build warnings remain enabled.

## Panda CSS pipeline

Panda configuration is shared from `panda/base.ts`:

- `panda/base.ts` — shared config, keyframes and `pandaBase`
- `panda/global.ts` — reset, font faces and light/dark CSS variables
- `panda/theme.ts` — Panda token aliases
- `panda/designTokens.ts` — generated token snapshot
- `panda/reset.ts` — reset styles

Each package has its own `panda.config.ts` and `postcss.config.cjs`. The `panda.css` files declare layer order; Panda's PostCSS plugin injects generated styles during the build.

After changing Panda configuration, regenerate the package types:

```bash
pnpm --filter @pivot-ui/editor panda
pnpm --filter @pivot-ui/gui panda
pnpm --filter @pivot-ui/react panda
```

Source-link consumers must also generate `@pivot-ui/react` styling modules before importing migrated components, including through old UI/GUI adapters. Their Panda configs scan `packages/interface/src/**/*.{ts,tsx}` as well as application source and any transitional package sources they use; generating modules does not replace the consumer's own CSS extraction and PostCSS build.

### Token snapshot

`panda/generate-tokens.mjs` reads the data-only token sources in `panda/token-source/` and writes `panda/designTokens.ts`:

```bash
node panda/generate-tokens.mjs
```

The generator uses `esbuild`, declared as a workspace dev dependency.

## Styling conventions

- Import runtime styling directly from `styled-system/jsx` and `styled-system/css` inside package source. A local `styled` re-export breaks Panda's static extraction.
- Consumers use `@pivot-ui/react/styling/css`, `/styling/jsx`, `/styling/tokens` and the type-only `/styling/types`. These resolve directly to generated modules; `pandaBase.importMap` registers both the public subpaths and local generated paths.
- Scan the unified package's `src` directory in all consumer configs. The demo and transitional packages generate the required styled-system modules in their pre-scripts, including when started individually after a clean checkout.
- Panda `styled` can consume CSS-like props before forwarding them. Keep semantic props explicit on plain React components, as in the new Flex, and consume them before spreading native props. For remaining styled wrappers, use non-colliding internal variant names. Old Flex aliases are compatibility-only; do not add them to the new API.
- Do not pass SVG `d` through a Panda `styled` wrapper; `d` is consumed as the CSS `display` shorthand. Use a `css()` class on a plain `<path>`.
- Empty pseudo-element content must be written as `content: '""'`.
- Prefer inline style configs for custom and Radix components; config objects held in variables can require type casts and weaken static extraction.
- Keep recipe creation and `recipe.raw()` composition in the same source module. Cross-file consumers can call a helper that returns the final class name; do not spread imported dynamic raw recipes into another recipe and hide extraction diagnostics.
- Use CSS variables (`var(--colors-...)`) or `token(...)` calls in `css` values.

## Verification

Run before merging:

```bash
pnpm verify
pnpm install --frozen-lockfile
pnpm dedupe --check
```

`pnpm verify` runs Prettier, TypeScript, the demo build and all three Storybook builds. The unified package checks production sources, stories/support, tooling and a pure ES2022 project for contracts/values without React, DOM or Node ambient types.

Git and Prettier use LF line endings on every platform. Refactor verification scripts and outputs belong in the operating system's temporary directory and are not committed as standalone tests.

For B03, inspect both the unified stories and legacy consumers. Required checks include label-click focus and description IDs, group and per-control names, long labels and narrow widths, disclosure keyboard/action focus, native scroll events matching the viewport ref, horizontal/vertical scrolling and height limits, and resizable separator keyboard/pointer cancellation. A controlled split must not move unless the parent accepts `onSizeChange`; its commit callback still reports the requested size. Exercise standalone and `primaryAsChild` sizing, both primary sides and RTL, disabled/boundary cases, and light/dark styles. Record actual results in the batch ledger instead of treating the presence of a story as verification.

Property-row implementations must not scan the DOM or infer child control types. Legacy FormItem adapters use explicit control render props or named groups; business-specific column rules remain in consumers. Keep root layout refs separate from input/scroll viewport refs, and put disclosure actions beside, not inside, the trigger button.

For B04, exercise the new Menus, Overlays, Dialogs and Notifications stories plus legacy consumers. Check controlled rejection, repeated open/close, nested Escape order, focus restoration, real unmount, StrictMode, custom portal containers and local light/dark themes. Retained Popovers must preserve state/DOM while closed content effects/refs, focus layers and scroll locks are suspended. Confirm service results settle once, reject duplicate confirmation hosts, and isolate notification IDs/cleanup across services; clear/dismiss/unmount must prevent stale promise completions from recreating notices. Check console diagnostics and Panda extraction as well as screenshots. API and migration details are in the [B04 guide](./refactor/blender-5.2/B04_OVERLAYS.md); record actual evidence in the ledger.

For B05, exercise the unified text/choice stories, PropertyField and remaining rename consumers. Check IME drafts, one submission for Enter plus blur, Escape cancellation, invalid drafts and rejected commits, pending updates, equal-valued revision changes, target replacement and unmount. Check original string/number option identity, empty and mixed values, readonly versus disabled behavior, keyboard/search boundaries and controlled rejection. Verify the removed GUI wrappers have no remaining consumers and keep Mock adapters in stories/support. Details are in the [B05 guide](./refactor/blender-5.2/B05_TEXT_CHOICES.md); numeric binding remains B06.

Each refactor batch finishes with its own verified Git commit and a push to the remote branch. Update the batch ledger and clean temporary project files before committing; confirm the remote commit before starting the next batch.

## Documentation conventions

- Integration behavior belongs in [CONSUMING.md](./CONSUMING.md) and the package READMEs.
- Repository workflow belongs in this guide.
- Historical project records are kept in the [project archive](./RELEASE_ARCHIVE.md). Archive documents are immutable records and are not a work plan.
- When changing a public API, update the relevant package README and Storybook description in the same change.

## B06 numeric regression scope

Numeric fields use the shared rules in values/numeric and the editing callbacks in interaction/numeric. Test a full gesture with live preview and a single terminal result, plus cancellation, pending rejection and external target/revision changes. Composite inputs must preserve one value owner; test zero-axis proportional edits, fixed controlled values, multiple thumbs and fixed-total distributions. Keep probes in the system temporary directory and record actual browser checks in the batch ledger. Do not add independent test files or duplicate rounding logic in a field wrapper.

## B07 collection regression scope

Verify numeric/string key identity, empty and bounded pagination, semantic navigation/table structure, independent tree selection/expansion/focus, keyboard row actions, focus after deletion/reorder, async rename rejection and stale completion. Exercise native drag/drop, provider isolation and cancellation when source/target/reset changes; check both themes and narrow layouts. CollectionTemplate replaces FormItemArray; legacy UI hooks only map their options into the new drag implementation. See the [B07 guide](./refactor/blender-5.2/B07_COLLECTIONS.md).

## B08 color regression scope

Verify normalized RGB/alpha, sRGB/Linear round trips, HDR preview clipping without data loss, inline/popup parity, missing and stale host capabilities. Exercise coincident stop identity, independent color/alpha tracks, selection without writes, keyboard/pointer cancellation, mode cache acceptance, controlled refusal and Reset. See the [B08 guide](./refactor/blender-5.2/B08_COLOR.md).

## B09 curve regression scope

Verify linear/cubic sampling, stable point/handle IDs, range changes, pointer/keyboard cancellation, zoom and selection without value writes, inline/popup parity, optional presets and stale service replies. Exercise all four numeric distribution modes, accepted caches, Reset and host multiplier round trips. The shared value-edit hook also serves B08; rerun color/ramp/distribution lifecycle probes. Keep temporary verification scripts outside the repository. See the [B09 guide](./refactor/blender-5.2/B09_CURVES.md).
