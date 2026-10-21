import { styled } from '../../styled-system/jsx'

const StyledText = styled('p', {
  base: {
    fontFamily: 'var(--fonts-default)',
    fontSynthesis: 'none',
  },
  variants: {
    code: {
      true: {
        fontFamily: 'var(--fonts-mono)',
      },
    },
    highContrast: {
      true: {
        color: 'var(--colors-hiContrast)',
      },
    },
    selectable: {
      true: {
        userSelect: 'auto',
      },
      false: {
        userSelect: 'none',
      },
    },
    weight: {
      light: {
        fontWeight: 300,
      },
      normal: {
        fontWeight: 400,
      },
      medium: {
        fontWeight: 500,
      },
      bold: {
        fontWeight: 600,
      },
    },
    size: {
      '0_5': {
        fontSize: '10px',
      },
      1: {
        fontSize: 'var(--fontSizes-1)',
        lineHeight: 'var(--lineHeights-1)',
      },
      2: {
        fontSize: 'var(--fontSizes-2)',
        lineHeight: 'var(--lineHeights-2)',
      },
      3: {
        fontSize: 'var(--fontSizes-3)',
        lineHeight: 'var(--lineHeights-3)',
      },
      4: {
        fontSize: 'var(--fontSizes-4)',
        lineHeight: 'var(--lineHeights-4)',
      },
      5: {
        fontSize: 'var(--fontSizes-6)',
        lineHeight: 'var(--lineHeights-6)',
      },
      sm: {
        fontSize: 'var(--fontSizes-1)',
        lineHeight: 'var(--lineHeights-1)',
      },
    },
    align: {
      center: {
        textAlign: 'center',
      },
    },
    muted: {
      true: {
        color: 'var(--colors-textMuted)',
      },
    },
    deleted: {
      true: {
        textDecoration: 'line-through',
      },
    },
    ellipsis: {
      true: {
        display: 'block',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },
    },
    primary: {
      true: {
        color: 'var(--colors-textStrong)',
      },
    },
    error: {
      true: {
        color: 'var(--colors-red9)',
      },
    },
  },
  defaultVariants: {
    weight: 'normal',
    highContrast: false,
  },
})

const StyledBold = styled('strong', {
  base: {
    fontWeight: 'bold',
    color: 'var(--colors-textStrong)',
  },
  variants: {
    variant: {
      subtle: {
        color: 'var(--colors-grayA11)',
      },
    },
  },
})

const StyledTitle = styled('h2', {
  base: {
    display: 'block',
    margin: 0,
    color: 'var(--colors-textStrong)',
  },
  variants: {
    weight: {
      light: {
        fontWeight: 300,
      },
      normal: {
        fontWeight: 400,
      },
      medium: {
        fontWeight: 500,
      },
      semi: {
        fontWeight: 600,
      },
      bold: {
        fontWeight: 700,
      },
    },
    size: {
      1: {
        fontSize: 'var(--fontSizes-1)',
        lineHeight: 1.2,
      },
      2: {
        fontSize: 'var(--fontSizes-2)',
        lineHeight: 1.2,
      },
      3: {
        fontSize: 'var(--fontSizes-4)',
        lineHeight: 1.4,
      },
      4: {
        fontSize: 'var(--fontSizes-6)',
        lineHeight: 1.4,
      },
      5: {
        fontSize: '32px',
        lineHeight: 1.4,
      },
      6: {
        fontSize: '64px',
        fontWeight: 600,
        lineHeight: 1.4,
      },
    },
  },
  defaultVariants: {
    size: 1,
  },
})

const StyledLink = styled('a', {
  base: {
    color: 'CurrentColor',
    textDecoration: 'underline',
    textDecorationColor: 'var(--colors-grayA6)',
    textUnderlineOffset: '4px',
    cursor: 'pointer',
    '&:hover': {
      color: 'var(--colors-gray12)',
    },
  },
})

export { StyledText as Text, StyledBold as Bold, StyledLink as Link, StyledTitle as Title }
