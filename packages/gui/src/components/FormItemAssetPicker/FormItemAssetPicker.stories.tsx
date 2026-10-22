import { useEffect, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { DragDropContextProvider, useDrag } from '@pivot-ui/editor'
import { FormItemAssetPicker, type BasicAssetType, type FormItemAssetPickerProps } from './'
import { StoryFrame } from '../../../stories/StoryFrame'

const thumbnail = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${color}"/><path d="M0 16h64M0 48h64M16 0v64M48 0v64" stroke="white" opacity=".3" stroke-width="2"/></svg>`)}`

const makeAsset = (id: string, name: string, type: string, color?: string): BasicAssetType => ({
  id,
  name,
  isInitCompleted: true,
  thumbnailUrl: color ? thumbnail(color) : undefined,
  getMetaConfig: () => ({ type }),
  getTempRoutes: () => ['Assets', type],
})

const assets = [
  makeAsset('brick-diffuse', 'brick_diffuse.png', 'Texture', '#b35c41'),
  makeAsset('brick-normal', 'brick_normal.png', 'Texture', '#8074d2'),
  makeAsset('metal', 'Brushed metal', 'Material'),
  makeAsset('scene', 'Main scene', 'Scene'),
  makeAsset('prefab', 'Character', 'Prefab'),
]

export default {
  title: 'FormItem/FormItemAssetPicker',
  component: FormItemAssetPicker,
  args: { label: 'Asset', dropLayer: 1, placeholder: 'Choose an asset', assets },
  argTypes: { assets: { control: false }, asset: { control: false }, value: { control: false } },
} as Meta<typeof FormItemAssetPicker>

function DraggableAsset({ asset, layer }: { asset: BasicAssetType; layer: number }) {
  const [dragRef] = useDrag({ type: layer, item: asset })
  return (
    <div
      ref={dragRef}
      style={{ padding: 8, border: '1px dashed var(--colors-gray7)', borderRadius: 4, cursor: 'grab' }}>
      Drag {asset.name} onto the field
    </div>
  )
}

function AssetPickerExample({
  initialSelection = 'brick-diffuse',
  withDrag = false,
  ...args
}: FormItemAssetPickerProps<BasicAssetType> & { initialSelection?: string; withDrag?: boolean }) {
  const initialId = args.asset?.id ?? initialSelection
  const [selectedId, setSelectedId] = useState(initialId)
  const [lastAction, setLastAction] = useState('No action yet')
  useEffect(() => setSelectedId(initialId), [initialId])
  const availableAssets = args.assets ?? assets
  const selected = availableAssets.find((asset) => asset.id === selectedId)

  return (
    <StoryFrame
      value={{ selected: selected ? { id: selected.id, name: selected.name } : null, lastAction }}
      onReset={() => {
        setSelectedId(initialId)
        setLastAction('No action yet')
      }}>
      <DragDropContextProvider>
        {withDrag && <DraggableAsset asset={assets[1]} layer={args.dropLayer} />}
        <FormItemAssetPicker
          {...args}
          assets={availableAssets}
          asset={selected}
          value={selected?.name ?? ''}
          groupBy={args.groupBy ?? ((asset) => asset.getTempRoutes().join(','))}
          onSelect={(asset) => {
            setSelectedId(asset.id)
            setLastAction(`Selected ${asset.name}`)
            args.onSelect?.(asset)
          }}
          onDelete={() => {
            setSelectedId('')
            setLastAction('Selection cleared')
            args.onDelete?.()
          }}
          onLocate={(name) => {
            setLastAction(`Located ${name}`)
            args.onLocate?.(name)
          }}
        />
      </DragDropContextProvider>
    </StoryFrame>
  )
}

export const Overview: StoryFn<typeof FormItemAssetPicker> = (args) => <AssetPickerExample {...args} />
export const EmptySelection: StoryFn<typeof FormItemAssetPicker> = (args) => (
  <AssetPickerExample {...args} initialSelection="" />
)
export const GenericAsset: StoryFn<typeof FormItemAssetPicker> = (args) => (
  <AssetPickerExample {...args} initialSelection="metal" />
)
export const Disabled: StoryFn<typeof FormItemAssetPicker> = (args) => <AssetPickerExample {...args} />
Disabled.args = { disabled: true }
export const EmptyLibrary: StoryFn<typeof FormItemAssetPicker> = (args) => <AssetPickerExample {...args} />
EmptyLibrary.args = { assets: [] }
export const TexturesOnly: StoryFn<typeof FormItemAssetPicker> = (args) => <AssetPickerExample {...args} />
TexturesOnly.args = { customFilter: (asset) => asset.getMetaConfig().type === 'Texture' }
export const DragAndDrop: StoryFn<typeof FormItemAssetPicker> = (args) => <AssetPickerExample {...args} withDrag />
