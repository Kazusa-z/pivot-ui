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
import { Button } from '../src/controls/buttons'
import { Select } from '../src/controls/choices/Select'
import { Callout } from '../src/display/feedback'
import { Text } from '../src/foundation/typography'
import { StoryPage, StorySection, StoryCard, StoryRow, StoryField, StoryGrid, StoryState } from './support/StoryPage'

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

const preferenceOptions = [
  { key: 'light', label: 'Light', value: 'light' },
  { key: 'dark', label: 'Dark', value: 'dark' },
  { key: 'system', label: 'System', value: 'system' },
] as const

function ThemeConsumer({ name }: { name: string }) {
  const { preference, resolvedTheme, setPreference } = useTheme()
  return (
    <StoryCard title={name} description="共享 store 的消费区域会同步更新。">
      <StoryField label="Preference">
        <Select
          aria-label={`${name} preference`}
          value={preference}
          options={[...preferenceOptions]}
          onValueChange={(value) => {
            if (isThemePreference(value)) setPreference(value)
          }}
        />
      </StoryField>
      <StoryState label={`${name} snapshot`} value={{ preference, resolvedTheme }} />
      <Callout severity="success">语义颜色随 resolvedTheme 使用对应的明暗配色。</Callout>
    </StoryCard>
  )
}

type Scenario = 'preferences' | 'providers' | 'lifecycle'

const descriptions: Record<Scenario, string> = {
  preferences:
    '选择 Light、Dark 或 System，两个区域同步显示。System 根据系统主题解析 resolvedTheme，同时保留用户的 System 偏好；外观应用到局部容器。',
  providers:
    'A 和 B 共享同一个 store，任意一侧切换都会同步。移除一个 Provider 后另一个仍可用；全部卸载后清理系统与存储订阅，再挂载时读取最新值。',
  lifecycle:
    '外部存储更新可同步其他窗口的主题偏好。用按钮发送通知，观察两个区域；全部卸载后修改存储，再挂载会读取新值。Clear storage 恢复初始 System 偏好。',
}

function ThemePlayground({ scenario, onReset }: { scenario: Scenario; onReset: () => void }) {
  const target = useRef<HTMLDivElement>(null)
  const [fixture] = useState(() => createThemeFixture(() => target.current))
  const [showA, setShowA] = useState(true)
  const [showB, setShowB] = useState(true)
  const diagnostics = useSyncExternalStore(fixture.subscribeDiagnostics, fixture.getDiagnostics, fixture.getDiagnostics)
  return (
    <div ref={target}>
      <StoryPage
        eyebrow="Foundation"
        title="Theme"
        summary={descriptions[scenario]}
        meta={
          <>
            <span>preference: light / dark / system</span>
            <span>·</span>
            <span>local appearance target</span>
          </>
        }
        actions={
          <Button size="sm" variant="outline" onClick={onReset}>
            Reset
          </Button>
        }>
        <StorySection title="Scenario">
          <StoryCard>
            <StoryRow>
              <Button size="sm" variant="outline" onClick={() => fixture.setSystemTheme('light')}>
                Simulate system light
              </Button>
              <Button size="sm" variant="outline" onClick={() => fixture.setSystemTheme('dark')}>
                Simulate system dark
              </Button>
              {scenario !== 'preferences' && (
                <>
                  <Button size="sm" variant="outline" aria-pressed={showA} onClick={() => setShowA((value) => !value)}>
                    {showA ? 'Unmount A' : 'Mount A'}
                  </Button>
                  <Button size="sm" variant="outline" aria-pressed={showB} onClick={() => setShowB((value) => !value)}>
                    {showB ? 'Unmount B' : 'Mount B'}
                  </Button>
                </>
              )}
            </StoryRow>
            {scenario === 'lifecycle' && (
              <StoryRow>
                <Button size="sm" variant="outline" onClick={() => fixture.externalPreference('light')}>
                  External light
                </Button>
                <Button size="sm" variant="outline" onClick={() => fixture.externalPreference('dark')}>
                  External dark
                </Button>
                <Button size="sm" variant="outline" onClick={() => fixture.externalPreference('system')}>
                  External system
                </Button>
                <Button size="sm" variant="outline" onClick={() => fixture.externalPreference(null)}>
                  Clear storage
                </Button>
              </StoryRow>
            )}
          </StoryCard>
        </StorySection>

        <StorySection title="Consumers" description="每个 Provider 连接自己的 store；同一 store 的消费者同步。">
          <StoryGrid>
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
          </StoryGrid>
        </StorySection>

        <StorySection title="Diagnostics">
          <StoryState label="Injected adapter state" value={diagnostics} />
          <Text size="sm" tone="muted">
            两个消费者共享同一个 store；Provider 卸载后 store 释放订阅，重新挂载时读取存储和系统主题。
          </Text>
        </StorySection>
      </StoryPage>
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
  parameters: {
    docs: {
      description: {
        component:
          'ThemeProvider 提供浅色、深色或跟随系统的主题。useTheme 读取 preference 和最终 resolvedTheme，setPreference 发起切换；共享 store 的多个区域同步更新。应用通过存储、系统主题和外观适配器接入运行环境。',
      },
    },
    layout: 'fullscreen',
    controls: { disable: true },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { render: () => <ThemeStory scenario="preferences" /> }
export const SharedProviders: Story = {
  render: () => <ThemeStory scenario="providers" />,
  tags: ['!autodocs'],
}
export const StorageAndCleanup: Story = {
  render: () => <ThemeStory scenario="lifecycle" />,
  tags: ['!autodocs'],
}
