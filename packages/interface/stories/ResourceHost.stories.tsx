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
      title="Host resource boundary"
      description="The host converts engine metadata and paths once. The controlled property carries only a stable ID; the host resolves it back to its own instance."
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
        label="Host selection"
        value={{
          id: selectedId,
          engineName: selected?.name ?? null,
          engineKind: selected?.getMetaConfig().type ?? null,
        }}
      />
      <StatePanel label="Pure descriptors" value={boundary.descriptors} />
    </ContractFrame>
  )
}

const meta = { title: 'Contracts/Resources', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const HostBoundary: Story = { render: () => <HostBoundaryExample /> }
