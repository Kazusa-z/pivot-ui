import { forwardRef, useId, useLayoutEffect, useRef, type ComponentPropsWithoutRef } from 'react'
import { IconEdit } from '@tabler/icons-react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Input, type InputProps } from './Input'
import { useTextEdit, type UseTextEditOptions } from './useTextEdit'

export interface EditableTextProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'>, Omit<UseTextEditOptions, 'multiline'> {
  /** Accessible name for the editing input. */
  label?: string
  emptyText?: string
  showIcon?: boolean
  css?: SystemStyleObject
  inputProps?: Omit<InputProps, 'value' | 'defaultValue' | 'onValueChange' | 'disabled' | 'readOnly'>
}

export const EditableText = forwardRef<HTMLDivElement, EditableTextProps>(function EditableText(
  {
    value,
    resetKey,
    disabled,
    readOnly,
    onBegin,
    onDraftChange,
    onCommit,
    onCancel,
    label = 'Text',
    emptyText = 'Empty',
    showIcon,
    css: cssProp,
    inputProps,
    className,
    ...props
  },
  ref
) {
  const editor = useTextEdit({ value, resetKey, disabled, readOnly, onBegin, onDraftChange, onCommit, onCancel })
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const previousPhase = useRef(editor.phase)
  const restoreFocus = useRef(false)
  const errorId = useId()
  useLayoutEffect(() => {
    if (editor.phase === 'editing' && previousPhase.current === 'idle') {
      inputRef.current?.focus()
      inputRef.current?.select()
    } else if (editor.phase === 'idle' && restoreFocus.current) {
      restoreFocus.current = false
      triggerRef.current?.focus()
    }
    previousPhase.current = editor.phase
  }, [editor.phase])
  const describedBy =
    [inputProps?.['aria-describedby'], editor.error ? errorId : undefined].filter(Boolean).join(' ') || undefined
  return (
    <div
      {...props}
      ref={ref}
      data-phase={editor.phase}
      aria-busy={editor.phase === 'pending' || undefined}
      className={cx(
        css({ display: 'inline-flex', flexDirection: 'column', minWidth: 0, maxWidth: '100%', gap: '4px' }, cssProp),
        className
      )}>
      {editor.phase === 'idle' ? (
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-disabled={readOnly || undefined}
          aria-label={`Edit ${label}`}
          onClick={() => {
            restoreFocus.current = false
            editor.begin()
          }}
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            minWidth: 0,
            maxWidth: '100%',
            minHeight: '24px',
            border: 0,
            borderRadius: '4px',
            padding: '2px 4px',
            color: 'var(--colors-text)',
            backgroundColor: 'transparent',
            font: 'inherit',
            fontSize: '12px',
            textAlign: 'start',
            cursor: 'text',
            '&:hover:not(:disabled):not([aria-disabled="true"])': { backgroundColor: 'var(--colors-softBgHover)' },
            '&:focus-visible': { outline: '2px solid var(--colors-focusRing)' },
            '&:disabled, &[aria-disabled="true"]': { color: 'var(--colors-textMuted)', cursor: 'default' },
          })}>
          <span className={css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
            {value || emptyText}
          </span>
          {showIcon && <IconEdit size={14} aria-hidden="true" />}
        </button>
      ) : (
        <Input
          {...inputProps}
          ref={inputRef}
          value={editor.draft}
          aria-label={inputProps?.['aria-label'] ?? label}
          aria-describedby={describedBy}
          aria-invalid={editor.error ? true : inputProps?.['aria-invalid']}
          readOnly={readOnly || editor.phase === 'pending'}
          disabled={disabled}
          state={editor.error ? 'invalid' : inputProps?.state}
          onFocus={(event) => {
            inputProps?.onFocus?.(event)
            editor.inputProps.onFocus(event)
          }}
          onChange={(event) => {
            inputProps?.onChange?.(event)
            editor.inputProps.onChange(event)
          }}
          onBlur={(event) => {
            restoreFocus.current = false
            inputProps?.onBlur?.(event)
            editor.inputProps.onBlur(event)
          }}
          onKeyDown={(event) => {
            inputProps?.onKeyDown?.(event)
            if (event.defaultPrevented) return
            editor.inputProps.onKeyDown(event)
            if (event.defaultPrevented && (event.key === 'Enter' || event.key === 'Escape')) restoreFocus.current = true
          }}
          onCompositionStart={(event) => {
            inputProps?.onCompositionStart?.(event)
            editor.inputProps.onCompositionStart(event)
          }}
          onCompositionEnd={(event) => {
            inputProps?.onCompositionEnd?.(event)
            editor.inputProps.onCompositionEnd(event)
          }}
        />
      )}
      {editor.phase === 'pending' && (
        <span role="status" className={css({ fontSize: '11px', color: 'var(--colors-textMuted)' })}>
          Saving…
        </span>
      )}
      {editor.error && (
        <span
          id={errorId}
          role="alert"
          className={css({ fontSize: '12px', color: 'var(--colors-dangerText)', overflowWrap: 'anywhere' })}>
          {editor.error}
        </span>
      )}
    </div>
  )
})
