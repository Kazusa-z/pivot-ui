export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeSnapshot {
  readonly preference: ThemePreference
  readonly resolvedTheme: ResolvedTheme
}

export interface ThemeStorageAdapter {
  read(): ThemePreference | null
  write(preference: ThemePreference): void
  subscribe?(listener: () => void): () => void
}

export interface SystemThemeAdapter {
  read(): ResolvedTheme
  subscribe(listener: () => void): () => void
}

export interface ThemeAppearanceAdapter {
  apply(theme: ResolvedTheme): void
  clear?(): void
}

export interface ThemeStoreOptions {
  readonly initialPreference?: ThemePreference
  readonly initialSystemTheme?: ResolvedTheme
  readonly storage?: ThemeStorageAdapter
  readonly system?: SystemThemeAdapter
  readonly appearance?: ThemeAppearanceAdapter
}

export interface ThemeStore {
  getSnapshot(): ThemeSnapshot
  getServerSnapshot(): ThemeSnapshot
  subscribe(listener: () => void): () => void
  setPreference(preference: ThemePreference): void
  /** Retain the external adapters. The last release removes their listeners. */
  connect(): () => void
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

/** Creation and snapshot reads never access adapters or mutate the DOM. */
export function createThemeStore(options: ThemeStoreOptions = {}): ThemeStore {
  const initialPreference = options.initialPreference ?? 'dark'
  let systemTheme = options.initialSystemTheme ?? 'dark'
  let snapshot: ThemeSnapshot = Object.freeze({
    preference: initialPreference,
    resolvedTheme: initialPreference === 'system' ? systemTheme : initialPreference,
  })
  const serverSnapshot = snapshot
  const listeners = new Set<() => void>()
  let connections = 0
  let disconnectSystem: (() => void) | undefined
  let disconnectStorage: (() => void) | undefined

  function update(preference: ThemePreference, nextSystemTheme: ResolvedTheme) {
    systemTheme = nextSystemTheme
    const resolvedTheme = preference === 'system' ? systemTheme : preference
    if (snapshot.preference === preference && snapshot.resolvedTheme === resolvedTheme) return
    snapshot = Object.freeze({ preference, resolvedTheme })
    if (connections > 0) options.appearance?.apply(resolvedTheme)
    for (const listener of Array.from(listeners)) listener()
  }

  function refreshStorage() {
    update(options.storage?.read() ?? initialPreference, systemTheme)
  }

  function refreshSystem() {
    update(snapshot.preference, options.system?.read() ?? systemTheme)
  }

  return Object.freeze({
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setPreference(preference: ThemePreference) {
      if (!isThemePreference(preference)) return
      options.storage?.write(preference)
      update(preference, systemTheme)
    },
    connect() {
      connections += 1
      if (connections === 1) {
        // Read on connection, including reconnection after all consumers unmounted.
        systemTheme = options.system?.read() ?? systemTheme
        const preference = options.storage?.read() ?? snapshot.preference
        const previousSnapshot = snapshot
        update(preference, systemTheme)
        if (snapshot === previousSnapshot) options.appearance?.apply(snapshot.resolvedTheme)
        disconnectSystem = options.system?.subscribe(refreshSystem)
        disconnectStorage = options.storage?.subscribe?.(refreshStorage)
      }
      let released = false
      return () => {
        if (released) return
        released = true
        connections -= 1
        if (connections === 0) {
          disconnectSystem?.()
          disconnectStorage?.()
          disconnectSystem = undefined
          disconnectStorage = undefined
          options.appearance?.clear?.()
        }
      }
    },
  })
}
