import { forwardRef, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { css } from '../../../styled-system/css'
import { Input, type InputProps } from './Input'
import { useNumericInput, type NumericInputOptions } from '../../interaction/numeric/useNumericInput'
import { numericModifierScale, useNumericDrag } from '../../interaction/numeric/useNumericDrag'
import { normalizeNumericConstraints } from '../../values/numeric'

export interface InputNumberProps
  extends
    Omit<InputProps, 'value' | 'defaultValue' | 'onValueChange' | 'type' | 'min' | 'max' | 'step'>,
    NumericInputOptions {
  /** Optional native increase/decrease buttons. ArrowUp/ArrowDown always work. */
  stepper?: boolean
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  {
    value,
    defaultValue,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    mixed,
    min,
    max,
    softMin,
    softMax,
    step,
    dragStep,
    precision,
    stepper,
    disabled,
    readOnly,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onPointerDown,
    onCompositionStart,
    onCompositionEnd,
    endSlot,
    ...props
  },
  ref
) {
  const constraints = { min, max, softMin, softMax, step, dragStep, precision }
  const editor = useNumericInput({
    ...constraints,
    value,
    defaultValue,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    mixed,
    disabled,
    readOnly,
  })
  const rules = normalizeNumericConstraints(constraints)
  const input = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => input.current!, [])
  const composing = useRef(false)
  const [focused, setFocused] = useState(false)
  const errorId = useId()
  const drag = useNumericDrag({
    ...constraints,
    value: editor.value,
    disabled: !!(disabled || readOnly || editor.phase === 'pending'),
    resetKey,
    cancelToken: editor.phase === 'idle' ? 'idle' : 'active',
    begin: () => editor.begin('drag'),
    change: (next, origin) => editor.request(next, 'drag', undefined, origin),
    commit: () => {
      void editor.commit('pointer-up')
    },
    cancel: editor.cancel,
  })
  const reset = useRef(() => {})
  reset.current = () => {
    drag.release()
    composing.current = false
    editor.reset()
  }
  useLayoutEffect(() => {
    const element = input.current
    const form = element?.form
    if (!element || !form) return
    let connected = true
    const onReset = (event: Event) => {
      // Native listeners run before React's bubbling onReset can prevent the default.
      queueMicrotask(() => {
        if (!connected || event.defaultPrevented || !element.isConnected || element.form !== form) return
        reset.current()
      })
    }
    form.addEventListener('reset', onReset)
    return () => {
      connected = false
      form.removeEventListener('reset', onReset)
    }
  }, [props.form, value, resetKey, mixed, disabled, readOnly, min, max, softMin, softMax, step, dragStep, precision])
  const textDraft = editor.phase !== 'idle' && (editor.source === 'text' || !!editor.error)
  const display = textDraft ? editor.draft : mixed && editor.phase === 'idle' ? '' : String(editor.value)
  const showLocalError = !!editor.error && !props['aria-errormessage']?.trim()
  const locked = disabled || readOnly || editor.phase === 'pending'
  return (
    <div
      data-numeric-phase={editor.phase}
      className={css({ minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' })}>
      <Input
        {...props}
        ref={input}
        value={display}
        type="text"
        inputMode={props.inputMode ?? 'decimal'}
        role="spinbutton"
        aria-valuemin={Number.isFinite(rules.min) ? rules.min : undefined}
        aria-valuemax={Number.isFinite(rules.max) ? rules.max : undefined}
        aria-valuenow={mixed && editor.phase === 'idle' ? undefined : editor.value}
        aria-busy={editor.phase === 'pending' || undefined}
        aria-invalid={editor.error ? true : props['aria-invalid']}
        state={editor.error ? 'invalid' : props.state}
        aria-describedby={
          [props['aria-describedby'], showLocalError ? errorId : undefined].filter(Boolean).join(' ') || undefined
        }
        disabled={disabled}
        readOnly={readOnly || editor.phase === 'pending'}
        placeholder={props.placeholder ?? (mixed ? 'Multiple values' : undefined)}
        style={{
          cursor: !focused && !locked ? 'ew-resize' : undefined,
          touchAction: !focused && !locked ? 'none' : undefined,
          ...props.style,
        }}
        endSlot={
          stepper ? (
            <>
              {endSlot}
              <span className={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
                <button
                  type="button"
                  aria-label="Decrease value"
                  disabled={!!locked}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={(event) => editor.step(-1, numericModifierScale(event))}
                  className={stepperClass}>
                  −
                </button>
                <button
                  type="button"
                  aria-label="Increase value"
                  disabled={!!locked}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={(event) => editor.step(1, numericModifierScale(event))}
                  className={stepperClass}>
                  +
                </button>
              </span>
            </>
          ) : (
            endSlot
          )
        }
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          composing.current = false
          onBlur?.(event)
          void editor.commit('blur')
        }}
        onChange={(event) => {
          onChange?.(event)
          editor.changeText(event.currentTarget.value)
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          drag.onPointerDown(event)
        }}
        onCompositionStart={(event) => {
          composing.current = true
          onCompositionStart?.(event)
        }}
        onCompositionEnd={(event) => {
          composing.current = false
          onCompositionEnd?.(event)
          editor.changeText(event.currentTarget.value)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || composing.current || event.nativeEvent.isComposing || event.keyCode === 229)
            return
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            editor.cancel('escape')
          } else if (event.key === 'Enter') {
            event.preventDefault()
            event.stopPropagation()
            void editor.commit('enter')
          } else if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && !locked) {
            event.preventDefault()
            editor.step(event.key === 'ArrowUp' ? 1 : -1, numericModifierScale(event))
          }
        }}
      />
      {editor.phase === 'pending' && (
        <span role="status" className={css({ fontSize: '11px', color: 'var(--colors-textMuted)' })}>
          Saving…
        </span>
      )}
      {showLocalError && (
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

const stepperClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '18px',
  minWidth: '18px',
  padding: 0,
  border: 0,
  borderRadius: '3px',
  font: 'inherit',
  color: 'var(--colors-text)',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  '&:hover:not(:disabled)': { backgroundColor: 'var(--colors-softBgHover)' },
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)' },
  '&:disabled': { color: 'var(--colors-textMuted)', cursor: 'default' },
})
