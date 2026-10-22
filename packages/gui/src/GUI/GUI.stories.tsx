import { useEffect, useRef, useState } from 'react'
import type { Meta } from '@storybook/react'
import { Button, Flex } from '@pivot-ui/editor'
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

function GUIExample() {
  useEffect(() => {
    const gui = new GUI(data, items)

    return () => {
      gui.dispose()
    }
  }, [])

  return <div style={{ width: 320, height: 480 }} />
}

export const Overview = () => <GUIExample />

function MultipleInstancesExample() {
  const firstHost = useRef<HTMLDivElement>(null)
  const secondHost = useRef<HTMLDivElement>(null)
  const firstGUI = useRef<GUI>(null)
  const [generation, setGeneration] = useState(0)

  useEffect(() => {
    const first = new GUI({ ...data, name: 'First object' }, items)
    const second = new GUI({ ...data, name: 'Second object' }, items)
    first.render(firstHost.current)
    second.render(secondHost.current)
    firstGUI.current = first
    first.add('name', { label: 'Another name control', type: GUIItemTypeEnum.Input })

    return () => {
      first.dispose()
      second.dispose()
      firstGUI.current = null
    }
  }, [generation])

  return (
    <Flex direction="column" gap="md">
      <Button onClick={() => setGeneration((value) => value + 1)}>Recreate both instances</Button>
      <Button
        onClick={() => firstGUI.current?.add('opacity', { label: 'Added opacity', type: GUIItemTypeEnum.Number })}>
        Add first GUI control
      </Button>
      <Flex gap="md">
        <div ref={firstHost} style={{ width: 340, height: 260, transform: 'translateZ(0)' }} />
        <div ref={secondHost} style={{ width: 340, height: 260, transform: 'translateZ(0)' }} />
      </Flex>
    </Flex>
  )
}

export const MultipleInstances = () => <MultipleInstancesExample />
