import { useRef, useState, useSyncExternalStore } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  ThemeProvider,
  createBrowserThemeAppearance,
  createThemeStore,
  isThemePreference,
  useTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '../src/foundation/theme'
import { css } from '../styled-system/css'
import {
  ContractFrame,
  ControlButton,
  ControlField,
  ControlSelect,
  StatePanel,
  contractStyles,
} from './support/ContractFrame'

function createThemeFixture(getTarget: () => HTMLElement | null) {
  let storedPreference: ThemePreference | null = 'system'
  let systemTheme: ResolvedTheme = 'light'
  const systemListeners = new Set<() => void>()
  const storageListeners = new Set<() => void>()
  const diagnosticListeners = new Set<() => void>()
  const readDiagnostics = () => ({
    storedPreference,
    systemTheme,
    systemListeners: systemListeners.size,
    storageListeners: storageListeners.size,
  })
  let diagnostics = readDiagnostics()
  const publishDiagnostics = () => {
    diagnostics = readDiagnostics()
    for (const listener of diagnosticListeners) listener()
  }
  const store = createThemeStore({
    initialPreference: 'system',
    initialSystemTheme: 'light',
    storage: {
      read: () => storedPreference,
      write(preference) {
        storedPreference = preference
        publishDiagnostics()
      },
      subscribe(listener) {
        storageListeners.add(listener)
        publishDiagnostics()
        return () => {
          storageListeners.delete(listener)
          publishDiagnostics()
        }
      },
    },
    system: {
      read: () => systemTheme,
      subscribe(listener) {
        systemListeners.add(listener)
        publishDiagnostics()
        return () => {
          systemListeners.delete(listener)
          publishDiagnostics()
        }
      },
    },
    appearance: createBrowserThemeAppearance({ getTarget }),
  })
  return {
    store,
    getDiagnostics: () => diagnostics,
    subscribeDiagnostics(listener: () => void) {
      diagnosticListeners.add(listener)
      return () => {
        diagnosticListeners.delete(listener)
      }
    },
    setSystemTheme(theme: ResolvedTheme) {
      systemTheme = theme
      for (const listener of systemListeners) listener()
      publishDiagnostics()
    },
    externalPreference(preference: ThemePreference | null) {
      storedPreference = preference
      for (const listener of storageListeners) listener()
      publishDiagnostics()
    },
  }
}

function ThemeConsumer({ name }: { name: string }) {
  const { preference, resolvedTheme, setPreference } = useTheme()
  return (
    <section
      aria-label={name}
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        border: '1px solid var(--colors-border)',
        borderRadius: '8px',
        backgroundColor: 'var(--colors-panelBg)',
      })}>
      <h2 className={css({ margin: 0, fontSize: '16px', fontWeight: 600 })}>{name}</h2>
      <ControlField label={`${name} preference`}>
        <ControlSelect
          value={preference}
          onChange={(event) => {
            if (isThemePreference(event.target.value)) setPreference(event.target.value)
          }}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </ControlSelect>
      </ControlField>
      <StatePanel label={`${name} snapshot`} value={{ preference, resolvedTheme }} />
      <div
        className={css({
          padding: '12px',
          borderRadius: '6px',
          color: 'var(--colors-successText)',
          backgroundColor: 'var(--colors-successBg)',
          border: '1px solid var(--colors-successBorder)',
        })}>
        Semantic colors follow resolvedTheme.
      </div>
    </section>
  )
}

type Scenario = 'preferences' | 'providers' | 'lifecycle'

const descriptions: Record<Scenario, string> = {
  preferences:
    '选择 Light、Dark 或 System；两个消费者同步。模拟系统主题改变时，只有 System 模式的 resolvedTheme 跟随，preference 与存储始终保持 System。局部 DOM 作用域不会修改 Storybook 工具栏主题。',
  providers:
    'A 和 B 使用同一 store，切换任意一侧会同步另一侧。单独卸载一个 Provider 不会移除另一侧仍需要的系统或存储监听；全部卸载后监听数量归零，再挂载会恢复最新值。',
  lifecycle:
    '模拟来自其他窗口的存储通知，观察两个消费者同步。全部卸载后系统和存储监听数量为零；此时修改外部值，再挂载会读取新值。Clear storage 会回到初始 System 偏好。',
}

function ThemePlayground({ scenario, onReset }: { scenario: Scenario; onReset: () => void }) {
  const target = useRef<HTMLDivElement>(null)
  const [fixture] = useState(() => createThemeFixture(() => target.current))
  const [showA, setShowA] = useState(true)
  const [showB, setShowB] = useState(true)
  const diagnostics = useSyncExternalStore(fixture.subscribeDiagnostics, fixture.getDiagnostics, fixture.getDiagnostics)
  return (
    <div ref={target} className={css({ backgroundColor: 'var(--colors-appBg)', minHeight: '100vh' })}>
      <ContractFrame title="Theme store" description={descriptions[scenario]} onReset={onReset}>
        <div className={contractStyles.row}>
          <ControlButton onClick={() => fixture.setSystemTheme('light')}>Simulate system light</ControlButton>
          <ControlButton onClick={() => fixture.setSystemTheme('dark')}>Simulate system dark</ControlButton>
          {scenario !== 'preferences' && (
            <>
              <ControlButton aria-pressed={showA} onClick={() => setShowA((value) => !value)}>
                {showA ? 'Unmount A' : 'Mount A'}
              </ControlButton>
              <ControlButton aria-pressed={showB} onClick={() => setShowB((value) => !value)}>
                {showB ? 'Unmount B' : 'Mount B'}
              </ControlButton>
            </>
          )}
        </div>
        {scenario === 'lifecycle' && (
          <div className={contractStyles.row}>
            <ControlButton onClick={() => fixture.externalPreference('light')}>External storage light</ControlButton>
            <ControlButton onClick={() => fixture.externalPreference('dark')}>External storage dark</ControlButton>
            <ControlButton onClick={() => fixture.externalPreference('system')}>External storage system</ControlButton>
            <ControlButton onClick={() => fixture.externalPreference(null)}>Clear storage</ControlButton>
          </div>
        )}
        <div className={contractStyles.grid}>
          {showA && (
            <ThemeProvider store={fixture.store}>
              <ThemeConsumer name="Consumer A" />
            </ThemeProvider>
          )}
          {showB && (
            <ThemeProvider store={fixture.store}>
              <ThemeProvider>
                <ThemeConsumer name="Consumer B" />
              </ThemeProvider>
            </ThemeProvider>
          )}
        </div>
        <StatePanel label="Injected adapter state" value={diagnostics} />
      </ContractFrame>
    </div>
  )
}

function ThemeStory({ scenario }: { scenario: Scenario }) {
  const [generation, setGeneration] = useState(0)
  return <ThemePlayground key={generation} scenario={scenario} onReset={() => setGeneration((value) => value + 1)} />
}

const meta = {
  title: 'Foundation/Theme',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Preferences: Story = { render: () => <ThemeStory scenario="preferences" /> }
export const SharedProviders: Story = { render: () => <ThemeStory scenario="providers" /> }
export const StorageAndCleanup: Story = { render: () => <ThemeStory scenario="lifecycle" /> }
