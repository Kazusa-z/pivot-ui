import type { PropertyValue } from '../values'

export interface HostFileReference {
  readonly uri: string
  readonly name: string
}

export interface HostFileRequest {
  readonly multiple?: boolean
  readonly extensions?: readonly string[]
}

/** Optional capabilities are injected by the application. Absence means unavailable. */
export interface HostCapabilities {
  readonly clipboard?: {
    readText(): Promise<string>
    writeText(text: string): Promise<void>
  }
  readonly preferences?: {
    read(key: string): Promise<PropertyValue | null>
    write(key: string, value: PropertyValue): Promise<void>
  }
  readonly files?: {
    pick(request: HostFileRequest): Promise<readonly HostFileReference[]>
  }
}
