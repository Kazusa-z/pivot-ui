import { useEffect, useMemo, useRef, useState } from 'react'
import { IconTrash, IconPlus, IconEdit } from '@tabler/icons-react'
import { Flex, ActionButton, Accordion, AccordionItem, Button, Input } from '@pivot-ui/editor'
import { styled } from '../../../styled-system/jsx'

import { FormItem, extractFormItemProps, type BaseFormItemProps } from '../FormItem'

interface AccordionTitleProps {
  title: string
  onDelete?: () => void
  onRename?: (name: string) => void
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

function AccordionTitle(props: AccordionTitleProps) {
  const { title, renameable, onDelete, onRename, removable } = props
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  const editingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const finishRename = (commit: boolean) => {
    if (!editingRef.current) return
    editingRef.current = false
    setEditing(false)
    if (commit && draft !== title) {
      onRename?.(draft)
    }
  }

  return (
    <Flex align="v" css={{ flex: 1, justifyContent: 'space-between' }}>
      {editing ? (
        <Input
          ref={inputRef}
          aria-label="Item name"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault()
              finishRename(e.key === 'Enter')
            }
          }}
          onKeyUp={(e) => e.stopPropagation()}
          onBlur={() => finishRename(true)}
        />
      ) : (
        <span>{title}</span>
      )}
      <Flex gap="xxs">
        {renameable && onRename && !editing && (
          <ActionButton
            as="div"
            variant="subtle"
            aria-hidden
            tabIndex={-1}
            size="xs"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDraft(title)
              editingRef.current = true
              setEditing(true)
            }}>
            <IconEdit size="14px" />
          </ActionButton>
        )}
        {removable && (
          <ActionButton
            as="div"
            variant="subtle"
            aria-hidden
            tabIndex={-1}
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
  onRename?: (item: GroupItem, name: string) => void
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
    <FormItem {...extractFormItemProps(props)} direction="column">
      <Accordion type="multiple" defaultValue={propDefaultValue ?? defaultValue}>
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={`${item.id}`}
            title={
              <AccordionTitle
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
