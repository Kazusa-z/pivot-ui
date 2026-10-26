import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { ResourceProvider } from '../src/contracts/resources'
import { DragDropProvider } from '../src/interaction/drag-drop/DragDropProvider'
import { useDragSource } from '../src/interaction/drag-drop/useDragSource'
import { AssetReferenceInput } from '../src/templates/resources/AssetReferenceInput'
import {
  ASSET_REFERENCE_DRAG_TYPE,
  type AssetDescriptor,
  type AssetDragData,
  type ResourceViewMode,
} from '../src/values/assets'
import { Button } from '../src/widgets/buttons'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryCode,
  StoryProps,
  StoryState,
  StoryKeyboard,
  StoryNote,
} from './support/StoryPage'
import { createMockResourceProvider, mockAssets } from './support/mock-resource-provider'

const fieldWidth = css({ width: 'min(540px, 100%)', minWidth: 0 })

function DraggableReference({ asset }: { asset: AssetDescriptor }) {
  const binding = useDragSource<AssetDragData, HTMLButtonElement>({
    type: ASSET_REFERENCE_DRAG_TYPE,
    data: { id: asset.id },
    effectAllowed: 'link',
  })
  return (
    <Button
      ref={binding.ref}
      size="sm"
      variant="outline"
      aria-label={`Drag ${asset.name}`}
      className={css({ borderStyle: 'dashed', cursor: 'grab' })}>
      {asset.name} · {asset.kind}
    </Button>
  )
}

function ReferenceExample() {
  const [value, setValue] = useState<string | null>('asset-1')
  const [revision, setRevision] = useState(0)
  const [mode, setMode] = useState<'editable' | 'readonly' | 'disabled'>('editable')
  const [reject, setReject] = useState(false)
  const [viewMode, setViewMode] = useState<ResourceViewMode>('grid')
  const [events, setEvents] = useState<string[]>([])
  const provider = useMemo(() => createMockResourceProvider({ delayMs: 200 }), [])
  const log = (event: string) => setEvents((previous) => [...previous.slice(-10), event])
  const reset = () => {
    setValue('asset-1')
    setRevision((old) => old + 1)
    setMode('editable')
    setReject(false)
    setViewMode('grid')
    setEvents([])
  }

  return (
    <StoryCard
      title="Reference field"
      description="输入框显示当前资源的名称和状态；打开弹层搜索、翻页并选择。onValueChange 可异步接受或拒绝。">
      <StoryRow>
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
        {(['editable', 'readonly', 'disabled'] as const).map((next) => (
          <Button
            key={next}
            size="sm"
            variant={mode === next ? 'soft' : 'outline'}
            aria-pressed={mode === next}
            onClick={() => setMode(next)}>
            {next}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => setReject((old) => !old)}>
          {reject ? 'Accept next change' : 'Reject next change'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setValue('asset-15')
            setRevision((old) => old + 1)
            log('target changed to asset-15')
          }}>
          Load another target
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            provider.setFileResult('asset-4')
            log('file chooser will return asset-4')
          }}>
          File result: texture
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            provider.rejectNext('locate')
            log('next locate will reject')
          }}>
          Fail next locate
        </Button>
      </StoryRow>
      <div className={fieldWidth}>
        <AssetReferenceInput
          value={value}
          provider={provider}
          resetKey={revision}
          disabled={mode === 'disabled'}
          readOnly={mode === 'readonly'}
          pickerProps={{ viewMode, onViewModeChange: setViewMode, pageSize: 6 }}
          onOpenChange={(open) => log(open ? 'picker opened' : 'picker closed')}
          onValueChange={async (next, asset) => {
            log(`request ${next ?? 'empty'} (${asset?.status ?? 'none'})`)
            await new Promise((resolve) => setTimeout(resolve, 300))
            if (reject) throw new Error('The reference change was rejected. Accept it and retry.')
            setValue(next)
            log(next ? 'accepted' : 'cleared')
            return true
          }}
        />
      </div>
      <StoryState label="Reference state" value={{ value, revision, mode, reject, viewMode, events }} />
    </StoryCard>
  )
}

function StateReference({
  title,
  description,
  value,
  provider,
  selectedAsset,
  readOnly,
  disabled,
  pickerProps,
}: {
  title: string
  description: string
  value: string | null
  provider: ResourceProvider
  selectedAsset?: AssetDescriptor
  readOnly?: boolean
  disabled?: boolean
  pickerProps?: { defaultQueryText?: string }
}) {
  return (
    <StoryCard title={title} description={description}>
      <AssetReferenceInput
        value={value}
        provider={provider}
        selectedAsset={selectedAsset}
        readOnly={readOnly}
        disabled={disabled}
        pickerProps={pickerProps}
      />
    </StoryCard>
  )
}

