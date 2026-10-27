import { useEffect, useState, type ComponentProps } from 'react'
import { Controls, Description, DocsContainer, Primary, Stories, Subtitle, Title } from '@storybook/addon-docs/blocks'
import { create } from 'storybook/theming'
import { darkColors, fonts, lightColors } from '../panda/designTokens'
import { themeClasses } from '../packages/interface/src/foundation/theme'

// Docs chrome uses the library's own surfaces and fonts, so a component shown in docs
// sits on the same background it gets in an application.
const docsThemes = {
  dark: create({
    base: 'dark',
    appBg: darkColors.gray1,
    appContentBg: darkColors.gray1,
    appPreviewBg: darkColors.gray2,
    appBorderColor: darkColors.gray5,
    textColor: darkColors.gray12,
    textMutedColor: darkColors.gray11,
    barBg: darkColors.gray2,
    colorSecondary: darkColors.primary,
    fontBase: fonts.default,
    fontCode: fonts.mono,
  }),
  light: create({
    base: 'light',
    appBg: lightColors.gray2,
    appContentBg: lightColors.gray1,
    appPreviewBg: lightColors.white,
    appBorderColor: lightColors.gray5,
    textColor: lightColors.gray12,
    textMutedColor: lightColors.gray11,
    barBg: lightColors.gray1,
    colorSecondary: lightColors.primary,
    fontBase: fonts.default,
    fontCode: fonts.mono,
  }),
}

type DocsContainerProps = ComponentProps<typeof DocsContainer>
type GlobalsContext = {
  store?: { userGlobals?: { globals?: Record<string, unknown> } }
  channel?: {
    on(event: string, listener: (event: { globals: Record<string, unknown> }) => void): void
    off(event: string, listener: (event: { globals: Record<string, unknown> }) => void): void
  }
}

/** Docs container that follows the toolbar theme instead of Storybook's fixed light docs theme. */
export function ThemedDocsContainer({ context, children }: DocsContainerProps) {
  const docsContext = context as unknown as GlobalsContext
  const read = () => (docsContext.store?.userGlobals?.globals?.theme === 'light' ? 'light' : 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(read)
  useEffect(() => {
    const listener = ({ globals }: { globals: Record<string, unknown> }) =>
      setTheme(globals.theme === 'light' ? 'light' : 'dark')
    docsContext.channel?.on('globalsUpdated', listener)
    return () => docsContext.channel?.off('globalsUpdated', listener)
  }, [docsContext])
  // Guide pages render library components without a story decorator; keep the page's
  // theme class in sync so their tokens match the docs chrome.
  useEffect(() => {
    document.documentElement.classList.toggle(themeClasses.light, theme === 'light')
    document.documentElement.classList.toggle(themeClasses.dark, theme === 'dark')
  }, [theme])
  return (
    <DocsContainer context={context} theme={docsThemes[theme]}>
      {children}
    </DocsContainer>
  )
}

/**
 * One page per component, most important first: what it is for (subtitle), the typical
 * example, when to use it and its neighbours (description), its API with live controls,
 * then the remaining examples.
 * Behavior stories opt out with the `!autodocs` tag and stay in the sidebar only.
 */
export function ComponentDocsPage() {
  return (
    <>
      <Title />
      <Subtitle />
      <Primary />
      <Description />
      <Controls />
      <Stories title="示例" includePrimary={false} />
    </>
  )
}
