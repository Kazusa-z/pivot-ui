import { forwardRef, useId, useLayoutEffect, useRef, type HTMLAttributes } from 'react'
import { cx } from '../../../styled-system/css'
import type { ColorCapabilities } from '../../contracts/color'
import type { ColorEditCallbacks } from '../../interaction/color/types'
import {
  areColorRampsEqual,
  assertColorRampValue,
  cloneColorRampValue,
  type ColorRampValue,
} from '../../values/color-ramp'
import { ColorRampControls, defaultRamp, rampStyles } from './RampControls'
import { useRampSelection, useRampState } from './useRampState'

export interface ColorRampEditorProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'>,
    ColorEditCallbacks<ColorRampValue> {
  value?: ColorRampValue
  defaultValue?: ColorRampValue
  onValueChange?: (value: ColorRampValue) => void
  activeStopId?: string | null
  defaultActiveStopId?: string | null
  onActiveStopIdChange?: (id: string | null) => void
  disabled?: boolean
  readOnly?: boolean
  hdr?: boolean
  resetKey?: unknown
  capabilities?: ColorCapabilities
}
export const ColorRampEditor = forwardRef<HTMLDivElement, ColorRampEditorProps>(function ColorRampEditor(
  {
    value,
    defaultValue = defaultRamp,
    onValueChange,
    activeStopId,
    defaultActiveStopId,
    onActiveStopIdChange,
    disabled,
    readOnly,
    hdr = false,
    resetKey,
    capabilities,
    onEditStart,
    onValueCommit,
    onEditCancel,
    className,
    ...props
  },
  ref
) {
  assertColorRampValue(value ?? defaultValue, { hdr })
  const state = useRampState({
    value,
    defaultValue,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    disabled,
    readOnly,
    resetKey,
    equals: areColorRampsEqual,
    clone: cloneColorRampValue,
  })
  const { editor } = state
  const selection = useRampSelection(state.value.stops, activeStopId, defaultActiveStopId, onActiveStopIdChange)
  const lastSelection = useRef(selection.id)
  useLayoutEffect(() => {
    if (lastSelection.current !== selection.id && editor.owner?.endsWith(`:${lastSelection.current}`))
      editor.cancel('target-change')
    lastSelection.current = selection.id
  }, [selection.id, editor.owner, editor.cancel])
  const errorId = useId(),
    externalError = props['aria-errormessage']
  return (
    <div
      {...props}
      ref={ref}
      role={props.role ?? 'group'}
      aria-label={props['aria-label'] ?? 'Color ramp'}
      aria-busy={editor.phase === 'pending' || undefined}
      data-color-phase={editor.phase}
      className={cx(rampStyles.root, className)}
      onKeyDown={(event) => {
        props.onKeyDown?.(event)
        if (!event.defaultPrevented && event.key === 'Escape' && editor.phase !== 'idle') {
          event.preventDefault()
          event.stopPropagation()
          editor.cancel('escape')
        }
      }}>
      <ColorRampControls
        value={state.value}
        editor={editor}
        getRamp={(next) => next}
        replaceRamp={(_, next) => next}
        activeId={selection.id}
        onSelect={selection.select}
        disabled={disabled}
        readOnly={readOnly}
        hdr={hdr}
        capabilities={capabilities}
        resetKey={resetKey}
        errorId={externalError || (editor.error ? errorId : undefined)}
      />
      {editor.error && !externalError && (
        <p id={errorId} role="alert">
          {editor.error}
        </p>
      )}
    </div>
  )
})
