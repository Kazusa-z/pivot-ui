import { createContext, createElement, forwardRef, useContext, type ComponentPropsWithRef, type ReactNode } from 'react'
import * as Primitive from '@radix-ui/react-accordion'
import { IconChevronRight } from '@tabler/icons-react'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import {
  disclosureClasses,
  getDisclosureContentClass,
  getDisclosureRootClass,
  getDisclosureRowClass,
  getDisclosureSurfaceClass,
  getDisclosureTriggerClass,
  type DisclosureHeadingLevel,
  type DisclosureSize,
  type DisclosureVariant,
} from './disclosure.styles'

const AccordionContext = createContext<{ size: DisclosureSize; variant: DisclosureVariant; disabled?: boolean }>({
  size: 'sm',
  variant: 'surface',
})

export type AccordionProps = (
  Omit<Primitive.AccordionSingleProps, 'asChild'> | Omit<Primitive.AccordionMultipleProps, 'asChild'>
) & {
  /** 标题栏高度：`sm` 24、`md` 32。 */
  size?: DisclosureSize
  /** 外观：`surface` 带边框的连续卡片（默认），`subtle` 面板底色，`transparent` 无底色。 */
  variant?: DisclosureVariant
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { size = 'sm', variant = 'surface', disabled, css: cssProp, className, ...props },
  ref
) {
  return (
    <AccordionContext.Provider value={{ size, variant, disabled }}>
      <Primitive.Root
        {...props}
        disabled={disabled}
        ref={ref}
        className={cx(getDisclosureRootClass(cssProp), className)}
      />
    </AccordionContext.Provider>
  )
})

export interface AccordionItemProps extends Omit<Primitive.AccordionItemProps, 'title' | 'asChild'> {
  /** 标题文字（不可交互）；按钮等放在 `actions`。 */
  title: ReactNode
  /** 标题栏右侧的操作。 */
  actions?: ReactNode
  /** 是否显示折叠箭头，默认显示。 */
  arrow?: boolean
  /** 标题的 HTML 层级（h2–h6）。 */
  headingLevel?: DisclosureHeadingLevel
  /** 传给折叠按钮的其他属性。 */
  triggerProps?: Omit<
    ComponentPropsWithRef<typeof Primitive.Trigger>,
    'asChild' | 'children' | 'id' | 'type' | 'aria-controls' | 'aria-expanded'
  >
  /** 传给内容区域的其他属性。 */
  contentProps?: Omit<
    ComponentPropsWithRef<typeof Primitive.Content>,
    'asChild' | 'children' | 'forceMount' | 'id' | 'hidden' | 'aria-labelledby'
  >
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
  /** 内容区域的 Panda 样式。 */
  contentCss?: SystemStyleObject
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  {
    children,
    title,
    arrow = true,
    actions,
    headingLevel = 3,
    triggerProps,
    contentProps,
    css: cssProp,
    contentCss,
    className,
    ...props
  },
  ref
) {
  const { size, variant, disabled } = useContext(AccordionContext)
  return (
    <Primitive.Item
      {...props}
      ref={ref}
      className={cx(getDisclosureSurfaceClass({ variant, connected: true }, cssProp), className)}>
      <div data-part="header" className={getDisclosureRowClass(variant, size)}>
        <Primitive.Header asChild>
          {createElement(
            `h${headingLevel}`,
            { className: disclosureClasses.heading },
            <Primitive.Trigger
              {...triggerProps}
              disabled={disabled || props.disabled || triggerProps?.disabled}
              className={cx(getDisclosureTriggerClass(size), triggerProps?.className)}>
              {/* Same leading chevron as Section/Section so every disclosure header reads alike. */}
              {arrow && <IconChevronRight data-disclosure-chevron aria-hidden className={disclosureClasses.chevron} />}
              <span className={disclosureClasses.title}>{title}</span>
            </Primitive.Trigger>
          )}
        </Primitive.Header>
        {actions != null && (
          <div data-part="actions" className={disclosureClasses.actions}>
            {actions}
          </div>
        )}
      </div>
      <Primitive.Content {...contentProps} className={cx(disclosureClasses.content, contentProps?.className)}>
        <div className={getDisclosureContentClass(size, contentCss)}>{children}</div>
      </Primitive.Content>
    </Primitive.Item>
  )
})
