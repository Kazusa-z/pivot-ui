import {
  forwardRef,
  type TableHTMLAttributes,
  type HTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
} from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Legacy compact flag; equivalent to density="compact". */
  compact?: boolean
  density?: 'compact' | 'regular'
  css?: SystemStyleObject
}
export interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {
  css?: SystemStyleObject
}
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean
  css?: SystemStyleObject
}
export interface TableHeaderCellProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: 'start' | 'center' | 'end'
  css?: SystemStyleObject
}
export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: 'start' | 'center' | 'end'
  css?: SystemStyleObject
}
export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  css?: SystemStyleObject
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { compact, density, css: cssProp, className, ...props },
  ref
) {
  const activeDensity = compact ? 'compact' : (density ?? 'regular')
  return (
    <table
      {...props}
      ref={ref}
      data-compact={compact || undefined}
      data-density={activeDensity}
      className={cx(
        css(
          {
            width: '100%',
            borderCollapse: 'collapse',
            borderSpacing: 0,
            color: 'var(--colors-text)',
            fontSize: 'var(--table-font-size, var(--fontSizes-controlLarge))',
            '--table-font-size': 'var(--fontSizes-controlLarge)',
            '--table-cell-padding': 'var(--space-1_5) var(--space-2)',
            '--table-row-height': 'var(--sizes-controlMd)',
            '&[data-density=compact]': {
              '--table-font-size': 'var(--fontSizes-control)',
              '--table-cell-padding': 'var(--space-0_5) var(--space-1_5)',
              '--table-row-height': 'var(--sizes-controlSm)',
            },
          },
          cssProp
        ),
        className
      )}
    />
  )
})
export const TableHead = forwardRef<HTMLTableSectionElement, TableSectionProps>(function TableHead(
  { css: cssProp, className, ...props },
  ref
) {
  return (
    <thead
      {...props}
      ref={ref}
      className={cx(
        css({ color: 'var(--colors-textMuted)', backgroundColor: 'var(--colors-surfaceSubtle)' }, cssProp),
        className
      )}
    />
  )
})
export const TableBody = forwardRef<HTMLTableSectionElement, TableSectionProps>(function TableBody(
  { css: cssProp, className, ...props },
  ref
) {
  return (
    <tbody
      {...props}
      ref={ref}
      className={cx(
        css({ '& > tr:not([data-selected]):hover': { backgroundColor: 'var(--colors-softBgHover)' } }, cssProp),
        className
      )}
    />
  )
})
export const TableFoot = forwardRef<HTMLTableSectionElement, TableSectionProps>(function TableFoot(
  { css: cssProp, className, ...props },
  ref
) {
  return (
    <tfoot
      {...props}
      ref={ref}
      className={cx(css({ fontWeight: 500, color: 'var(--colors-textMuted)' }, cssProp), className)}
    />
  )
})
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected, css: cssProp, className, ...props },
  ref
) {
  return (
    <tr
      {...props}
      ref={ref}
      data-selected={selected || undefined}
      className={cx(
        css(
          {
            '&[data-selected=true]': {
              backgroundColor: 'var(--colors-selectionBg)',
              color: 'var(--colors-selectionText)',
            },
          },
          cssProp
        ),
        className
      )}
    />
  )
})
const cellRecipe = cva({
  base: {
    height: 'var(--table-row-height, var(--sizes-controlMd))',
    padding: 'var(--table-cell-padding, var(--space-1_5) var(--space-2))',
    borderBottom: '1px solid var(--colors-border)',
    verticalAlign: 'middle',
    overflowWrap: 'anywhere',
  },
  variants: { align: { start: { textAlign: 'start' }, center: { textAlign: 'center' }, end: { textAlign: 'end' } } },
})
export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(function TableHeaderCell(
  { align = 'start', css: cssProp, className, scope = 'col', ...props },
  ref
) {
  return (
    <th
      {...props}
      ref={ref}
      scope={scope}
      className={cx(css(cellRecipe.raw({ align }), { fontWeight: 600 }, cssProp), className)}
    />
  )
})
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align = 'start', css: cssProp, className, ...props },
  ref
) {
  return <td {...props} ref={ref} className={cx(css(cellRecipe.raw({ align }), cssProp), className)} />
})
export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(function TableCaption(
  { css: cssProp, className, ...props },
  ref
) {
  return (
    <caption
      {...props}
      ref={ref}
      className={cx(
        css(
          {
            textAlign: 'start',
            padding: 'var(--space-2) 0',
            fontWeight: 500,
            color: 'var(--colors-textMuted)',
            fontSize: 'var(--table-font-size, var(--fontSizes-control))',
          },
          cssProp
        ),
        className
      )}
    />
  )
})
