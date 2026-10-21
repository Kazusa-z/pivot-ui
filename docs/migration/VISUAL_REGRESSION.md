# Full visual regression

**Archive status:** final. Migration baseline: `4c8b588`; candidate: Panda branch at `925a7bf`.

## Method

- Baseline: `4c8b588` (the last Stitches version), built as a separate git worktree.
- Candidate: current Panda branch, after TD-11 and TD-12 fixes.
- Both Storybooks served statically and captured with Chromium at `1000x800`, `fullPage`.
- Each page waited for fonts, then animations/transitions were disabled before screenshotting.
- Pixel comparison used a per-channel threshold of 5/255.
- Compared all stories present in both builds:
  - UI: 103 stories
  - GUI: 8 stories

## Result

| Result                                 | Count |
| -------------------------------------- | ----: |
| Total compared                         |   111 |
| Pixel-identical                        |    94 |
| Subpixel/text antialias only (<= 0.2%) |    15 |
| Reviewed exceptions                    |     2 |

No story changed dimensions. No runtime console errors remained after retrying one transient static-server reset.

## Subpixel-only stories

These differ only in glyph antialiasing or 1 px control edges. Their computed dimensions, colors and layout geometry were checked against the baseline.

- `display-kbd--kbd-group`
- `display-kbd--kbd-color`
- `display-kbd--sizes`
- `display-kbd--overview`
- `inputs-colorslider--overview`
- `inputs-colorslider--particle-slider`
- `inputs-colorslider--gradient-slider`
- `display-spin--sizes`
- `display-spin--overview`
- `inputs-checkbox--controlled`
- `inputs-checkbox--disabled`
- `inputs-checkbox--uncontrolled`
- `inputs-checkbox--with-label`
- `gui--overview`
- `guiroot--overview`

## Reviewed exceptions

### `inputs-textarea--states`

The old Stitches build rendered the same soft/invalid textarea classes with a red background in `States`, but with a soft background in `Matrix`. This is a CSS-injection-order inconsistency in the old implementation, not a deterministic visual target. Panda now renders one deterministic result and matches `Matrix`.

### `display-tree--overview`

The Tree story was intentionally enriched during Batch 3 (folder/file tree, expand/collapse, rename/delete actions). The diff is expected story-content change, not a component regression.

## Raw report

See [visual-regression-report.json](./visual-regression-report.json) for every compared story, diff percentage and status.
