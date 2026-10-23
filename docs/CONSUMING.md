# Integrating Pivot UI

Pivot UI is distributed from this repository as source packages. An application can consume it through the pnpm workspace or by linking a package directory.

Use [`@pivot-ui/react`](../packages/interface/README.md) for migrated foundations, B03 layout APIs and current B04 overlays, menus, dialogs and confirmation/notification services. Pure property contracts and value types are available through `/contracts` and `/values`. The transitional `@pivot-ui/editor` and `@pivot-ui/gui` packages still provide unmigrated controls and form items. The unified package has no Qt bridge; its Mock is Storybook-only support. See the refactor ledger for batch acceptance status.

## Requirements

- Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0`
- pnpm `12.14.0`
- React and React DOM `^19.3.1`, matching the package peer range; retained Popovers use React Activity

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
- Unified Storybook: `packages/interface/panda.config.ts`

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

## Overlay and service boundaries

The new Popover, Tooltip and HoverCard split `rootProps`, `triggerProps`, `portalProps` and `contentProps`; Dialog and AlertDialog also separate Overlay, Title and Description. Menu families keep their own dropdown, context-menu or menubar behavior. Import the family parts and their Props from `@pivot-ui/react`.

Place `TooltipProvider` around the application or an independent composition that uses tooltips. Individual new and legacy Tooltip components no longer create a provider. Portaled content receives the resolved theme of its local ThemeProvider, including when mounted in another DOM container.

`PopoverRoot keepMounted` preserves state and DOM through React Activity while suspending hidden effects/refs and interaction layers. Reopening restores them; it is not a background-effect host. The old Popover `forceRender` maps to this behavior. Keep the portal container stable when retaining content.

Create a stable confirmation service and inject it into exactly one `ConfirmationProvider`; components request a decision through `useConfirmation()`. The legacy call **must change from `showAlert(props)` to `showAlert(props, service)`**. It returns a request with an awaitable, idempotent result instead of creating an independent React root. `zIndex/actionable` no longer customize this service host; use an explicit AlertDialog composition when needed.

Use `NotificationProvider` and `useNotifications()` for scoped notifications. An external `createNotificationService()` can be injected for application ownership; otherwise the Provider creates its own service. `hostProps` configures the host, equal notification IDs update one item, and cleanup is scoped to the service. Legacy `toast`/`Toaster` remain transitional scheduler entry points.

See [B04 overlay and service migration](./refactor/blender-5.2/B04_OVERLAYS.md) for examples, result statuses, repeated-host rules and async completion behavior.

## First component

```tsx
import { useId, useState } from 'react'
import { Button, Flex, Text } from '@pivot-ui/react'
import { ColorPicker } from '@pivot-ui/editor'

export function Toolbar() {
  const [color, setColor] = useState({ r: 30, g: 99, b: 238, a: 1 })

  return (
    <Flex gap="sm" align="center">
      <Button>Save</Button>
      <Text tone="muted">Scene settings</Text>
      <ColorPicker mode="constant" value={color} onValueChange={setColor} />
    </Flex>
  )
}
```

## Explicit property layouts

The layout owns structure, while the caller owns control identity, value and help associations:

```tsx
import { useId, useState } from 'react'
import { PropertyRow, PropertyLabel, PropertyControl, PropertyDescription } from '@pivot-ui/react'

