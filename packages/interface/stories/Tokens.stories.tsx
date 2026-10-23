import { useState } from 'react'
import { ThemeProvider, createThemeStore, Button, Checkbox, Input } from '@pivot-ui/react'
import type { Meta, StoryFn } from '@storybook/react'
import { fontSizes, radii, shadows, sizes, space } from '../../../panda/designTokens'
import { styled } from '@pivot-ui/react/styling/jsx'

const Page = styled('main', {
  base: {
    minHeight: '100vh',
    padding: '24px',
    backgroundColor: 'var(--colors-appBg)',
    color: 'var(--colors-textStrong)',
    fontSize: '14px',
    lineHeight: 1.5,
  },
})

const Section = styled('section', {
  base: {
    marginBlock: '24px',
    '& h2': { fontSize: '20px', fontWeight: 600, marginBottom: '8px' },
    '& > p': { color: 'var(--colors-text)', marginBottom: '16px', maxWidth: '760px' },
  },
})

const Grid = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    '@media (max-width: 900px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
})

const Card = styled('div', {
  base: {
    minWidth: 0,
    padding: '16px',
    backgroundColor: 'var(--colors-panelBg)',
    color: 'var(--colors-textStrong)',
    border: '1px solid var(--colors-border)',
    borderRadius: '8px',
    '& h3': { fontSize: '16px', fontWeight: 600, marginBottom: '12px' },
  },
})

const Surface = styled('div', {
  base: { padding: '12px', border: '1px solid var(--colors-border)', borderRadius: '6px', marginBottom: '8px' },
})

const Controls = styled('div', {
  base: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '16px' },
})

const TokenGrid = styled('div', {
  base: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '12px' },
})

const TokenName = styled('div', { base: { fontWeight: 600, marginTop: '8px' } })
const TokenValue = styled('div', {
  base: {
    color: 'var(--colors-textMuted)',
    fontFamily: 'var(--fonts-mono)',
    fontSize: '12px',
    overflowWrap: 'anywhere',
  },
})
const ScaleRow = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) 52px',
    gap: '12px',
    alignItems: 'center',
    minHeight: '32px',
  },
})
const Bar = styled('div', {
  base: { maxWidth: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-primary)' },
})

const semanticSwatches = [
  'appBg',
  'primary',
  'primaryActive',
  'textMuted',
  'text',
  'textStrong',
  'textInverted',
  'softBg',
  'softBgHover',
  'softBgActive',
  'surface',
  'surfaceSubtle',
  'surfaceStrong',
  'surfaceOverlay',
  'successBg',
  'successBorder',
  'successText',
  'dangerBg',
  'dangerBorder',
  'dangerText',
  'warningBg',
  'warningText',
  'infoBg',
  'infoText',
  'selectionBg',
  'selectionBorder',
  'panelBg',
  'toastBg',
  'border',
  'borderStrong',
  'focusRing',
] as const

function ThemeShowcase({ mode }: { mode: 'dark' | 'light' }) {
  const [store] = useState(() => createThemeStore({ initialPreference: mode }))
  return (
    <ThemeProvider store={store}>
      <Card className={`${mode}-theme`}>
        <h3>{mode === 'dark' ? 'Dark Theme' : 'Light Theme'}</h3>
        {(['surface', 'surfaceSubtle', 'surfaceStrong', 'softBg', 'panelBg'] as const).map((token) => (
          <Surface key={token} style={{ backgroundColor: `var(--colors-${token})` }}>
            <strong>{token}</strong>
            <TokenValue>Panels, controls and text share semantic color roles.</TokenValue>
          </Surface>
        ))}
        <Input aria-label={`${mode} theme input`} placeholder="Edit a value…" />
        <Controls>
          <Button variant="solid">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Checkbox aria-label={`${mode} theme checkbox`} defaultChecked />
        </Controls>
      </Card>
    </ThemeProvider>
  )
}

function SizeScale({ tokens }: { tokens: (keyof typeof sizes)[] }) {
  return tokens.map((token) => (
    <ScaleRow key={token}>
      <span style={{ overflowWrap: 'anywhere' }}>{token}</span>
      <Bar style={{ width: sizes[token] }} />
      <TokenValue>{sizes[token]}</TokenValue>
    </ScaleRow>
  ))
}

