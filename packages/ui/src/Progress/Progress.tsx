import { type ComponentProps } from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva, css, cx } from '../../styled-system/css'

const progressRoot = cva({
  base: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'var(--colors-softBg)',
    borderRadius: '9999px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    border: '1px solid transparent',
  },
  variants: {
    size: {
      sm: {
        height: '4px',
      },
      md: {
        height: '6px',
      },
      lg: {
        height: '8px',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const indicatorClass = css({
  width: '100%',
  height: '100%',
  borderRadius: '9999px',
  backgroundColor: 'var(--colors-selectionBg)',
  transition: 'transform .2s ease-out, background-color .2s ease-out',
})

type PrimitiveProgressProps = ComponentProps<typeof ProgressPrimitive.Root>

export type ProgressProps = PrimitiveProgressProps & {
  size?: 'sm' | 'md' | 'lg'
  // TODO(TD-01): narrow to SystemStyleObject after the consumer css audit.
  css?: any
}

function Progress(props: ProgressProps) {
  const { value: rawValue, size, css: cssProp, className, ...rest } = props
  const value = Math.max(0, Math.min(100, rawValue ?? 0))

  return (
    <ProgressPrimitive.Root
      {...rest}
      value={value}
      className={cx(progressRoot({ size }), cssProp && css(cssProp), className)}>
      <ProgressPrimitive.Indicator className={indicatorClass} style={{ transform: `translateX(-${100 - value}%)` }} />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
