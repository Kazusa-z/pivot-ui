import { useEffect, useId, useRef, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemArray, type FormItemArrayProps } from './'
import { Checkbox, InputNumber, PropertyRow, PropertyLabel, PropertyControl } from '@pivot-ui/react'
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
  const idPrefix = useId()
  const [layers, setLayers] = useState(() => structuredClone(initialEmpty ? [] : initialLayers))
  const [resetKey, setResetKey] = useState(0)
  const nextId = useRef(3)
  const weightStarts = useRef(new Map<string, number>())
  useEffect(() => setLayers(structuredClone(initialEmpty ? [] : initialLayers)), [initialEmpty])

  const reset = () => {
    setLayers(structuredClone(initialEmpty ? [] : initialLayers))
    nextId.current = 3
    weightStarts.current.clear()
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
              <PropertyRow>
                <PropertyLabel htmlFor={`${idPrefix}-${layer.id}-weight`}>Weight</PropertyLabel>
                <PropertyControl association="control">
                  <InputNumber
                    id={`${idPrefix}-${layer.id}-weight`}
                    value={layer.weight}
                    min={0}
                    max={1}
                    step={0.1}
                    onEditStart={() => {
                      weightStarts.current.set(layer.id, layer.weight)
                    }}
                    onEditCancel={(reason) => {
                      if (!['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason)) return
                      const weight = weightStarts.current.get(layer.id)
                      if (weight !== undefined)
                        setLayers((current) =>
                          current.map((item) => (item.id === layer.id ? { ...item, weight } : item))
                        )
                    }}
                    onValueChange={(weight) =>
                      setLayers((current) => current.map((item) => (item.id === layer.id ? { ...item, weight } : item)))
                    }
                  />
                </PropertyControl>
              </PropertyRow>
              <PropertyRow>
                <PropertyLabel htmlFor={`${idPrefix}-${layer.id}`}>Enabled</PropertyLabel>
                <PropertyControl association="control">
                  <Checkbox
                    id={`${idPrefix}-${layer.id}`}
                    checked={layer.enabled}
                    onCheckedChange={(enabled) =>
                      setLayers((current) =>
                        current.map((item) => (item.id === layer.id ? { ...item, enabled } : item))
                      )
                    }
                  />
                </PropertyControl>
              </PropertyRow>
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
