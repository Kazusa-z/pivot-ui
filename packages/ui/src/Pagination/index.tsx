import React from 'react'
import { IconChevronLeft, IconChevronRight, IconDots } from '@tabler/icons-react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'

import { DOTS, usePagination } from './usePagination'

import { styled } from '../../styled-system/jsx'

const StyledPaginationRoot = styled('ul', {
  base: { display: 'flex', alignItems: 'center' },
})

const StyledPaginationItem = styled('li', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--colors-border)',
    color: 'var(--colors-text)',
    userSelect: 'none',
    cursor: 'pointer',
    marginRight: '8px',
    transition: 'border-color .2s ease, background-color .2s ease, color .2s ease, box-shadow .2s ease',
    '&:last-child': { marginRight: 0 },
    '&:hover': { borderColor: 'var(--colors-borderStrong)', backgroundColor: 'var(--colors-surfaceSubtle)' },
    '&:focus-visible': {
      borderColor: 'var(--colors-borderStrong)',
      boxShadow: '0 0 0 2px var(--colors-focusRing)',
    },
  },
  variants: {
    active: {
      true: {
        backgroundColor: 'var(--colors-selectionBg)',
        borderColor: 'var(--colors-selectionBorder)',
        color: 'var(--colors-selectionText)',
        '&:hover': {
          borderColor: 'var(--colors-selectionBorder)',
          backgroundColor: 'var(--colors-selectionBgHover)',
          color: 'var(--colors-selectionText)',
        },
      },
    },
    disabled: {
      true: {
        backgroundColor: 'var(--colors-surface)',
        color: 'var(--colors-textMuted)',
        cursor: 'initial',
        '&:hover': { borderColor: 'var(--colors-border)', backgroundColor: 'var(--colors-surface)' },
      },
    },
    size: {
      sm: {
        height: '24px',
        width: '24px',
        fontSize: '12px',
        borderRadius: '4px',
        '& > svg': { width: '14px', height: '14px' },
      },
      md: {
        height: '32px',
        width: '32px',
        fontSize: '14px',
        borderRadius: '6px',
        '& > svg': { width: '16px', height: '16px' },
      },
    },
  },
  defaultVariants: { size: 'sm' },
})

type IPaginationProps = {
  totalCount: number
  pageSize: number
  siblingCount?: number
  currentPage?: number
  onPageChange?: (nextPage: number) => void
  size?: 'sm' | 'md'
}

function Pagination(props: IPaginationProps) {
  const { totalCount, onPageChange, currentPage, pageSize, siblingCount = 1, size } = props

  const [current = 1, setCurrentPage] = useControllableState({
    prop: currentPage,
    onChange: onPageChange,
    defaultProp: props.currentPage,
  })

  const range = usePagination({
    currentPage: current,
    totalCount,
    siblingCount,
    pageSize,
  })
  const lastPage = range[range.length - 1]

  if (current === 0 || range.length < 2) return null

  const onNext = () => {
    if (current >= lastPage) return
    setCurrentPage(current + 1)
  }

  const onPrev = () => {
    if (current === 1) return
    setCurrentPage(current - 1)
  }

  const onItemClick = (pageNo) => {
    setCurrentPage(pageNo)
  }

  return (
    <StyledPaginationRoot>
      <StyledPaginationItem size={size} onClick={onPrev} disabled={current === 1}>
        <IconChevronLeft />
      </StyledPaginationItem>
      {range.map((item, idx) => {
        if (item === DOTS) {
          return (
            <StyledPaginationItem size={size} key={`${DOTS}_${idx}`}>
              <IconDots />
            </StyledPaginationItem>
          )
        }
        return (
          <StyledPaginationItem key={item} onClick={() => onItemClick(item)} active={item === current} size={size}>
            {item}
          </StyledPaginationItem>
        )
      })}
      <StyledPaginationItem size={size} onClick={onNext} disabled={current === lastPage}>
        <IconChevronRight />
      </StyledPaginationItem>
    </StyledPaginationRoot>
  )
}

export { Pagination }
