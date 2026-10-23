import type { PropertyValue } from '../values'

export interface HostFileReference {
  readonly uri: string
  readonly name: string
}

export interface HostFileRequest {
  readonly multiple?: boolean
  readonly extensions?: readonly string[]
}

/** 将剪贴板、偏好保存和文件选择连接到应用环境。按需提供各方法，并为未提供的能力显示可用的替代操作或原因。 */
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
