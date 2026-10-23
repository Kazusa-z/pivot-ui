import { Children, Fragment, isValidElement, type HTMLAttributes, type ReactNode } from 'react'
import type { ChoiceOption, ChoiceValue } from '@pivot-ui/react'

export interface LegacySelectItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: ChoiceValue
  children?: ReactNode
  icon?: ReactNode
  label?: string
  textValue?: string
  disabled?: boolean
  disabledReason?: string
}
/** Declarative data marker consumed by the compatibility Select adapter. */
export function LegacySelectItem(_props: LegacySelectItemProps) {
  return null
}

function textFromNode(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? textFromNode(child.props.children)
          : ''
    )
    .join('')
}
export function collectLegacyOptions(children: ReactNode) {
  const options: ChoiceOption[] = []
  const rendered = new Map<string, ReactNode>()
  function visit(nodes: ReactNode) {
    Children.forEach(nodes, (child) => {
      if (!isValidElement<Partial<LegacySelectItemProps>>(child)) return
      if (child.type === Fragment || child.props.value === undefined) {
        visit(child.props.children)
        return
      }
      const { value, children, icon, label, textValue, disabled, disabledReason, title } = child.props
      const key = `${typeof value}:${value}`
      options.push({
        key,
        value,
        label: textValue ?? label ?? (textFromNode(children) || String(value)),
        disabled,
        disabledReason: disabledReason ?? title,
      })
      rendered.set(
        key,
        <>
          {icon}
          {children ?? label ?? String(value)}
        </>
      )
    })
  }
  visit(children)
  return { options, rendered }
}
