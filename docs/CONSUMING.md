# Integrating Pivot UI

`@pivot-ui/react` is the only component source package. Consume it with `workspace:*` inside the monorepo or link `packages/interface` from another application. B11 removes the former editor/gui packages and their compatibility APIs. This is a source integration, not a prebuilt npm distribution.

## Runtime and styling

Use the package's React/React DOM peer range (`^19.3.1`), Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0`, and pnpm `12.14.0`.

```bash
pnpm link ../pivot-ui/packages/interface
# Run in the library workspace after a fresh clone or clean:
pnpm --filter @pivot-ui/react panda
```

`@pivot-ui/react/panda.css` declares CSS layer order; it does not contain prebuilt component CSS. Configure Panda PostCSS, inherit `panda/base.ts`, scan both application sources and `packages/interface/src/**/*.{ts,tsx}`, and import one CSS layer entry. See `app/panda.config.ts`, `app/postcss.config.cjs` and `app/src/main.tsx` for the complete working configuration. Source-link consumers need access to the shared Panda infrastructure in this repository.

Use `@pivot-ui/react/styling/css`, `/styling/jsx`, `/styling/tokens` and the type-only `/styling/types` entry. These resolve directly to generated Panda modules and are registered in the shared import map. Do not wrap `styled` in a re-export that hides it from extraction. Generate library modules before running a consuming build; its own PostCSS extraction is still required.

## Composition and themes

```tsx
import { ThemeProvider, TooltipProvider, Button, useTheme } from '@pivot-ui/react'

function ThemeToggle() {
  const { resolvedTheme, setPreference } = useTheme()
  return <Button onClick={() => setPreference(resolvedTheme === 'dark' ? 'light' : 'dark')}>Toggle theme</Button>
}

export function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <ThemeToggle />
      </TooltipProvider>
    </ThemeProvider>
  )
}
```

The default theme store uses browser preference, system-theme and document-appearance adapters. Inject `createThemeStore({ storage, system, appearance })` for another host or a local mock. Preference retains `light | dark | system`; resolved theme is light or dark. A scoped store also needs a scoped appearance adapter or theme class for non-portaled content. Portals inherit the local Provider's resolved theme.

Tooltips need a Provider at an application or independent composition boundary. Use separate `rootProps`, `triggerProps`, `portalProps`, `contentProps` for overlays, or compose their public parts. Retained Popovers use `keepMounted` and React Activity: hidden state/DOM persist while effects, refs, focus layers and scroll locks are suspended.

Create and inject confirmation and notification services at application boundaries. `useConfirmation()` / `useNotifications()` issue requests to their Providers; no component creates an independent React root. Services settle requests once and isolate hosts. For details see [B04](./refactor/blender-5.2/B04_OVERLAYS.md), with B11's legacy removal taking precedence.

## Fields and application state

For a simple controlled input, use local state and `PropertyRow`, `PropertyLabel`, `PropertyControl`, `PropertyDescription`. Pass IDs and accessible names explicitly. Use `association="control"` for one input and `association="group"` for a composite. Layout does not inspect or clone arbitrary child controls. `Section` groups fields; disclosure actions sit beside the trigger. Scroll events/ref belong on `ScrollAreaViewport`; pixel sizing belongs to `ResizableSplit`.

For host-owned state, provide a stable `PropertyAccess<T>` to `PropertyField<T>`. Scalars have built-in renderers. Complex values use a typed render function that passes value, edit callbacks and control associations into an existing template:

```tsx
import { PropertyField, Vector3Input, type PropertyAccess, type Vector3 } from '@pivot-ui/react'

export function PositionField({ access }: { access: PropertyAccess<Vector3> }) {
  return (
    <PropertyField
      access={access}
      render={(field) => <Vector3Input {...field.controlProps} {...field.editProps} value={field.value} />}
    />
  )
}
```

The access owns immutable snapshots, preview, revision and the captured edit session. One gesture starts once, previews many times, and commits/cancels once. Successful own acknowledgements retain UI caches; external revisions invalidate drafts even if the value is equal. Resource/collection actions use `field.submit(nextValue)` for atomic changes. See the [B11 integration contract](./refactor/blender-5.2/B11_INTEGRATION.md) for custom data, async errors, mixed state and complete examples.

Before a backend exists, implement the access in application memory. Storybook's Mock illustrates the contract and is not a public runtime export. Later replace the adapter with C++ / Qt transport without changing controls. Transport, engine object mapping, persistence and undo remain application concerns.

## Optional capabilities

Use data-only values and IDs. Inject `ResourceProvider`, `HostCapabilities`, color capabilities and curve-preset services as needed. Missing capabilities remain unavailable; widgets must not claim clipboard, filesystem, resource resolution or Qt behavior is connected. Selection, curve viewport, color display space and browsing preferences are UI state, not property commits.

The [package guide](../packages/interface/README.md) and [batch guides](./README.md) document each component family. The [ledger](./refactor/blender-5.2/LEDGER.md) records verified scope and any known limitations.
