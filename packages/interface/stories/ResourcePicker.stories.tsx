import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { ResourceProvider } from '../src/contracts/resources'
import { ResourcePicker } from '../src/templates/resources/ResourcePicker'
import type { ResourceViewMode } from '../src/values/assets'
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
import { createMockResourceProvider, resourceGroupOptions, resourceKindOptions } from './support/mock-resource-provider'

const pickerWidth = css({ width: '100%', minWidth: 0 })

function PickerExample() {
  const [selectedId, setSelectedId] = useState<string | null>('asset-4')
  const [queryText, setQueryText] = useState('')
  const [kinds, setKinds] = useState<readonly string[]>([])
  const [groupId, setGroupId] = useState('')
  const [viewMode, setViewMode] = useState<ResourceViewMode>('grid')
  const [page, setPage] = useState(1)
  const [readOnly, setReadOnly] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [reject, setReject] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const provider = useMemo(() => createMockResourceProvider({ delayMs: 250 }), [])

  const log = (event: string) => setEvents((previous) => [...previous.slice(-9), event])
  const reset = () => {
    setSelectedId('asset-4')
    setQueryText('')
    setKinds([])
    setGroupId('')
    setViewMode('grid')
    setPage(1)
    setReadOnly(false)
    setDisabled(false)
    setReject(false)
    setEvents([])
  }

  return (
    <StoryCard
      title="Search, filter and select"
      description="受控查询状态。选择请求先经过 onSelect；拒绝时显示错误并保留原选择。">
      <StoryRow>
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
        <Button size="sm" variant="outline" onClick={() => setReadOnly((value) => !value)}>
          {readOnly ? 'Allow selection' : 'Read only'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setDisabled((value) => !value)}>
          {disabled ? 'Enable picker' : 'Disable picker'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setReject((value) => !value)}>
          {reject ? 'Accept selection' : 'Reject selection'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            provider.rejectNext('query')
            log('next query will fail')
          }}>
          Fail next query
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            provider.rejectNext('rename')
            log('next rename will fail')
          }}>
          Fail next rename
        </Button>
      </StoryRow>
      <div className={pickerWidth}>
        <ResourcePicker
          provider={provider}
          selectedId={selectedId}
          onSelectedIdChange={setSelectedId}
          queryText={queryText}
          onQueryTextChange={setQueryText}
          kinds={kinds}
          onKindsChange={setKinds}
          groupId={groupId}
          onGroupIdChange={setGroupId}
          kindOptions={resourceKindOptions}
          groupOptions={resourceGroupOptions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          page={page}
          onPageChange={setPage}
          pageSize={6}
          readOnly={readOnly}
          disabled={disabled}
          onSelect={async (id) => {
            log(`select ${id}`)
            await new Promise((resolve) => setTimeout(resolve, 300))
            if (reject) throw new Error('The selection was rejected. Turn off Reject selection and retry.')
            return true
          }}
          onSelectSuccess={(id) => log(`accepted ${id}`)}
        />
      </div>
      <StoryState
        label="Picker state"
        value={{ selectedId, queryText, kinds, groupId, viewMode, page, readOnly, disabled, events }}
      />
    </StoryCard>
  )
}

function StatePicker({
  title,
  description,
  provider,
  selectedId = null,
  disabled,
  readOnly,
}: {
  title: string
  description: string
  provider: ResourceProvider
  selectedId?: string | null
  disabled?: boolean
  readOnly?: boolean
}) {
  return (
    <StoryCard title={title} description={description}>
      <ResourcePicker
        provider={provider}
        selectedId={selectedId}
        pageSize={4}
        disabled={disabled}
        readOnly={readOnly}
        kindOptions={resourceKindOptions}
        groupOptions={resourceGroupOptions}
      />
    </StoryCard>
  )
}

function StateExamples() {
  const empty = useMemo(() => createMockResourceProvider({ assets: [] }), [])
  const loading = useMemo(() => createMockResourceProvider({ delayMs: 1200 }), [])
  const error = useMemo<ResourceProvider>(
    () => ({
      query: async () => {
        throw new Error('The resource library is unavailable.')
      },
      get: async () => {
        throw new Error('The resource library is unavailable.')
      },
    }),
    []
  )
  const normal = useMemo(() => createMockResourceProvider(), [])
  return (
    <StoryGrid>
      <StatePicker title="Empty" description="Provider 返回 total=0。" provider={empty} />
      <StatePicker title="Loading" description="延迟 1200ms，保留加载状态。" provider={loading} />
      <StatePicker title="Error" description="查询抛错，错误由应用显示。" provider={error} />
      <StatePicker
        title="Read only"
        description="可浏览、筛选和查看，但不能选择。"
        provider={normal}
        selectedId="asset-1"
        readOnly
      />
      <StatePicker
        title="Disabled"
        description="整个浏览器不可交互。"
        provider={normal}
        selectedId="asset-1"
        disabled
      />
    </StoryGrid>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ResourcePicker 在页面或弹层中浏览资源，支持搜索、类型与分组筛选、分页和网格/列表视图。selectedId 表示当前选择，onSelect 可异步接受或拒绝；provider 负责查询与可选改名。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Resources/ResourcePicker',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Resources"
      title="ResourcePicker"
      summary="搜索、筛选、翻页，再选择一项资源。把查询状态放在 React 中，把接受逻辑放在 onSelect；浏览器本身不假设资源数据的来源。"
      meta={
        <>
          <span>Grid / list</span>
          <span>·</span>
          <span>Controlled filters</span>
          <span>·</span>
          <span>Async onSelect</span>
        </>
      }>
      <StorySection
        title="Browser"
        description="这个例子把 selectedId、query、kinds、groupId、viewMode 和 page 全部受控，便于观察状态变化。">
        <PickerExample />
      </StorySection>

      <StorySection title="States" description="空结果、加载、查询失败、只读和禁用分别由不同状态表达。">
        <StateExamples />
        <StoryNote>只读仍允许浏览和查看资源；禁用会把整个浏览器从交互中移除。</StoryNote>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<ResourcePicker
  provider={provider}
  selectedId={selectedId}
  onSelectedIdChange={setSelectedId}
  queryText={query}
  onQueryTextChange={setQuery}
  page={page}
  onPageChange={setPage}
  pageSize={24}
  onSelect={async (id) => saveSelection(id)}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'provider', type: 'ResourceProvider', description: '查询、读取和可选改名。' },
              { name: 'selectedId', type: 'AssetId | null', defaultValue: 'null', description: '受控选中资源。' },
              {
                name: 'onSelect',
                type: '(id, asset) => boolean | void | Promise<...>',
                description: '接受或拒绝选择请求。',
              },
              {
                name: 'queryText / kinds / groupId',
                type: 'controlled filters',
                description: '搜索与筛选；改变时自动回到第一页。',
              },
              {
                name: 'page / pageSize',
                type: 'number',
                defaultValue: '1 / 24',
                description: '分页；page 受控时由应用接受。',
              },
              {
                name: 'readOnly / disabled',
                type: 'boolean',
                defaultValue: 'false',
                description: '只读保留浏览，禁用移除交互。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>

      <StorySection title="Keyboard and accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在搜索、筛选、视图切换、资源项和分页之间移动。' },
            { keys: ['Enter', 'Space'], action: '选择当前资源；只读时只浏览。' },
            { keys: 'Escape', action: '关闭由上层弹层承载的浏览器；页面内版本保持打开。' },
            { keys: 'F2 / double click', action: '在 provider 支持改名时编辑资源名称。' },
          ]}
        />
      </StorySection>
    </StoryPage>
  ),
}
