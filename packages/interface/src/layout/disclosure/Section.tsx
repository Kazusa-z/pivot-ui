import { createElement, forwardRef, useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import * as Primitive from '@radix-ui/react-collapsible'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { IconChevronRight } from '@tabler/icons-react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import {
  disclosureClasses,
  getDisclosureContentClass,
  getDisclosureRowClass,
  getDisclosureSurfaceClass,
  getDisclosureTriggerClass,
  type DisclosureHeadingLevel,
  type DisclosureSize,
  type DisclosureVariant,
} from './disclosure.styles'

export interface SectionProps extends Omit<Primitive.CollapsibleProps, 'title' | 'asChild'> {
  /** Non-interactive title content. Put buttons and inputs in actions. */
  title: ReactNode
  actions?: ReactNode
  size?: DisclosureSize
  variant?: DisclosureVariant
  triggerMode?: 'title' | 'icon'
  triggerLabel?: string
  /** False renders a fixed, expanded section with no disclosure button. */
  collapsible?: boolean
  headingLevel?: DisclosureHeadingLevel
  triggerProps?: Omit<
    ComponentPropsWithRef<typeof Primitive.Trigger>,
    'asChild' | 'children' | 'id' | 'type' | 'aria-controls' | 'aria-expanded'
  >
  contentProps?: Omit<
    ComponentPropsWithRef<typeof Primitive.Content>,
    'asChild' | 'children' | 'forceMount' | 'id' | 'hidden'
  >
  css?: SystemStyleObject
  contentCss?: SystemStyleObject
}

/** 将相关字段或内容放入有标题的区域，默认展开。`collapsible={false}` 固定展开；`defaultOpen={false}` 默认收起；标题旁的操作放在 actions。 */
export const Section = forwardRef<HTMLDivElement, SectionProps>(function Section(
  {
    title,
    actions,
    children,
    size = 'sm',
    variant = 'subtle',
    triggerMode = 'title',
    triggerLabel,
    collapsible = true,
    headingLevel = 3,
    open: controlledOpen,
    defaultOpen = true,
    onOpenChange,
    disabled,
    triggerProps,
    contentProps,
    css: cssProp,
    contentCss,
    className,
    ...props
  },
  ref
) {
  const titleId = useId()
  const [open, setOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  })
  const hasTitle = title !== null && title !== undefined && title !== false && title !== ''
  const chevron = <IconChevronRight data-disclosure-chevron aria-hidden className={disclosureClasses.chevron} />
  const trigger = (
    <Primitive.Trigger
      {...triggerProps}
      disabled={disabled || triggerProps?.disabled}
      aria-label={triggerProps?.['aria-label'] ?? triggerLabel ?? (hasTitle ? undefined : 'Toggle section')}
      aria-labelledby={
        triggerProps?.['aria-labelledby'] ??
        (triggerProps?.['aria-label'] || triggerLabel ? undefined : hasTitle ? titleId : undefined)
      }
      className={cx(getDisclosureTriggerClass(size, triggerMode === 'icon'), triggerProps?.className)}>
      {chevron}
      {triggerMode === 'title' && (
        <span id={titleId} className={disclosureClasses.title}>
          {title}
        </span>
      )}
    </Primitive.Trigger>
  )
  return (
    <Primitive.Root
      {...props}
      ref={ref}
      open={!collapsible || open}
      disabled={disabled || !collapsible}
      onOpenChange={(nextOpen) => {
        if (collapsible && !disabled) setOpen(nextOpen)
      }}
      className={cx(getDisclosureSurfaceClass({ variant }, cssProp), className)}>
      <div data-part="header" className={getDisclosureRowClass(variant, size)}>
        {collapsible && triggerMode === 'icon' && trigger}
        {createElement(
          `h${headingLevel}`,
          { className: disclosureClasses.heading },
          collapsible && triggerMode === 'title' ? (
            trigger
          ) : (
            <span id={titleId} className={cx(disclosureClasses.staticHeading, disclosureClasses.title)}>
              {title}
            </span>
          )
        )}
        {actions != null && (
          <div data-part="actions" className={disclosureClasses.actions}>
            {actions}
          </div>
        )}
      </div>
      <Primitive.Content
        {...contentProps}
        className={cx(
          disclosureClasses.content,
          css({ '--radix-accordion-content-height': 'var(--radix-collapsible-content-height)' }),
          contentProps?.className
        )}>
        <div className={getDisclosureContentClass(size, contentCss)}>{children}</div>
      </Primitive.Content>
    </Primitive.Root>
  )
})
