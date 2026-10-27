import { forwardRef, useEffect, useRef, useState } from 'react'
import { css } from '../../../styled-system/css'
import { boundariesToPartition, partitionToBoundaries, validatePartition } from '../../values/partition'
import { Slider, type SliderProps, type SliderSharedProps } from './Slider'

export interface PartitionSliderProps
  extends
    SliderSharedProps,
    Omit<
      SliderProps,
      | keyof SliderSharedProps
      | 'min'
      | 'max'
      | 'minStepsBetweenThumbs'
      | 'minStepsToEdges'
      | 'preserveThumbOrder'
      | 'trackContent'
      | 'formatValue'
      | 'compact'
    > {
  /** 各段的长度（受控）；n 段对应 n − 1 个可拖动的分界点。 */
  value?: number[]
  /** 各段长度之和。省略时取当前长度之和。 */
  total?: number
  /** 每段的最小长度，拖动分界点时不会压缩到更小。 */
  minSegment?: number
  /** 段内数值后的单位，默认 `%`。 */
  unit?: string
  /** 自定义每段显示的文字。 */
  formatter?: (length: number, index: number, total: number) => string | number
}

/** 通过拖动分界点调整各段长度，同时保持总量。value 和回调使用长度数组，n 段对应 n - 1 个分界点。 */
export const PartitionSlider = forwardRef<HTMLSpanElement, PartitionSliderProps>(function PartitionSlider(
  {
    value,
    defaultValue = [],
    onValueChange,
    total: totalProp,
    minSegment = 0,
    unit = '%',
    formatter,
    step = 1,
    onValueCommit,
    onEditCancel,
    orientation = 'horizontal',
    dir,
    inverted,
    name,
    form,
    ...props
  },
  ref
) {
  const [internal, setInternal] = useState(defaultValue)
  const initialDefault = useRef([...defaultValue])
  const root = useRef<HTMLSpanElement>(null)
  const lengths = value ?? internal
  const total = validatePartition(lengths, { total: totalProp, minSegment })
  const boundaries = partitionToBoundaries(lengths)
  const convert = (next: number[]) => (lengths.length === 0 ? [] : boundariesToPartition(next, total, minSegment))
  const initial = useRef([...lengths])
  useEffect(() => {
    const element = form ? root.current?.ownerDocument.getElementById(form) : root.current?.closest('form')
    if (!(element instanceof HTMLFormElement) || value !== undefined) return
    let active = true
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (active && !event.defaultPrevented && root.current?.isConnected) setInternal(initialDefault.current)
      })
    }
    element.addEventListener('reset', reset)
    return () => {
      active = false
      element.removeEventListener('reset', reset)
    }
  }, [form, value, props.resetKey])
  return (
    <Slider
      {...props}
      ref={(node) => {
        root.current = node
        if (typeof ref === 'function') return ref(node)
        if (ref) ref.current = node
      }}
      form={form}
      orientation={orientation}
      dir={dir}
      inverted={inverted}
      value={boundaries}
      min={0}
      max={total}
      step={step}
      minStepsBetweenThumbs={minSegment / step}
      minStepsToEdges={minSegment / step}
      preserveThumbOrder
      onEditStart={(source) => {
        initial.current = [...lengths]
        return props.onEditStart?.(source)
      }}
      onValueChange={(next) => {
        const requested = convert(next)
        if (value === undefined) setInternal(requested)
        onValueChange?.(requested)
      }}
      onValueCommit={(next, reason) => onValueCommit?.(convert(next), reason)}
      onEditCancel={(reason) => {
        if (value === undefined && !['external-update', 'reset', 'target-change', 'unmount'].includes(reason))
          setInternal(initial.current)
        onEditCancel?.(reason)
      }}
      formatValue={(_, index) => `Boundary ${index + 1}`}
      trackContent={
        <span
          aria-hidden="true"
          className={css({ display: 'flex', width: '100%', height: '100%' })}
          style={{
            flexDirection:
              orientation === 'vertical' ? (inverted ? 'column' : 'column-reverse') : inverted ? 'row-reverse' : 'row',
          }}>
          {name &&
            lengths.map((length, index) => (
              <input
                key={`value-${index}`}
                type="hidden"
                name={lengths.length > 1 ? `${name}[]` : name}
                form={form}
                value={length}
                disabled={props.disabled}
              />
            ))}
          {lengths.map((length, index) => (
            <span
              key={index}
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 0,
                minHeight: 0,
                overflow: 'hidden',
                fontSize: 'var(--fontSizes-micro)',
                color: 'var(--colors-text)',
              })}
              style={{
                flex: `${total === 0 ? 1 : length} 1 0`,
                backgroundColor: `color-mix(in srgb, var(--colors-selectionBg) ${15 + (index % 6) * 12}%, var(--colors-softBg))`,
              }}>
              {formatter ? formatter(length, index, total) : length}
              {unit}
            </span>
          ))}
        </span>
      }
    />
  )
})
