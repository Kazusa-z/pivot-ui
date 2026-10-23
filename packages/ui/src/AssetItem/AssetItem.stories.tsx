import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AssetItem } from './'
import { css } from '../../styled-system/css'

function AssetItemExample({ list = false }: { list?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [name, setName] = useState('Landscape texture')
  const [events, setEvents] = useState<string[]>([])
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: 0,
        width: '100%',
        maxWidth: '620px',
        padding: '16px',
      })}>
      <p>
        Legacy props adapt to the new AssetItem. Select the preview, then edit the name. Expansion is a separate button.
      </p>
      <button
        type="button"
        onClick={() => {
          setSelected(null)
          setName('Landscape texture')
          setEvents([])
        }}>
        Reset
      </button>
      <div
        className={css({ display: 'grid', gap: '12px', minWidth: 0 })}
        style={{ gridTemplateColumns: list ? 'minmax(0, 1fr)' : 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))' }}>
        <AssetItem
          id="legacy-texture"
          name={name}
          loadingStatus="success"
          selected={selected === 'legacy-texture'}
          displayMode={list ? 'list' : 'grid'}
          onSelectedChange={(event) => {
            event.stopPropagation()
            setSelected('legacy-texture')
            setEvents((old) => [...old, 'select:texture'])
          }}
          onRename={(next) => {
            setName(next)
            setEvents((old) => [...old, 'rename:' + next])
          }}
          expandable
          onToggleExpanded={() => setEvents((old) => [...old, 'toggle expansion'])}>
          <p>Host supplied expanded details.</p>
        </AssetItem>
        <AssetItem
          id="legacy-loading"
          name="Loading mesh"
          loadingStatus="loading"
          displayMode={list ? 'list' : 'grid'}
          onSelectedChange={() => setEvents((old) => [...old, 'unexpected loading select'])}
        />
        <AssetItem
          id="legacy-error"
          name="Unavailable asset"
          loadingStatus="error"
          displayMode={list ? 'list' : 'grid'}
          onSelectedChange={() => setEvents((old) => [...old, 'unexpected error select'])}
        />
        <AssetItem
          id="legacy-readonly"
          name="Read-only material"
          readOnly
          selected={selected === 'legacy-readonly'}
          displayMode={list ? 'list' : 'grid'}
          onSelectedChange={() => setSelected('legacy-readonly')}
        />
      </div>
      <pre className={css({ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' })}>
        {JSON.stringify({ selected, name, events }, null, 2)}
      </pre>
    </div>
  )
}
const meta = {
  title: 'Display/AssetItem',
  component: AssetItem,
  args: { name: 'Asset' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AssetItem>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <AssetItemExample /> }
export const List: Story = { render: () => <AssetItemExample list /> }
