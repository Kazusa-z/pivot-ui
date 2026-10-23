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
  size?: DisclosureSize
  variant?: DisclosureVariant
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
  /** Non-interactive title content. Put buttons and inputs in actions. */
  title: ReactNode
  actions?: ReactNode
  arrow?: boolean
  headingLevel?: DisclosureHeadingLevel
  triggerProps?: Omit<
    ComponentPropsWithRef<typeof Primitive.Trigger>,
    'asChild' | 'children' | 'id' | 'type' | 'aria-controls' | 'aria-expanded'
  >
  contentProps?: Omit<
    ComponentPropsWithRef<typeof Primitive.Content>,
    'asChild' | 'children' | 'forceMount' | 'id' | 'hidden' | 'aria-labelledby'
  >
  css?: SystemStyleObject
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
      <div data-part="header" className={getDisclosureRowClass(variant)}>
        <Primitive.Header asChild>
          {createElement(
            `h${headingLevel}`,
            { className: disclosureClasses.heading },
            <Primitive.Trigger
              {...triggerProps}
              disabled={disabled || props.disabled || triggerProps?.disabled}
              className={cx(getDisclosureTriggerClass(size), triggerProps?.className)}>
              <span className={disclosureClasses.title}>{title}</span>
              {arrow && <IconChevronRight data-disclosure-chevron aria-hidden className={disclosureClasses.chevron} />}
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
