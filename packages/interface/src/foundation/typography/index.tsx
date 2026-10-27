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
      '0_5': { fontSize: 'var(--fontSizes-micro)', lineHeight: 'var(--lineHeights-1)' },
      xs: { fontSize: 'var(--fontSizes-micro)', lineHeight: 'var(--lineHeights-1)' },
      sm: { fontSize: 'var(--fontSizes-control)', lineHeight: 'var(--lineHeights-1)' },
      md: { fontSize: 'var(--fontSizes-controlLarge)', lineHeight: 'var(--lineHeights-2)' },
      lg: { fontSize: 'var(--fontSizes-heading)', lineHeight: 'var(--lineHeights-3)' },
      xl: { fontSize: 'var(--fontSizes-4)', lineHeight: 'var(--lineHeights-4)' },
      1: { fontSize: 'var(--fontSizes-control)', lineHeight: 'var(--lineHeights-1)' },
      2: { fontSize: 'var(--fontSizes-controlLarge)', lineHeight: 'var(--lineHeights-2)' },
      3: { fontSize: 'var(--fontSizes-heading)', lineHeight: 'var(--lineHeights-3)' },
      4: { fontSize: 'var(--fontSizes-4)', lineHeight: 'var(--lineHeights-4)' },
      5: { fontSize: 'var(--fontSizes-display)', lineHeight: 'var(--lineHeights-6)' },
    },
    tone: {
      default: { color: 'inherit' },
      muted: { color: 'var(--colors-textMuted)' },
      strong: { color: 'var(--colors-textStrong)' },
      danger: { color: 'var(--colors-dangerText)' },
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
  /** 选择段落、行内文字或代码等 HTML 语义；视觉字号通过 size 设置。 */
  as?: 'p' | 'span' | 'div' | 'small' | 'code' | 's' | 'del'
  /** 视觉字号；不设置时继承父元素。`xs` 11、`sm` 12、`md` 14、`lg` 16，`5` 为页面标题字号。 */
  size?: TextSize
  /** 文字色：`muted` 次要说明，`strong` 强调，`danger` 错误说明。 */
  tone?: TextTone
  /** 字重。 */
  weight?: TextWeight
  /** 对齐方式。 */
  align?: 'start' | 'center' | 'end' | 'justify'
  /** 使用等宽字体，适合代码、数值和路径。 */
  monospace?: boolean
  /** 是否允许选中文字；界面标签默认不需要。 */
  selectable?: boolean
  /** 单行截断并显示省略号；建议同时设置 title 提供完整内容。 */
  truncate?: boolean
  /** 删除线样式（不改变语义；需要语义时用 `as="del"`）。 */
  strikethrough?: boolean
  /** 追加 Panda 样式对象。 */
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
      1: { fontSize: 'var(--fontSizes-control)', lineHeight: 1.2 },
      2: { fontSize: 'var(--fontSizes-controlLarge)', lineHeight: 1.2 },
      3: { fontSize: 'var(--fontSizes-heading)', lineHeight: 1.4 },
      4: { fontSize: 'var(--fontSizes-4)', lineHeight: 1.4 },
      5: { fontSize: 'var(--fontSizes-display)', lineHeight: 1.4 },
      6: { fontSize: 'calc(var(--fontSizes-8) * 2)', lineHeight: 1.4 },
    },
  },
})

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** 按文档层级选择 h1–h6，视觉字号通过 size 设置。 */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /** 视觉尺寸，1 最大；与 `as` 独立选择。 */
  size?: 1 | 2 | 3 | 4 | 5 | 6
  /** 字重。 */
  weight?: TextWeight
  /** 追加 Panda 样式对象。 */
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
  '&:focus-visible': {
    outline: '2px solid var(--colors-focusRing)',
    outlineOffset: '2px',
    borderRadius: 'var(--radii-control)',
  },
} satisfies SystemStyleObject

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  css?: SystemStyleObject
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ css: cssProp, className, ...props }, ref) {
  return <a {...props} ref={ref} className={cx(css(linkStyles, cssProp), className)} />
})
