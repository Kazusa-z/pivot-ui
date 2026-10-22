# @pivot-ui/gui

Composable React form items for scene inspectors, material editors and other property editors. Built on [@pivot-ui/editor](../ui/README.md), this package supplies fields and field groups. The application owns layout, state and backend integration.

## Setup

This is a TypeScript source package in the Pivot UI workspace. React and React DOM 19 are peer dependencies. Add it through `workspace:*` or link the directory:

```bash
pnpm link ../pivot-ui/packages/gui
```

Configure Panda's PostCSS plugin and include both `packages/gui/src` and `packages/ui/src` in the application's Panda configuration. Import the layer entry once:

```ts
import '@pivot-ui/gui/panda.css'
```

The CSS entry declares layer order; Panda generates the styles during the application build. See [Integrating Pivot UI](../../docs/CONSUMING.md) for the full configuration.

## Controlled form items

```tsx
import { useState } from 'react'
import { FormItemGroup, FormItemInput, FormItemSlider, FormItemVector3 } from '@pivot-ui/gui'

export function Inspector() {
  const [name, setName] = useState('Object')
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 })
  const [opacity, setOpacity] = useState(1)

  return (
    <div style={{ width: 360 }}>
      <FormItemGroup label="Object">
        <FormItemInput label="Name" value={name} onChange={setName} />
        <FormItemVector3 label="Position" value={position} onChange={setPosition} />
        <FormItemSlider label="Opacity" value={opacity} onChange={setOpacity} min={0} max={1} step={0.01} />
      </FormItemGroup>
    </div>
  )
}
```

Pass an accepted value back into the field after each edit. A fixed `value` without an updating callback does not provide an editable form. Replacing application state also updates the fields, so local mock data can later be replaced by backend snapshots.

The component library does not own data fetching, object binding, command dispatch or backend synchronization. Those belong in the application. For a C++/Qt integration, application callbacks can send commands through an adapter and supply returned state through component props.

## Available form items

Every form item has a dedicated Storybook entry under `FormItem`.

| Component                                               | Purpose                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| `FormItem`                                              | Label, help text and field layout for custom controls        |
| `FormItemInput`                                         | Text input                                                   |
| `FormItemTextarea`                                      | Multiline input                                              |
| `FormItemInputNumber`                                   | Numeric input with dragging and increment/decrement controls |
| `FormItemSlider`                                        | Numeric slider and input                                     |
| `FormItemCascadeSlider`                                 | Editable distribution across segments                        |
| `FormItemVector2`, `FormItemVector3`, `FormItemVector4` | Vector fields; Vector3 supports proportional edits           |
| `FormItemRect`                                          | Rectangle coordinates and dimensions                         |
| `FormItemToggle`                                        | Boolean field                                                |
| `FormItemToggleGroup`                                   | Single or multiple selections                                |
| `FormItemSegmentControl`                                | Segmented selection                                          |
| `FormItemSelect`                                        | Dropdown selection                                           |
| `FormItemColor`                                         | Color and alpha input                                        |
| `FormItemGradient`                                      | Constant colors and gradient modes                           |
| `FormItemParticleCurve`                                 | Constant values and curve modes                              |
| `FormItemParticle`                                      | Alias of `FormItemParticleCurve`                             |
| `FormItemAssetPicker`                                   | Asset selection, location and clearing                       |
| `FormItemDisplay`                                       | Read-only text or image                                      |
| `FormItemButton`                                        | Action with a form label                                     |
| `FormItemGroup`                                         | Collapsible field group                                      |
| `FormItemArray`                                         | Collection with add, delete and rename callbacks             |

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
