import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AssetReferenceInput } from '../src/templates/resources/AssetReferenceInput'
import { Button } from '../src/widgets/buttons'
import { Text } from '../src/foundation/typography'
import { createMockResourceProvider } from './support/mock-resource-provider'
import { createEngineAssetLookup, type EngineAssetFixture } from './support/resource-host-adapter'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryState,
  StoryCode,
  StoryProps,
  StoryNote,
} from './support/StoryPage'

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
  const reset = () => {
    setSelectedId('texture')
    setRevision((value) => value + 1)
  }

  return (
    <StoryPage
      eyebrow="Resources"
      title="ResourceHost"
      summary="把应用自己的资源对象转换成 AssetDescriptor，再通过 ResourceProvider 接入 AssetReferenceInput。选择时 onValueChange 返回资源 ID，应用按 ID 找回原始对象，业务方法仍留在应用侧。"
      meta={
        <>
          <span>AssetDescriptor</span>
          <span>·</span>
          <span>ResourceProvider</span>
          <span>·</span>
          <span>48px field</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      }>
      <StorySection
        title="Host boundary"
        description="界面只接收稳定的 ID、名称、类型和缩略图；原始对象可以带方法、路径或业务元数据。">
        <StoryCard
          title="Engine resource → AssetDescriptor"
          description="选择纹理、模型或子材质，比较下方应用对象与组件使用的描述。">
          <AssetReferenceInput
            value={selectedId}
            provider={provider}
            resetKey={revision}
            label="Host resource"
            onValueChange={setSelectedId}
          />
          <StoryRow>
            <Text size="sm" tone="muted">
              {selected ? `Engine object: ${selected.name}` : 'No engine object selected'}
            </Text>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection title="Adapter mapping" description="路径解析、缩略图地址和原始对象查找由应用适配器负责。">
        <StoryGrid>
          <StoryCard title="Selected reference" description="组件只保存 ID；名称和类型来自适配后的描述。">
            <StoryState
              label="Selection"
              value={{
                id: selectedId,
                engineName: selected?.name ?? null,
                engineKind: selected?.getMetaConfig().type ?? null,
                descriptor: boundary.descriptors.find((item) => item.id === selectedId) ?? null,
              }}
            />
          </StoryCard>
          <StoryCard title="Adapter contract" description="描述需要稳定的 id、name、kind/status 与可选 thumbnailUrl。">
            <StoryNote tone="muted">
              生成描述时不要把 getMetaConfig 之类的方法透传给界面；组件需要的是可序列化的显示数据。原始对象由应用按 ID
              管理，避免把业务实例放进属性值。
            </StoryNote>
            <StoryCode
              label="ts"
              code={`const descriptor = {
  id: engine.id,
  name: engine.name,
  kind: engine.getMetaConfig().type,
  status: 'ready',
}

<AssetReferenceInput
  value={selectedId}
  provider={provider}
  onValueChange={setSelectedId}
/>`}
            />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const provider = {
  ...resourceService,
  get: async (id) => descriptors.get(id) ?? null,
}

<AssetReferenceInput
  value={value}
  provider={provider}
  onValueChange={(id) => setValue(id)}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'value', type: 'AssetId | null', description: '稳定 ID；空值表示未选择。' },
              { name: 'provider', type: 'ResourceProvider', description: '应用提供的查询/选择/改名能力。' },
              { name: 'selectedAsset', type: 'AssetDescriptor', description: '可直接展示的当前资源描述。' },
              {
                name: 'onValueChange',
                type: '(id, asset) => boolean | void | Promise',
                description: '应用接受或拒绝引用变化。',
              },
              { name: 'dropEnabled', type: 'boolean', description: '启用应用内资源拖放；需要 DragDropProvider。' },
            ]}
          />
        </StoryGrid>
      </StorySection>

      <StoryState
        label="Host state"
        value={{
          revision,
          selectedId,
          engine: selected ? { id: selected.id, name: selected.name, kind: selected.getMetaConfig().type } : null,
          descriptors: boundary.descriptors,
        }}
      />
    </StoryPage>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Resources/ResourceHost',
  parameters: {
    docs: {
      description: {
        component:
          '这些示例展示如何把应用自己的资源对象接到 ResourceProvider 和 AssetReferenceInput。应用先把对象转换成 AssetDescriptor，界面只接收显示所需的数据；选择时 onValueChange 返回 ID，应用再按 ID 找到原始对象。路径解析、缩略图和业务方法仍由应用适配器负责。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { render: () => <HostBoundaryExample /> }
