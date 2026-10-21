import { forwardRef, type ComponentProps } from 'react'
import * as PrimitiveSeparator from '@radix-ui/react-separator'
import { styled } from '../../styled-system/jsx'
import { cva, css, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'
import { Text } from '../Typography'

const StyledCrosslineText = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    userSelect: 'none',
    '&::before': {
      borderBottom: '1px solid var(--colors-border)',
      content: '""',
      flex: '1 0 0',
      transform: 'translateY(-0.5px)',
    },
    '&::after': {
      borderBottom: '1px solid var(--colors-border)',
      content: '""',
      flex: '1 0 0',
      transform: 'translateY(-0.5px)',
    },
    '& > div': {
      display: 'inline-flex',
      alignItems: 'center',
      maxWidth: 'calc(100% - 60px)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: 'var(--colors-textMuted)',
      flex: '0 1 auto',
      margin: '0 8px',
    },
  },
})

const separator = cva({
  base: {
    backgroundColor: 'var(--colors-border)',
    flexShrink: 0,
  },
  variants: {
    orientation: {
      horizontal: {
        height: '1px',
        width: '100%',
      },
      vertical: {
        height: '100%',
        width: '1px',
      },
    },
    raw: {
      true: {
        display: 'block',
        width: '100%',
        margin: 0,
        backgroundColor: 'var(--colors-surfaceSubtle)',
        '& + &': {
          display: 'block',
        },
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})

type PrimitiveSeparatorProps = ComponentProps<typeof PrimitiveSeparator.Root>

export interface SeparatorProps extends PrimitiveSeparatorProps {
  text?: string
  css?: SystemStyleObject
  orientation?: 'horizontal' | 'vertical'
  raw?: boolean
}

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(props, forwardedRef) {
  const { text, css: cssProp, className, orientation, raw, ...rest } = props
  if (text) {
    return (
      <StyledCrosslineText {...rest} ref={forwardedRef} className={className} css={cssProp}>
        <div>
          <Text size={1} muted>
            {text}
          </Text>
        </div>
      </StyledCrosslineText>
    )
  }

  return (
    <PrimitiveSeparator.Root
      {...rest}
      ref={forwardedRef}
      orientation={orientation}
      className={cx(separator({ orientation, raw }), cssProp && css(cssProp), className)}
    />
  )
})

export { Separator }
