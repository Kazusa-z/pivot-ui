# Pivot UI

Pivot UI is a React component and GUI toolkit for building browser-based 3D editors, inspectors and content tools. It provides production-ready controls for scene properties, assets, colors, curves and hierarchical data, together with an imperative GUI layer for rapid tool development.

## Highlights

- **Editor-focused components** — color pickers, gradient and HDR sliders, bezier curve editing, asset views, trees, tables and inspector panels.
- **Two APIs** — use declarative React components for application UI, or the dat.gui-style `GUI` class for compact tooling and prototypes.
- **Consistent theming** — light and dark themes are driven by a shared design-token system.
- **Accessible foundations** — interactive primitives are built on Radix UI and support keyboard navigation.
- **Engine agnostic** — bind controls to any scene graph, store or plain JavaScript object.
- **TypeScript first** — public component props and GUI configuration are fully typed.

## Packages

| Package                                       | Role                                                         |
| --------------------------------------------- | ------------------------------------------------------------ |
| [`@pivot-ui/editor`](./packages/ui/README.md) | Base components, overlays, color tools, asset and tree views |
| [`@pivot-ui/gui`](./packages/gui/README.md)   | Form controls, panels and the imperative `GUI` class         |
| [`app`](./app)                                | Vite demo application                                        |

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

# Demo application
pnpm dev:demo
```

The Storybook package scripts default to port `6006`. See the [development guide](./docs/DEVELOPMENT.md) when running both explorers together.

### Build and verify

```bash
pnpm build:app          # Production demo build
pnpm build:storybook    # Both Storybook sites
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

### Imperative GUI

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

### Three.js integration

```ts
import * as THREE from 'three'
import { GUI } from '@pivot-ui/gui'

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const gui = new GUI({ camera: { position: { x: 0, y: 0, z: 5 } } }, [
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

## Documentation

- [Documentation index](./docs/README.md)
- [Integration guide](./docs/CONSUMING.md)
- [Development guide](./docs/DEVELOPMENT.md)
- [Editor package](./packages/ui/README.md)
- [GUI package](./packages/gui/README.md)

## Technology

Pivot UI is organized as a pnpm monorepo. Components are written in React 19 and TypeScript, styled with Panda CSS, and built on Radix UI primitives. Both component packages are TypeScript source packages.

## License

MIT License. See [LICENSE](./LICENSE).
