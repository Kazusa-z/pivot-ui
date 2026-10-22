import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import { nanoid } from 'nanoid'
import { GUIItemConfig, GUIRoot, GUIItemTypeEnum, type GUIDefineItem } from '../components/GUIRoot'

export { type GUIItemConfig }
export { GUIItemTypeEnum }

const themeMap = {
  light: 'light-theme',
  dark: 'dark-theme',
} as const

abstract class GUIBase {
  abstract render(): void
  abstract add(keyName: string, item: GUIItemConfig): void
  abstract add(data: object, keyName: string, item: GUIItemConfig): void
  abstract add(sourceDataOrKeyName: object | string, keyNameOrItem: string | GUIItemConfig, item?: GUIItemConfig): void
}

const initContainerStyle = {
  position: 'fixed',
  top: '32px',
  right: '32px',
} as const

type ContainerRoot = { root: Root; owner: GUI | null }
const containerRoots = new WeakMap<HTMLDivElement, ContainerRoot>()
const ownedContainers = new WeakSet<HTMLDivElement>()

class GUI implements GUIBase {
  private _containerId = `pivot-ui-gui-container-${nanoid()}`
  private _container: HTMLDivElement = null
  private _root: Root = null
  private _data: Record<string, any> = null
  private _items: GUIDefineItem[] = []
  private _theme: any = 'dark'

  get container() {
    return this._container
  }

  get root() {
    return this._root
  }

  get data() {
    return this._data
  }

  get items() {
    return this._items
  }

  get theme() {
    return this._theme
  }

  constructor(data: Record<string, any>, items: GUIItemConfig[] = []) {
    this._data = data
    this._items = items.map((item) => [data, item.bindPath, item])

    this._prepareContainer()

    if (data && items.length) {
      this.render()
    }
  }

  private _prepareContainer() {
    if (this._container) return this._container
    const container = document.createElement('div')
    container.id = this._containerId
    Object.assign(container.style, initContainerStyle)
    this._container = container
    ownedContainers.add(container)
    if (document.body) {
      document.body.appendChild(container)
    }
    return container
  }

  render(container = this.container) {
    container ??= this._prepareContainer()
    const registered = containerRoots.get(container)
    if (registered?.owner && registered.owner !== this) {
      throw new Error(
        'This container already belongs to another GUI instance. Dispose it before reusing the container.'
      )
    }
    if (container !== this.container) {
      this.dispose()
      this._container = container
    }
    if (!this.root) {
      if (registered) {
        registered.owner = this
        this._root = registered.root
      } else {
        this._root = createRoot(container)
        containerRoots.set(container, { root: this.root, owner: this })
      }
    }

    this.root.render(React.createElement(GUIRoot, { key: this._containerId, data: this.data, items: this.items }))
  }

  add(keyName: string, item: GUIItemConfig): void
  add(data: object, keyName: string, item: GUIItemConfig): void
  add(sourceDataOrKeyName: object | string, keyNameOrItem: string | GUIItemConfig, item?: GUIItemConfig): void {
    if (typeof sourceDataOrKeyName === 'string') {
      const keyName = sourceDataOrKeyName
      const itemConfig = keyNameOrItem as GUIItemConfig

      if (keyName in this.data) {
        this.items.push([this.data, keyName, itemConfig])
        this._update()
      } else {
        console.warn(`Key "${keyName}" not found in data object`)
      }
      return
    }

    if (typeof sourceDataOrKeyName === 'object' && sourceDataOrKeyName !== null) {
      const data = sourceDataOrKeyName
      const keyName = keyNameOrItem as string
      const itemConfig = item

      if (typeof keyName === 'string' && itemConfig) {
        if (keyName in data) {
          this.items.push([data, keyName, itemConfig])
          this._update()
        } else {
          console.warn(`Key "${keyName}" not found in provided data object`)
        }
      } else {
        console.warn('Invalid parameters for add method')
      }
      return
    }

    console.warn('Invalid parameters for add method')
  }

  addGroup(groupName: string, items: GUIItemConfig[]) {
    this.items.push([
      this.data,
      groupName,
      {
        type: 'Group',
        items: items,
      },
    ])
    this._update()
  }

  private _update() {
    this.render()
  }

  dispose() {
    const container = this.container
    const registered = container && containerRoots.get(container)
    if (registered?.owner === this) registered.owner = null
    this._root = null
    this._container = null
    if (!container) return

    // A GUI is often disposed from a React effect cleanup. Unmount outside that commit;
    // an immediately recreated instance can reclaim the same external container's root.
    queueMicrotask(() => {
      if (registered) {
        if (registered.owner || containerRoots.get(container) !== registered) return
        registered.root.unmount()
        containerRoots.delete(container)
      } else if (containerRoots.has(container)) {
        return
      }
      if (ownedContainers.has(container)) {
        container.remove()
        ownedContainers.delete(container)
      }
    })
  }

  setTheme(theme: keyof typeof themeMap = 'dark') {
    this._theme = theme
    const html = document.documentElement
    html.classList.remove(themeMap.dark, themeMap.light)
    html.classList.add(themeMap[theme])
  }
}

export { GUI }
