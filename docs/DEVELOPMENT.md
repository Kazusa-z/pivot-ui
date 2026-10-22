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
panda/               shared Panda configuration, tokens and reset
docs/                integration, development and archive documentation
```

Both component packages are source packages. They are consumed through `workspace:*` or a package link; the repository does not produce a `dist` bundle or an npm release.

## Commands

| Command                | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `pnpm dev`             | Editor Storybook                                                  |
| `pnpm dev:gui`         | GUI Storybook                                                     |
| `pnpm dev:demo`        | Demo application                                                  |
| `pnpm typecheck`       | Type-check all packages and the app                               |
| `pnpm build:demo`      | Build the demo application                                        |
| `pnpm build:storybook` | Build both Storybook sites                                        |
| `pnpm verify:quick`    | Prettier check + typecheck                                        |
| `pnpm verify`          | Full verification: formatting, types, demo build, both Storybooks |
| `pnpm clean`           | Remove generated builds and caches                                |

The Editor Storybook runs on port `6007`; the GUI Storybook runs on `6008`.

Both explorers share `storybook/vite.ts`. Their prebundled preview and docs runtimes use a 1200 kB chunk warning budget; the demo keeps Vite's default budget. Only the irrelevant `use client` module-directive warnings are filtered in these browser-only explorers. Other build warnings remain enabled.

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
```

### Token snapshot

`panda/generate-tokens.mjs` reads the data-only token sources in `panda/token-source/` and writes `panda/designTokens.ts`:

```bash
node panda/generate-tokens.mjs
```

The generator uses `esbuild`, declared as a workspace dev dependency.

## Styling conventions

- Import runtime styling directly from `styled-system/jsx` and `styled-system/css` inside package source. A local `styled` re-export breaks Panda's static extraction.
- Do not use CSS property names as variant names. Use `orientation`, `spacing` and `justify` on styled layout wrappers instead of `direction`, `gap` and `justifyContent`.
- Do not pass SVG `d` through a Panda `styled` wrapper; `d` is consumed as the CSS `display` shorthand. Use a `css()` class on a plain `<path>`.
- Empty pseudo-element content must be written as `content: '""'`.
- Prefer inline style configs for custom and Radix components; config objects held in variables can require type casts and weaken static extraction.
- Use CSS variables (`var(--colors-...)`) or `token(...)` calls in `css` values.

## Verification

Run before merging:

```bash
pnpm verify
pnpm install --frozen-lockfile
pnpm dedupe --check
```

`pnpm verify` runs Prettier, TypeScript, the demo build and both Storybook builds.

Git and Prettier use LF line endings on every platform. Temporary verification scripts and outputs belong in the ignored `temp/` directory and are excluded from formatting checks.

## Documentation conventions

- Integration behavior belongs in [CONSUMING.md](./CONSUMING.md) and the package READMEs.
- Repository workflow belongs in this guide.
- Historical project records are kept in the [project archive](./RELEASE_ARCHIVE.md). Archive documents are immutable records and are not a work plan.
- When changing a public API, update the relevant package README and Storybook description in the same change.
