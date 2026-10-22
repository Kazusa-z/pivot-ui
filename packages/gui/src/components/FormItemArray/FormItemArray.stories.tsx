import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemArray, type FormItemArrayProps } from './'
import { FormItemInputNumber } from '../FormItemInputNumber'
import { FormItemToggle } from '../FormItemToggle'
import { StoryFrame } from '../../../stories/StoryFrame'

export default {
  title: 'FormItem/FormItemArray',
  component: FormItemArray,
  args: { label: 'Layers', addable: true, addItemText: 'Add layer' },
  argTypes: { items: { control: false } },
} as Meta<typeof FormItemArray>

const initialLayers = [
  { id: 'layer-1', name: 'Base layer', weight: 1, enabled: true },
  { id: 'layer-2', name: 'Detail layer', weight: 0.5, enabled: true },
]

function ArrayExample({ initialEmpty = false, ...args }: FormItemArrayProps & { initialEmpty?: boolean }) {
  const [layers, setLayers] = useState(() => structuredClone(initialEmpty ? [] : initialLayers))
  const [resetKey, setResetKey] = useState(0)
  const nextId = useRef(3)
  useEffect(() => setLayers(structuredClone(initialEmpty ? [] : initialLayers)), [initialEmpty])

  const reset = () => {
    setLayers(structuredClone(initialEmpty ? [] : initialLayers))
    nextId.current = 3
    setResetKey((key) => key + 1)
  }

  return (
    <StoryFrame value={layers} onReset={reset}>
      <FormItemArray
        {...args}
        key={resetKey}
        items={layers.map((layer) => ({
          id: layer.id,
          name: layer.name,
          renameable: true,
          removable: true,
          children: (
            <>
              <FormItemInputNumber
                label="Weight"
                value={layer.weight}
                min={0}
                max={1}
                step={0.1}
                onChange={(weight) =>
                  setLayers((current) => current.map((item) => (item.id === layer.id ? { ...item, weight } : item)))
                }
              />
              <FormItemToggle
                label="Enabled"
                value={layer.enabled}
                onChange={(enabled) =>
                  setLayers((current) => current.map((item) => (item.id === layer.id ? { ...item, enabled } : item)))
                }
              />
            </>
          ),
        }))}
        onAdd={() => {
          const id = nextId.current++
          setLayers((current) => [...current, { id: `layer-${id}`, name: `Layer ${id}`, weight: 1, enabled: true }])
          args.onAdd?.()
        }}
        onDelete={(item) => {
          setLayers((current) => current.filter((layer) => layer.id !== item.id))
          args.onDelete?.(item)
        }}
        onRename={(item, name) => {
          setLayers((current) => current.map((layer) => (layer.id === item.id ? { ...layer, name } : layer)))
          args.onRename?.(item, name)
        }}
      />
    </StoryFrame>
  )
}

export const Overview: StoryFn<typeof FormItemArray> = (args) => <ArrayExample {...args} />
export const Empty: StoryFn<typeof FormItemArray> = (args) => <ArrayExample {...args} initialEmpty />
export const InitiallyCollapsed: StoryFn<typeof FormItemArray> = (args) => <ArrayExample {...args} />
InitiallyCollapsed.args = { defaultValue: [] }
