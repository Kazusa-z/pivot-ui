import React, { useEffect, useRef } from 'react'
import { useTextEdit } from '@pivot-ui/react'
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
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '-2px' },
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
  onRename?: (id: string, name: string) => void | Promise<void>
  handleMouseEnter?: () => void
  handleMouseLeave?: () => void
}

export function TreeItemContent(props: TreeItemContentProps) {
  const input = useRef<HTMLInputElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef(false)
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
  const editor = useTextEdit({
    value: propName,
    resetKey: id,
    readOnly: !renamable || !onRename,
    onCommit: (name) => {
      if (name !== propName) return onRename?.(id, name)
    },
  })
  const editing = editor.phase !== 'idle'

  const toggleExpandEntity = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onExpand(id)
  }

  const handleSelect = () => {
    onSelect(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
      return
    }
    if (e.key === 'F2' && renamable) {
      e.preventDefault()
      editor.begin()
      return
    }
    if (isExpandable && ((e.key === 'ArrowRight' && !isExpanded) || (e.key === 'ArrowLeft' && isExpanded))) {
      e.preventDefault()
      onExpand(id)
      return
    }
    let group = e.currentTarget.closest('[data-tree-group]')
    while (group?.parentElement?.closest('[data-tree-group]')) {
      group = group.parentElement.closest('[data-tree-group]')
    }
    const rows = Array.from(group?.querySelectorAll<HTMLElement>('[data-part="content"][role="treeitem"]') ?? [])
    const index = rows.indexOf(e.currentTarget)
    const nextIndex =
      e.key === 'ArrowDown'
        ? index + 1
        : e.key === 'ArrowUp'
          ? index - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? rows.length - 1
              : -1
    if (nextIndex >= 0 && nextIndex < rows.length) {
      e.preventDefault()
      rows[nextIndex].focus()
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    editor.inputProps.onKeyDown(e)
    if (e.defaultPrevented && (e.key === 'Enter' || e.key === 'Escape')) restoreFocus.current = true
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (renamable) {
      editor.begin()
    }
  }

  useEffect(() => {
    if (editing) {
      input.current?.focus()
      input.current?.select()
    } else if (restoreFocus.current) {
      restoreFocus.current = false
      content.current?.focus()
    }
  }, [editing])

  return (
    <TreeItemContentRoot
      ref={content}
      data-part="content"
      role="treeitem"
      tabIndex={0}
      aria-label={propName}
      aria-level={level + 1}
      aria-selected={isSelected}
      aria-expanded={isExpandable ? isExpanded : undefined}
      style={{ paddingLeft: `${(isExpandable ? 0 : 16) + 6 + level * 6}px` }}
      onClick={handleSelect}
      onContextMenu={handleSelect}
      onKeyDown={handleKeyDown}
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
            {...editor.inputProps}
            type="text"
            ref={input}
            aria-label={`Rename ${propName}`}
            readOnly={editor.phase === 'pending'}
            value={editor.draft}
            onKeyDown={handleInputKeyDown}
            onBlur={(event) => {
              restoreFocus.current = false
              editor.inputProps.onBlur(event)
            }}
          />
        ) : (
          <Text size="sm" ellipsis deleted={prefabRemoved}>
            {propName}
          </Text>
        )}
      </TreeItemName>
      {editor.error && <span role="alert">{editor.error}</span>}
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