export function NameRow() {
  const id = useId()
  const [name, setName] = useState('Camera')
  return (
    <PropertyRow>
      <PropertyLabel htmlFor={id}>Name</PropertyLabel>
      <PropertyControl association="control">
        <input
          id={id}
          aria-describedby={`${id}-help`}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
      </PropertyControl>
      <PropertyDescription id={`${id}-help`}>Shown in the scene hierarchy.</PropertyDescription>
    </PropertyRow>
  )
}
```

For several inputs, use `PropertyLabel id={labelId}` and `PropertyControl association="group" labelledBy={labelId}`. Give each input its own name and put group help on the group's `aria-describedby`. Use `direction="column"` for stacked rows and `withoutLabel` when there is no label column. The layout does not scan the DOM or infer a control type. Color, asset and other specialized grids belong to their consuming components.

`Flex` uses `direction`, `gap`, cross-axis `align`, main-axis `justify`, and string-valued `wrap`; it defaults to `row` and `nowrap`. Old aliases such as `spacing`, `align="v"` or boolean `wrap` exist only in the legacy adapter. Use `Separator` for an oriented line, `decorative` for a purely visual line, and `SectionDivider` for a text-and-line composition.

`ScrollAreaRoot` receives dimensions, `sizing`, scrolling axes and scrollbar policy. Its ref points to the outer container. `ScrollAreaViewport` receives scroll events and the imperative scrolling ref; give a fill-sized area a definite parent height. The `ScrollArea` convenience component preserves the split through `viewportProps` and `viewportRef`. `sizing="content"` with `css={{ maxHeight: '180px' }}` grows up to a limit; viewport `contentLayout="intrinsic"` supports wide horizontal content.

`AccordionItem`, `Collapsible` and `Section` put interactive header controls in `actions`, beside the disclosure trigger. Titles are non-interactive content. `Section` defaults open; `Collapsible` defaults closed. `collapsible={false}` creates a fixed expanded section. `ReadonlyValue` displays formatted content without parsing or binding; `ImagePreview` requires `alt` and keeps native image attributes/ref.

`ResizableSplit` uses CSS pixel sizes. Supply `primary`, optional remaining `children`, and either `defaultSize` or controlled `size` / `onSizeChange`. A controlled parent must accept size requests to update the display; `onSizeCommit` reports the final request. The pane is bounded by explicit min/max and, with a secondary pane, available container space. Escape and pointer cancellation restore the starting size through a new request. See the [full layout API](../packages/interface/README.md) for cancellation reasons, keyboard behavior, standalone sizing and `primaryAsChild` requirements.

## Transitional controlled form items

```tsx
import { useId, useState } from 'react'

import { Input, Vector3Input, PropertyRow, PropertyLabel, PropertyControl } from '@pivot-ui/react'

export function Inspector() {
  const nameId = useId()
  const positionId = useId()
  const [name, setName] = useState('Camera')
  const [position, setPosition] = useState({ x: 0, y: 0, z: 5 })

  return (
    <div style={{ width: 360 }}>
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
    </div>
  )
}
```

The application owns layout and state. Update each control's `value` in its change callback; a fixed value rejects value changes; use readOnly to declare a readable, non-editable control explicitly. Use local state while developing the UI, then connect the same callbacks to application commands and supply backend snapshots through props.

The old `FormItem` entry is a thin composition over the property-row parts. When directly wrapping a single control, use `association="control"` and its render function to forward the supplied `id` and `aria-describedby` to the actual input. This is required for label-click focus and help association; the adapter no longer searches or clones child controls. B05 removed the text, boolean, choice and action wrappers; B06 also removed the numeric, slider, vector and rectangle wrappers; B07 removes FormItemArray in favor of CollectionTemplate. Compose their controls with PropertyRow directly or use PropertyField with a PropertyAccess. Business-specific `fieldColumn` names have moved to the corresponding consumers; the generic column count is 1–4.

Legacy `ResizablePanel` now delegates to `ResizableSplit`: its default size is 240px and default bounds are 80–960px. `range.min/max` are explicit pixel bounds, replacing the former measured-size ±50 behavior. Its `asChild` requires a single non-Fragment child that forwards DOM props/ref.

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

## Numeric editing and cancellation

Use InputNumber, Slider, DistributionSlider, NumericSlider and Vector2/3/4Input/RectInput from `@pivot-ui/react`. A controlled onValueChange accepts preview requests; onValueCommit marks one edit boundary. The application handles controlled rollback through onEditCancel, while external resetKey updates preserve the new authoritative value. PropertyField with a numeric PropertyAccess connects these callbacks to the host transaction automatically. See [B06 numeric integration](./refactor/blender-5.2/B06_NUMERIC.md) for constraints, mixed state, proportional edits and migration details.

## Collections and drag/drop

Use TreeRoot, Table/DataTable, Breadcrumbs, Pagination and CollectionTemplate from `@pivot-ui/react`. Stable keys distinguish numeric and string identities; the host owns item mutations and accepts selection/expansion/reorder requests. Put drag-enabled components inside an explicit DragDropProvider; useDragDropState provides a readonly snapshot. The legacy DragContext mutable object is removed. See the [B07 collection guide](./refactor/blender-5.2/B07_COLLECTIONS.md) for composition and migration.
