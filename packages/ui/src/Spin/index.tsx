import { styled } from '../../styled-system/jsx'

const Spin = styled('div', {
  base: {
    position: 'relative',
    height: '12px',
    width: '12px',
    border: '2px solid var(--colors-grayA6)',
    borderRadius: '9999px',
    animationName: 'spin',
    animationDuration: '0.8s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    transformOrigin: 'center',
    boxSizing: 'border-box',
    '&::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      inset: '-2px',
      borderRadius: '9999px',
      border: '2px solid var(--colors-gray12)',
      borderColor: 'transparent transparent transparent white',
      boxSizing: 'border-box',
    },
  },
  variants: {
    size: {
      xs: {
        height: '12px',
        width: '12px',
      },
      sm: {
        height: '16px',
        width: '16px',
      },
      md: {
        height: '20px',
        width: '20px',
      },
    },
    color: {
      primary: {
        '&::after': {
          borderColor: 'transparent transparent transparent var(--colors-blueA11)',
        },
      },
      inherit: {
        '&::after': {
          borderColor: 'transparent transparent transparent CurrentColor',
        },
      },
      default: {
        '&::after': {
          borderColor: 'transparent transparent transparent var(--colors-white)',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
})

export { Spin }
