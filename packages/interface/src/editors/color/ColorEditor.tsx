import { forwardRef, useId, useLayoutEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { useColorEdit } from '../../interaction/color/useColorEdit'
import {
  areColorsEqual,
  assertColorValue,
  convertColorSpace,
  formatColorHex,
  hsvToColor,
  parseHexColor,
  rgbToHsv,
  type ColorSpace,
  type ColorValue,
} from '../../values/color'
import { Button } from '../../controls/buttons/Button'
import { Select } from '../../controls/choices/Select'
import { NumberInput } from '../../controls/inputs/NumberInput'
import { Slider } from '../../controls/sliders/Slider'
import { ColorPlane } from './ColorPlane'
import { HexColorField } from './HexColorField'
import { checkerboardClass, getColorCss } from './color-preview'
import type { ColorControlProps } from './types'

export type { ColorControlProps } from './types'
export interface ColorEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'>, ColorControlProps {
  /** 整组的无障碍名称，默认 `Color`。 */
  label?: string
  /** 初始的输入方式：`rgb`（默认）或 `hsv`，用户可以切换。 */
  defaultModel?: 'rgb' | 'hsv'
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}
const stack = css({ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 0 })
const modelOptions = [
  { key: 'rgb', value: 'rgb', label: 'RGB' },
  { key: 'hsv', value: 'hsv', label: 'HSV (sRGB)' },
] as const
const spaceOptions = [
  { key: 'srgb', value: 'srgb', label: 'sRGB display' },
  { key: 'linear', value: 'linear', label: 'Linear display' },
] as const

