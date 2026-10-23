import { EditableText as NewEditableText, type EditableTextProps as NewEditableTextProps } from '@pivot-ui/react'

export interface EditableTextProps extends Pick<NewEditableTextProps, 'value' | 'showIcon' | 'css'> {
  onFocus?: (value: string) => void
  onEdit?: () => void
  onBlur?: (value: string) => void | Promise<void>
}

/** @deprecated B11 removes this legacy callback mapping. Escape never calls onBlur/commit. */
export function EditableText({ value, onFocus, onEdit, onBlur, ...props }: EditableTextProps) {
  return (
    <NewEditableText
      {...props}
      value={value}
      onBegin={() => {
        onFocus?.(value)
        onEdit?.()
      }}
      onCommit={(draft) => onBlur?.(draft)}
    />
  )
}
