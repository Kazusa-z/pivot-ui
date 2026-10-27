// standard gray scale
import { gray, grayA, grayDark, grayDarkA } from '@radix-ui/colors'
import { slate, slateA, slateDark, slateDarkA } from '@radix-ui/colors'
// primary colors
import { blue, blueA, blueDark, blueDarkA } from '@radix-ui/colors'
import { orange, orangeA, orangeDark, orangeDarkA } from '@radix-ui/colors'
// positive colors
import { green, greenA, greenDark, greenDarkA } from '@radix-ui/colors'
// negative colors
import { red, redA, redDark, redDarkA } from '@radix-ui/colors'
import { amber, amberA, amberDark, amberDarkA } from '@radix-ui/colors'
import { yellow, yellowA, yellowDark, yellowDarkA } from '@radix-ui/colors'
// exclusive colors
import { gold, goldA, goldDark, goldDarkA } from '@radix-ui/colors'
// dedicated colors for prefab
import { cyan, cyanA, cyanDark, cyanDarkA } from '@radix-ui/colors'
import { teal, tealA, tealDark, tealDarkA } from '@radix-ui/colors'
import { violet, violetA, violetDark, violetDarkA } from '@radix-ui/colors'
import { lime, limeA, limeDark, limeDarkA } from '@radix-ui/colors'

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
  ...orangeDark,
  ...orangeDarkA,
  ...greenDark,
  ...greenDarkA,
  ...redDark,
  ...redDarkA,
  ...amberDark,
  ...amberDarkA,
  ...yellowDark,
  ...yellowDarkA,
  ...goldDark,
  ...goldDarkA,
  ...cyanDark,
  ...cyanDarkA,
  ...tealDark,
  ...tealDarkA,
  ...violetDark,
  ...violetDarkA,
  ...limeDark,
  ...limeDarkA,
}

const lightColors = {
  ...absoluteColors,
  ...lightStandardGrayColor,
  ...blue,
  ...blueA,
  ...orange,
  ...orangeA,
  ...green,
  ...greenA,
  ...red,
  ...redA,
  ...amber,
  ...amberA,
  ...yellow,
  ...yellowA,
  ...gold,
  ...goldA,
  ...cyan,
  ...cyanA,
  ...teal,
  ...tealA,
  ...violet,
  ...violetA,
  ...lime,
  ...limeA,
}

const coreSemanticColors = {
  appBg: '$gray2',

  primary: '$blue9',
  primaryActive: '$blue10',
  // Solid fills that carry white text use a darker blue than the blue9 accent.
  // Radix light blue8 is too light for white text; light theme overrides use blue11.
  primarySolid: '$blue8',
  primarySolidHover: '$blue7',

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

  border: '$grayA5',
  borderStrong: '$grayA7',

  focusRing: '$blueA7',
}

const statusSemanticColors = {
  // Status text uses the 12 step so 12px/14px copy clears 4.5:1 on the status tint.
  infoText: '$blue12',
  infoBg: '$blue3',
  infoBgHover: '$blue4',
  infoBorder: '$blue7',
  infoSolid: '$blue9',
  infoSolidHover: '$blue10',

  successText: '$green12',
  successBg: '$green3',
  successBgHover: '$greenA4',
  successBorder: '$green7',
  successSolid: '$green9',
  successSolidHover: '$green10',

  warningText: '$amber12',
  warningBg: '$amber3',
  warningBgHover: '$amber4',
  warningBorder: '$amber7',
  // Amber 9 is too light for white text; use a dark amber that clears 4.5:1.
  warningSolid: '#8a5a00',
  warningSolidHover: '#6f4800',

  dangerText: '$red12',
  dangerBg: '$redA3',
  dangerBgHover: '$redA4',
  dangerBorder: '$red7',
  dangerSolid: '$red9',
  dangerSolidHover: '$red10',

  selectionText: '$white',
  selectionBg: '$blue8',
  selectionBgHover: '$blue7',
  selectionBorder: '$blue8',

  // Secondary selection for cards/tiles: tinted, not a full solid row.
  selectionSubtleBg: '$blueA3',
  selectionSubtleBorder: '$blue8',

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
    // Solid status fills are darker than the accent steps so white text clears 4.5:1.
    dangerSolid: '$red8',
    dangerSolidHover: '$red7',
    successSolid: '$green8',
    successSolidHover: '$green7',
    infoSolid: '$blue8',
    infoSolidHover: '$blue7',
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
    // Light Radix blue8 (#5eb1ef) does not carry white text; use blue11 and a darker hover.
    primarySolid: '$blue11',
    primarySolidHover: '#0a5fa8',
    selectionBg: '$blue11',
    selectionBgHover: '#0a5fa8',
    selectionBorder: '$blue11',
    selectionSubtleBorder: '$blue11',
    dangerSolid: '$red11',
    dangerSolidHover: '$red12',
    successSolid: '$green11',
    successSolidHover: '$green12',
    infoSolid: '$blue11',
    infoSolidHover: '$blue12',
  },
} as const
