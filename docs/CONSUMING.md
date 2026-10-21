# Consuming Pivot UI locally

Pivot UI is a local pnpm workspace, not an npm package. The packages are consumed from this workspace or through a local link. They are source-only and do not ship a prebuilt `dist` bundle.

## Requirements

- Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0`
- pnpm `12.14.0`
- React and React DOM 19

## Link from another local project

```bash
# From the consuming project
pnpm link ../editor-ui/packages/ui
# Optional high-level GUI package
pnpm link ../editor-ui/packages/gui
```

React remains a peer dependency and must be installed by the consuming application.

## Load the Panda CSS pipeline

Components are styled with Panda CSS. The package `panda.css` file only declares the CSS layer order; it is not a prebuilt stylesheet. The consuming application must run Panda's PostCSS plugin so the generated styles are injected.

Use the reference integration in this workspace:

- Demo app: `app/postcss.config.cjs`, `app/panda.config.ts`, `app/src/main.tsx`
- Editor Storybook: `packages/ui/postcss.config.cjs`, `packages/ui/panda.config.ts`
- GUI Storybook: `packages/gui/panda.config.ts`

A linked consumer needs a Panda config that includes both its own source and the linked package source, for example:

```ts
// panda.config.ts in the consuming project
import { defineConfig } from '@pandacss/dev'
import { pandaBase } from '../editor-ui/panda/base'

export default defineConfig({
  ...pandaBase,
  include: [
    './src/**/*.{ts,tsx}',
    '../editor-ui/packages/ui/src/**/*.{ts,tsx}',
    // Add this when using @pivot-ui/gui:
    '../editor-ui/packages/gui/src/**/*.{ts,tsx}',
  ],
  exclude: ['**/*.stories.tsx', '**/*.stories.ts'],
})
```

Then add the PostCSS plugin:

```js
// postcss.config.cjs
module.exports = {
  plugins: {
    '@pandacss/dev/postcss': {},
  },
}
```

Import the matching layer entry once in the application entry:

```ts
// @pivot-ui/editor
import '@pivot-ui/editor/panda.css'

// or, when using the GUI package, its entry also covers its bundled UI sources
import '@pivot-ui/gui/panda.css'
```

Do not import both entries in the same application; use the one that matches the package you consume.

## Theme provider

Wrap the application so light/dark switching is applied to the document:

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

`ThemeProvider` owns the class switch; the actual colors come from the Panda CSS variables emitted by the package stylesheet.

## Basic usage

```tsx
import { useState } from 'react'
import { Button, ColorPicker, Flex, Text } from '@pivot-ui/editor'

export function Toolbar() {
  const [color, setColor] = useState({ r: 30, g: 99, b: 238, a: 1 })

  return (
    <Flex gap="sm" align="v">
      <Button>Pivot Editor</Button>
      <Text muted>Local-first UI</Text>
      <ColorPicker mode="constant" value={color} onValueChange={setColor} />
    </Flex>
  )
}
```

For the imperative GUI:

```ts
import { GUI } from '@pivot-ui/gui'

const gui = new GUI(sceneData, [
  {
    label: 'Camera Position',
    bindPath: 'camera.position',
    type: 'Vector3',
    onChange(value) {
      camera.position.set(value.x, value.y, value.z)
    },
  },
])
```

## Custom styling

Migrated components accept a Panda `css` prop typed as `SystemStyleObject`:

```tsx
<Button css={{ borderRadius: '8px' }}>Save</Button>
```

Prefer raw CSS variables or Panda `token(...)` calls over legacy Stitches `$token` strings.

## More documentation

- [Documentation index](./README.md)
- [Development](./DEVELOPMENT.md)
- [Release archive](./RELEASE_ARCHIVE.md)
- [Editor package](../packages/ui/README.md)
- [GUI package](../packages/gui/README.md)
