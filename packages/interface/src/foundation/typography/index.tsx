import { createElement, forwardRef, type AnchorHTMLAttributes, type HTMLAttributes } from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

export type TextSize = '0_5' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 1 | 2 | 3 | 4 | 5
export type TextTone = 'default' | 'muted' | 'strong' | 'danger'
export type TextWeight = 'light' | 'normal' | 'medium' | 'semi' | 'bold'

const textRecipe = cva({
  base: { margin: 0, fontFamily: 'var(--fonts-default)', fontSynthesis: 'none' },
  variants: {
    size: {
      '0_5': { fontSize: 'var(--fontSizes-0_5)', lineHeight: 'var(--lineHeights-1)' },
      xs: { fontSize: 'var(--fontSizes-xs)', lineHeight: 'var(--lineHeights-1)' },
      sm: { fontSize: 'var(--fontSizes-1)', lineHeight: 'var(--lineHeights-1)' },
      md: { fontSize: 'var(--fontSizes-2)', lineHeight: 'var(--lineHeights-2)' },
      lg: { fontSize: 'var(--fontSizes-3)', lineHeight: 'var(--lineHeights-3)' },
      xl: { fontSize: 'var(--fontSizes-4)', lineHeight: 'var(--lineHeights-4)' },
      1: { fontSize: 'var(--fontSizes-1)', lineHeight: 'var(--lineHeights-1)' },
      2: { fontSize: 'var(--fontSizes-2)', lineHeight: 'var(--lineHeights-2)' },
      3: { fontSize: 'var(--fontSizes-3)', lineHeight: 'var(--lineHeights-3)' },
      4: { fontSize: 'var(--fontSizes-4)', lineHeight: 'var(--lineHeights-4)' },
      5: { fontSize: 'var(--fontSizes-6)', lineHeight: 'var(--lineHeights-6)' },
    },
    tone: {
      default: { color: 'inherit' },
      muted: { color: 'var(--colors-textMuted)' },
      strong: { color: 'var(--colors-textStrong)' },
      danger: { color: 'var(--colors-dangerText, var(--colors-red11))' },
    },
    weight: {
      light: { fontWeight: 'var(--fontWeights-light)' },
      normal: { fontWeight: 'var(--fontWeights-regular)' },
      medium: { fontWeight: 'var(--fontWeights-medium)' },
      semi: { fontWeight: 'var(--fontWeights-bold)' },
      bold: { fontWeight: 700 },
    },
    align: {
      start: { textAlign: 'start' },
      center: { textAlign: 'center' },
      end: { textAlign: 'end' },
      justify: { textAlign: 'justify' },
    },
    monospace: { true: { fontFamily: 'var(--fonts-mono)' } },
    selectable: { true: { userSelect: 'text' }, false: { userSelect: 'none' } },
    truncate: { true: { display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' } },
    strikethrough: { true: { textDecoration: 'line-through' } },
  },
})

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** HTML meaning is independent of font size. */
  as?: 'p' | 'span' | 'div' | 'small' | 'code' | 's' | 'del'
  size?: TextSize
  tone?: TextTone
  weight?: TextWeight
  align?: 'start' | 'center' | 'end' | 'justify'
  monospace?: boolean
  selectable?: boolean
  truncate?: boolean
  strikethrough?: boolean
  css?: SystemStyleObject
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as = 'p',
    size,
    tone = 'default',
    weight = 'normal',
    align,
    monospace,
    selectable,
    truncate,
    strikethrough,
    css: cssProp,
    className,
    ...props
  },
  ref
) {
  return createElement(as, {
    ...props,
    ref,
    className: cx(
      css(textRecipe.raw({ size, tone, weight, align, monospace, selectable, truncate, strikethrough }), cssProp),
      className
    ),
  })
})

export interface BoldProps extends HTMLAttributes<HTMLElement> {
  tone?: TextTone
  css?: SystemStyleObject
}

export const Bold = forwardRef<HTMLElement, BoldProps>(function Bold(
  { tone = 'strong', css: cssProp, className, ...props },
  ref
) {
  return (
    <strong {...props} ref={ref} className={cx(css(textRecipe.raw({ tone, weight: 'bold' }), cssProp), className)} />
  )
})

const titleRecipe = cva({
  base: { display: 'block', margin: 0, color: 'var(--colors-textStrong)', fontFamily: 'var(--fonts-default)' },
  variants: {
    size: {
      1: { fontSize: 'var(--fontSizes-1)', lineHeight: 1.2 },
      2: { fontSize: 'var(--fontSizes-2)', lineHeight: 1.2 },
      3: { fontSize: 'var(--fontSizes-4)', lineHeight: 1.4 },
      4: { fontSize: 'var(--fontSizes-6)', lineHeight: 1.4 },
      5: { fontSize: 'var(--fontSizes-8)', lineHeight: 1.4 },
      6: { fontSize: 'calc(var(--fontSizes-8) * 2)', lineHeight: 1.4 },
    },
  },
})

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Select heading hierarchy without changing its visual size. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: 1 | 2 | 3 | 4 | 5 | 6
  weight?: TextWeight
  css?: SystemStyleObject
}

export const Title = forwardRef<HTMLHeadingElement, TitleProps>(function Title(
  { as = 'h2', size = 1, weight = 'semi', css: cssProp, className, ...props },
  ref
) {
  return createElement(as, {
    ...props,
    ref,
    className: cx(css(titleRecipe.raw({ size }), textRecipe.raw({ weight }), cssProp), className),
  })
})

const linkStyles = {
  color: 'inherit',
  textDecoration: 'underline',
  textDecorationColor: 'var(--colors-borderStrong)',
  textUnderlineOffset: '3px',
  cursor: 'pointer',
  '&:hover': { color: 'var(--colors-textStrong)' },
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px', borderRadius: '2px' },
} satisfies SystemStyleObject

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  css?: SystemStyleObject
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ css: cssProp, className, ...props }, ref) {
  return <a {...props} ref={ref} className={cx(css(linkStyles, cssProp), className)} />
})
