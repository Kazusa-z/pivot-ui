# Integrating Pivot UI

Pivot UI is distributed from this repository as source packages. An application can consume it through the pnpm workspace or by linking a package directory.

## Requirements

- Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0`
- pnpm `12.14.0`
- React and React DOM 19

## Add a package

Inside the workspace, reference the packages with `workspace:*`. For an application outside the workspace, link the package directory:

```bash
pnpm link ../pivot-ui/packages/ui
# Optional high-level GUI package
pnpm link ../pivot-ui/packages/gui
```

React remains a peer dependency and must be installed by the application.

## Configure Panda CSS

Components are styled with Panda CSS. The package `panda.css` file declares CSS layer order; it is not a prebuilt stylesheet. The application must run Panda's PostCSS plugin so generated styles are included in the build.

Use the integrations in this repository as references:

- Demo application: `app/postcss.config.cjs`, `app/panda.config.ts`, `app/src/main.tsx`
- Editor Storybook: `packages/ui/postcss.config.cjs`, `packages/ui/panda.config.ts`
- GUI Storybook: `packages/gui/panda.config.ts`

A consuming application needs a Panda config that includes its own source and the Pivot UI package source:

```ts
// panda.config.ts
import { defineConfig } from '@pandacss/dev'
import { pandaBase } from '../pivot-ui/panda/base'

export default defineConfig({
  ...pandaBase,
  include: [
    './src/**/*.{ts,tsx}',
    '../pivot-ui/packages/ui/src/**/*.{ts,tsx}',
    // Include this when using @pivot-ui/gui:
    '../pivot-ui/packages/gui/src/**/*.{ts,tsx}',
  ],
  exclude: ['**/*.stories.tsx', '**/*.stories.ts'],
})
```

Add the PostCSS plugin:

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

// or, when using @pivot-ui/gui
import '@pivot-ui/gui/panda.css'
```

Use the entry that matches the package being consumed; do not import both in one application.

## Theme provider

Wrap the application so light and dark mode are applied to the document:

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

`ThemeProvider` manages the `light-theme` / `dark-theme` class. The color values are emitted by the Panda CSS pipeline.

## First component

```tsx
import { useState } from 'react'
import { Button, ColorPicker, Flex, Text } from '@pivot-ui/editor'

export function Toolbar() {
  const [color, setColor] = useState({ r: 30, g: 99, b: 238, a: 1 })

  return (
    <Flex gap="sm" align="v">
      <Button>Save</Button>
      <Text muted>Scene settings</Text>
      <ColorPicker mode="constant" value={color} onValueChange={setColor} />
    </Flex>
  )
}
```

## Controlled form items

```tsx
import { useState } from 'react'
import { FormItemInput, FormItemVector3 } from '@pivot-ui/gui'

export function Inspector() {
  const [name, setName] = useState('Camera')
  const [position, setPosition] = useState({ x: 0, y: 0, z: 5 })

  return (
    <div style={{ width: 360 }}>
      <FormItemInput label="Name" value={name} onChange={setName} />
      <FormItemVector3 label="Position" value={position} onChange={setPosition} />
    </div>
  )
}
```

The application owns layout and state. Update each control's `value` in its change callback; passing a fixed value makes the control read-only. Use local state while developing the UI, then connect the same callbacks to application commands and supply backend snapshots through props.

## Custom styling

Components accept a Panda `css` prop typed as `SystemStyleObject`:

```tsx
<Button css={{ borderRadius: '8px' }}>Save</Button>
```

Use CSS variables such as `var(--colors-textMuted)` or Panda `token('colors.textMuted')` in style values.

## Related documents

- [Documentation index](./README.md)
- [Development](./DEVELOPMENT.md)
- [Editor package](../packages/ui/README.md)
- [GUI package](../packages/gui/README.md)
