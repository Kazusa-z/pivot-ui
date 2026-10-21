# Panda CSS Phase 0 Pilot

This folder contains the Phase 0 migration pilots. Nothing here is exported from `@pivot-ui/editor` yet.

## Scope

- `PandaButton`: Panda CSS `styled` + variants.
- `PandaDialog`: Radix Dialog + Panda CSS, including overlay/content/close button and animations.
- Compared side by side with the current Stitches implementations in Storybook.
- `CssProp` story verifies that Panda `styled` components accept the `css` prop.

Button covers `solid / outline / soft / subtle / inverted`, `xs / sm / md / lg`, `disabled`, `round`, and `fullWidth`. Dialog has been checked with identical content against the Stitches Dialog. FormItemColor has its own pilot in the GUI package.

## Not covered yet

- `loading` / `Spin` composition
- `css` prop compatibility
- theme/light-dark token migration
- the remaining 290+ styled components

## Verification

The pilot stories were checked with computed-style comparison against the Stitches counterparts:

- Button: 11 pairs, 0 computed-style differences.
- Dialog: identical content, 0 computed-style differences.
- FormItemColor: color badge and controls matched (see the GUI pilot).

## Reset migration

Storybook now loads Panda's global reset/font faces instead of the Stitches `resetStyle()` call. Panda utilities therefore sit above the reset layer and the temporary bridge classes used during the first pilot round have been removed.

Shared Panda tokens are now aliased to the existing Stitches CSS variables, and the `css` prop is verified. Next phase: promote the pilots into the real components and begin Batch 1.
