import { useEffect } from 'react'
import type { Meta } from '@storybook/react'
import { GUI, GUIItemTypeEnum, type GUIItemConfig } from './GUI'

export default {
  title: 'GUI',
} as Meta

const data = {
  name: 'Pivot Object',
  visible: true,
  position: { x: 0, y: 0, z: 0 },
  color: { r: 0.2, g: 0.6, b: 1, a: 1 },
  opacity: 1,
}

const items: GUIItemConfig[] = [
  { label: 'Name', bindPath: 'name', type: GUIItemTypeEnum.Input },
  { label: 'Visible', bindPath: 'visible', type: GUIItemTypeEnum.Toggle },
  { label: 'Position', bindPath: 'position', type: GUIItemTypeEnum.Vector3 },
  { label: 'Color', bindPath: 'color', type: GUIItemTypeEnum.Color },
  { label: 'Opacity', bindPath: 'opacity', type: GUIItemTypeEnum.Slider, min: 0, max: 1, step: 0.01 },
]

export const Overview = () => {
  useEffect(() => {
    const gui = new GUI(data, items)

    return () => {
      const container = gui.container
      gui.dispose()
      container?.remove()
    }
  }, [])

  return <div style={{ width: 320, height: 480 }} />
}
