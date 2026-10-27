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
  /** 是否展开（受控）。 */
  open?: boolean
  /** 非受控时初始是否展开，默认 `true`。 */
  defaultOpen?: boolean
  /** 展开或收起时调用。 */
  onOpenChange?: (open: boolean) => void
  /** 禁用折叠按钮，内容保持当前状态。 */
  disabled?: boolean
  /** 标题文字（不可交互）；按钮、输入框等放在 `actions`。 */
  title: ReactNode
  /** 标题栏右侧的操作，例如 `IconButton`；点击它们不会折叠分组。 */
  actions?: ReactNode
  /** 标题栏高度：`sm` 24（面板）、`md` 32（表单、对话框）。 */
  size?: DisclosureSize
  /** 外观：`subtle` 面板底色（默认），`surface` 带边框的卡片，`transparent` 无底色。 */
  variant?: DisclosureVariant
  /** 折叠触发区域：`title` 整个标题可点（默认），`icon` 只有箭头可点（标题里有其他交互时）。 */
  triggerMode?: 'title' | 'icon'
  /** `triggerMode="icon"` 时箭头按钮的无障碍名称。 */
  triggerLabel?: string
  /** `false` 时固定展开，不显示箭头。 */
  collapsible?: boolean
  /** 标题的 HTML 层级（h2–h6），按页面结构选择。 */
  headingLevel?: DisclosureHeadingLevel
  /** 传给折叠按钮的其他属性。 */
  triggerProps?: Omit<
    ComponentPropsWithRef<typeof Primitive.Trigger>,
    'asChild' | 'children' | 'id' | 'type' | 'aria-controls' | 'aria-expanded'
  >
  /** 传给内容区域的其他属性。 */
  contentProps?: Omit<
    ComponentPropsWithRef<typeof Primitive.Content>,
    'asChild' | 'children' | 'forceMount' | 'id' | 'hidden'
  >
  /** 追加 Panda 样式对象（作用于外框）。 */
  css?: SystemStyleObject
  /** 内容区域的 Panda 样式，例如调整内边距。 */
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
