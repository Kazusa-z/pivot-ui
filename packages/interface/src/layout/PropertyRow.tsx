import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { css, cva, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

const rowRecipe = cva({
  base: {
    display: 'grid',
    width: '100%',
    minWidth: 0,
    padding: 'var(--space-0_5)',
    gap: 'var(--property-row-gap, var(--space-1))',
    alignItems: 'center',
    // The label column scales with narrow panels but stops growing, so labels line up
    // across sections and wide dialogs do not push controls far from their labels.
    gridTemplateColumns: 'var(--property-label-width, var(--property-label-default)) minmax(0, 1fr)',
    '& > [data-property-part="description"]': { gridColumn: '2' },
  },
  variants: {
    density: {
      compact: {
        '--property-label-default': 'clamp(64px, 35%, 120px)',
        '--property-row-gap': 'var(--space-1)',
        '--property-label-min-height': 'var(--sizes-controlSm)',
        '--property-font-size': 'var(--fontSizes-control)',
        '--property-description-size': 'var(--fontSizes-control)',
      },
      regular: {
        '--property-label-default': 'clamp(80px, 35%, 160px)',
        '--property-row-gap': 'var(--space-2)',
        '--property-label-min-height': 'var(--sizes-controlMd)',
        '--property-font-size': 'var(--fontSizes-controlLarge)',
        '--property-description-size': 'var(--fontSizes-controlLarge)',
      },
    },
    direction: {
      row: {},
      column: {
        gridTemplateColumns: 'minmax(0, 1fr)',
        '& > [data-property-part="description"]': { gridColumn: '1' },
      },
    },
    withoutLabel: {
      true: {
        gridTemplateColumns: 'minmax(0, 1fr)',
        '& > [data-property-part="description"]': { gridColumn: '1' },
      },
    },
  },
  defaultVariants: { density: 'compact' },
})

export interface PropertyRowProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column'
  /** 将整行空间用于内容，适合没有字段标签的布局。 */
  withoutLabel?: boolean
  /** 紧凑 24px 行或常规 32px 行。 */
  density?: 'compact' | 'regular'
  /** Any CSS grid track size, for example 120px or minmax(0, 1fr). */
  labelWidth?: string
  css?: SystemStyleObject
}

/** 将标签、控件和说明排成字段行。使用 PropertyLabel、PropertyControl 和 PropertyDescription 组合内容，并将标签 ID 关联到实际输入。 */
export const PropertyRow = forwardRef<HTMLDivElement, PropertyRowProps>(function PropertyRow(
  { direction = 'row', withoutLabel, density = 'compact', labelWidth, css: cssProp, className, style, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx(css(rowRecipe.raw({ direction, withoutLabel, density }), cssProp), className)}
      style={{ '--property-label-width': labelWidth, ...style } as CSSProperties}
    />
  )
})

export interface PropertyLabelProps extends HTMLAttributes<HTMLDivElement> {
  /** Set for a single labelable control; omit for a group name or read-only content. */
  htmlFor?: string
  startSlot?: ReactNode
  endSlot?: ReactNode
  css?: SystemStyleObject
}

/** id names only the label text; actions in the slots keep their own accessible names. */
export const PropertyLabel = forwardRef<HTMLDivElement, PropertyLabelProps>(function PropertyLabel(
  { id, htmlFor, children, startSlot, endSlot, css: cssProp, className, ...props },
  ref
) {
  const labelClass = css({ minWidth: 0, flex: 1, overflowWrap: 'anywhere' })
  return (
    <div
      {...props}
      ref={ref}
      data-property-part="label"
      className={cx(
        css(
          {
            display: 'flex',
            minWidth: 0,
            minHeight: 'var(--property-label-min-height, var(--sizes-controlSm))',
            alignItems: 'center',
            gap: 'var(--property-row-gap, var(--space-1))',
            fontSize: 'var(--property-font-size, var(--fontSizes-control))',
            fontWeight: 500,
            color: 'var(--colors-textMuted)',
          },
          cssProp
        ),
        className
      )}>
      {startSlot}
      {htmlFor ? (
        <label id={id} htmlFor={htmlFor} className={labelClass}>
          {children}
        </label>
      ) : (
        <span id={id} className={labelClass}>
          {children}
        </span>
      )}
      {endSlot}
    </div>
  )
})

export type PropertyControlProps = Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'aria-labelledby'> &
  ({ association: 'group'; labelledBy: string } | { association: 'control' | 'none'; labelledBy?: undefined }) & {
    columns?: 1 | 2 | 3 | 4
    css?: SystemStyleObject
  }

const controlRecipe = cva({
  base: {
    display: 'grid',
    minWidth: 0,
    gap: 'var(--property-row-gap, var(--space-1))',
    alignItems: 'start',
  },
  variants: {
    columns: {
      1: { gridTemplateColumns: 'minmax(0, 1fr)' },
      2: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
      3: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
      4: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
    },
  },
})

/** For a single control, put its id and aria-describedby on the actual control explicitly. */
export const PropertyControl = forwardRef<HTMLDivElement, PropertyControlProps>(function PropertyControl(
  { association, labelledBy, columns, css: cssProp, className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      data-property-part="control"
      role={association === 'group' ? 'group' : undefined}
      aria-labelledby={association === 'group' ? labelledBy : undefined}
      className={cx(css(controlRecipe.raw({ columns }), cssProp), className)}
    />
  )
})

export interface PropertyDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  /** Muted help text by default; danger for validation or save errors. */
  tone?: 'muted' | 'danger'
  css?: SystemStyleObject
}

export const PropertyDescription = forwardRef<HTMLDivElement, PropertyDescriptionProps>(function PropertyDescription(
  { tone = 'muted', css: cssProp, className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      data-property-part="description"
      data-tone={tone}
      className={cx(
        css(
          {
            minWidth: 0,
            fontSize: 'var(--property-description-size, var(--fontSizes-control))',
            color: 'var(--colors-textMuted)',
            overflowWrap: 'anywhere',
            '&[data-tone=danger]': { color: 'var(--colors-dangerText)' },
          },
          cssProp
        ),
        className
      )}
    />
  )
})
