import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { css, cva, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

const rowRecipe = cva({
  base: {
    display: 'grid',
    width: '100%',
    minWidth: 0,
    padding: '2px',
    gap: '4px',
    alignItems: 'center',
    gridTemplateColumns: 'var(--property-label-width, minmax(0, 1.3fr)) minmax(0, 3fr)',
    '& > [data-property-part="description"]': { gridColumn: '2' },
  },
  variants: {
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
})

export interface PropertyRowProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column'
  /** Explicitly reserve no label column. The row never inspects its children. */
  withoutLabel?: boolean
  /** Any CSS grid track size, for example 120px or minmax(0, 1fr). */
  labelWidth?: string
  css?: SystemStyleObject
}

/** Layout only: values, control identity and business-specific columns belong to the caller. */
export const PropertyRow = forwardRef<HTMLDivElement, PropertyRowProps>(function PropertyRow(
  { direction = 'row', withoutLabel, labelWidth, css: cssProp, className, style, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx(css(rowRecipe.raw({ direction, withoutLabel }), cssProp), className)}
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
            minHeight: '24px',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--colors-gray10)',
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
  base: { display: 'grid', minWidth: 0, gap: '4px', alignItems: 'start' },
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
  css?: SystemStyleObject
}

export const PropertyDescription = forwardRef<HTMLDivElement, PropertyDescriptionProps>(function PropertyDescription(
  { css: cssProp, className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      data-property-part="description"
      className={cx(
        css({ minWidth: 0, fontSize: '12px', color: 'var(--colors-gray11)', overflowWrap: 'anywhere' }, cssProp),
        className
      )}
    />
  )
})
