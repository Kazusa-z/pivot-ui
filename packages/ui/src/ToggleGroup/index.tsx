import React, { forwardRef, PropsWithChildren, cloneElement, ReactElement, Children } from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import type {
  ToggleGroupItemProps as PrimitiveItemProps,
  ToggleGroupSingleProps,
  ToggleGroupMultipleProps,
} from '@radix-ui/react-toggle-group'

import { styled } from '../../styled-system/jsx'

const StyledToggleGroup = styled(ToggleGroupPrimitive.Root, {
  base: { display: 'flex', gap: '4px' },
})

const StyledItem = styled(ToggleGroupPrimitive.Item, {
  base: {
    all: 'unset',
    display: 'flex',
    height: '24px',
    aspectRatio: '1/1',
    borderRadius: '4px',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: 'var(--colors-text)',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    transition: 'background-color .2s ease, color .2s ease, box-shadow .2s ease, transform 0.2s ease',
    cursor: 'pointer',
    boxSizing: 'border-box',
    '&:hover': { backgroundColor: 'var(--colors-softBgHover)' },
    '&:focus-visible': {
      position: 'relative',
      boxShadow: '0 0 0 2px var(--colors-focusRing)',
    },
  },
  variants: {
    size: {
      sm: {
        height: '24px',
        borderRadius: '4px',
        fontSize: '12px',
        '& > svg': { width: '14px', height: '14px', strokeWidth: 1.5 },
      },
      md: {
        height: '32px',
        borderRadius: '6px',
        fontSize: '14px',
        '& > svg': { width: '16px', height: '16px' },
      },
      lg: {
        height: '36px',
        borderRadius: '8px',
        fontSize: '14px',
        '& > svg': { width: '18px', height: '18px' },
      },
    },
    fancy: {
      true: { '&:active': { transform: 'scale(0.94)' } },
    },
    variant: {
      primary: {
        '&[data-state=on]': {
          backgroundColor: 'var(--colors-selectionBg)',
          color: 'var(--colors-selectionText)',
          fontWeight: 500,
        },
        '&[data-state=on]:hover': {
          backgroundColor: 'var(--colors-selectionBgHover)',
          color: 'var(--colors-selectionText)',
        },
      },
      subtle: {
        backgroundColor: 'var(--colors-softBg)',
        '&[data-state=on]': {
          backgroundColor: 'var(--colors-surface)',
          color: 'var(--colors-textStrong)',
          fontWeight: 500,
          boxShadow: 'inset 0 0 0 1px var(--colors-border)',
        },
        '&[data-state=on]:hover': {
          backgroundColor: 'var(--colors-surface)',
          color: 'var(--colors-textStrong)',
        },
      },
    },
  },
  defaultVariants: { size: 'sm', variant: 'primary' },
})

type ToggleGroupPrimitiveProps = ToggleGroupSingleProps | ToggleGroupMultipleProps

type ToggleGroupProps = ToggleGroupPrimitiveProps & { size?: 'sm' | 'md' | 'lg'; variant?: 'primary' | 'subtle' }

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(props, forwardedRef) {
  const { size, variant, children: propChildren, ...rest } = props
  const children = Children.toArray(propChildren)

  return (
    <StyledToggleGroup ref={forwardedRef} {...rest}>
      {children.map((child, key) => {
        return cloneElement(child as ReactElement<Pick<ToggleGroupProps, 'size' | 'variant'>>, { size, key, variant })
      })}
    </StyledToggleGroup>
  )
})

export interface ToggleGroupItemProps extends PrimitiveItemProps {
  fancy?: boolean
  size?: 'sm' | 'md' | 'lg'
  subtle?: boolean
}

export const ToggleGroupItem = StyledItem

export type { ToggleGroupSingleProps, ToggleGroupMultipleProps } from '@radix-ui/react-toggle-group'
