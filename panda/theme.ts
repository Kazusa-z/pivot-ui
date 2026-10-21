import { colors } from '../packages/ui/src/design-system/colors'
import { fontSizes, radii, shadows, sizes, space } from '../packages/ui/src/design-system/sizes'

const tokenVars = (keys: string[], scale: string) =>
  Object.fromEntries(keys.map((key) => [key, { value: `var(--${scale}-${key})` }]))

const fontKeys = ['default', 'untitled', 'mono']
const fontWeightKeys = ['light', 'regular', 'medium', 'bold']
const lineHeightKeys = ['1', '1_5', '2', '3', '4', '5', '6', '7', '8', '9']
const transitionKeys = ['shadow', 'backgroundColor', 'borderColor', 'color']

export const tokens = {
  colors: tokenVars(Object.keys(colors.dark), 'colors'),
  spacing: tokenVars(Object.keys(space), 'space'),
  sizes: tokenVars(Object.keys(sizes), 'sizes'),
  fontSizes: tokenVars(Object.keys(fontSizes), 'fontSizes'),
  radii: tokenVars(Object.keys(radii), 'radii'),
  shadows: tokenVars(Object.keys(shadows), 'shadows'),
  fonts: tokenVars(fontKeys, 'fonts'),
  fontWeights: tokenVars(fontWeightKeys, 'fontWeights'),
  lineHeights: tokenVars(lineHeightKeys, 'lineHeights'),
  transitions: tokenVars(transitionKeys, 'transitions'),
}
