# @pivot-ui/editor

`@pivot-ui/editor` provides React components for building 3D editor interfaces in the browser. It includes basic controls, overlays, color tools, asset and tree views, and editor-specific components such as `ColorPicker`, `BezierCurveEditor` and `GradientSlider`.

The package is part of the Pivot UI workspace and can be integrated through the workspace or a package link.

Migrated components forward to `@pivot-ui/react`. B05 moves text and choice controls to the unified package, including their shared text-edit lifecycle and the first `PropertyField` bindings. Use the unified entry for new code; numeric, color, curve and resource controls remain here until their assigned batches. See the [B05 migration guide](../../docs/refactor/blender-5.2/B05_TEXT_CHOICES.md).

## Installation

```bash
pnpm link ../pivot-ui/packages/ui
```

React and React DOM 19 are peer dependencies.

## Styling prerequisite

Components use Panda CSS. The consuming application must run Panda's PostCSS plugin and scan both `packages/ui/src/**/*.{ts,tsx}` and `packages/interface/src/**/*.{ts,tsx}` alongside its own source. The unified source is required because migrated legacy entries forward to it. The `panda.css` file declares layer order only; it is not a prebuilt stylesheet.

Before consuming a source link, generate the unified package's styling modules from the Pivot UI workspace:

```bash
pnpm --filter @pivot-ui/react panda
```

Workspace app and Storybook pre-scripts already generate these modules, including after cleaning generated files. Consumers still run their own Panda extraction and PostCSS build.

See [Integrating Pivot UI](../../docs/CONSUMING.md) for the full configuration. The demo app in `app/` is the reference integration.

```ts
// application entry, after Panda/PostCSS is configured
import '@pivot-ui/editor/panda.css'
```

## Usage

```tsx
import React from 'react'
import { Button, ColorPicker, Flex, Text } from '@pivot-ui/editor'

export function Toolbar() {
  const [color, setColor] = React.useState({ r: 30, g: 99, b: 238, a: 1 })

  return (
    <Flex gap="sm" align="v">
      <Button>Save</Button>
      <Text muted>Scene settings</Text>
      <ColorPicker mode="constant" value={color} onValueChange={setColor} />
    </Flex>
  )
}
```

## Theming

Wrap the application in `ThemeProvider`:

```tsx
import { ThemeProvider, useTheme } from '@pivot-ui/editor'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle theme</button>
}

export function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      {/* application */}
    </ThemeProvider>
  )
}
```

`ThemeProvider` switches the `light-theme` / `dark-theme` class on the document. Colors come from the Panda CSS variables emitted by the package's Panda pipeline.

## Component API notes

- `Text` and `Title` sizes are numeric variants: `size={2}`, not `size="2"`.
- `Flex.wrap` accepts `true`, `false` or `"reverse"`.
- Migrated components accept a Panda `css` prop typed as `SystemStyleObject`.
- Use raw CSS variables (`var(--colors-...)`) or Panda `token(...)` calls in `css` values.
- `ActionButton` no longer exposes the unused `as` prop.
- `resetStyle()` was removed; load the Panda CSS pipeline instead.

## Documentation

- [Documentation index](../../docs/README.md)
- [Integration guide](../../docs/CONSUMING.md)
- [Development guide](../../docs/DEVELOPMENT.md)
- [GUI package](../gui/README.md)

## Development

```bash
pnpm dev          # Storybook
pnpm typecheck    # Type checking
pnpm build-storybook
```

## License

MIT License. See the repository [LICENSE](../../LICENSE).

## Acknowledgements

Built with:

- `@radix-ui` for accessible primitives
- `@radix-ui/colors` for the color system
- `react-colorful` for the color picker
- `colord` for color manipulation
- `@tabler/icons-react` for icons
