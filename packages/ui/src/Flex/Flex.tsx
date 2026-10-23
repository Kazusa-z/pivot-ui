import { forwardRef } from 'react'
import { Flex as BaseFlex, type FlexProps as BaseFlexProps } from '@pivot-ui/react'

type LegacyWrap = boolean | 'reverse'
type LegacyAlign = 'both' | 'v' | 'h'

/** @deprecated Use @pivot-ui/react Flex with one prop per layout axis. */
export interface FlexProps extends Omit<BaseFlexProps, 'align' | 'wrap'> {
  align?: BaseFlexProps['align'] | LegacyAlign
  wrap?: BaseFlexProps['wrap'] | LegacyWrap
  orientation?: BaseFlexProps['direction']
  flexDirection?: BaseFlexProps['direction']
  justifyContent?: BaseFlexProps['justify']
  spacing?: BaseFlexProps['gap']
  flexWrap?: LegacyWrap
  wrapMode?: LegacyWrap
  fullWidth?: boolean
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex(
  {
    direction,
    orientation,
    flexDirection,
    gap,
    spacing,
    align,
    justify,
    justifyContent,
    wrap,
    flexWrap,
    wrapMode,
    fullWidth,
    style,
    ...props
  },
  ref
) {
  const legacyWrap = wrapMode ?? flexWrap ?? wrap ?? true
  return (
    <BaseFlex
      {...props}
      ref={ref}
      direction={orientation ?? flexDirection ?? direction}
      gap={spacing ?? gap}
      align={align === 'both' || align === 'v' ? 'center' : align === 'h' ? undefined : align}
      justify={align === 'both' || align === 'h' ? 'center' : (justify ?? justifyContent)}
      wrap={
        legacyWrap === true
          ? 'wrap'
          : legacyWrap === false
            ? 'nowrap'
            : legacyWrap === 'reverse'
              ? 'wrap-reverse'
              : legacyWrap
      }
      style={{ ...(align === 'v' ? { lineHeight: 1 } : {}), ...(fullWidth ? { width: '100%' } : {}), ...style }}
    />
  )
})
