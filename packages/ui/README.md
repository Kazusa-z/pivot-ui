# @galacean/editor-ui

`@galacean/editor-ui` is a set of React components for building 3D editor interfaces in the browser. It is developed and consumed inside this local pnpm workspace and is **not published to npm**.

The package includes basic components such as `<Button>` and `<Input />`, editor-specific components such as `<ColorPicker />`, `<GradientSlider />`, `<ParticleSlider />` and `AssetPicker`, and hooks for building custom editor UIs.

## Local usage

The package is available to other packages in this workspace through `workspace:*`. From another local project, link it directly:

```bash
pnpm link ../editor-ui/packages/ui
```

## Usage

```tsx
import { Button } from '@galacean/editor-ui'

function App() {
  return <Button>Galacean Editor</Button>
}
```

Note: keep a CSS reset in your application so the components render consistently. You can use `resetStyle()` exported from `@galacean/editor-ui` to reset the styles.

> This package does not use the `z-index` style.

## Development

```bash
pnpm dev          # Storybook
pnpm typecheck    # Type checking
pnpm build-storybook
```

## Acknowledgement

This library would not have been possible without these excellent open-source projects:

- `@stitches/react` for CSS-in-JS
- `@radix-ui` for accessible component primitives
- `@radix-ui/colors` for the color system
- `react-colorful` for the color picker
- `colord` for color manipulation
- `@tabler/icons-react` for icons
