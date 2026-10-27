import { forwardRef, type HTMLAttributes } from 'react'
import { IconHandFinger, IconHandTwoFingers } from '@tabler/icons-react'
import { css, cva, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'
import { formatShortcut, type ShortcutInput, type ShortcutLetterCase, type ShortcutGesture } from '../values/shortcut'
import { MouseLeftDownIcon, MouseRightDownIcon, MouseDoubleDownIcon } from '../foundation/icons'

const keyRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    verticalAlign: 'middle',
    fontFamily: 'var(--fonts-mono)',
    color: 'inherit',
    backgroundColor: 'var(--colors-surfaceSubtle)',
    border: '1px solid var(--colors-border)',
    borderRadius: 'var(--radii-control)',
    userSelect: 'none',
    flexShrink: 0,
  },
  variants: {
    size: {
      xs: {
        minWidth: '14px',
        height: '16px',
        fontSize: 'var(--fontSizes-micro)',
        lineHeight: '12px',
        padding: '0 var(--space-0_5)',
      },
      sm: {
        minWidth: '16px',
        height: '18px',
        fontSize: 'var(--fontSizes-micro)',
        lineHeight: '14px',
        padding: '0 var(--space-1)',
      },
      md: {
        minWidth: '20px',
        height: '20px',
        fontSize: 'var(--fontSizes-control)',
        lineHeight: '16px',
        padding: '0 var(--space-1_5)',
      },
    },
    letterCase: { upper: { textTransform: 'uppercase' }, lower: { textTransform: 'lowercase' }, preserve: {} },
  },
  defaultVariants: { size: 'sm', letterCase: 'upper' },
})

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  size?: 'xs' | 'sm' | 'md'
  letterCase?: ShortcutLetterCase
  css?: SystemStyleObject
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { size, letterCase, css: cssProp, className, ...props },
  ref
) {
  return <kbd {...props} ref={ref} className={cx(css(keyRecipe.raw({ size, letterCase }), cssProp), className)} />
})

const groupStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  verticalAlign: 'middle',
} satisfies SystemStyleObject

export interface KbdGroupRootProps extends HTMLAttributes<HTMLSpanElement> {
  css?: SystemStyleObject
}

export const KbdGroupRoot = forwardRef<HTMLSpanElement, KbdGroupRootProps>(function KbdGroupRoot(
  { css: cssProp, className, ...props },
  ref
) {
  return <span {...props} ref={ref} className={cx(css(groupStyles, cssProp), className)} />
})

const gestureIcons = {
  'mouse-left': MouseLeftDownIcon,
  'mouse-right': MouseRightDownIcon,
  'mouse-double': MouseDoubleDownIcon,
  'touch-one': IconHandFinger,
  'touch-two': IconHandTwoFingers,
} satisfies Record<ShortcutGesture, typeof MouseLeftDownIcon | typeof IconHandFinger>

export interface KbdGroupProps extends Omit<KbdGroupRootProps, 'children'> {
  shortcuts?: ShortcutInput
  size?: KbdProps['size']
  letterCase?: ShortcutLetterCase
}

export const KbdGroup = forwardRef<HTMLSpanElement, KbdGroupProps>(function KbdGroup(
  { shortcuts, size = 'sm', letterCase = 'upper', ...props },
  ref
) {
  const tokens = formatShortcut(shortcuts, letterCase)
  if (!tokens.length) return null
  const pixels = size === 'xs' ? 12 : size === 'md' ? 16 : 14
  return (
    <KbdGroupRoot role="group" aria-label={tokens.map((token) => token.label).join(' + ')} {...props} ref={ref}>
      {tokens.map((token, index) => {
        if (token.kind === 'gesture') {
          const GestureIcon = gestureIcons[token.key]
          return (
            <GestureIcon
              key={index}
              width={pixels}
              height={pixels}
              stroke="currentColor"
              strokeWidth={1.4}
              aria-hidden="true"
            />
          )
        }
        return (
          <Kbd key={index} size={size} letterCase="preserve" aria-hidden="true">
            {token.display}
          </Kbd>
        )
      })}
    </KbdGroupRoot>
  )
})
