# Panda CSS infrastructure

This directory contains the single Panda CSS preset and token source used by `@pivot-ui/react`, the transitional `@pivot-ui/editor` / `@pivot-ui/gui` packages, and the demo app. It is configuration infrastructure, not end-user documentation. B02 keeps this shared source instead of duplicating tokens inside the new package.

For the migration record, see:

- [Release archive](../docs/RELEASE_ARCHIVE.md)
- [Migration ledger](../docs/migration/LEDGER.md)
- [Visual regression report](../docs/migration/VISUAL_REGRESSION.md)

## Files

| File                  | Role                                                           |
| --------------------- | -------------------------------------------------------------- |
| `base.ts`             | Shared `pandaBase` config, keyframes and global settings       |
| `global.ts`           | Reset, font faces and light/dark CSS variables                 |
| `theme.ts`            | Panda token aliases                                            |
| `designTokens.ts`     | Generated token snapshot                                       |
| `reset.ts`            | Reset styles                                                   |
| `generate-tokens.mjs` | Regenerates `designTokens.ts` from the data-only token sources |
| `token-source/`       | Color and size source values used by the token generator       |

## Theme model

Panda's prefix is `panda`, so a token resolves through a CSS variable:

```text
--panda-colors-gray3 → var(--colors-gray3)
```

`global.ts` emits all color, spacing, size, radius, shadow, font, weight, line-height and transition variables on `:root` for dark mode and `.light-theme` for light mode. The plain `light-theme` / `dark-theme` classes are managed by `ThemeProvider`.

Panda owns the token snapshot in `designTokens.ts`. `panda/token-source/colors.ts` and `sizes.ts` are data-only inputs for `generate-tokens.mjs`; they are not part of the component runtime.

## Styling rules

- Import runtime styling directly from `styled-system/jsx`, `styled-system/css` and `styled-system/tokens`. Do not create a local `styled` re-export facade; Panda's static extractor does not follow it.
- Consumers may import the public `@pivot-ui/react/styling/css`, `/styling/jsx` and `/styling/tokens` subpaths. These resolve directly to generated modules and are registered alongside `styled-system` in `pandaBase.importMap`. Type-only helpers are available from `/styling/types`.
- Every consumer must scan `packages/interface/src` as well as its own sources; older packages also scan this path while their entries forward to the new implementation. Generate the new package's styled-system before consuming it. Use one CSS layer entry per application.
- Do not use variant names that collide with CSS properties. In particular, use `orientation`, `spacing` and `justify` rather than `direction`, `gap` and `justifyContent` on styled wrappers.
- Do not pass SVG `d` through a Panda `styled` wrapper. `d` is consumed as the CSS `display` shorthand; use a `css()` class on a plain `<path>` instead.
- Empty pseudo-element content must be written as `content: '""'`; an empty string is dropped.
- Prefer inline style configs for custom/Radix components. Config objects in variables can require casts and weaken static extraction.
- Use raw CSS variables (`var(--colors-...)`) or `token(...)` calls in `css` props, not legacy `$token` strings.

## Regenerate

```bash
node panda/generate-tokens.mjs

pnpm --filter @pivot-ui/editor panda
pnpm --filter @pivot-ui/gui panda
pnpm --filter @pivot-ui/react panda
```

The generator uses `esbuild`; it is a direct workspace dev dependency.

## Verification

Run:

```bash
pnpm verify
```

The completed migration was checked against the Stitches baseline with the visual regression archived under `docs/migration/`.
