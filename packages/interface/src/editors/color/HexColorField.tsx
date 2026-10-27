import { useId, useLayoutEffect, useRef, useState } from 'react'
import { css } from '../../../styled-system/css'
import { Input } from '../../controls/inputs/Input'
import { useTextEdit } from '../../controls/inputs/useTextEdit'
import { areColorsEqual, formatColorHex, parseHexColor, type ColorValue } from '../../values/color'
import type { ColorControlProps } from './types'

/** Text drafts are local. HEX is committed as an explicit sRGB value, preserving alpha unless supplied. */
export function HexColorField({
  value,
  onValueChange,
  onEditStart,
  onValueCommit,
  onEditCancel,
  resetKey,
  disabled,
  readOnly,
  label = 'HEX (sRGB)',
  errorMessage,
}: ColorControlProps & { label?: string; errorMessage?: string }) {
  const [anchor, setAnchor] = useState<string | null>(null)
  const lastRequested = useRef<ColorValue | null>(null)
  const initial = useRef(value)
  const observed = useRef(value)
  const epoch = useRef(0)
  const submission = useRef<'pending' | 'rejected' | undefined>(undefined)
  const mounted = useRef(true)
  const id = useId()
  const editor = useTextEdit({
    value: anchor ?? formatColorHex(value),
    resetKey,
    disabled,
    readOnly,
    onBegin: () => {
      if (onEditStart?.('hex') === false) return false
      initial.current = value
      epoch.current++
      lastRequested.current = null
      submission.current = undefined
      setAnchor(formatColorHex(value))
    },
    onCommit: async (draft, reason) => {
      const currentEpoch = epoch.current
      const parsed = parseHexColor(draft, value.space)
      if (!parsed) throw new Error('Enter a HEX color with 3, 4, 6 or 8 digits.')
      const length = draft.trim().replace(/^#/, '').length
      const next = length === 3 || length === 6 ? { ...parsed, a: value.a } : parsed
      lastRequested.current = next
      submission.current = 'pending'
      try {
        onValueChange?.(next)
        await onValueCommit?.(next, reason === 'blur' ? 'blur' : 'enter')
      } catch (error) {
        if (mounted.current && currentEpoch === epoch.current) submission.current = 'rejected'
        throw error
      }
      if (mounted.current && currentEpoch === epoch.current) {
        submission.current = undefined
        setAnchor(null)
      }
    },
    onCancel: (reason) => {
      epoch.current++
      setAnchor(null)
      lastRequested.current = null
      submission.current = undefined
      onEditCancel?.(reason)
    },
  })
  useLayoutEffect(() => {
    epoch.current++
    submission.current = undefined
    setAnchor(null)
  }, [resetKey, disabled, readOnly])
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      epoch.current++
    }
  }, [])
  useLayoutEffect(() => {
    if (!areColorsEqual(observed.current, value) && editor.phase !== 'idle') {
      const ownEcho = lastRequested.current && areColorsEqual(lastRequested.current, value)
      const rollback = submission.current !== undefined && areColorsEqual(initial.current, value)
      if (!ownEcho && !rollback) {
        epoch.current++
        editor.cancel('external-update')
        setAnchor(null)
      }
    }
    observed.current = value
  }, [value, editor.phase, editor.cancel])
  const localError = editor.error && !errorMessage
  return (
    <div className={css({ minWidth: 0 })}>
      <Input
        aria-label={label}
        value={editor.draft}
        disabled={disabled}
        readOnly={readOnly || editor.phase === 'pending'}
        aria-busy={editor.phase === 'pending' || undefined}
        aria-invalid={!!editor.error || undefined}
        aria-errormessage={errorMessage ?? (localError ? id : undefined)}
        spellCheck={false}
        autoComplete="off"
        {...editor.inputProps}
      />
      {localError && (
        <div
          id={id}
          role="alert"
          className={css({
            color: 'var(--colors-dangerText)',
            fontSize: 'var(--fontSizes-control)',
            overflowWrap: 'anywhere',
          })}>
          {editor.error}
        </div>
      )}
    </div>
  )
}
