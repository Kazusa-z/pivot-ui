import { forwardRef, useId, useState, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { AssetItem as NewAssetItem, ActionButton } from '@pivot-ui/react'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import type { SystemStyleObject } from '../../styled-system/types'
import { legacyAssetDescriptor } from './legacyAssetDescriptor'

export interface AssetItemProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  thumbnail?: string
  loadingStatus?: 'loading' | 'error' | 'success'
  selected?: boolean
  onSelectedChange?: (event: MouseEvent) => void
  onRename?: (name: string) => void | Promise<void>
  readOnly?: boolean
  disabled?: boolean
  expandable?: boolean
  expanded?: boolean
  defaultExpanded?: boolean
  onToggleExpanded?: () => void
  dropping?: boolean
  mini?: boolean
  children?: ReactNode
  displayMode?: 'grid' | 'list'
  css?: SystemStyleObject
}

/** B11 removes this prop-shape adapter. Expansion is an explicit sibling action, outside the selection button. */
export const AssetItem = forwardRef<HTMLDivElement, AssetItemProps>(function AssetItem(
  {
    id,
    name,
    thumbnail,
    loadingStatus,
    selected,
    onSelectedChange,
    onSelect: nativeOnSelect,
    onRename,
    readOnly,
    disabled,
    expandable,
    expanded: controlledExpanded,
    defaultExpanded = false,
    onToggleExpanded,
    dropping,
    mini,
    children,
    displayMode = 'grid',
    css,
    ...props
  },
  ref
) {
  const localId = useId()
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded)
  const expanded = controlledExpanded ?? localExpanded
  return (
    <div
      data-legacy-asset=""
      data-dropping={dropping || undefined}
      onSelect={nativeOnSelect}
      style={dropping ? { outline: '2px solid var(--colors-focusRing)', borderRadius: '6px' } : undefined}>
      <NewAssetItem
        {...props}
        id={id}
        ref={ref}
        asset={legacyAssetDescriptor(id ?? localId, name, thumbnail, loadingStatus)}
        selected={selected}
        selectionButtonProps={onSelectedChange ? { onClick: onSelectedChange } : undefined}
        onRename={onRename}
        readOnly={readOnly || !selected}
        disabled={disabled}
        viewMode={mini ? 'list' : displayMode}
        css={css}
        actions={
          expandable ? (
            <ActionButton
              aria-label={expanded ? `Collapse ${name}` : `Expand ${name}`}
              aria-expanded={expanded}
              disabled={disabled}
              size="xs"
              variant="subtle"
              onClick={() => {
                if (controlledExpanded === undefined) setLocalExpanded(!expanded)
                onToggleExpanded?.()
              }}>
              {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            </ActionButton>
          ) : undefined
        }
      />
      {(!expandable || expanded) && children}
    </div>
  )
})
