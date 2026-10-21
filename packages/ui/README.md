# @pivot-ui/editor

`@pivot-ui/editor` is a set of React components for building 3D editor interfaces in the browser. It is developed and consumed inside the local Pivot UI pnpm workspace and is **not published to npm**.

The package includes basic components such as `<Button>` and `<Input />`, editor-specific components such as `<ColorPicker />`, `<GradientSlider />`, `<ParticleSlider />` and `AssetPicker`, and hooks for building custom editor UIs.

## Local usage

The package is available to other packages in this workspace through `workspace:*`. From another local project, link it directly:

```bash
pnpm link ../editor-ui/packages/ui
```

## Usage

```tsx
import { Button } from '@pivot-ui/editor'

function App() {
  return <Button>Pivot UI</Button>
}
```

Note: load the package's Panda CSS entry (`packages/ui/panda.css`) in the consuming application so the reset, tokens and utilities are available.

> This package does not use the `z-index` style.

## Panda migration notes

- `Text` / `Title` sizes are numeric variants: `size={2}`, not `size="2"`.
- `Flex.wrap` is boolean (`true` / `false`) or `"reverse"`.
- Migrated components accept Panda `css` props. Replace Stitches `$token` values with raw CSS variables (`var(--colors-...)`) or `token(...)` calls.
- `ActionButton` no longer exposes the unused `as` prop.
- See [the migration ledger](../../panda/MIGRATION.md) for temporary compatibility notes.

## Development

```bash
pnpm dev          # Storybook
pnpm typecheck    # Type checking
pnpm build-storybook
```

## Acknowledgement

This library would not have been possible without these excellent open-source projects:

- `@radix-ui` for accessible component primitives
- `@radix-ui/colors` for the color system
- `react-colorful` for the color picker
- `colord` for color manipulation
- `@tabler/icons-react` for icons
