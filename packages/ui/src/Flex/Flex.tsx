import React, { type ComponentProps, type PropsWithChildren } from 'react'

import { styled } from '../../styled-system/jsx'
import type { SystemStyleObject } from '../../styled-system/types'

const StyledFlex = styled('div', {
  base: {
    display: 'flex',
    boxSizing: 'border-box',
  },
  variants: {
    orientation: {
      column: { flexDirection: 'column' },
      row: { flexDirection: 'row' },
      'row-reverse': { flexDirection: 'row-reverse' },
      'column-reverse': { flexDirection: 'column-reverse' },
    },
    justify: {
      center: { justifyContent: 'center' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      end: { justifyContent: 'flex-end' },
    },
    align: {
      both: { alignItems: 'center', justifyContent: 'center' },
      v: { alignItems: 'center', lineHeight: 1 },
      h: { justifyContent: 'center' },
    },
    wrapMode: {
      true: { flexWrap: 'wrap' },
      false: { flexWrap: 'nowrap' },
      reverse: { flexWrap: 'wrap-reverse' },
    },
    spacing: {
      none: { gap: '0' },
      xxs: { gap: '2px' },
      xs: { gap: '4px' },
      sm: { gap: '8px' },
      md: { gap: '12px' },
      lg: { gap: '16px' },
    },
    fullWidth: {
      true: { width: '100%' },
    },
  },
  defaultVariants: {
    orientation: 'row',
    wrapMode: true,
  },
})

type StyledFlexProps = ComponentProps<typeof StyledFlex>

export type FlexProps = PropsWithChildren<
  Omit<StyledFlexProps, 'css' | 'flexDirection' | 'justify' | 'spacing' | 'flexWrap'> & {
    css?: SystemStyleObject
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    justifyContent?: 'center' | 'between' | 'around' | 'end'
    gap?: 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg'
    wrap?: true | false | 'reverse'
    orientation?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    justify?: 'center' | 'between' | 'around' | 'end'
    spacing?: 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg'
    flexWrap?: true | false | 'reverse'
  }
>

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(function Flex(props, forwardedRef) {
  const {
    direction,
    justifyContent,
    gap,
    wrap,
    orientation,
    flexDirection,
    justify,
    spacing,
    flexWrap,
    children,
    ...rest
  } = props
  return (
    <StyledFlex
      orientation={orientation ?? flexDirection ?? direction}
      justify={justify ?? justifyContent}
      spacing={spacing ?? gap}
      wrapMode={flexWrap ?? wrap}
      {...rest}
      ref={forwardedRef}>
      {children}
    </StyledFlex>
  )
})
