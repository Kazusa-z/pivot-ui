import React, { useEffect, useRef } from 'react'
import { useTextEdit } from '@pivot-ui/react'
import { styled } from '../../styled-system/jsx'

export const StyledAssetNameRoot = styled('div', {
  base: {
    fontSize: '12px',
    whiteSpace: 'break-word',
    minHeight: '20px',
    flexShrink: 0,
    overflowWrap: 'break-word',
    textAlign: 'center',
    maxWidth: '100%',
    cursor: 'default',
    userSelect: 'none',
    backgroundColor: 'transparent',
    borderRadius: '4px',
  },
})

const AssetNameDisplay = styled('span', {
  base: {
    display: 'block',
    minHeight: '20px',
    color: 'var(--colors-gray11)',
    padding: '0 6px',
  },
  variants: {
    selected: {
      true: {
        height: '20px',
        lineHeight: '19px',
        borderRadius: '4px',
        backgroundColor: 'var(--colors-blueA10)',
        color: 'var(--colors-white)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
    editing: { true: { padding: 0, outline: '1px solid var(--colors-blueA10)' } },
  },
})

const AssetNameInput = styled('input', {
  base: {
    all: 'unset',
    display: 'none',
    backgroundColor: 'transparent',
    fontSize: '12px',
    color: 'var(--colors-grayA11)',
    lineHeight: '14px',
    minHeight: '20px',
    flexShrink: 0,
    overflowWrap: 'break-word',
    textAlign: 'center',
    padding: '0 6px',
    width: '100%',
    maxWidth: '100%',
    userSelect: 'none',
    borderRadius: '4px',
    '&:focus': {
      boxShadow: '0 0 0 1px var(--colors-blueA10)',
      color: 'var(--colors-grayA12)',
    },
  },
  variants: {
    editing: { true: { display: 'block', boxSizing: 'border-box' } },
    renaming: {
      true: {
        display: 'block',
        userSelect: 'none',
        pointerEvents: 'none',
        backgroundColor: 'var(--colors-grayA3)',
        color: 'var(--colors-gray9)',
        boxShadow: 'none',
      },
    },
  },
})

export interface AssetNameProps {
  name: string
  selected?: boolean
  readOnly?: boolean
  onRename?: (name: string) => Promise<void>
}

export const AssetName = function AssetName(props: AssetNameProps) {
  const { selected, readOnly, onRename } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const editor = useTextEdit({
    value: props.name,
    readOnly: readOnly || !selected || !onRename,
    onCommit: async (name) => {
      if (!name) throw new Error('Name cannot be empty')
      if (name !== props.name) await onRename?.(name)
    },
  })
  const editing = editor.phase !== 'idle'

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    if (readOnly || !selected) return
    editor.begin()
  }

  return (
    <StyledAssetNameRoot onDoubleClickCapture={handleDoubleClick}>
      {!editing && <AssetNameDisplay selected={selected}>{props.name}</AssetNameDisplay>}
      <AssetNameInput
        {...editor.inputProps}
        aria-label={`Rename ${props.name}`}
        aria-invalid={editor.error ? true : undefined}
        readOnly={readOnly || editor.phase === 'pending'}
        value={editor.draft}
        editing={editing}
        renaming={editor.phase === 'pending'}
        ref={inputRef}
      />
      {editor.error && <span role="alert">{editor.error}</span>}
    </StyledAssetNameRoot>
  )
}

export default AssetName
