import { styled } from '../../styled-system/jsx'
import { Flex } from '../Flex'

const StyledCallout = styled(Flex, {
  base: {
    borderRadius: '4px',
    fontSize: '12px',
    padding: '4px 8px',
    userSelect: 'none',
    fontWeight: 500,
  },
  variants: {
    type: {
      info: { backgroundColor: 'var(--colors-blue3)', color: 'var(--colors-blueA11)' },
      warning: { backgroundColor: 'var(--colors-amber3)', color: 'var(--colors-amber11)' },
      error: { backgroundColor: 'var(--colors-red3)', color: 'var(--colors-red11)' },
      success: { backgroundColor: 'var(--colors-green3)', color: 'var(--colors-green11)' },
    },
  },
})

export { StyledCallout as Callout }
