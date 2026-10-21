# Panda CSS Phase 0 Pilot: FormItemColor

This folder contains the GUI-side Phase 0 pilot. It is not exported from `@pivot-ui/gui`.

- `PandaFormItemColor` keeps the existing Stitches FormItem/ColorPicker/Input children and replaces the color-space badge with a Panda `styled` component.
- Compared side by side with the current `FormItemColor` in Storybook.
- Storybook now loads Panda's global reset/font faces instead of the Stitches `resetStyle()` call, so the pilot no longer needs the temporary padding/font-size bridge.

Next phase: migrate the design-system tokens and light/dark theme to Panda, then replace the production component.
