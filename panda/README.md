# Panda CSS Infrastructure

This folder holds the shared Panda CSS setup used by both packages during the migration. See [MIGRATION.md](./MIGRATION.md) for batch status, temporary compromises and resolution criteria.

## Current strategy

- **Tokens are aliases to the existing Stitches CSS variables.**
  - Panda's prefix is `panda`, so a token resolves to `var(--panda-colors-gray3)`, whose value is `var(--colors-gray3)`.
  - This lets components migrate to Panda tokens before the light/dark theme implementation is migrated; the Stitches `ThemeProvider` still controls the underlying variables.
- **Theme variables are emitted by Panda.**
  - All Stitches token variables are generated in `globalCss` on `:root` (dark) and `.light-theme` (light). This removes the dependency on another Stitches component being rendered on the page before Panda components can resolve `var(--colors-*)`.
- **Global reset/fonts are migrated to Panda.**
  - `global.ts` is derived from the Stitches reset and the existing font-face declarations.
  - Storybook UI and GUI load Panda reset instead of `resetStyle()`.
- **Import runtime styling directly from `styled-system`.**
  - Do not re-export `styled`/`css` through a local facade; Panda's static extractor does not follow the re-export and variants can produce classes without matching CSS. Import from `styled-system/jsx`, `styled-system/css`, and `styled-system/tokens` directly.
- **`css` prop is supported.**
  - A Panda `styled` component accepts `css={{ ... }}` and applies the style through Panda utility classes.
  - Use `token('colors.textMuted')` / `token('spacing.1')` for token values; do not write `'textMuted'` or `'colors.textMuted'` as raw style values (they emit invalid CSS).
  - The 69 existing `css` props can be kept during component migration, but their `$token` values must be translated to `token(...)` calls.
- **Type mapping (to be applied in batches).**
  - `CSS` → `SystemStyleObject`
  - `VariantProps` → `RecipeVariantProps`
  - `StitchesComponent` → `ComponentProps`

## Verification

- Batch 1/2 components and the promoted Dialog/FormItemColor were checked for computed-style parity with their Stitches counterparts.
- `css` prop probe: `marginLeft` applied correctly.
- Generated token aliases verified, e.g.:
  - `--panda-colors-gray3: var(--colors-gray3)`
  - `--panda-spacing-1: var(--space-1)`
  - `--panda-fonts-default: var(--fonts-default)`
