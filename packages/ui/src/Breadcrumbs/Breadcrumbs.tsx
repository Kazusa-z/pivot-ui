import React, { Fragment } from 'react'
import { IconSlash } from '@tabler/icons-react'

import { styled } from '../../styled-system/jsx'
import type { SystemStyleObject } from '../../styled-system/types'

const StyledBreadcrumbs = styled('ol', {
  base: {
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    fontSize: '12px',
    color: 'var(--colors-text)',
    listStyle: 'none',
  },
})

export interface BreadcrumbProps {
  css?: SystemStyleObject
  size?: 'sm' | 'md'
  items: { id: number | string; label: string }[]
  onNavigate?: (id: number | string) => void
}

function Breadcrumbs(props: BreadcrumbProps) {
  const { items, size, onNavigate } = props
  const length = items.length

  const handleNavigate = (id) => {
    onNavigate && onNavigate(id)
  }

  return (
    <StyledBreadcrumbs>
      {items.map((item, index) => {
        return (
          <BreadcrumbItem
            size={size}
            key={item.id}
            isCurrent={index === length - 1}
            data-current={index === length - 1}
            onClick={() => handleNavigate(item.id)}>
            {item.label}
          </BreadcrumbItem>
        )
      })}
    </StyledBreadcrumbs>
  )
}

const StyledBreadcrumbItem = styled('li', {
  base: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    lineHeight: '16px',
    outline: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    color: 'var(--colors-textMuted)',
    '&[data-current="true"]': { color: 'var(--colors-textStrong)' },
  },
  variants: {
    size: {
      sm: { minHeight: '20px', padding: '0 4px', fontSize: '12px', borderRadius: '4px' },
      md: { minHeight: '24px', padding: '0 6px', fontSize: '14px', lineHeight: '20px', borderRadius: '4px' },
    },
  },
  defaultVariants: { size: 'sm' },
})

const Slash = styled(IconSlash, {
  base: { color: 'var(--colors-textMuted)' },
  variants: {
    size: {
      sm: { height: '12px', width: '12px', margin: '0 2px' },
      md: { height: '16px', width: '16px', margin: '0 4px' },
    },
  },
  defaultVariants: { size: 'sm' },
})

export interface BreadcrumbItemProps extends React.HtmlHTMLAttributes<HTMLLIElement> {
  isCurrent?: boolean
  size?: 'sm' | 'md'
  children: React.ReactNode
}

function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { isCurrent, size, ...rest } = props
  return (
    <Fragment>
      <StyledBreadcrumbItem size={size} {...rest}>
        {rest.children}
      </StyledBreadcrumbItem>
      {!isCurrent && <Slash size={size} />}
    </Fragment>
  )
}

export { Breadcrumbs, BreadcrumbItem }
