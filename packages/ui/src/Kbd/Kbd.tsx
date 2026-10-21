import { IconHandFinger, IconHandTwoFingers } from '@tabler/icons-react'

import { MouseRightDownIcon } from '../Icons/MouseRightDownIcon'
import { MouseLeftDownIcon } from '../Icons/MouseLeftDownIcon'
import { MouseDoubleDownIcon } from '../Icons/MouseDoubleDownIcon'
import { styled } from '../../styled-system/jsx'

const symbolsMap = {
  backspace: '⌫',
  delete: 'Del',
  cmd: '⌘',
  alt: '⌥',
  option: '⌥',
  enter: '↩',
  ctrl: '⌃',
  shift: '⇧',
  tab: '⇥',
  capslock: '⇪',
}

const gastureList = ['OF', 'TF', 'MLD', 'MRD', 'MDD']
const gastureMap = {
  OF: (
    <IconHandFinger
      width="16px"
      height="18px"
      stroke="var(--colors-gray8)"
      strokeWidth={1.2}
      fill="var(--colors-grayA2)"
      style={{ marginLeft: '2px' }}
    />
  ),
  TF: (
    <IconHandTwoFingers
      width="16px"
      height="18px"
      stroke="var(--colors-gray8)"
      strokeWidth={1.2}
      fill="var(--colors-grayA2)"
      style={{ marginLeft: '2px' }}
    />
  ),
  MLD: (
    <MouseLeftDownIcon
      width="18px"
      height="18px"
      stroke="var(--colors-gray8)"
      fill="var(--colors-gray8)"
      strokeWidth={1.2}
    />
  ),
  MRD: (
    <MouseRightDownIcon
      width="18px"
      height="18px"
      stroke="var(--colors-gray8)"
      fill="var(--colors-gray8)"
      strokeWidth={1.2}
    />
  ),
  MDD: (
    <MouseDoubleDownIcon
      width="18px"
      height="18px"
      stroke="var(--colors-gray8)"
      fill="var(--colors-gray8)"
      strokeWidth={1.2}
    />
  ),
}

const IconSlot = styled('span', {
  base: {
    display: 'inline-block',
    marginLeft: '-1px',
    height: '18px',
    width: '18px',
  },
  variants: {
    half: {
      true: {
        marginLeft: '-2px',
      },
    },
  },
})

const StyledKbd = styled('kbd', {
  base: {
    display: 'inline-block',
    background: 'var(--colors-gray3)',
    fontSize: '10px',
    minWidth: '12px',
    height: '16px',
    lineHeight: '14px',
    borderRadius: '8px',
    backgroundColor: 'var(--colors-grayA2)',
    border: '1px solid var(--colors-grayA4)',
    padding: '0 4px',
    marginRight: '4px',
    color: 'currentColor',
    userSelect: 'none',
  },
  variants: {
    size: {
      xs: {
        minWidth: '12px',
        height: '12px',
        fontSize: '10px',
        borderRadius: '4px',
        padding: '0 2px',
      },
      sm: {
        minWidth: '16px',
        height: '16px',
        fontSize: '10px',
      },
      md: {
        minWidth: '20px',
        height: '20px',
        fontSize: '12px',
        lineHeight: '16px',
        borderRadius: '8px',
        padding: '0 6px',
      },
    },
    uppercase: {
      true: {
        textTransform: 'uppercase',
      },
    },
    lowercase: {
      true: {
        textTransform: 'lowercase',
      },
    },
  },
  defaultVariants: {
    uppercase: true,
  },
})

export const StyledKbdGroup = styled('div', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    '& > kbd:last-child': {
      marginRight: 0,
    },
  },
})

export const Kbd = StyledKbd

type IKbdGroupProps = {
  shortcuts?: string | string[]
  uppercase?: boolean
  size?: 'xs' | 'sm' | 'md'
}

export function KbdGroup(props: IKbdGroupProps) {
  const { shortcuts, uppercase = true, size = 'sm' } = props
  if (!shortcuts) return null

  if (Array.isArray(shortcuts)) {
    return (
      <StyledKbdGroup>
        {shortcuts.map((key, index) => {
          if (gastureList.indexOf(key) !== -1) {
            return <IconSlot key={index}>{gastureMap[key]}</IconSlot>
          }
          return (
            <Kbd uppercase={uppercase} size={size} key={index}>
              {symbolsMap[key] ?? key}
            </Kbd>
          )
        })}
      </StyledKbdGroup>
    )
  }

  const keys: string[] = shortcuts.split(/[,+]/).map((k) => symbolsMap[k] ?? k)

  return (
    <StyledKbdGroup>
      {keys.map((key, index) => {
        return (
          <Kbd uppercase={uppercase} size={size} key={index}>
            {key}
          </Kbd>
        )
      })}
    </StyledKbdGroup>
  )
}