export default {
  title: 'Foundation/Tokens',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta

export const Overview: StoryFn = () => (
  <Page>
    <header>
      <TokenValue>FOUNDATIONS</TokenValue>
      <h1 style={{ fontSize: '32px', fontWeight: 600 }}>Design System</h1>
      <p>Semantic colors, surfaces, control sizes, spacing, typography and elevation for Pivot UI.</p>
    </header>

    <Section>
      <h2>Theme Surfaces</h2>
      <p>
        Compare both themes below. Use the Theme toolbar to switch the entire preview, including popovers and menus.
      </p>
      <Grid>
        <ThemeShowcase mode="dark" />
        <ThemeShowcase mode="light" />
      </Grid>
    </Section>

    <Section>
      <h2>Semantic Colors</h2>
      <p>Use semantic roles for components so their colors follow the selected theme.</p>
      <TokenGrid>
        {semanticSwatches.map((token) => (
          <Card key={token}>
            <div style={{ height: '40px', borderRadius: '4px', backgroundColor: `var(--colors-${token})` }} />
            <TokenName>{token}</TokenName>
            <TokenValue>var(--colors-{token})</TokenValue>
          </Card>
        ))}
      </TokenGrid>
    </Section>

    <Section>
      <h2>Control Sizes</h2>
      <Grid>
        <Card>
          <h3>Public Control Heights</h3>
          <SizeScale tokens={['xs', 'sm', 'md', 'lg', 'xl']} />
        </Card>
        <Card>
          <h3>Dense Editor Controls</h3>
          <SizeScale tokens={['controlXs', 'controlSm', 'controlMd', 'controlLg']} />
          <h3>Icon Sizes</h3>
          <SizeScale tokens={['iconXs', 'iconSm', 'iconMd', 'iconLg']} />
        </Card>
      </Grid>
    </Section>

    <Section>
      <h2>Spacing Rhythm</h2>
      <Card>
        {(['0_5', '1', '1_5', '2', '3', '4', '5', '6', '7', '8', '10'] as const).map((token) => (
          <ScaleRow key={token}>
            <span style={{ overflowWrap: 'anywhere' }}>{token}</span>
            <Bar style={{ width: space[token] }} />
            <TokenValue>{space[token]}</TokenValue>
          </ScaleRow>
        ))}
      </Card>
    </Section>

    <Section>
      <h2>Typography and Shape</h2>
      <Grid>
        <Card>
          <h3>Font Sizes</h3>
          {(['0_5', '1', '1_5', '2', '3', '4', '5', '6'] as const).map((token) => (
            <ScaleRow key={token}>
              <span style={{ overflowWrap: 'anywhere' }}>{token}</span>
              <span style={{ fontSize: fontSizes[token] }}>Aa</span>
              <TokenValue>{fontSizes[token]}</TokenValue>
            </ScaleRow>
          ))}
        </Card>
        <Card>
          <h3>Radii</h3>
          <TokenGrid>
            {(['xs', 'sm', 'md', 'lg', 'xl', 'round'] as const).map((token) => (
              <div key={token}>
                <div
                  style={{
                    width: '40px',
                    height: '32px',
                    backgroundColor: 'var(--colors-surfaceStrong)',
                    border: '1px solid var(--colors-borderStrong)',
                    borderRadius: radii[token],
                  }}
                />
                <TokenName>{token}</TokenName>
                <TokenValue>{radii[token]}</TokenValue>
              </div>
            ))}
          </TokenGrid>
        </Card>
      </Grid>
    </Section>

    <Section>
      <h2>Shadows and Focus</h2>
      <TokenGrid>
        {(['1', '2', '3', 'focus', 'subtleFocus'] as const).map((token) => (
          <Card key={token}>
            <div
              style={{
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--colors-surface)',
                boxShadow: shadows[token],
              }}
            />
            <TokenName>{token}</TokenName>
            <TokenValue>{shadows[token]}</TokenValue>
          </Card>
        ))}
      </TokenGrid>
    </Section>
  </Page>
)
