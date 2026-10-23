import { parseHexColor, type ColorCapabilities } from '@pivot-ui/react'

interface BrowserEyeDropper {
  open(options: { signal: AbortSignal }): Promise<{ sRGBHex: string }>
}
type ColorBrowserWindow = Window & { EyeDropper?: new () => BrowserEyeDropper }

/** Application-owned browser adapter. Call dispose when its owner is destroyed. */
export function createBrowserColorCapabilities(host: ColorBrowserWindow = window): {
  capabilities: ColorCapabilities
  dispose(): void
} {
  let active: AbortController | null = null
  let disposed = false
  const clipboard = host.isSecureContext ? host.navigator.clipboard : undefined
  const EyeDropper = host.isSecureContext ? host.EyeDropper : undefined
  return {
    capabilities: {
      clipboard: clipboard
        ? {
            readText: () => {
              if (disposed) return Promise.reject(new Error('Color host has been disposed.'))
              return clipboard.readText()
            },
            writeText: (text) => {
              if (disposed) return Promise.reject(new Error('Color host has been disposed.'))
              return clipboard.writeText(text)
            },
          }
        : undefined,
      eyeDropper: EyeDropper
        ? {
            async pick() {
              if (disposed) throw new Error('Color host has been disposed.')
              active?.abort()
              const request = new AbortController()
              active = request
              try {
                const result = await new EyeDropper().open({ signal: request.signal })
                if (disposed || request.signal.aborted) return null
                const color = parseHexColor(result.sRGBHex)
                if (!color) throw new Error('The browser returned an invalid color.')
                return color
              } catch (error) {
                if (request.signal.aborted || (error instanceof DOMException && error.name === 'AbortError'))
                  return null
                throw error
              } finally {
                if (active === request) active = null
              }
            },
          }
        : undefined,
    },
    dispose() {
      disposed = true
      active?.abort()
      active = null
    },
  }
}
