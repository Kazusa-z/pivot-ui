import { useMemo, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { IconFile, IconFolder, IconTrash } from '@tabler/icons-react'
import { ActionButton } from '../ActionButton'
import { Button } from '../Button'
import { Flex } from '../Flex'
import { TreeGroup, TreeItemContent, TreeItemRoot } from './'

export default {
  title: 'Display/Tree',
} as Meta

type TreeNode = {
  id: string
  name: string
  children?: TreeNode[]
}

const initialTree: TreeNode[] = [
  {
    id: 'scene',
    name: 'Scene',
    children: [
      {
        id: 'meshes',
        name: 'Meshes',
        children: [
          { id: 'mesh-sphere', name: 'Sphere' },
          { id: 'mesh-cube', name: 'Cube' },
          { id: 'mesh-plane', name: 'Plane' },
        ],
      },
      {
        id: 'lights',
        name: 'Lights',
        children: [
          { id: 'light-main', name: 'Main Light' },
          { id: 'light-fill', name: 'Fill Light' },
        ],
      },
      {
        id: 'cameras',
        name: 'Cameras',
        children: [{ id: 'camera-main', name: 'Main Camera' }],
      },
    ],
  },
]

/**
 * A small interactive example of the low-level Tree primitives.
 *
 * It demonstrates expansion, selection, inline rename, start/end slots and
 * deletion. Drag and drop is intentionally left to the consuming editor.
 */
export const Overview: StoryFn = () => {
  const [tree, setTree] = useState(initialTree)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['scene', 'meshes']))
  const [selected, setSelected] = useState('mesh-sphere')
  const [names, setNames] = useState<Record<string, string>>({})

  const allParentIds = useMemo(() => {
    const ids: string[] = []
    const visit = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children?.length) {
          ids.push(node.id)
          visit(node.children)
        }
      })
    }
    visit(tree)
    return ids
  }, [tree])

  const toggleNode = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const removeNode = (id: string) => {
    const remove = (nodes: TreeNode[]): TreeNode[] =>
      nodes
        .filter((node) => node.id !== id)
        .map((node) => (node.children ? { ...node, children: remove(node.children) } : node))

    setTree((current) => remove(current))
    if (selected === id) setSelected('scene')
  }

  const renderNodes = (nodes: TreeNode[], level: number) =>
    nodes.map((node) => {
      const hasChildren = !!node.children?.length
      const isExpanded = expanded.has(node.id)
      const isSelected = selected === node.id

      return (
        <TreeItemRoot key={node.id} isSelected={isSelected}>
          <TreeItemContent
            id={node.id}
            name={names[node.id] ?? node.name}
            level={level}
            isExpandable={hasChildren}
            isExpanded={isExpanded}
            isSelected={isSelected}
            isActive
            onSelect={setSelected}
            onExpand={toggleNode}
            onRename={(id, name) => setNames((current) => ({ ...current, [id]: name }))}
            startSlot={hasChildren ? <IconFolder size={12} /> : <IconFile size={12} />}
            endSlot={
              <ActionButton
                size="xs"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation()
                  removeNode(node.id)
                }}>
                <IconTrash size={11} />
              </ActionButton>
            }
          />
          {hasChildren && isExpanded && <TreeGroup>{renderNodes(node.children!, level + 1)}</TreeGroup>}
        </TreeItemRoot>
      )
    })

  return (
    <Flex direction="column" gap="sm" style={{ width: 340 }}>
      <Flex gap="xs" align="v">
        <Button size="xs" variant="soft" onClick={() => setExpanded(new Set(allParentIds))}>
          Expand all
        </Button>
        <Button size="xs" variant="soft" onClick={() => setExpanded(new Set())}>
          Collapse all
        </Button>
        <Button
          size="xs"
          variant="subtle"
          onClick={() => {
            setTree(initialTree)
            setExpanded(new Set(['scene', 'meshes']))
            setSelected('mesh-sphere')
            setNames({})
          }}>
          Reset
        </Button>
      </Flex>
      <TreeGroup role="tree" aria-label="Scene hierarchy">
        {renderNodes(tree, 0)}
      </TreeGroup>
    </Flex>
  )
}
