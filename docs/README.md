# Pivot UI Documentation

Pivot UI is a React component library for building 3D editor interfaces, inspectors and content tools. The unified `@pivot-ui/react` source package provides property contracts, visual foundations and B03 layouts: Flex, separators, scroll areas, explicit property rows, read-only presentation, disclosure and resizable panes. B04 currently adds overlays, menus, dialogs and application-owned confirmation/notification services. Unmigrated components remain in `@pivot-ui/editor` and `@pivot-ui/gui`; migrated legacy entries forward to the unified implementation. Batch acceptance status belongs in the live ledger.

These documents apply to workspace `1.0.0`, `@pivot-ui/editor` `1.2.0`, `@pivot-ui/gui` `1.2.1` and `@pivot-ui/react` `0.1.0`.

## Guides

| Document                                           | Purpose                                                                                   |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [Integrating Pivot UI](./CONSUMING.md)             | Package integration, Panda CSS setup, theming and first usage                             |
| [Development](./DEVELOPMENT.md)                    | Repository setup, commands, architecture and verification                                 |
| [Editor package](../packages/ui/README.md)         | Component package reference                                                               |
| [GUI package](../packages/gui/README.md)           | Controlled React form items and their Storybook examples                                  |
| [Unified package](../packages/interface/README.md) | Components, explicit field/scroll composition, resizing contracts and the mock playground |

## Active refactor

The Blender 5.2 LTS alignment refactor runs on `feat-blender-5-2-refactor`. Its plan and live ledger are separate from the completed Panda migration archive.

| Document                                                                                              | Purpose                                                                               |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [Refactor architecture](D:/QtProject/editor-ui-custom/docs/architecture/BLENDER_5_2_REFACTOR_PLAN.md) | Shared terminology, responsibilities, dependencies and complete component disposition |
| [Implementation batches](D:/QtProject/editor-ui-custom/docs/refactor/blender-5.2/BATCHES.md)          | Batch scope, prerequisites and acceptance criteria                                    |
| [Implementation ledger](D:/QtProject/editor-ui-custom/docs/refactor/blender-5.2/LEDGER.md)            | Inherited baseline, component progress, validation evidence and Git status            |
| [B04 overlay and service migration](./refactor/blender-5.2/B04_OVERLAYS.md)                           | U24–U30 API boundaries, provider placement, lifecycle and explicit service injection  |

## Project archive

The completed styling migration is retained as a traceable project record:

- [Release archive](./RELEASE_ARCHIVE.md)
- [Migration ledger](./migration/LEDGER.md)
- [Visual regression report](./migration/VISUAL_REGRESSION.md)
- [Raw visual regression results](./migration/visual-regression-report.json)

Archive documents describe how the current implementation was established. Current usage and development guidance belongs in the guides above.
