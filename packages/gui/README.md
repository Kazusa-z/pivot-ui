# @pivot-ui/gui

Composable React form items for scene inspectors, material editors and other property editors. Built on [@pivot-ui/editor](../ui/README.md), this package supplies fields and field groups. The application owns layout, state and backend integration.

B05 removes the basic text, boolean, choice and action FormItem wrappers; B06 removes the numeric, slider, vector and rectangle wrappers. Compose controls from `@pivot-ui/react` with `PropertyRow`, or use `PropertyField` to bind a text, number, boolean or enum property through `PropertyAccess`. Color, curve, collection and resource form items remain for their migration batches. See the [B05 migration guide](../../docs/refactor/blender-5.2/B05_TEXT_CHOICES.md) and [B06 numeric guide](../../docs/refactor/blender-5.2/B06_NUMERIC.md).

## Setup

This is a TypeScript source package in the Pivot UI workspace. React and React DOM 19 are peer dependencies. Add it through `workspace:*` or link the directory:

```bash
pnpm link ../pivot-ui/packages/gui
```

Configure Panda's PostCSS plugin and scan `packages/gui/src/**/*.{ts,tsx}`, `packages/ui/src/**/*.{ts,tsx}` and `packages/interface/src/**/*.{ts,tsx}` alongside the application's source. The unified source is required for migrated controls and layouts, even when importing a legacy FormItem.

Before consuming a source link, generate the unified package's styling modules from the Pivot UI workspace:

```bash
pnpm --filter @pivot-ui/react panda
```

Workspace app and Storybook pre-scripts already generate these modules, including after cleaning generated files. Consumers still run their own Panda extraction and PostCSS build. Import the layer entry once:

```ts
import '@pivot-ui/gui/panda.css'
```

The CSS entry declares layer order; Panda generates the styles during the application build. See [Integrating Pivot UI](../../docs/CONSUMING.md) for the full configuration.

## Controlled form items

```tsx
import { useId, useState } from 'react'
import { FormItemGroup } from '@pivot-ui/gui'

import { Input, Vector3Input, NumericSlider, PropertyRow, PropertyLabel, PropertyControl } from '@pivot-ui/react'

export function Inspector() {
  const nameId = useId()
  const positionId = useId()
  const opacityId = useId()
  const [name, setName] = useState('Object')
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 })
  const [opacity, setOpacity] = useState(1)

  return (
    <div style={{ width: 360 }}>
      <FormItemGroup label="Object">
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
        <PropertyRow>
          <PropertyLabel htmlFor={opacityId}>Opacity</PropertyLabel>
          <PropertyControl association="control">
            <NumericSlider
              id={opacityId}
              label="Opacity"
              value={opacity}
              onValueChange={setOpacity}
              min={0}
              max={1}
              step={0.01}
            />
          </PropertyControl>
        </PropertyRow>
      </FormItemGroup>
    </div>
  )
}
```

Pass an accepted value back into the field after each edit. A fixed `value` without an updating callback does not provide an editable form. Replacing application state also updates the fields, so local mock data can later be replaced by backend snapshots.

The component library does not own data fetching, object binding, command dispatch or backend synchronization. Those belong in the application. For a C++/Qt integration, application callbacks can send commands through an adapter and supply returned state through component props.

## Available form items

Every form item has a dedicated Storybook entry under `FormItem`.

| Component               | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `FormItem`              | Label, help text and field layout for custom controls |
| `FormItemColor`         | Color and alpha input                                 |
| `FormItemGradient`      | Constant colors and gradient modes                    |
| `FormItemParticleCurve` | Constant values and curve modes                       |
| `FormItemParticle`      | Alias of `FormItemParticleCurve`                      |
| `FormItemAssetPicker`   | Asset selection, location and clearing                |
| `FormItemDisplay`       | Read-only text or image                               |
| `FormItemGroup`         | Collapsible field group                               |
| `FormItemArray`         | Collection with add, delete and rename callbacks      |

Most editable items use `value` and `onChange`. Gradient and particle fields use `onValueChange(value, type)`; keep the selected mode in state when supplying a controlled `type`. Asset selection uses `onSelect(asset)` and `onDelete()`. Arrays receive `items` plus `onAdd`, `onDelete` and `onRename`; update the item list in those callbacks.

## Storybook

```bash
pnpm dev:gui
```

Open the component explorer on port `6008`. Editable stories maintain local React state, show the current value and provide Reset. Additional stories demonstrate supported ranges, disabled states, selection modes, collection editing and specialized color/curve modes.

The toolbar switches between light and dark themes. In an application, use `ThemeProvider` from `@pivot-ui/editor`.

## Validation

```bash
pnpm --filter @pivot-ui/gui typecheck
pnpm verify
```

The GUI typecheck includes all component stories and tooling. The workspace verification also checks formatting and builds the demo and all three Storybooks.

## Related documents

- [Documentation index](../../docs/README.md)
- [Integrating Pivot UI](../../docs/CONSUMING.md)
- [Development](../../docs/DEVELOPMENT.md)
- [Editor package](../ui/README.md)
