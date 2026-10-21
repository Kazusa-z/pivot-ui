import { ReactNode } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { HoverCard } from '@pivot-ui/editor'
import { styled } from '../../../styled-system/jsx'
import type { SystemStyleObject } from '../../../styled-system/types'

const StyledLabelRoot = styled('div', {
  base: {
    all: 'unset',
    display: 'flex',
    minHeight: '24px',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 500,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: 'var(--colors-gray10)',
    textOverflow: 'ellipsis',
    userSelect: 'none',
  },
})

const StyledLabel = styled(LabelPrimitive.Root, {
  base: { display: 'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' },
})

export interface LabelProps {
  info?: ReactNode
  label: string
  startSlot?: ReactNode
  endSlot?: ReactNode
  htmlFor?: string
  css?: SystemStyleObject
}

export function Label(props: LabelProps) {
  const { info, startSlot, endSlot, label, htmlFor, css } = props

  const LabelRoot = (
    <StyledLabelRoot css={css}>
      {startSlot}
      <StyledLabel htmlFor={htmlFor}>{label}</StyledLabel>
      {endSlot}
    </StyledLabelRoot>
  )

  if (info) {
    return (
      <HoverCard trigger={LabelRoot} side="left">
        {info}
      </HoverCard>
    )
  }
  return LabelRoot
}
