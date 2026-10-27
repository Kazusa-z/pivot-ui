import { useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
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
import { SegmentControl } from '../src/controls/choices/SegmentControl'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { Column, Grid, Row, StateView } from './support/layout'

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

const regionClass = css({
  display: 'grid',
  gap: 'var(--space-3)',
  padding: 'var(--space-4)',
  borderRadius: 'var(--radii-controlLg)',
  border: '1px solid var(--colors-border)',
  backgroundColor: 'var(--colors-appBg)',
  color: 'var(--colors-text)',
})

function PreferencePicker({ label }: { label: string }) {
  const { preference, resolvedTheme, setPreference } = useTheme()
  return (
    <Column>
      <SegmentControl
        aria-label={`${label} theme`}
        value={preference}
        options={[...preferenceOptions]}
        css={{ width: '240px' }}
        onValueChange={(value) => {
          if (isThemePreference(value)) setPreference(value)
        }}
      />
      <Text size="sm" tone="muted">
        preference: {preference} · resolvedTheme: {resolvedTheme}
      </Text>
    </Column>
  )
}

/** A region with its own store, so the example does not change the rest of the docs page. */
function LocalThemeRegion({ children }: { children: ReactNode }) {
  const target = useRef<HTMLDivElement>(null)
  const [store] = useState(() =>
    createThemeStore({
      initialPreference: 'light',
      appearance: createBrowserThemeAppearance({ getTarget: () => target.current }),
    })
  )
  return (
    <div ref={target} className={regionClass}>
      <ThemeProvider store={store}>{children}</ThemeProvider>
    </div>
  )
}

const meta = {
  title: 'Foundation/Theme',
  component: ThemeProvider,
  tags: ['autodocs'],
  parameters: {
    ...describeComponent({
      summary: '`ThemeProvider` 提供亮色、暗色或跟随系统的主题；`useTheme()` 读取和切换。',
      use: [
        '应用根部放一个 `ThemeProvider`，用 `useTheme().setPreference` 做主题切换菜单',
        '局部区域使用不同主题（例如预览面板）：传入 `createThemeStore()` 创建的独立 store',
      ],
      notes: [
        '`preference` 是用户的选择（light / dark / system），`resolvedTheme` 是实际生效的明暗',
        '偏好的保存位置、系统主题来源、class 加在哪个元素上，都通过 store 的适配器注入；默认使用浏览器实现',
        'Popover、菜单等浮层通过 portal 渲染时会继承所属 Provider 的主题',
      ],
    }),
    controls: { disable: true },
  },
} satisfies Meta<typeof ThemeProvider>
export default meta
type Story = StoryObj<typeof meta>

/** 这个区域有自己的 store，切换只影响区域内部。 */
export const Basic: Story = {
  args: { children: null },
  render: () => (
    <LocalThemeRegion>
      <PreferencePicker label="Region" />
      <Row>
        <Button variant="solid">Save</Button>
        <Button>Cancel</Button>
      </Row>
    </LocalThemeRegion>
  ),
}

function ThemeBehavior({ lifecycle }: { lifecycle: boolean }) {
  const target = useRef<HTMLDivElement>(null)
  const [fixture] = useState(() => createThemeFixture(() => target.current))
  const [showA, setShowA] = useState(true)
  const [showB, setShowB] = useState(true)
  const diagnostics = useSyncExternalStore(fixture.subscribeDiagnostics, fixture.getDiagnostics, fixture.getDiagnostics)
  return (
    <div ref={target} className={regionClass}>
      <Row>
        <Button size="sm" variant="outline" onClick={() => fixture.setSystemTheme('light')}>
          System light
        </Button>
        <Button size="sm" variant="outline" onClick={() => fixture.setSystemTheme('dark')}>
          System dark
        </Button>
        <Button size="sm" variant="outline" aria-pressed={showA} onClick={() => setShowA((value) => !value)}>
          {showA ? 'Unmount A' : 'Mount A'}
        </Button>
        <Button size="sm" variant="outline" aria-pressed={showB} onClick={() => setShowB((value) => !value)}>
          {showB ? 'Unmount B' : 'Mount B'}
        </Button>
      </Row>
      {lifecycle && (
        <Row>
          {(['light', 'dark', 'system'] as const).map((preference) => (
            <Button key={preference} size="sm" variant="outline" onClick={() => fixture.externalPreference(preference)}>
              External {preference}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={() => fixture.externalPreference(null)}>
            Clear storage
          </Button>
        </Row>
      )}
      <Grid>
        {showA && (
          <ThemeProvider store={fixture.store}>
            <PreferencePicker label="Consumer A" />
          </ThemeProvider>
        )}
        {showB && (
          <ThemeProvider store={fixture.store}>
            <ThemeProvider>
              <PreferencePicker label="Consumer B (nested, inherits the store)" />
            </ThemeProvider>
          </ThemeProvider>
        )}
      </Grid>
      <StateView value={diagnostics} />
    </div>
  )
}

/** A 和 B 共享一个 store：任意一侧切换都同步；全部卸载后释放系统与存储订阅，重新挂载时读取最新值。 */
export const BehaviorSharedProviders: Story = {
  tags: ['!autodocs'],
  args: { children: null },
  render: () => <ThemeBehavior lifecycle={false} />,
}

/** 外部存储变化（例如另一个窗口）同步到所有区域；卸载期间修改存储，再挂载时读取新值。 */
export const BehaviorStorageSync: Story = {
  tags: ['!autodocs'],
  args: { children: null },
  render: () => <ThemeBehavior lifecycle />,
}
