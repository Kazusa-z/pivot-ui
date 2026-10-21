import type { Meta, StoryFn } from '@storybook/react'
import { Popover } from '@pivot-ui/editor'
import { AssetPickerContent } from './AssetPickerContent'
import type { BasicAssetType } from './PickableAssetItem'

export default {
  title: 'Panda Audit/AssetPicker',
  component: AssetPickerContent,
} as Meta

const makeAsset = (id: string, name: string, type = 'Texture'): BasicAssetType => ({
  id,
  name,
  isInitCompleted: true,
  getMetaConfig: () => ({ type }),
  getTempRoutes: () => ['Assets', type],
})

const assets = [
  makeAsset('1', 'brick_diffuse.png'),
  makeAsset('2', 'brick_normal.png'),
  makeAsset('3', 'metal_roughness.png'),
  makeAsset('4', 'Scene', 'Scene'),
  makeAsset('5', 'Character', 'Prefab'),
]

export const Overview: StoryFn<typeof AssetPickerContent> = () => (
  <Popover open trigger={<span />}>
    <AssetPickerContent assets={assets} onSelect={() => {}} />
  </Popover>
)