function StateExamples() {
  const normal = useMemo(() => createMockResourceProvider(), [])
  const loading = useMemo(() => createMockResourceProvider({ delayMs: 1200 }), [])
  const error = useMemo<ResourceProvider>(
    () => ({
      query: async (query) => ({ items: [], total: 0, offset: query.offset }),
      get: async () => {
        throw new Error('The current reference could not be loaded.')
      },
    }),
    []
  )
  const snapshot = mockAssets.find((asset) => asset.id === 'asset-15')
  return (
    <StoryGrid>
      <StateReference title="Empty" description="value 为 null，显示 placeholder。" value={null} provider={normal} />
      <StateReference
        title="Missing"
        description="provider.get 返回 null。"
        value="missing-resource"
        provider={normal}
      />
      <StateReference
        title="Outside current query"
        description="当前资源不在搜索结果中，仍通过 provider.get 显示名称。"
        value="asset-15"
        provider={normal}
        pickerProps={{ defaultQueryText: 'Brick' }}
      />
      <StateReference
        title="Injected snapshot"
        description="selectedAsset 直接提供名称和缩略图，省去一次 get。"
        value="asset-15"
        provider={normal}
        selectedAsset={snapshot}
      />
      <StateReference
        title="Read only"
        description="可以查看、定位和打开浏览器，但不能更换。"
        value="asset-1"
        provider={normal}
        readOnly
      />
      <StateReference title="Disabled" description="字段整体不可交互。" value="asset-1" provider={normal} disabled />
      <StateReference
        title="Loading reference"
        description="provider.get 延迟 1200ms。"
        value="asset-1"
        provider={loading}
      />
      <StateReference
        title="Reference error"
        description="provider.get 抛错，提供 Retry reference。"
        value="asset-1"
        provider={error}
      />
    </StoryGrid>
  )
}

function DragDemo() {
  const [value, setValue] = useState<string | null>(null)
  const [events, setEvents] = useState<string[]>([])
  const provider = useMemo(() => createMockResourceProvider(), [])
  return (
    <DragDropProvider>
      <StoryCard title="Drop a reference" description="只接受 texture；加载中和错误资源会被拒绝。">
        <StoryRow>
          {[mockAssets[0], mockAssets[1], mockAssets[15]].map((asset) => (
            <DraggableReference key={asset.id} asset={asset} />
          ))}
        </StoryRow>
        <div className={fieldWidth}>
          <AssetReferenceInput
            value={value}
            provider={provider}
            dropEnabled
            kinds={['texture']}
            onValueChange={async (next, asset) => {
              setEvents((previous) => [...previous.slice(-5), `${next ?? 'empty'}:${asset?.status ?? 'none'}`])
              setValue(next)
              return true
            }}
          />
        </div>
        <StoryState label="Drop state" value={{ value, events }} />
      </StoryCard>
    </DragDropProvider>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'AssetReferenceInput 在表单中展示并更换一个资源引用。value 保存资源 ID，provider.get 解析当前资源名称；onValueChange 可异步接受或拒绝选择，dropEnabled 时接受应用内资源拖放。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Resources/AssetReferenceInput',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Resources"
      title="AssetReferenceInput"
      summary="一个 48px 的资源字段：显示当前资源，打开弹层搜索选择，并允许清空、定位、文件选择或拖入。接受逻辑由 onValueChange 决定。"
      meta={
        <>
          <span>48px field</span>
          <span>·</span>
          <span>Popover picker</span>
          <span>·</span>
          <span>Drop enabled</span>
        </>
      }>
      <StorySection title="Field" description="受控 value 与异步 onValueChange；拒绝时保留字段内容并显示错误。">
        <ReferenceExample />
        <StoryNote>资源字段是两档控件之外的 48px 例外，用于同时容纳缩略图、名称和状态。</StoryNote>
      </StorySection>

      <StorySection title="States" description="空、缺失、不在当前查询、注入快照、只读、禁用、加载中和解析失败。">
        <StateExamples />
      </StorySection>

      <StorySection
        title="Drag and drop"
        description="需要 DragDropProvider 与 dropEnabled；拖入数据只携带 id，详情仍由 provider 读取。">
        <DragDemo />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<AssetReferenceInput
  value={value}
  provider={provider}
  resetKey={targetId}
  onValueChange={async (next, asset) => {
    const saved = await saveReference(next)
    if (!saved) return false
    setValue(next)
  }}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'value', type: 'AssetId | null', description: '当前资源 ID；null 表示空。' },
              { name: 'provider', type: 'ResourceProvider', description: 'get 解析当前资源，query 供弹层搜索。' },
              {
                name: 'onValueChange',
                type: '(id, asset) => boolean | void | Promise<...>',
                description: '接受/拒绝更换或清空。',
              },
              { name: 'selectedAsset', type: 'AssetDescriptor', description: '可选的当前快照，避免额外 get。' },
              {
                name: 'readOnly / disabled',
                type: 'boolean',
                defaultValue: 'false',
                description: '只读允许定位浏览；禁用移除交互。',
              },
              {
                name: 'dropEnabled',
                type: 'boolean',
                defaultValue: 'false',
                description: '需要 DragDropProvider；只接受资源引用类型。',
              },
              { name: 'pickerProps', type: 'ResourcePicker subset', description: '透传查询、视图和分页配置。' },
            ]}
          />
        </StoryGrid>
      </StorySection>

      <StorySection title="Keyboard and accessibility">
        <StoryKeyboard
          rows={[
            { keys: ['Enter', 'Space'], action: '打开资源选择弹层。' },
            { keys: 'Tab', action: '在字段、Locate、Clear、Choose file 之间移动。' },
            { keys: 'Escape', action: '关闭弹层并回到字段。' },
            { keys: ['Arrow keys', 'Enter'], action: '在弹层内浏览资源并选择。' },
          ]}
        />
      </StorySection>
    </StoryPage>
  ),
}
