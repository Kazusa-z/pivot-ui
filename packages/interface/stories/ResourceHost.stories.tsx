import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AssetReferenceInput } from '../src/templates/resources/AssetReferenceInput'
import { createMockResourceProvider } from './support/mock-resource-provider'
import { createEngineAssetLookup, type EngineAssetFixture } from './support/resource-host-adapter'
import { ContractFrame, StatePanel } from './support/ContractFrame'

function HostBoundaryExample() {
  const [revision, setRevision] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>('texture')
  const boundary = useMemo(() => {
    const parent: EngineAssetFixture = {
      id: 'model',
      name: 'chair.glb',
      isInitCompleted: true,
      getMetaConfig: () => ({ type: 'Model' }),
      getTempRoutes: () => ['Library', '__proto__'],
    }
    return createEngineAssetLookup([
      parent,
      {
        id: 'texture',
        name: 'wood.png',
        isInitCompleted: true,
        getMetaConfig: () => ({ type: 'Texture2D' }),
        getTempRoutes: () => ['Library', 'Materials'],
      },
      {
        id: 'sub-material',
        name: 'Seat',
        isInitCompleted: true,
        isSubAsset: true,
        mainAsset: parent,
        getMetaConfig: () => ({ type: 'Material' }),
        getTempRoutes: () => [],
      },
    ])
  }, [])
  const provider = useMemo(() => createMockResourceProvider({ assets: boundary.descriptors }), [boundary, revision])
  const selected = selectedId ? boundary.getEngineAsset(selectedId) : null
  return (
    <ContractFrame
      title="连接应用自己的资源对象"
      description="打开弹层并选择纹理、模型或子材质，比较下方的资源描述与应用对象名称。此例先把应用对象转换为 AssetDescriptor，再用 onValueChange 收到的 ID 找回原始对象；可以照此连接带方法或业务信息的资源对象。"
      onReset={() => {
        setSelectedId('texture')
        setRevision((value) => value + 1)
      }}>
      <AssetReferenceInput
        value={selectedId}
        provider={provider}
        resetKey={revision}
        label="Host resource"
        onValueChange={setSelectedId}
      />
      <StatePanel
        label="应用中的选择结果"
        value={{
          id: selectedId,
          engineName: selected?.name ?? null,
          engineKind: selected?.getMetaConfig().type ?? null,
        }}
      />
      <StatePanel label="供组件使用的资源描述" value={boundary.descriptors} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Contracts/Resources',
  parameters: {
    docs: {
      description: {
        component:
          '这些示例展示如何把应用自己的资源对象接到 ResourceProvider 和 AssetReferenceInput，适用于对象包含方法、文件路径或业务元数据的项目。\n\n应用先把对象转换成 AssetDescriptor，界面只接收显示所需的数据；选择时 onValueChange 返回资源 ID，应用再按 ID 找到原始对象。示例中的状态面板展示两侧的数据。\n\n路径解析、缩略图地址和原始对象的查找由应用适配代码负责。组件接收稳定 ID 和资源描述，业务对象仍由应用管理。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const HostBoundary: Story = { render: () => <HostBoundaryExample /> }
