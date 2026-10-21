import React, { forwardRef, Fragment } from 'react'
import { IconCaretRightFilled, IconCaretLeftFilled, IconCloudDownload, IconCloudX } from '@tabler/icons-react'

import { styled } from '../../styled-system/jsx'
import type { SystemStyleObject } from '../../styled-system/types'
import { ActionButton } from '../ActionButton'
import { mergeRefs } from '../utils/merge-refs'
import { Flex } from '../Flex'
import IconPendingFile from '../Icons/Files/Pending'

const ExpandButton = styled(ActionButton, {
  base: {
    position: 'absolute',
    top: '50%',
    right: '0',
    transform: 'translateY(-50%)',
    opacity: 0,
    transition: 'opacity 0.16s ease-in-out',
    color: 'var(--colors-gray12)',
  },
  variants: {
    expanded: { true: { opacity: 1 } },
  },
})

const AssetThumbnailRoot = styled(Flex, {
  base: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: '6px',
    flexShrink: 0,
    userSelect: 'none',
    backgroundColor: 'transparent',
    outline: '0px solid transparent',
    transition: 'background-color 0.16s ease-in-out, outline 0.16s ease-in-out',
    '&:hover': { backgroundColor: 'var(--colors-grayA2)' },
    '& img': {
      display: 'block',
      objectFit: 'cover',
      maxWidth: '70%',
      maxHeight: '70%',
      transform: 'scale(1)',
      transition: 'transform 0.16s ease-in-out',
    },
  },
  variants: {
    expandable: {
      true: {
        '&:hover [data-expand-button]': { opacity: 1 },
      },
    },
    mini: { true: { width: '28px', height: '28px', borderRadius: '4px' } },
    selected: {
      true: {
        backgroundColor: 'var(--colors-grayA3)',
        '&:hover': { backgroundColor: 'var(--colors-grayA3)' },
      },
    },
    dropping: {
      true: {
        backgroundColor: 'var(--colors-blueA4)',
        outline: '2px solid var(--colors-blue10)',
        '&:hover': { backgroundColor: 'var(--colors-blueA4)' },
        '& img': { transform: 'scale(1.06)' },
      },
    },
  },
})

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

export const AssetThumbnail = forwardRef<HTMLDivElement, AssetThumbnailProps>(
  function AssetThumbnail(props, forwardedRef) {
    const thumbnailRef = React.useRef<HTMLDivElement>(null)
    const {
      thumbnail,
      dropping = false,
      mini = false,
      selected,
      expandable = false,
      expanded,
      onToggleExpanded,
      loadingStatus,
      css,
    } = props

    const handleToggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onToggleExpanded && onToggleExpanded()
    }

    return (
      <AssetThumbnailRoot
        mini={mini}
        align="both"
        expandable={expandable}
        selected={selected}
        dropping={dropping}
        css={css}
        ref={mergeRefs([thumbnailRef, forwardedRef])}>
        {loadingStatus !== undefined && loadingStatus !== 'success' && (
          <Fragment>
            {loadingStatus === 'loading' && (
              <IconPendingFile style={{ display: 'blobk', maxWidth: '70%', maxHeight: '70%' }} />
            )}
            {loadingStatus === 'error' && <IconCloudX size="16px" />}
          </Fragment>
        )}
        {(loadingStatus === undefined || (thumbnail && loadingStatus === 'success')) && <img src={thumbnail} />}
        {expandable && (
          <ExpandButton data-expand-button expanded={expanded} onClick={handleToggleExpand} size="xs" variant="subtle">
            {expanded ? (
              <IconCaretLeftFilled size="24px" strokeWidth={3} />
            ) : (
              <IconCaretRightFilled size="24px" strokeWidth={3} />
            )}
          </ExpandButton>
        )}
      </AssetThumbnailRoot>
    )
  }
)