/** 内联颜色编辑器，适合持续调整颜色的面板。通过编辑回调接收 ColorValue；显示模式决定输入方式，value.space 决定颜色编码。 */
export const ColorEditor = forwardRef<HTMLDivElement, ColorEditorProps>(function ColorEditor(
  {
    value,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    hdr = false,
    disabled = false,
    readOnly = false,
    capabilities,
    displaySpace: controlledSpace,
    defaultDisplaySpace,
    onDisplaySpaceChange,
    defaultModel = 'rgb',
    label = 'Color',
    css: cssProp,
    className,
    ...props
  },
  ref
) {
  assertColorValue(value, { hdr })
  const [localSpace, setLocalSpace] = useState(defaultDisplaySpace ?? value.space)
  const displaySpace = controlledSpace ?? localSpace
  const [model, setModel] = useState(defaultModel)
  const [hue, setHue] = useState(() => rgbToHsv(value).h)
  const [planeMaximum, setPlaneMaximum] = useState(() => Math.max(1, rgbToHsv(value).v))
  const [toolStatus, setToolStatus] = useState<string | null>(null)
  const [toolBusy, setToolBusy] = useState(false)
  const operation = useRef(0)
  const planeScale = useRef(1)
  const mounted = useRef(true)
  const edit = useColorEdit({
    value,
    onValueChange,
    onEditStart,
    onValueCommit,
    onEditCancel,
    resetKey,
    disabled,
    readOnly,
    equals: areColorsEqual,
  })
  const childResetKey = useMemo(() => ({ resetKey, token: edit.resetToken }), [resetKey, edit.resetToken])
  const errorId = useId()
  const externalError = props['aria-errormessage']
  const errorMessage = externalError ?? (edit.error ? errorId : undefined)
  const rgb = convertColorSpace(value, displaySpace)
  const hsv = rgbToHsv(value)
  const shownHue = hsv.s === 0 || hsv.v === 0 ? hue : hsv.h
  useLayoutEffect(() => {
    setPlaneMaximum((maximum) => Math.max(maximum, hsv.v, 1))
  }, [hsv.v])
  useLayoutEffect(() => {
    setPlaneMaximum(Math.max(1, rgbToHsv(value).v))
  }, [resetKey])
  useLayoutEffect(() => {
    if (hsv.s > 0 && hsv.v > 0) setHue(hsv.h)
  }, [hsv.h, hsv.s, hsv.v])
  useLayoutEffect(() => {
    operation.current++
    setToolBusy(false)
    setToolStatus(null)
    if (edit.owner === 'capability' && edit.phase === 'editing') edit.cancel('external-update')
  }, [resetKey, disabled, readOnly, !!capabilities?.eyeDropper, !!capabilities?.clipboard])
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      operation.current++
    }
  }, [])
  const locked = (owner: string) => readOnly || (edit.owner !== null && edit.owner !== owner)
  function channelValue(channel: 'r' | 'g' | 'b' | 'a' | 'h' | 's' | 'v', number: number): ColorValue {
    const base = edit.getRequested()
    if (channel === 'a') return { ...base, a: number }
    if (channel === 'r' || channel === 'g' || channel === 'b')
      return convertColorSpace({ ...convertColorSpace(base, displaySpace), [channel]: number }, base.space)
    const current = rgbToHsv(base)
    const next = { ...current, h: current.s === 0 || current.v === 0 ? hue : current.h, [channel]: number }
    if (channel === 'h') setHue(number)
    return hsvToColor(next, base.space, { hdr })
  }
  async function runCapability(kind: 'pick' | 'paste') {
    const owner = 'capability'
    if (!edit.begin('capability', owner)) return
    const token = edit.getSessionToken(),
      epoch = ++operation.current
    let submitted = false
    setToolBusy(true)
    setToolStatus(null)
    try {
      const result =
        kind === 'pick'
          ? await capabilities?.eyeDropper?.pick()
          : parseHexColor(await capabilities!.clipboard!.readText(), value.space)
      if (!edit.isCurrent(token) || epoch !== operation.current) return
      if (result == null) {
        if (kind === 'paste') throw new Error('Clipboard text is not a valid HEX color.')
        edit.cancel('escape')
        return
      }
      assertColorValue(result, { hdr })
      const next = convertColorSpace(result, value.space)
      edit.request(next, owner)
      submitted = true
      await edit.commit(next, 'capability', owner)
      if (
        mounted.current &&
        epoch === operation.current &&
        (areColorsEqual(edit.getRequested(), next) || areColorsEqual(edit.getRequested(), value))
      )
        setToolStatus('Color accepted.')
    } catch (error) {
      if (mounted.current && epoch === operation.current && edit.isCurrent(token)) {
        // Submitted failures retain an explicit retry/cancel path and use the shared error owner.
        if (!submitted) {
          setToolStatus(error instanceof Error ? error.message : String(error))
          edit.cancel('pointer-cancel')
        }
      }
    } finally {
      if (mounted.current && epoch === operation.current) setToolBusy(false)
    }
  }
  async function copy() {
    const epoch = ++operation.current
    setToolBusy(true)
    setToolStatus(null)
    try {
      await capabilities!.clipboard!.writeText(formatColorHex(value, { alpha: true }))
      if (mounted.current && epoch === operation.current) setToolStatus('HEX copied.')
    } catch (error) {
      if (mounted.current && epoch === operation.current)
        setToolStatus(error instanceof Error ? error.message : String(error))
    } finally {
      if (mounted.current && epoch === operation.current) setToolBusy(false)
    }
  }
  const channels =
    model === 'rgb'
      ? [
          { key: 'r' as const, label: 'R', value: rgb.r },
          { key: 'g' as const, label: 'G', value: rgb.g },
          { key: 'b' as const, label: 'B', value: rgb.b },
        ]
      : [
          { key: 'h' as const, label: 'H', value: shownHue },
          { key: 's' as const, label: 'S', value: hsv.s },
          { key: 'v' as const, label: 'V', value: hsv.v },
        ]
  return (
    <div
      {...props}
      ref={ref}
      role={props.role ?? 'group'}
      aria-label={props['aria-label'] ?? label}
      aria-busy={edit.phase === 'pending' || toolBusy || undefined}
      data-color-phase={edit.phase}
      className={cx(
        css(
          {
            minWidth: 0,
            width: '100%',
            color: 'var(--colors-text)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          },
          cssProp
        ),
        className
      )}>
      <div
        aria-label={`${label} preview`}
        className={cx(
          checkerboardClass,
          css({
            height: '48px',
            border: '1px solid var(--colors-border)',
            borderRadius: 'var(--radii-control)',
            overflow: 'hidden',
          })
        )}>
        <div style={{ backgroundColor: getColorCss(value), height: '100%' }} />
      </div>
      <ColorPlane
        label={label}
        hue={shownHue}
        saturation={hsv.s}
        brightness={hsv.v / planeMaximum}
        active={edit.owner === 'sv'}
        disabled={disabled || locked('sv') || edit.phase === 'pending'}
        onBegin={() => {
          planeScale.current = planeMaximum
          return edit.begin('drag', 'sv')
        }}
        onChange={(s, v) => {
          const current = rgbToHsv(edit.getRequested())
          edit.request(
            hsvToColor({ h: shownHue, s, v: v * planeScale.current, a: current.a }, value.space, { hdr }),
            'sv'
          )
        }}
        onCommit={() => edit.commit(edit.getRequested(), 'pointer-up', 'sv')}
        onCancel={edit.cancel}
      />
      {hdr && (
        <div className={css({ fontSize: 'var(--fontSizes-micro)', color: 'var(--colors-textMuted)' })}>
          SV brightness range: 0–{planeMaximum.toPrecision(3)} sRGB
        </div>
      )}
      <Slider
        aria-label={`${label} Hue`}
        thumbLabels={[`${label} Hue`]}
        value={[shownHue]}
        min={0}
        max={360}
        step={1}
        resetKey={childResetKey}
        disabled={disabled}
        readOnly={locked('hue')}
        aria-errormessage={errorMessage}
        css={{
          '& [data-part=track]': { background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' },
          '& [data-part=range]': { background: 'transparent' },
        }}
        onEditStart={(source) => edit.begin(source, 'hue')}
        onValueChange={([next]) => edit.request(channelValue('h', next), 'hue')}
        onValueCommit={([next], reason) => edit.commit(channelValue('h', next), reason, 'hue')}
        onEditCancel={edit.cancel}
      />
      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' })}>
        <Select
          aria-label={`${label} color model`}
          size="sm"
          value={model}
          options={modelOptions}
          disabled={disabled || edit.phase !== 'idle'}
          css={{ flex: '1 1 100px' }}
          onValueChange={(next) => next && setModel(next as 'rgb' | 'hsv')}
        />
        {model === 'rgb' && (
          <Select
            aria-label={`${label} display encoding`}
            size="sm"
            value={displaySpace}
            options={spaceOptions}
            disabled={disabled || edit.phase !== 'idle'}
            css={{ flex: '1 1 100px' }}
            onValueChange={(next) => {
              if (!next) return
              const value = next as ColorSpace
              if (controlledSpace === undefined) setLocalSpace(value)
              onDisplaySpaceChange?.(value)
            }}
          />
        )}
      </div>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 'var(--space-1_5)',
        })}>
        {channels.map(({ key, label: channelLabel, value: number }) => (
          <label key={key} className={stack}>
            <span className={css({ fontSize: 'var(--fontSizes-control)' })}>{channelLabel}</span>
            <NumberInput
              aria-label={`${label} ${channelLabel}`}
              value={number}
              min={0}
              max={key === 'h' ? 360 : key === 's' || !hdr ? 1 : undefined}
              softMax={key === 'h' ? 360 : key === 's' || !hdr ? 1 : 8}
              step={key === 'h' ? 1 : 0.01}
              dragStep={key === 'h' ? 0.5 : 0.005}
              precision={5}
              displayPrecision={key === 'h' ? 1 : 3}
              resetKey={childResetKey}
              disabled={disabled}
              readOnly={locked(key)}
              aria-errormessage={errorMessage}
              onEditStart={(source) => edit.begin(source, key)}
              onValueChange={(next) => edit.request(channelValue(key, next), key)}
              onValueCommit={(next, reason) => edit.commit(channelValue(key, next), reason, key)}
              onEditCancel={edit.cancel}
            />
          </label>
        ))}
      </div>
      <label className={stack}>
        <span className={css({ fontSize: 'var(--fontSizes-control)' })}>Alpha</span>
        <NumberInput
          aria-label={`${label} Alpha`}
          value={value.a}
          min={0}
          max={1}
          step={0.01}
          dragStep={0.005}
          precision={4}
          displayPrecision={3}
          resetKey={childResetKey}
          disabled={disabled}
          readOnly={locked('a')}
          aria-errormessage={errorMessage}
          onEditStart={(source) => edit.begin(source, 'a')}
          onValueChange={(next) => edit.request(channelValue('a', next), 'a')}
          onValueCommit={(next, reason) => edit.commit(channelValue('a', next), reason, 'a')}
          onEditCancel={edit.cancel}
        />
      </label>
      <label className={stack}>
        <span className={css({ fontSize: 'var(--fontSizes-control)' })}>
          HEX · sRGB{hdr ? ' (display clipped)' : ''}
        </span>
        <HexColorField
          value={value}
          resetKey={childResetKey}
          disabled={disabled}
          readOnly={locked('hex')}
          label={`${label} HEX (sRGB)`}
          errorMessage={errorMessage}
          onEditStart={() => edit.begin('hex', 'hex')}
          onValueChange={(next) => edit.request(next, 'hex')}
          onValueCommit={(next, reason) => edit.commit(next, reason, 'hex')}
          onEditCancel={edit.cancel}
        />
      </label>
      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1_5)' })}>
        <Button
          size="sm"
          disabled={
            disabled ||
            readOnly ||
            toolBusy ||
            edit.phase === 'pending' ||
            locked('capability') ||
            !capabilities?.eyeDropper
          }
          onClick={() => {
            void runCapability('pick')
          }}>
          Pick screen color
        </Button>
        <Button
          size="sm"
          disabled={disabled || toolBusy || edit.phase !== 'idle' || !capabilities?.clipboard}
          onClick={() => {
            void copy()
          }}>
          Copy HEX
        </Button>
        <Button
          size="sm"
          disabled={
            disabled ||
            readOnly ||
            toolBusy ||
            edit.phase === 'pending' ||
            locked('capability') ||
            !capabilities?.clipboard
          }
          onClick={() => {
            void runCapability('paste')
          }}>
          Paste HEX
        </Button>
        {edit.owner === 'capability' && edit.phase === 'editing' && !toolBusy && (
          <Button
            size="sm"
            onClick={() => {
              edit.cancel('escape')
              setToolStatus(null)
            }}>
            Cancel color request
          </Button>
        )}
      </div>
      {(!capabilities?.eyeDropper || !capabilities?.clipboard) && (
        <p
          className={css({
            margin: 0,
            fontSize: 'var(--fontSizes-micro)',
            color: 'var(--colors-textMuted)',
            overflowWrap: 'anywhere',
          })}>
          {!capabilities?.eyeDropper && 'Screen picking unavailable; choose a color with the controls. '}
          {!capabilities?.clipboard && 'Clipboard access unavailable; type or paste into the HEX field.'}
        </p>
      )}
      {toolStatus && (
        <div role="status" className={css({ fontSize: 'var(--fontSizes-control)', overflowWrap: 'anywhere' })}>
          {toolStatus}
        </div>
      )}
      {edit.error && !externalError && (
        <div
          id={errorId}
          role="alert"
          className={css({
            color: 'var(--colors-dangerText)',
            fontSize: 'var(--fontSizes-control)',
            overflowWrap: 'anywhere',
          })}>
          {edit.error}
        </div>
      )}
    </div>
  )
})
