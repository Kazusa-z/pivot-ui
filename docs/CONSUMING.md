# Integrating Pivot UI

Pivot UI is distributed from this repository as source packages. An application can consume it through the pnpm workspace or by linking a package directory.

Use [`@pivot-ui/react`](../packages/interface/README.md) for migrated foundations: theme, buttons, feedback, typography, icons and shortcut presentation. Pure property contracts and value types are available through `/contracts` and `/values`. The transitional `@pivot-ui/editor` and `@pivot-ui/gui` packages still provide unmigrated controls and form items. The unified package has no Qt bridge; its Mock is Storybook-only support.

## Requirements

- Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0`
- pnpm `12.14.0`
- React and React DOM 19

## Add a package

Inside the workspace, reference the packages with `workspace:*`. For an application outside the workspace, link the package directory:

```bash
pnpm link ../pivot-ui/packages/interface
# Transitional packages for components not migrated yet:
pnpm link ../pivot-ui/packages/ui
pnpm link ../pivot-ui/packages/gui
```

React remains a peer dependency and must be installed by the application.

Generate the unified package's styling modules before using a source link: `pnpm --filter @pivot-ui/react panda`. Workspace app and Storybook pre-scripts already do this, including after cleaning generated files.

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
    '../pivot-ui/packages/interface/src/**/*.{ts,tsx}',
    // Include this when using transitional @pivot-ui/editor controls:
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
// Unified components:
import '@pivot-ui/react/panda.css'

// or, when using @pivot-ui/gui
import '@pivot-ui/gui/panda.css'
```

Use one layer entry per application, including applications combining migrated and transitional components. All entries share the same layer order and Panda preset; source scanning determines the emitted component styles.

## Theme provider

Wrap the application so light and dark mode are applied to the document:

```tsx
import { ThemeProvider, useTheme } from '@pivot-ui/react'

function ThemeToggle() {
  const { resolvedTheme, setPreference } = useTheme()
  return <button onClick={() => setPreference(resolvedTheme === 'dark' ? 'light' : 'dark')}>Toggle theme</button>
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

`ThemeProvider` manages the `light-theme` / `dark-theme` class through an appearance adapter. `preference` is `light`, `dark` or `system`; `resolvedTheme` is always `light` or `dark`. Set `system` to follow OS changes without overwriting the stored preference. Consumers share a store, including nested Providers that do not supply another store. Storage, system detection and appearance adapters can be injected separately for mocks or a future host. The color values come from the shared Panda preset.

## First component

```tsx
import { useState } from 'react'
import { Button, Text } from '@pivot-ui/react'
import { ColorPicker, Flex } from '@pivot-ui/editor'

export function Toolbar() {
  const [color, setColor] = useState({ r: 30, g: 99, b: 238, a: 1 })

  return (
    <Flex gap="sm" align="v">
      <Button>Save</Button>
      <Text tone="muted">Scene settings</Text>
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

For custom layouts, import `css`/`cva`/`cx` from `@pivot-ui/react/styling/css`, `styled` from `/styling/jsx`, and `token` from `/styling/tokens`. These package subpaths resolve directly to generated modules and are registered in `pandaBase.importMap`; do not wrap `styled` in another re-export facade. Import `SystemStyleObject` or `RecipeVariantProps` as types from `/styling/types`.

## Related documents

- [Documentation index](./README.md)
- [Development](./DEVELOPMENT.md)
- [Editor package](../packages/ui/README.md)
- [GUI package](../packages/gui/README.md)
