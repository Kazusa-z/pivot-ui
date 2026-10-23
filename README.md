# Pivot UI

Pivot UI is a React component library for building 3D editor interfaces, inspectors and content tools. It provides controls for scene properties, assets, colors, curves and hierarchical data, plus composable form items for application-owned state.

## Highlights

- **Editor-focused components** — color pickers, gradient and HDR sliders, bezier curve editing, asset views, trees, tables and inspector panels.
- **Composable property layouts** — explicitly associate labels, controls and descriptions; combine sections, scrolling and resizable panes with application state.
- **Consistent theming** — light and dark themes are driven by a shared design-token system.
- **Accessible foundations** — interactive primitives are built on Radix UI and support keyboard navigation.
- **Engine agnostic** — connect controlled inputs to local state or an application adapter for an engine backend.
- **TypeScript first** — public component props are typed.

## Packages

| Package                                             | Role                                                                                                            |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [`@pivot-ui/editor`](./packages/ui/README.md)       | Base components, overlays, color tools, asset and tree views                                                    |
| [`@pivot-ui/gui`](./packages/gui/README.md)         | Composable React form items for property editors                                                                |
| [`@pivot-ui/react`](./packages/interface/README.md) | Unified package: contracts, foundations, layouts, overlays, menus and scoped confirmation/notification services |
| [`@pivot-ui/demo`](./app)                           | Vite demo application                                                                                           |

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

# Unified package components and contract playground
pnpm dev:interface

# Demo application
pnpm dev:demo
```

Editor Storybook runs on port `6007`; the GUI Storybook runs on `6008`; the unified package runs on `6009`. The unified package includes foundations, layouts, overlays, services, text and choice controls, numeric editing, sliders, geometry templates and PropertyField bindings, plus B07 collections/drag-drop and B08 color, HDR, ramp and color-distribution templates. B09 adds CurveWidget/CurvePicker, optional preset services and NumericDistributionTemplate. Migrated legacy entries are adapters, and unmigrated controls remain in the existing packages. Acceptance status is tracked in the [refactor ledger](./docs/refactor/blender-5.2/LEDGER.md). See the [development guide](./docs/DEVELOPMENT.md) for the full command reference.

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
import { Button, Flex, Text } from '@pivot-ui/react'
import { ColorPicker, type ColorValue } from '@pivot-ui/react'

export function Toolbar() {
  const [color, setColor] = useState<ColorValue>({ space: 'srgb', r: 30 / 255, g: 99 / 255, b: 238 / 255, a: 1 })

  return (
    <Flex gap="sm" align="center">
      <Button>Save</Button>
      <Text tone="muted">Scene settings</Text>
      <ColorPicker value={color} onValueChange={setColor} />
    </Flex>
  )
}
```

### Form items

```tsx
import { useId, useState } from 'react'
import { FormItemGroup } from '@pivot-ui/gui'

import { Input, Vector3Input, PropertyRow, PropertyLabel, PropertyControl } from '@pivot-ui/react'

export function Inspector() {
  const nameId = useId()
  const positionId = useId()
  const [name, setName] = useState('Camera')
  const [position, setPosition] = useState({ x: 0, y: 0, z: 5 })

  return (
    <FormItemGroup label="Camera">
      <PropertyRow>
        <PropertyLabel htmlFor={nameId}>Name</PropertyLabel>
        <PropertyControl association="control">
          <Input id={nameId} value={name} onValueChange={setName} />
        </PropertyControl>
      </PropertyRow>
      <PropertyRow>
        <PropertyLabel id={positionId}>Position</PropertyLabel>
        <PropertyControl association="group" labelledBy={positionId}>
          <Vector3Input value={position} onValueChange={setPosition} />
        </PropertyControl>
      </PropertyRow>
    </FormItemGroup>
  )
}
```

Form items work with local state before a backend exists. The application owns data loading, commands and synchronization with a future engine or C++/Qt adapter.

For new layouts, use `PropertyRow`, `PropertyLabel`, `PropertyControl` and `PropertyDescription` from `@pivot-ui/react`. Control IDs and help relationships are explicit; the layout does not inspect or clone controls. `Section` separates its disclosure trigger from header actions, and `ScrollAreaRoot` / `ScrollAreaViewport` separate layout from scroll events and refs. See the [unified package API guide](./packages/interface/README.md) for these compositions and the pixel-based `ResizableSplit` contract.

Provide `TooltipProvider` at an application or composition boundary. Confirmation and notification services are also owned by the application; the legacy `showAlert` now requires an injected service. See the [B04 migration guide](./docs/refactor/blender-5.2/B04_OVERLAYS.md) for the separate overlay props, retained Popover lifecycle and service hosts.

## Documentation

- [Documentation index](./docs/README.md)
- [Integration guide](./docs/CONSUMING.md)
- [Development guide](./docs/DEVELOPMENT.md)
- [Editor package](./packages/ui/README.md)
- [GUI package](./packages/gui/README.md)
- [Unified package](./packages/interface/README.md)

## Technology

Pivot UI is organized as a pnpm monorepo. Components are written in React 19 and TypeScript, styled with Panda CSS, and built on Radix UI primitives. Library packages are TypeScript source packages. The [active refactor ledger](./docs/refactor/blender-5.2/LEDGER.md) tracks migration into `@pivot-ui/react`.

## License

MIT License. See [LICENSE](./LICENSE).
