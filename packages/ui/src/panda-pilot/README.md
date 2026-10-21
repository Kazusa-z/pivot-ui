# Panda CSS Phase 0 Pilot

This folder contains the Phase 0 migration pilots. Nothing here is exported from `@pivot-ui/editor` yet.

## Scope

- `PandaButton`: Panda CSS `styled` + variants.
- `PandaDialog`: Radix Dialog + Panda CSS, including overlay/content/close button and animations.
- Compared side by side with the current Stitches implementations in Storybook.

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

## Temporary reset bridge

Stitches' reset is unlayered while Panda utilities are emitted in CSS layers. This means the Stitches `div` reset can win over Panda utility classes for properties like `padding` and `font-size`. The pilot contains a small unlayered bridge class in `panda.css` so the comparison is meaningful; this disappears once the reset is migrated to Panda.

Next phase: migrate the design-system tokens/theme and reset to Panda, then promote the pilots into the real components.
