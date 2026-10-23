import { forwardRef, useId } from 'react'
import { AssetThumbnail as NewAssetThumbnail, ActionButton } from '@pivot-ui/react'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import type { SystemStyleObject } from '../../styled-system/types'
import { legacyAssetDescriptor } from './legacyAssetDescriptor'

export interface AssetThumbnailProps {
  thumbnail?: string
  loadingStatus?: 'loading' | 'error' | 'success'
  selected?: boolean
  dropping?: boolean
  mini?: boolean
  expanded?: boolean
  expandable?: boolean
  onToggleExpanded?: () => void
  css?: SystemStyleObject
}

/** B11 compatibility composition; the new thumbnail itself has no expansion or selection state. */
export const AssetThumbnail = forwardRef<HTMLDivElement, AssetThumbnailProps>(function AssetThumbnail(
  { thumbnail, loadingStatus, selected, dropping, mini, expanded, expandable, onToggleExpanded, css },
  ref
) {
  const id = useId()
  return (
    <div
      ref={ref}
      data-selected={selected || undefined}
      data-dropping={dropping || undefined}
      style={{
        borderRadius: '4px',
        backgroundColor: selected ? 'var(--colors-softBg)' : undefined,
        outline: dropping ? '2px solid var(--colors-focusRing)' : undefined,
      }}>
      <NewAssetThumbnail
        asset={legacyAssetDescriptor(id, 'Asset preview', thumbnail, loadingStatus)}
        viewMode={mini ? 'list' : 'grid'}
        css={css}
      />
      {expandable && (
        <ActionButton
          aria-label={expanded ? 'Collapse asset' : 'Expand asset'}
          aria-expanded={expanded}
          size="xs"
          variant="subtle"
          onClick={onToggleExpanded}>
          {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
        </ActionButton>
      )}
    </div>
  )
})
