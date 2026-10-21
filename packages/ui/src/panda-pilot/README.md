# Panda CSS Phase 0 Pilot

This folder contains the first isolated migration pilot. Nothing here is exported from `@pivot-ui/editor` yet.

## Scope

- `PandaButton`: Panda CSS `styled` + variants.
- Compared side by side with the current Stitches `Button` in Storybook.
- Covers `solid / outline / soft / subtle / inverted`, `xs / sm / md / lg`, `disabled`, `round`, and `fullWidth`.
- Uses the existing Stitches CSS variables (`--colors-*`) so this pilot tests the Panda API/cascade without migrating the theme yet.

## Not covered yet

- `loading` / `Spin` composition
- `css` prop compatibility
- theme/light-dark migration
- Dialog / FormItemColor
- the other 290+ styled components

## Verification

The pilot story was checked with computed-style comparison against the Stitches Button for the covered variants, sizes, and disabled/round states. No computed-style differences were found for the compared properties.

Next phase: migrate the design-system tokens/theme to Panda, then port Dialog and FormItemColor before touching production exports.
