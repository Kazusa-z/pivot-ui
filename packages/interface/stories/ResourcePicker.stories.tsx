import { StrictMode, useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ResourcePicker } from '../src/templates/resources/ResourcePicker'
import type { ResourceProvider } from '../src/contracts/resources'
import type { ResourceViewMode } from '../src/values/assets'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'
import {
  createMockResourceProvider,
  mockAssets,
  resourceGroupOptions,
  resourceKindOptions,
} from './support/mock-resource-provider'

function PickerExample({
  empty = false,
  capabilities = true,
  initialReadOnly = false,
  initialDisabled = false,
  refuse = false,
  async = false,
  narrow = false,
}: {
  empty?: boolean
  capabilities?: boolean
  initialReadOnly?: boolean
  initialDisabled?: boolean
  refuse?: boolean
  async?: boolean
  narrow?: boolean
}) {
  const [revision, setRevision] = useState(0),
    [host, setHost] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>('outside-current-page')
  const [queryText, setQueryText] = useState(''),
    [kinds, setKinds] = useState<readonly string[]>([]),
    [groupId, setGroupId] = useState('')
  const [viewMode, setViewMode] = useState<ResourceViewMode>('grid'),
    [page, setPage] = useState(1)
  const [readOnly, setReadOnly] = useState(initialReadOnly),
    [disabled, setDisabled] = useState(initialDisabled)
  const [events, setEvents] = useState<string[]>([]),
    [reject, setReject] = useState(false)
  const context = useRef({ revision, host })
  context.current = { revision, host }
  const mock = useMemo(
    () =>
      createMockResourceProvider({
        assets: empty
          ? []
          : host
            ? mockAssets.map((asset) => ({ ...asset, name: `Other host ${asset.name}` }))
            : mockAssets,
        delayMs: async ? 450 : 0,
      }),
    [revision, host, empty, async]
  )
  const provider = useMemo<ResourceProvider>(
    () => (capabilities ? mock : { query: (query) => mock.query(query), get: (id) => mock.get(id) }),
    [mock, capabilities]
  )
  const log = (event: string) => setEvents((previous) => [...previous.slice(-11), event])
  function reset() {
    setRevision((value) => value + 1)
    setSelectedId('outside-current-page')
    setQueryText('')
    setKinds([])
    setGroupId('')
    setViewMode('grid')
    setPage(1)
    setEvents([])
    setReject(false)
    setReadOnly(initialReadOnly)
    setDisabled(initialDisabled)
  }
  return (
    <ContractFrame
      title="Resource picker"
      description="Search, filters, grouping and paging are independent UI state. Selection is an ID request; the host accepts, refuses or rejects it. Rename and query failures can be retried without losing the current reference."
      onReset={reset}>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setReadOnly((value) => !value)}>
          {readOnly ? 'Allow selection' : 'Read only'}
        </ControlButton>
        <ControlButton onClick={() => setDisabled((value) => !value)}>
          {disabled ? 'Enable picker' : 'Disable picker'}
        </ControlButton>
        <ControlButton onClick={() => setHost((value) => value + 1)}>Replace provider</ControlButton>
        <ControlButton
          onClick={() => {
            mock.rejectNext('query')
            log('Next query will fail')
          }}>
          Fail next query
        </ControlButton>
        {capabilities && (
          <ControlButton
            onClick={() => {
              mock.rejectNext('rename')
              log('Next rename will fail')
            }}>
            Fail next rename
          </ControlButton>
        )}
        <ControlButton onClick={() => setReject((value) => !value)}>
          {reject ? 'Accept selection' : 'Reject selection asynchronously'}
        </ControlButton>
      </div>
      <div style={{ width: narrow ? 280 : '100%', maxWidth: '100%' }}>
        <ResourcePicker
          provider={provider}
          selectedId={selectedId}
          onSelectedIdChange={(id) => {
            if (!refuse) setSelectedId(id)
          }}
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
          resetKey={revision}
          onSelect={async (id) => {
            const token = context.current
            log(`select ${id}`)
            if (async || reject) await new Promise((resolve) => setTimeout(resolve, 500))
            if (
              token !== context.current &&
              (token.revision !== context.current.revision || token.host !== context.current.host)
            )
              return false
            if (reject) throw Error('The host rejected this resource. Retry after enabling acceptance.')
            return !refuse
          }}
          onSelectSuccess={(id) => log(`selection completed ${id}`)}
        />
      </div>
      <StatePanel
        label="Authoritative selection and UI state"
        value={{ selectedId, queryText, kinds, groupId, viewMode, page, readOnly, disabled, events }}
      />
    </ContractFrame>
  )
}

const meta = {
  title: 'Templates/Resources/ResourcePicker',
  component: PickerExample,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PickerExample>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = {}
export const ControlledRefusal: Story = { args: { refuse: true } }
export const AsyncAndReset: Story = {
  args: { async: true },
  render: (args) => (
    <StrictMode>
      <PickerExample {...args} />
    </StrictMode>
  ),
}
export const Empty: Story = { args: { empty: true } }
export const ReadOnly: Story = { args: { initialReadOnly: true } }
export const Disabled: Story = { args: { initialDisabled: true } }
export const WithoutOptionalCapabilities: Story = { args: { capabilities: false } }
export const Narrow: Story = { args: { narrow: true } }
