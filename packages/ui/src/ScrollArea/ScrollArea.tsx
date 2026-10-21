import React from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import type { ScrollAreaViewportProps, ScrollAreaProps as PrimitiveScrollAreaProps } from '@radix-ui/react-scroll-area'

import { styled } from '../../styled-system/jsx'
import type { SystemStyleObject } from '../../styled-system/types'

const ScrollAreaRoot = styled(ScrollAreaPrimitive.Root, {
  base: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    maxHeight: 'inherit',
  },
  variants: {
    fullHeight: { true: { height: '100%' } },
  },
  defaultVariants: { fullHeight: true },
})

const ScrollAreaViewport = styled(ScrollAreaPrimitive.Viewport, {
  base: {
    width: '100%',
    height: '100%',
    maxHeight: 'inherit',
    borderRadius: 'inherit',
    '& > div[style]': { display: 'block !important' },
  },
  variants: {
    asContainer: { true: { padding: '4px' } },
  },
})

const SCROLLBAR_SIZE = 4

const ScrollAreaScrollbar = styled(ScrollAreaPrimitive.Scrollbar, {
  base: {
    display: 'flex',
    userSelect: 'none',
    touchAction: 'none',
    margin: '2px',
    background: 'var(--colors-scrollbarTrack)',
    '&[data-orientation="vertical"]': { width: SCROLLBAR_SIZE },
    '&[data-orientation="horizontal"]': { flexDirection: 'column', height: SCROLLBAR_SIZE },
  },
  variants: {
    subtle: {
      true: {
        padding: '2px 0 2px 2px',
        margin: 0,
        background: 'transparent',
        '&:hover': { background: 'var(--colors-scrollbarTrackHover)' },
      },
    },
  },
  defaultVariants: { subtle: true },
})

const ScrollAreaThumb = styled(ScrollAreaPrimitive.Thumb, {
  base: {
    flex: 1,
    background: 'var(--colors-scrollbarThumb)',
    borderRadius: SCROLLBAR_SIZE,
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      height: '100%',
      minWidth: 8,
      minHeight: 8,
    },
  },
})

const StyledCorner = styled(ScrollAreaPrimitive.Corner, {
  base: { backgroundColor: 'var(--colors-scrollbarTrackHover)' },
})

interface ScrollAreaProps extends PrimitiveScrollAreaProps {
  children: React.ReactNode
  css?: SystemStyleObject
  fullHeight?: boolean
  asContainer?: boolean
  subtle?: boolean
}

export function ScrollArea(props: ScrollAreaProps) {
  const { fullHeight, subtle, css, asContainer, ...rest } = props
  return (
    <ScrollAreaRoot fullHeight={fullHeight}>
      <ScrollAreaViewport css={css} asContainer={asContainer} {...rest} />
      <ScrollAreaScrollbar orientation="horizontal" subtle={subtle}>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollbar orientation="vertical" subtle={subtle}>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <StyledCorner />
    </ScrollAreaRoot>
  )
}
