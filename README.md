# Pivot UI

Pivot UI is a local-first React UI library for building 3D editor interfaces in the browser. It combines a low-level component package with an opinionated GUI layer for scene inspectors, asset panels and tool controls.

The workspace is private and source-only. Packages are consumed through the pnpm workspace or a local link; there is no npm publish, CI pipeline, `dist` bundle or UMD build.

## Packages

| Package                                       | Version | Role                                                         |
| --------------------------------------------- | ------- | ------------------------------------------------------------ |
| [`@pivot-ui/editor`](./packages/ui/README.md) | `1.2.0` | Base components, overlays, color tools, asset and tree views |
| [`@pivot-ui/gui`](./packages/gui/README.md)   | `1.2.1` | Form controls, panels and the imperative GUI class           |
| [`app`](./app)                                | `0.0.1` | Vite demo application                                        |

## Status

The Stitches → Panda CSS migration is complete and archived:

- [Release archive](./docs/RELEASE_ARCHIVE.md)
- [Migration ledger](./docs/migration/LEDGER.md)
- [Full visual regression report](./docs/migration/VISUAL_REGRESSION.md)

The final migration baseline is commit `925a7bf` on `feat/panda-css-migration`. The branch has not been merged or pushed.

## Quick start

Requirements:

- Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0`
- pnpm `12.14.0`

```bash
pnpm install

# Editor Storybook
pnpm dev

# GUI Storybook
pnpm dev:gui

# Demo application
pnpm dev:demo
```

Storybook package scripts default to port `6006`. Use the commands in the [development guide](./docs/DEVELOPMENT.md) when running both sites simultaneously.

## Usage

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

## Consuming locally

Pivot UI is not published to npm. Link a package from another local project:

```bash
pnpm link ../editor-ui/packages/ui
# or
pnpm link ../editor-ui/packages/gui
```

Panda CSS must be wired into the consuming application. The package `panda.css` files declare layer order only; generated styles are injected by Panda's PostCSS plugin. See [Consuming Pivot UI](./docs/CONSUMING.md) for the required configuration and theme provider setup.

## Documentation

- [Documentation index](./docs/README.md)
- [Consuming](./docs/CONSUMING.md)
- [Development](./docs/DEVELOPMENT.md)
- [Release archive](./docs/RELEASE_ARCHIVE.md)
- [Editor package](./packages/ui/README.md)
- [GUI package](./packages/gui/README.md)

## Architecture

- **Panda CSS** owns styling, reset, tokens and theme variables.
- **Radix UI** provides accessible primitives.
- **React 19** is the UI runtime; both packages peer-depend on React.
- **Source-only workspace**: packages export TypeScript source and are consumed locally.

## Verification

```bash
pnpm verify
pnpm install --frozen-lockfile
pnpm dedupe --check
```

`pnpm verify` runs Prettier, TypeScript, the demo build and both Storybook builds.

## License

MIT License. See [LICENSE](./LICENSE).
