# Development guide

## Environment and commands

Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0`; pnpm `12.14.0`. Install with `pnpm install --frozen-lockfile`.

| Command                           | Purpose                                                                    |
| --------------------------------- | -------------------------------------------------------------------------- |
| `pnpm dev` / `pnpm dev:interface` | Unified Storybook on port 6009                                             |
| `pnpm dev:demo`                   | Existing Vite demo                                                         |
| `pnpm typecheck`                  | Production, stories/support, tooling, pure contracts/values and demo types |
| `pnpm build:demo`                 | Production demo                                                            |
| `pnpm build:storybook`            | Unified Storybook production site                                          |
| `pnpm verify:quick`               | Repository Prettier check and typecheck                                    |
| `pnpm verify`                     | Formatting, types and both production builds                               |
| `pnpm clean`                      | Generated style modules, build outputs and caches                          |

The workspace contains only `packages/interface` (`@pivot-ui/react`) and `app` (`@pivot-ui/demo`). The former UI/GUI package split and their development commands ended in B11. Builds remain source-package consumption checks, not an npm release.

## Layers and ownership

`values` contains pure data and algorithms; `contracts` contains pure property and host interfaces. Neither layer imports React, DOM, Node, widgets or an engine. `foundation` owns visual primitives and theme adapters; `interaction` owns reusable React input lifecycles; `widgets` owns independent controls; `layout` owns structural composition; `templates` combines controls; `property` connects these to one `PropertyAccess<T>`.

Applications own data loading, selection of domain objects, commands, undo, real resources, file access and future C++ / Qt transport. Storybook mocks stay in `stories/support` and are not exported by the library. Avoid business state, implicit schema-generated pages and engine handles in components.

Use stable IDs for collections, gradient stops, curve points and resources. Keep view state (selection, zoom, browsing, display encoding, mode caches) separate from property values. One gesture has one edit session and at most one history entry. Preview remains immediate while host acknowledgement may be delayed.

## Theme and Storybook

The shared decorator supplies the Theme toolbar and TooltipProvider. Theme changes affect actual CSS variables, including portals; it does not persist the preview preference into application storage. Applications provide their own TooltipProvider and scoped notification/confirmation services.

`Foundation / Tokens` preserves the full semantic color, surface, size, spacing, typography, radius and shadow catalogue with side-by-side themes. `Foundation / Theme` covers injected theme stores. `Property` covers scalar and complex bindings. Runtime logs, keyboard behavior and narrow layouts are acceptance evidence; merely adding a story does not verify it.

`storybook/vite.ts` gives Storybook's prebundled preview/docs runtimes a 1200 kB warning budget. The demo retains Vite's default. Only browser-irrelevant module `use client` directive warnings are filtered; other build warnings remain enabled.

## Panda pipeline

`panda/base.ts`, `global.ts`, `theme.ts`, `reset.ts` and the data-only `token-source` form the shared source. Regenerate token snapshots with `node panda/generate-tokens.mjs`. The source package's `panda.css` declares layers; each consuming build runs PostCSS extraction and scans both its own files and `packages/interface/src`.

```bash
pnpm --filter @pivot-ui/react panda
```

Dev/typecheck/build pre-scripts generate `styled-system`, including after cleaning. Never commit generated modules or build outputs. A source-linked application must generate the library's modules as well as its own extracted CSS.

- Inside the package import `styled-system/css`, `/jsx` and `/tokens` directly. Consumers use the corresponding public `@pivot-ui/react/styling/*` paths registered in `pandaBase.importMap`.
- Do not hide `styled` behind a re-export facade. Keep recipe creation and `recipe.raw()` composition in one source module.
- Use explicit semantic props and avoid CSS-name collisions in styled variants. Put SVG `d` on a plain path with a CSS class; Panda treats `d` as a display shorthand.
- Use `content: '""'` for empty pseudo-elements and CSS variables or tokens instead of legacy `$token` strings.
- Layout refs, input refs and scroll viewport refs have separate meanings. Labels and help IDs are explicit; do not scan or clone unknown children.

## Verification and delivery

```bash
pnpm verify
pnpm install --frozen-lockfile
pnpm dedupe --check
```

All TypeScript projects use strict mode. The pure project checks ES2022 without React/DOM/Node ambient types and without skipLibCheck. App production and Vite/Panda tooling are checked separately. For release acceptance, regenerate from clean outputs and exercise both dev and static production builds.

Verify continuous preview/commit/cancel, mixed and readonly values, asynchronous rejection and stale completion, target/revision changes, portal focus and themes, collection identity and keyboard navigation. The [B11 guide](./refactor/blender-5.2/B11_INTEGRATION.md) defines integration details; individual batch guides retain focused regression scenarios.

Temporary probes and evidence belong in the operating system temporary directory. Do not add independent test files. Keep LF endings. Each batch finishes with an updated ledger, a clear Git commit and a push; confirm the remote SHA. Do not use stale build output as acceptance evidence.

## Documentation

Current instructions belong in [CONSUMING.md](./CONSUMING.md), the [package guide](../packages/interface/README.md) and this document. B01–B10 migration notes and original disposition tables preserve historical names; B11 supersedes their temporary adapter instructions. [Earlier migration records](./RELEASE_ARCHIVE.md) are archives, not current integration instructions.
