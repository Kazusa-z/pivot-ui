import { useState } from 'react'
import { Button, ThemeProvider, Text, Title, useTheme } from '@pivot-ui/react'
import { styled } from '@pivot-ui/react/styling/jsx'
import { token } from '@pivot-ui/react/styling/tokens'

const DemoRoot = styled('main', {
  base: {
    minHeight: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px',
    color: 'var(--colors-text)',
    backgroundColor: 'var(--colors-appBg)',
  },
})

function ThemeControls() {
  const { preference, resolvedTheme, setPreference } = useTheme()
  return (
    <>
      <div aria-label="Theme choices" role="group">
        {(['light', 'dark', 'system'] as const).map((mode) => (
          <Button
            key={mode}
            variant={preference === mode ? 'solid' : 'soft'}
            aria-pressed={preference === mode}
            onClick={() => setPreference(mode)}>
            {mode}
          </Button>
        ))}
      </div>
      <Text size="sm" tone="muted">
        Theme: {preference}; actual: {resolvedTheme}
      </Text>
    </>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <ThemeProvider>
      <DemoRoot>
        <Title as="h1" size={6} weight="bold">
          Pivot UI
        </Title>
        <Text style={{ color: token.var('colors.textStrong') }}>Count: {count}</Text>
        <Button size="md" variant="solid" onClick={() => setCount(count + 1)} css={{ margin: '16px 0' }}>
          Increment Count
        </Button>
        <ThemeControls />
        <Text size="sm" tone="muted">
          Check the bundle analyzer to verify tree-shaking is working correctly
        </Text>
      </DemoRoot>
    </ThemeProvider>
  )
}

export default App
