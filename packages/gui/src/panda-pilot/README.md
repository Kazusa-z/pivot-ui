# Panda CSS Phase 0 Pilot: FormItemColor

This folder contains the GUI-side Phase 0 pilot. It is not exported from `@pivot-ui/gui`.

- `PandaFormItemColor` keeps the existing Stitches FormItem/ColorPicker/Input children and replaces the color-space badge with a Panda `styled` component.
- Compared side by side with the current `FormItemColor` in Storybook.
- The pilot uses a small unlayered bridge class for `padding`/`font-size` because Stitches' reset is unlayered while Panda utilities use CSS layers. This bridge goes away when the reset is migrated to Panda.

Next phase: migrate the design-system tokens/theme and reset, then replace the production component.
