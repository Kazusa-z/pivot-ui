// Gray uses slate; the remaining hues are the only ones the components may use:
// blue is the single accent, green/amber/red carry status, violet is the one
// category color. Add a hue here only when a component needs a new meaning.
import { gray, grayA } from '@radix-ui/colors'
import { slate, slateA, slateDark, slateDarkA } from '@radix-ui/colors'
import { blue, blueA, blueDark, blueDarkA } from '@radix-ui/colors'
import { green, greenA, greenDark, greenDarkA } from '@radix-ui/colors'
import { amber, amberA, amberDark, amberDarkA } from '@radix-ui/colors'
import { red, redA, redDark, redDarkA } from '@radix-ui/colors'
import { violet, violetA, violetDark, violetDarkA } from '@radix-ui/colors'

const conver2StandardGrayColors = (colors: Record<string, string>): typeof gray & typeof grayA => {
  const standardColors: any = {}
  for (const [key, value] of Object.entries(colors)) {
    standardColors[key.replace(/([a-z])+(A)?/, 'gray$2')] = value
  }
  return standardColors
}

// Radix UI provide 7 types of gray.
export const lightStandardGrayColor = conver2StandardGrayColors({ ...slate, ...slateA })
export const darkStandardGrayColor = conver2StandardGrayColors({ ...slateDark, ...slateDarkA })

// Absolute colors are shared by both themes so `$white` / `$black` always resolve.
const absoluteColors = {
  white: '#ffffff',
  black: '#000000',
}

// Both themes must expose the same keys; a key missing from one theme silently
// inherits the other theme's value through the CSS cascade.
const darkColors = {
  ...absoluteColors,
  ...darkStandardGrayColor,
  ...blueDark,
  ...blueDarkA,
  ...greenDark,
  ...greenDarkA,
  ...amberDark,
  ...amberDarkA,
  ...redDark,
  ...redDarkA,
  ...violetDark,
  ...violetDarkA,
}

const lightColors = {
  ...absoluteColors,
  ...lightStandardGrayColor,
  ...blue,
  ...blueA,
  ...green,
  ...greenA,
  ...amber,
  ...amberA,
  ...red,
  ...redA,
  ...violet,
  ...violetA,
}

const coreSemanticColors = {
  appBg: '$gray2',

  // One accent blue for fills, lines and indicators. It is dark enough to carry
  // white text (>= 4.5:1) in both themes, so solid buttons, selections and chart
  // lines read as the same color instead of two competing blues.
  primary: '$blue11',
  primaryHover: '#0a5fa8',
  primaryActive: '#0a5fa8',
  primarySolid: '$blue11',
  primarySolidHover: '#0a5fa8',
  // Low-emphasis accent for large value fills (slider bars) that sit under text.
  primaryMuted: '$blue6',
  primaryMutedHover: '$blue7',

  textMuted: '$gray10',
  text: '$gray11',
  textStrong: '$gray12',
  textInverted: '$gray1',

  surface: '$gray2',
  surfaceSubtle: '$grayA3',
  surfaceStrong: '$gray4',
  surfaceOverlay: '$gray3',
  surfaceRaised: '$gray3',

  softBg: '$grayA3',
  softBgHover: '$grayA4',
  softBgActive: '$grayA5',

  // Selected item inside a neutral track (subtle segment / toggle groups).
  controlRaisedBg: '$white',

  border: '$grayA5',
  borderStrong: '$grayA7',

  focusRing: '$blueA8',
}

const statusSemanticColors = {
  // Tinted backgrounds stay translucent so status blocks sit on any surface
  // without turning into saturated slabs. Status text uses step 12 so 12px/14px
  // copy clears 4.5:1 on the tint; step 11 marks icons and titles.
  infoText: '$blue12',
  infoIcon: '$blue11',
  infoBg: '$blueA3',
  infoBgHover: '$blueA4',
  infoBorder: '$blueA7',
  infoSolid: '$blue11',
  infoSolidHover: '#0a5fa8',

  successText: '$green12',
  successIcon: '$green11',
  successBg: '$greenA3',
  successBgHover: '$greenA4',
  successBorder: '$greenA7',
  successSolid: '$green11',
  successSolidHover: '$green12',

  warningText: '$amber12',
  warningIcon: '$amber11',
  warningBg: '$amberA3',
  warningBgHover: '$amberA4',
  warningBorder: '$amberA7',
  // Amber 9 is too light for white text; use a dark amber that clears 4.5:1.
  warningSolid: '#8a5a00',
  warningSolidHover: '#6f4800',

  dangerText: '$red12',
  dangerIcon: '$red11',
  dangerBg: '$redA3',
  dangerBgHover: '$redA4',
  dangerBorder: '$redA8',
  dangerSolid: '$red11',
  dangerSolidHover: '$red12',

  // Strong selection (menus, rows, checked boxes) is the accent itself.
  selectionText: '$white',
  selectionBg: '$blue11',
  selectionBgHover: '#0a5fa8',
  selectionBorder: '$blue11',

  // Secondary selection for cards/tiles: tinted, not a full solid row.
  selectionSubtleBg: '$blueA3',
  selectionSubtleBorder: '$blue11',

  scrollbarTrack: '$grayA3',
  scrollbarTrackHover: '$grayA5',
  scrollbarThumb: '$grayA7',
}

const contextSemanticColors = {
  panelBg: '$gray3',
  overlayScrim: 'rgba(0, 0, 0, 0.72)',
}

export const semanticColors = {
  ...coreSemanticColors,
  ...statusSemanticColors,
  ...contextSemanticColors,
}

// Dark accent: Radix dark blue9 (#0090ff) cannot carry white text and blue8 reads
// gray, so the dark theme uses one calibrated blue. Hover gets lighter in the
// dark theme and darker in the light theme, so feedback always moves toward
// more contrast with the surrounding surface.
const darkAccent = '#2f6fdb'
const darkAccentHover = '#3f7ee6'

export const colors = {
  dark: {
    ...darkColors,
    ...semanticColors,
    // Restore elevation: page is darker than cards, overlays are lighter than the page.
    appBg: '$gray1',
    surface: '$gray2',
    surfaceOverlay: '$gray3',
    surfaceRaised: '$gray3',
    textMuted: '#8b909a',
    primary: darkAccent,
    primaryHover: darkAccentHover,
    primaryActive: darkAccentHover,
    primarySolid: darkAccent,
    primarySolidHover: darkAccentHover,
    primaryMuted: '#24406b',
    primaryMutedHover: '#2b4b7d',
    controlRaisedBg: '$gray6',
    selectionBg: darkAccent,
    selectionBgHover: darkAccentHover,
    selectionBorder: darkAccent,
    selectionSubtleBorder: darkAccent,
    infoSolid: darkAccent,
    infoSolidHover: darkAccentHover,
    // Solid status fills are darker than the accent steps so white text clears 4.5:1.
    dangerSolid: '$red8',
    dangerSolidHover: '$red9',
    successSolid: '$green8',
    successSolidHover: '$green9',
  },
  light: {
    ...lightColors,
    ...semanticColors,
    appBg: '$gray2',
    surfaceOverlay: '$white',
    surfaceRaised: '$white',
    surface: '$gray1',
    surfaceSubtle: '$gray2',
    surfaceStrong: '$gray3',
    textMuted: '#6b7078',
  },
} as const
