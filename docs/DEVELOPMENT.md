# Development

## Environment

- Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0`
- pnpm `12.14.0`
- pnpm workspace with a hoisted node linker

```bash
pnpm install
```

## Workspace layout

```text
app/                 demo Vite application
packages/ui/         @pivot-ui/editor
packages/gui/        @pivot-ui/gui
panda/               shared Panda config, tokens, reset and codegen helpers
docs/                formal documentation and migration archive
```

The packages are source-only. They are consumed through `workspace:*` or a local `pnpm link`; there is no npm publish or `dist` build.

## Common commands

| Command                | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `pnpm dev`             | Editor Storybook                                                 |
| `pnpm dev:gui`         | GUI Storybook                                                    |
| `pnpm dev:demo`        | Demo application                                                 |
| `pnpm typecheck`       | Type-check all packages and the app                              |
| `pnpm build:app`       | Build the demo application                                       |
| `pnpm build:storybook` | Build both Storybook sites                                       |
| `pnpm verify:quick`    | Prettier check + typecheck                                       |
| `pnpm verify`          | Full verification: formatting, types, app build, both Storybooks |
| `pnpm clean`           | Remove generated builds and caches                               |

Storybook package scripts default to port `6006`. When running both sites at once, pass a different port, for example:

```bash
pnpm --filter @pivot-ui/editor exec storybook dev -p 6007 --no-open
pnpm --filter @pivot-ui/gui exec storybook dev -p 6008 --no-open
```

## Panda CSS pipeline

Panda configuration is shared from `panda/base.ts`:

- `panda/base.ts` — shared config, keyframes and `pandaBase`
- `panda/global.ts` — reset, font faces and semantic CSS variables
- `panda/theme.ts` — Panda token aliases
- `panda/designTokens.ts` — generated token snapshot
- `panda/reset.ts` — reset styles

Each package has its own `panda.config.ts` and `postcss.config.cjs`. The `panda.css` files only declare the layer order; Panda's PostCSS plugin injects the generated styles at build time.

After changing Panda configuration, regenerate the package types:

```bash
pnpm --filter @pivot-ui/editor panda
pnpm --filter @pivot-ui/gui panda
```

### Regenerate the token snapshot

`panda/generate-tokens.mjs` reads the data-only token sources in `packages/ui/src/design-system/` and writes `panda/designTokens.ts`:

```bash
node panda/generate-tokens.mjs
```

The generator uses `esbuild` directly; it is declared as a workspace dev dependency.

## Styling conventions

- Import runtime styling directly from `styled-system/jsx` and `styled-system/css` inside package source. Do not re-export a local `styled` facade; Panda's static extractor does not follow it.
- Avoid variant names that collide with CSS properties (`direction`, `gap`, `justifyContent`). Use semantic variant names such as `orientation`, `spacing` and `justify`.
- Do not pass SVG `d` through a Panda `styled` wrapper; it is consumed as the CSS `display` shorthand. Use a `css()` class on a plain `<path>`.
- Empty pseudo-element content must be serialized as `content: '""'`; an empty string is dropped.
- Prefer inline style configs for custom/Radix components. Config objects held in variables can require type casts and weaken static extraction.

## Verification and visual regression

`pnpm verify` is the required check before archiving a change. The completed migration archive was additionally checked against the last Stitches build:

- Baseline: commit `4c8b588`
- 111 shared stories (103 UI, 8 GUI)
- Chromium at `1000x800`, full-page screenshots
- fonts loaded, animations/transitions disabled
- per-channel pixel threshold of 5/255

See [migration/VISUAL_REGRESSION.md](./migration/VISUAL_REGRESSION.md) for the archived result.

## Documentation maintenance

- Consumer-facing behavior belongs in this `docs/` directory or the package READMEs.
- The migration ledger and visual report are historical archives; do not turn them into an active work plan.
- Update [RELEASE_ARCHIVE.md](./RELEASE_ARCHIVE.md) only for a new formal archive.
