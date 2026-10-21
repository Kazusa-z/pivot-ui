import React, { type ComponentProps, type PropsWithChildren } from 'react'

import { styled } from '../../styled-system/jsx'
import type { SystemStyleObject } from '../../styled-system/types'

const StyledFlex = styled('div', {
  base: {
    display: 'flex',
    boxSizing: 'border-box',
  },
  variants: {
    direction: {
      column: {
        flexDirection: 'column',
      },
      row: { flexDirection: 'row' },
      'row-reverse': { flexDirection: 'row-reverse' },
      'column-reverse': { flexDirection: 'column-reverse' },
    },
    justifyContent: {
      center: {
        justifyContent: 'center',
      },
      between: {
        justifyContent: 'space-between',
      },
      around: {
        justifyContent: 'space-around',
      },
      end: {
        justifyContent: 'flex-end',
      },
    },
    align: {
      both: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      v: {
        alignItems: 'center',
        lineHeight: 1,
      },
      h: {
        justifyContent: 'center',
      },
    },
    wrap: {
      true: { flexWrap: 'wrap' },
      false: { flexWrap: 'nowrap' },
      reverse: { flexWrap: 'wrap-reverse' },
    },
    gap: {
      none: { gap: '0' },
      xxs: { gap: '2px' },
      xs: { gap: '4px' },
      sm: { gap: '8px' },
      md: { gap: '12px' },
      lg: { gap: '16px' },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },
  defaultVariants: {
    direction: 'row',
    wrap: true,
  },
})

type StyledFlexProps = ComponentProps<typeof StyledFlex>

export type FlexProps = PropsWithChildren<Omit<StyledFlexProps, 'css'> & { css?: SystemStyleObject }>

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(function Flex(props: FlexProps, forwardedRef) {
  return (
    <StyledFlex {...props} ref={forwardedRef}>
      {props.children}
    </StyledFlex>
  )
})
