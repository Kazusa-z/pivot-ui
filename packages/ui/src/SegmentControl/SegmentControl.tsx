import React, { createContext, useContext } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

import { styled } from '../../styled-system/jsx'

// Context for SegmentControl
type SegmentControlContextValue = {
  size: 'sm' | 'md'
  variant: 'subtle' | 'solid'
}

const SegmentControlContext = createContext<SegmentControlContextValue | null>(null)
SegmentControlContext.displayName = 'SegmentControlContext'

const useSegmentControlContext = () => {
  const context = useContext(SegmentControlContext)
  if (!context) {
    throw new Error('SegmentControlItem must be used within a SegmentControl')
  }
  return context
}

const StyledSegmentControlItem = styled(RadioGroupPrimitive.Item, {
  base: {
    all: 'unset',
    textWrap: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    color: 'var(--colors-textMuted)',
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    cursor: 'pointer',
    padding: '0 6px',
    borderRadius: 'inherit',
    gap: '4px',
    transition: 'all .2s ease',
    userSelect: 'none',
    '& > svg': { height: '14px', width: '14px' },
    '&:hover': { color: 'var(--colors-textStrong)' },
    '&[data-state=checked]': {
      backgroundColor: 'var(--colors-surfaceOverlay)',
      color: 'var(--colors-textStrong)',
      boxShadow: '0 0 0 1px var(--colors-border)',
      '&:hover': { color: 'var(--colors-textStrong)' },
    },
    '&:focus-visible': {
      position: 'relative',
      boxShadow: 'inset 0 0 0 1px var(--colors-borderStrong)',
    },
  },
  variants: {
    variant: {
      subtle: {},
      solid: {
        backgroundColor: 'var(--colors-softBg)',
        '&[data-state=checked]': {
          backgroundColor: 'var(--colors-selectionBg)',
          color: 'var(--colors-selectionText)',
          boxShadow: 'none',
          '&:hover': { color: 'var(--colors-selectionText)' },
        },
      },
    },
  },
  defaultVariants: { variant: 'subtle' },
})

const StyledSegmentControlRoot = styled(RadioGroupPrimitive.Root, {
  base: {
    display: 'inline-grid',
    backgroundColor: 'var(--colors-softBg)',
    gridAutoColumns: '1fr',
    gridAutoFlow: 'column',
    width: '100%',
    alignItems: 'center',
    borderRadius: '4px',
  },
  variants: {
    size: {
      sm: { height: '24px', fontSize: '12px' },
      md: { height: '32px', fontSize: '14px', borderRadius: '8px' },
    },
    variant: {
      subtle: {},
      solid: { backgroundColor: 'transparent', gap: '4px' },
    },
  },
  defaultVariants: { size: 'sm', variant: 'subtle' },
})

type SegmentControlProps = React.ComponentProps<typeof StyledSegmentControlRoot> & {
  size?: 'sm' | 'md'
  variant?: 'subtle' | 'solid'
}

const SegmentControl = React.forwardRef<React.ElementRef<typeof StyledSegmentControlRoot>, SegmentControlProps>(
  (props, ref) => {
    const { size = 'sm', variant = 'subtle', children, ...rest } = props

    return (
      <SegmentControlContext.Provider value={{ size, variant }}>
        <StyledSegmentControlRoot ref={ref} size={size} variant={variant} {...rest}>
          {children}
        </StyledSegmentControlRoot>
      </SegmentControlContext.Provider>
    )
  }
)

SegmentControl.displayName = 'SegmentControl'

const SegmentControlItem = React.forwardRef<
  React.ElementRef<typeof StyledSegmentControlItem>,
  React.ComponentProps<typeof StyledSegmentControlItem>
>((props, ref) => {
  const { variant } = useSegmentControlContext()

  return <StyledSegmentControlItem ref={ref} variant={variant} {...props} />
})

SegmentControlItem.displayName = 'SegmentControlItem'

export { SegmentControl, SegmentControlItem }
