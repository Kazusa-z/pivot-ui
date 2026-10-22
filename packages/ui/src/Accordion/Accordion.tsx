import React, { type ReactNode } from 'react'
import { IconChevronRight } from '@tabler/icons-react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import type {
  AccordionItemProps as PrimitiveItemProps,
  AccordionSingleProps,
  AccordionMultipleProps,
} from '@radix-ui/react-accordion'

import { styled } from '../../styled-system/jsx'

type AccordionSize = 'sm' | 'md'

const AccordionContext = React.createContext<{ size: AccordionSize }>({ size: 'sm' })

const StyledAccordion = styled(AccordionPrimitive.Root, {
  base: { width: '100%', display: 'flex', flexDirection: 'column' },
})

const StyledItem = styled(AccordionPrimitive.Item, {
  base: {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: 'var(--colors-surface)',
    border: '1px solid var(--colors-border)',
    borderBottom: 'none',
    overflow: 'hidden',
    '&:first-child': { borderTopLeftRadius: '4px', borderTopRightRadius: '4px' },
    '&:last-child': {
      borderBottomLeftRadius: '4px',
      borderBottomRightRadius: '4px',
      borderBottom: '1px solid var(--colors-border)',
    },
    '&[data-state=open]': {
      borderColor: 'var(--colors-borderStrong)',
      '&:not(:first-child)': { borderTopColor: 'var(--colors-borderStrong)' },
      '& + &': { borderTopColor: 'var(--colors-borderStrong)' },
    },
    '&:has(+ [data-state=open])': { borderBottomColor: 'var(--colors-borderStrong)' },
  },
})

const StyledChevron = styled(IconChevronRight, {
  base: {
    width: '14px',
    height: '14px',
    color: 'currentColor',
    flexShrink: 0,
    transform: 'rotate(0deg)',
    transition: 'transform .2s ease, color .2s ease',
  },
})

const StyledHeader = styled(AccordionPrimitive.Header, {
  base: { all: 'unset', display: 'block', minWidth: 0, flex: 1 },
})

const StyledHeaderRow = styled('div', {
  base: { display: 'flex', alignItems: 'center' },
})

const StyledActions = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexShrink: 0,
    paddingRight: '8px',
    maxWidth: '65%',
    backgroundColor: 'var(--colors-grayA2)',
  },
})

const StyledTrigger = styled(AccordionPrimitive.Trigger, {
  base: {
    all: 'unset',
    display: 'flex',
    width: '100%',
    minHeight: '30px',
    padding: '0 12px',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    color: 'var(--colors-text)',
    overflow: 'hidden',
    boxSizing: 'border-box',
    userSelect: 'none',
    backgroundColor: 'var(--colors-grayA2)',
    transition: 'background-color .2s ease, border-color .2s ease, color .2s ease',
    '& > span': {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '&[data-state="open"] [data-accordion-chevron]': { transform: 'rotate(90deg)' },
    '&:hover': { backgroundColor: 'var(--colors-grayA3)', color: 'var(--colors-textStrong)' },
    '&:focus-visible': { outline: 'none', boxShadow: '0 0 0 2px var(--colors-focusRing)' },
  },
  variants: {
    size: {
      sm: { minHeight: '27px', padding: '0 8px', fontSize: '12px', lineHeight: '16px' },
      md: { minHeight: '30px', padding: '0 12px', fontSize: '14px', lineHeight: '20px' },
    },
  },
  defaultVariants: { size: 'sm' },
})

const StyledContent = styled(AccordionPrimitive.Content, {
  base: {
    overflow: 'hidden',
    fontSize: '12px',
    color: 'var(--colors-text)',
    backgroundColor: 'var(--colors-grayA2)',
    '&[data-state="open"]': {
      animationName: 'accordionSlideDown',
      animationDuration: '200ms',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    '&[data-state="closed"]': {
      animationName: 'accordionSlideUp',
      animationDuration: '180ms',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      '&[data-state="open"], &[data-state="closed"]': { animation: 'none' },
    },
  },
})

const StyledContentInner = styled('div', {
  base: {
    color: 'var(--colors-text)',
    borderTop: '1px solid var(--colors-border)',
  },
  variants: {
    size: {
      sm: { padding: '8px', fontSize: '12px', lineHeight: '16px' },
      md: { padding: '12px', fontSize: '12px', lineHeight: '20px' },
    },
  },
  defaultVariants: { size: 'sm' },
})

export type AccordionProps = (AccordionSingleProps | AccordionMultipleProps) & { size?: AccordionSize }

export const Accordion = function Accordion(props: AccordionProps) {
  const { size = 'sm', ...rest } = props
  return (
    <AccordionContext.Provider value={{ size }}>
      <StyledAccordion {...rest} />
    </AccordionContext.Provider>
  )
}

export type AccordionItemProps = Omit<PrimitiveItemProps, 'title'> & {
  title: ReactNode
  arrow?: boolean
  /** Interactive header actions must be siblings of the disclosure button. */
  actions?: ReactNode
}

export function AccordionItem(props: AccordionItemProps) {
  const { size } = React.useContext(AccordionContext)
  const { children, title, arrow = true, actions, ...rest } = props
  return (
    <StyledItem {...rest}>
      <StyledHeaderRow>
        <StyledHeader>
          <StyledTrigger size={size}>
            <span>{title}</span>
            {arrow && <StyledChevron data-accordion-chevron aria-hidden />}
          </StyledTrigger>
        </StyledHeader>
        {actions && <StyledActions>{actions}</StyledActions>}
      </StyledHeaderRow>
      <StyledContent>
        <StyledContentInner size={size}>{children}</StyledContentInner>
      </StyledContent>
    </StyledItem>
  )
}
