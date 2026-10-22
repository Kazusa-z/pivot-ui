# Pivot UI

Pivot UI is a React component library for building 3D editor interfaces, inspectors and content tools. It provides controls for scene properties, assets, colors, curves and hierarchical data, plus composable form items for application-owned state.

## Highlights

- **Editor-focused components** — color pickers, gradient and HDR sliders, bezier curve editing, asset views, trees, tables and inspector panels.
- **Composable forms** — combine individual `FormItem` components with application state and layout.
- **Consistent theming** — light and dark themes are driven by a shared design-token system.
- **Accessible foundations** — interactive primitives are built on Radix UI and support keyboard navigation.
- **Engine agnostic** — connect controlled inputs to local state or an application adapter for an engine backend.
- **TypeScript first** — public component props are typed.

## Packages

| Package                                             | Role                                                                       |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| [`@pivot-ui/editor`](./packages/ui/README.md)       | Base components, overlays, color tools, asset and tree views               |
| [`@pivot-ui/gui`](./packages/gui/README.md)         | Composable React form items for property editors                           |
| [`@pivot-ui/react`](./packages/interface/README.md) | Unified package: property contracts, theme, buttons and visual foundations |
| [`@pivot-ui/demo`](./app)                           | Vite demo application                                                      |

## Getting started

### Prerequisites

- Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0`
- pnpm `12.14.0`

### Run the project

After cloning the repository, run from its root:

```bash
pnpm install

# Editor component explorer
pnpm dev

# GUI component explorer
pnpm dev:gui

# Unified package foundations and contract playground
pnpm dev:interface

# Demo application
pnpm dev:demo
```

Editor Storybook runs on port `6007`; the GUI Storybook runs on `6008`; the new unified package runs on `6009`. Components remain in the existing packages until their migration batch is complete. See the [development guide](./docs/DEVELOPMENT.md) for the full command reference.

### Build and verify

```bash
pnpm build:demo         # Production demo build
pnpm build:storybook    # All three Storybook sites
pnpm verify             # Formatting, types, demo build and Storybook builds
```

## Usage

### React components

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

### Form items

```tsx
import { useState } from 'react'
import { FormItemGroup, FormItemInput, FormItemVector3 } from '@pivot-ui/gui'

export function Inspector() {
  const [name, setName] = useState('Camera')
  const [position, setPosition] = useState({ x: 0, y: 0, z: 5 })

  return (
    <FormItemGroup label="Camera">
      <FormItemInput label="Name" value={name} onChange={setName} />
      <FormItemVector3 label="Position" value={position} onChange={setPosition} />
    </FormItemGroup>
  )
}
```

Form items work with local state before a backend exists. The application owns data loading, commands and synchronization with a future engine or C++/Qt adapter.

## Documentation

- [Documentation index](./docs/README.md)
- [Integration guide](./docs/CONSUMING.md)
- [Development guide](./docs/DEVELOPMENT.md)
- [Editor package](./packages/ui/README.md)
- [GUI package](./packages/gui/README.md)

## Technology

Pivot UI is organized as a pnpm monorepo. Components are written in React 19 and TypeScript, styled with Panda CSS, and built on Radix UI primitives. Library packages are TypeScript source packages. The [active refactor ledger](./docs/refactor/blender-5.2/LEDGER.md) tracks migration into `@pivot-ui/react`.

## License

MIT License. See [LICENSE](./LICENSE).
