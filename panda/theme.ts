import {
  darkColors,
  fontSizes,
  fonts,
  fontWeights,
  lineHeights,
  radii,
  shadows,
  sizes,
  space,
  transitions,
} from './designTokens'

const tokenVars = (keys: string[], scale: string) =>
  Object.fromEntries(keys.map((key) => [key, { value: `var(--${scale}-${key})` }]))

export const tokens = {
  colors: tokenVars(Object.keys(darkColors), 'colors'),
  spacing: tokenVars(Object.keys(space), 'space'),
  sizes: tokenVars(Object.keys(sizes), 'sizes'),
  fontSizes: tokenVars(Object.keys(fontSizes), 'fontSizes'),
  radii: tokenVars(Object.keys(radii), 'radii'),
  shadows: tokenVars(Object.keys(shadows), 'shadows'),
  fonts: tokenVars(Object.keys(fonts), 'fonts'),
  fontWeights: tokenVars(Object.keys(fontWeights), 'fontWeights'),
  lineHeights: tokenVars(Object.keys(lineHeights), 'lineHeights'),
  transitions: tokenVars(Object.keys(transitions), 'transitions'),
}
