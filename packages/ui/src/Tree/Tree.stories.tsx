import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createTreeCollection } from '@pivot-ui/react'
import { TreeRoot, TreeItemContent } from './'

const initial = [
  {
    id: 'folder',
    name: 'Folder',
    children: [
      { id: 'alpha', name: 'Alpha' },
      { id: 'beta', name: 'Beta' },
    ],
  },
]
function TreeExample() {
  const [items, setItems] = useState(initial)
  const [selected, setSelected] = useState<readonly (string | number)[]>(['alpha'])
  const [expanded, setExpanded] = useState<readonly (string | number)[]>(['folder'])
  const collection = useMemo(
    () =>
      createTreeCollection<{ id: string; name: string; children?: readonly { id: string; name: string }[] }>(items, {
        getKey: (item) => item.id,
        getChildren: (item) => item.children,
        getTextValue: (item) => item.name,
      }),
    [items]
  )
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
      <button
        type="button"
        onClick={() => {
          setItems(initial)
          setSelected(['alpha'])
          setExpanded(['folder'])
        }}>
        Reset
      </button>
      <TreeRoot
        collection={collection}
        aria-label="Example tree"
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        expandedKeys={expanded}
        onExpandedKeysChange={setExpanded}
        renderItem={(node) => (
          <TreeItemContent
            label={node.item.name}
            onRename={(name) =>
              setItems((old) =>
                old.map((item) =>
                  item.id === node.key
                    ? { ...item, name }
                    : {
                        ...item,
                        children: item.children.map((child) => (child.id === node.key ? { ...child, name } : child)),
                      }
                )
              )
            }
          />
        )}
      />
      <pre>{JSON.stringify({ selected, expanded, items }, null, 2)}</pre>
    </div>
  )
}
export default { title: 'Display/Tree' } satisfies Meta
export const Overview: StoryObj = { render: () => <TreeExample /> }
