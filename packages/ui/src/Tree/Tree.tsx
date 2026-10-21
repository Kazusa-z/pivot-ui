import React, { useEffect, useRef, useState } from 'react'
import { IconChevronRight, IconChevronDown } from '@tabler/icons-react'

import { styled } from '../../styled-system/jsx'
import { Flex } from '../Flex'
import { Text } from '../Typography'

const StyledTreeGroup = styled('div', {
  base: { borderRadius: '4px' },
})

export const TreeGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof StyledTreeGroup>>(
  function TreeGroup(props, ref) {
    return <StyledTreeGroup data-tree-group {...props} ref={ref} />
  }
)

// TreeItemPreview is used for the preview of the tree item during drag and drop operation.
export const TreeItemPreview = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    height: '24px',
    fontSize: '12px',
    padding: '8px',
    borderRadius: '9999px',
    backgroundColor: 'var(--colors-blueA10)',
    color: 'var(--colors-white)',
  },
})

const TreeItemName = styled(Flex, {
  base: { height: '100%', flex: 1, minWidth: 0, userSelect: 'none' },
})

const TreeItemContentRoot = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '24px',
    fontSize: '12px',
    boxSizing: 'border-box',
    padding: '0 4px',
    borderRadius: '4px',
    gap: '4px',
    '&:hover': { boxShadow: '0 0 0 1px var(--colors-blue11)' },
  },
  variants: {
    isHovered: { true: { boxShadow: '0 0 0 1px var(--colors-blue11)' } },
    selected: {
      true: { color: 'var(--colors-white)', backgroundColor: 'var(--colors-blue10)', borderRadius: 0 },
    },
    isActive: { false: { color: 'var(--colors-gray9)' } },
  },
  compoundVariants: [{ selected: true, isActive: false, css: { color: 'var(--colors-white)' } }],
})

// TreeItemRenameInput is used for renaming the tree item.
const TreeItemRenameInput = styled('input', {
  base: {
    all: 'unset',
    width: '100%',
    fontWeight: 'inherit',
    height: '20px',
    outline: 'none',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 0 6px 4px',
    fontSize: '12px',
    backgroundColor: 'var(--colors-white)',
    color: 'black',
    boxSizing: 'border-box',
  },
})

/**
 * TreeItemRoot is the root element of the TreeItem component.
 * A basic structure of a TreeItem is as follows:
 * <TreeItemRoot>
 *  <InsertionIndicator />
 *  <TreeItemContent startSlot={<TreeItemIcon />} endSlot={<Button />} />
 *  <TreeGroup>
 *    <TreeItemRoot />
 *  </TreeGroup>
 *  <InsertionIndicator />
 *  <TreeItemDragPreview />
 * <TreeItemRoot />
 */
export const TreeItemRoot = styled('div', {
  base: {
    position: 'relative',
    borderRadius: '0',
    color: 'var(--colors-gray11)',
    fontWeight: 300,
    '&:hover': { backgroundColor: 'var(--colors-grayA2)' },
    '&:focus-visible': { outline: 'none' },
    '&[data-drop-target="true"] > [data-part="content"]': {
      color: 'var(--colors-gray12)',
      backgroundColor: 'var(--colors-grayA4)',
      borderRadius: '4px',
    },
  },
  variants: {
    isHovered: { true: { backgroundColor: 'var(--colors-grayA2)' } },
    isSelected: {
      true: {
        color: 'var(--colors-white)',
        borderRadius: '4px',
        boxShadow: '0 0 0 1px var(--colors-blueA11)',
        overflow: 'hidden',
        '& > [data-tree-group]': { backgroundColor: 'var(--colors-blue3)' },
      },
    },
    noTopRadius: { true: { borderTopLeftRadius: 0, borderTopRightRadius: 0 } },
    noBottomRadius: { true: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } },
    disabled: { true: { opacity: 0.5, pointerEvents: 'none' } },
  },
})

interface TreeItemContentProps {
  isHovered?: boolean
  id: string
  name: string
  isActive?: boolean
  prefabRemoved?: boolean
  renamable?: boolean
  level: number
  isExpandable: boolean
  isExpanded: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  onExpand: (id: string) => void
  startSlot?: React.ReactNode
  endSlot?: React.ReactNode
  onRename?: (id: string, name: string) => void
  handleMouseEnter?: () => void
  handleMouseLeave?: () => void
}

export function TreeItemContent(props: TreeItemContentProps) {
  const input = useRef<HTMLInputElement>(undefined)
  const {
    isHovered,
    id,
    name: propName,
    prefabRemoved,
    level,
    isExpandable,
    isExpanded,
    isSelected,
    onSelect,
    onExpand,
    startSlot,
    endSlot,
    isActive,
    onRename,
    renamable = true,
  } = props
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(propName)

  const toggleExpandEntity = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onExpand(id)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    onSelect(id)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter') {
      setEditing(false)
      if (onRename) {
        onRename(id, name)
      }
    }
    if (e.key === 'Escape') {
      setEditing(false)
      setName(propName)
    }
  }

  const handleInputChange = (e) => {
    setName(e.target.value)
  }

  const handleInputBlur = (e) => {
    e.stopPropagation()
    setEditing(false)
    if (onRename) {
      onRename(id, name)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (renamable) {
      setEditing(true)
    }
  }

  useEffect(() => {
    if (editing) {
      input.current?.focus()
      input.current?.select()
    }
  }, [editing])

  useEffect(() => {
    setName(propName)
  }, [propName])

  return (
    <TreeItemContentRoot
      data-part="content"
      style={{ paddingLeft: `${(isExpandable ? 0 : 16) + 6 + level * 6}px` }}
      onContextMenu={handleContextMenu}
      onMouseEnter={props.handleMouseEnter}
      onMouseLeave={props.handleMouseLeave}
      selected={isSelected}
      isHovered={isHovered}
      isActive={isActive}>
      {isExpandable && (
        <>
          {isExpanded ? (
            <IconChevronDown size="12px" onClick={toggleExpandEntity} />
          ) : (
            <IconChevronRight size="12px" onClick={toggleExpandEntity} />
          )}
        </>
      )}
      {startSlot}
      <TreeItemName align="v" onDoubleClick={handleDoubleClick}>
        {renamable && editing ? (
          <TreeItemRenameInput
            type="text"
            ref={input}
            value={name}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onChange={handleInputChange}
          />
        ) : (
          <Text size="sm" ellipsis deleted={prefabRemoved}>
            {name}
          </Text>
        )}
      </TreeItemName>
      {endSlot}
    </TreeItemContentRoot>
  )
}

type IconPolicy<T> = {
  icon: React.JSX.Element
  policy: (item?: T) => boolean
  color?: string
}[]

interface TreeItemIconProps<T> {
  item: T
  selected: boolean
  policy?: IconPolicy<T>
}

export function TreeItemIcon<T = any>(props: TreeItemIconProps<T>) {
  const { item, selected, policy } = props
  const { icon, color } = policy.find(({ policy }) => policy(item)) || policy[policy.length - 1]
  return React.cloneElement(icon, { color: selected ? 'CurrentColor' : color })
}
