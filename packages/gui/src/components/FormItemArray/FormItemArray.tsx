import { useEffect, useMemo, useRef } from 'react'
import { useTextEdit } from '@pivot-ui/react'
import { IconTrash, IconPlus, IconEdit } from '@tabler/icons-react'
import { Flex, ActionButton, Accordion, AccordionItem, Button, Input } from '@pivot-ui/editor'
import { styled } from '../../../styled-system/jsx'

import { FormItem, extractFormItemProps, type BaseFormItemProps } from '../FormItem'

interface AccordionActionsProps {
  title: string
  onDelete?: () => void
  onRename?: (name: string) => void | Promise<void>
  removable?: boolean
  renameable?: boolean
  hasChild?: boolean
}

const AddItemButton = styled(Button, {
  base: {
    width: '100%',
    border: 'none',
    position: 'relative',
    borderRadius: 0,
    '& > svg': { marginRight: '4px' },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      borderTop: '1px solid var(--colors-grayA2)',
    },
  },
})

function AccordionActions(props: AccordionActionsProps) {
  const { title, renameable, onDelete, onRename, removable } = props
  const editor = useTextEdit({
    value: title,
    readOnly: !renameable || !onRename,
    onCommit: (draft) => {
      if (draft !== title) return onRename?.(draft)
    },
  })
  const editing = editor.phase !== 'idle'
  const inputRef = useRef<HTMLInputElement>(null)
  const renameButtonRef = useRef<HTMLButtonElement>(null)
  const restoreRenameFocus = useRef(false)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    } else if (restoreRenameFocus.current) {
      restoreRenameFocus.current = false
      renameButtonRef.current?.focus()
    }
  }, [editing])

  return (
    <Flex align="v" gap="xxs" css={{ minWidth: 0 }}>
      {editing && (
        <Input
          {...editor.inputProps}
          ref={inputRef}
          aria-label={`Rename ${title}`}
          css={{ width: '140px', minWidth: 0, maxWidth: '100%' }}
          value={editor.draft}
          readOnly={editor.phase === 'pending'}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation()
            editor.inputProps.onKeyDown(e)
            if (e.defaultPrevented && (e.key === 'Enter' || e.key === 'Escape')) restoreRenameFocus.current = true
          }}
          onKeyUp={(e) => e.stopPropagation()}
          onBlur={(event) => {
            restoreRenameFocus.current = false
            editor.inputProps.onBlur(event)
          }}
        />
      )}
      <Flex gap="xxs">
        {renameable && onRename && !editing && (
          <ActionButton
            ref={renameButtonRef}
            variant="subtle"
            aria-label={`Rename ${title}`}
            size="xs"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.begin()
            }}>
            <IconEdit size="14px" />
          </ActionButton>
        )}
        {removable && (
          <ActionButton
            variant="subtle"
            aria-label={`Delete ${title}`}
            size="xs"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onDelete) {
                onDelete()
              }
            }}>
            <IconTrash size="14px" />
          </ActionButton>
        )}
      </Flex>
      {editor.error && <span role="alert">{editor.error}</span>}
    </Flex>
  )
}

type GroupItem = {
  id: string
  name: any
  children: any
  removable?: boolean
  renameable?: boolean
}

export interface FormItemArrayProps extends Omit<BaseFormItemProps<any>, 'value' | 'onChange'> {
  items: GroupItem[]
  addable?: boolean
  addItemText?: string
  defaultValue?: string[]
  onAdd?: () => void
  onDelete?: (item: GroupItem) => void
  /** Called after an inline rename is committed. Update the item's name in `items` to apply it. */
  onRename?: (item: GroupItem, name: string) => void | Promise<void>
}

export function FormItemArray(props: FormItemArrayProps) {
  const {
    items = [],
    onAdd,
    onDelete,
    onRename,
    addItemText = 'Add Item',
    defaultValue: propDefaultValue,
    addable = false,
  } = props

  const handleItemDelete = (item: GroupItem) => () => {
    onDelete && onDelete(item)
  }

  const defaultValue = useMemo(() => {
    if (items.length) {
      return items.map((item) => `${item.id}`)
    }
    return []
  }, [items])

  return (
    <FormItem {...extractFormItemProps(props)} association="group" direction="column">
      <Accordion type="multiple" defaultValue={propDefaultValue ?? defaultValue}>
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={`${item.id}`}
            title={item.name}
            actions={
              <AccordionActions
                title={item.name}
                onDelete={handleItemDelete(item)}
                onRename={onRename ? (name) => onRename(item, name) : undefined}
                removable={item.removable}
                renameable={item.renameable}
              />
            }
            arrow={!!item.children}>
            {item.children && <Flex direction="column">{item.children}</Flex>}
          </AccordionItem>
        ))}
        {addable && (
          <AddItemButton size="sm" variant="soft" onClick={onAdd}>
            <IconPlus size="12px" /> {addItemText}
          </AddItemButton>
        )}
      </Accordion>
    </FormItem>
  )
}
