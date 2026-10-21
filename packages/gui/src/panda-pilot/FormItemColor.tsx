import React, { useEffect, useState } from 'react'
import { colord } from 'colord'

import { FormItem, extractFormItemProps, type BaseFormItemProps } from '../components/FormItem'
import { ColorPicker, Input, InputNumber, Text, useColorSpaceConversion, type ColorSpace } from '@pivot-ui/editor'
import { normalizeColor, denormalizeColor, toNormalizeHexStr, type Color } from '@pivot-ui/editor'

import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { styled } from '../../styled-system/jsx'

export interface PandaFormItemColorProps extends BaseFormItemProps<Color> {
  mode?: 'constant' | 'hdr'
  colorSpace?: ColorSpace
  onColorSpaceChange?: (colorSpace: ColorSpace) => void
}

const PandaColorSpaceBadge = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    height: '12px',
    fontSize: '8px',
    borderRadius: '9999px',
    padding: '4px',
    backgroundColor: 'var(--colors-gray3)',
    boxShadow: '0 0 0 1px var(--colors-grayA5)',
    strokeWidth: 1.2,
    color: 'var(--colors-grayA11)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: 'var(--colors-gray6)',
      color: 'var(--colors-grayA12)',
    },
  },
})

const defaultColor: Color = denormalizeColor({ r: 0, g: 0, b: 0, a: 1 })

export function PandaFormItemColor(props: PandaFormItemColorProps) {
  const { value, defaultValue, disabled, onChange, mode = 'constant', colorSpace = 'Linear' } = props

  const [displayColorSpace, setDisplayColorSpace] = useState<ColorSpace>(colorSpace)

  useEffect(() => {
    setDisplayColorSpace(colorSpace)
  }, [colorSpace])

  const [color, setColor] = useControllableState({
    prop: value === undefined ? undefined : denormalizeColor(value),
    defaultProp: defaultValue === undefined ? defaultColor : denormalizeColor(defaultValue),
    onChange: (value) => {
      if (onChange) {
        onChange(normalizeColor(value))
      }
    },
  })

  const { displayValue, convertInputToComponentSpace } = useColorSpaceConversion(color, colorSpace, displayColorSpace)

  const displayColorStr = toNormalizeHexStr(displayValue)
  const [colorStr, setColorStr] = useState(displayColorStr)

  useEffect(() => {
    setColorStr(displayColorStr)
  }, [displayColorStr])

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorStr(e.target.value)
  }

  const handleAlphaChange = (value: number) => {
    setColor({ ...color, a: value / 100 })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const colordValue = colord(`#${colorStr.replace('#', '')}`)
      if (colordValue.isValid()) {
        setColor(convertInputToComponentSpace(colordValue.toRgb()))
      } else {
        setColorStr(displayColorStr)
      }
    }
  }

  const isHdrMode = mode === 'hdr'

  return (
    <FormItem {...extractFormItemProps(props)} fieldColumn={isHdrMode ? '1' : 'color'}>
      <ColorPicker
        mode={mode as 'constant'}
        fullsize={isHdrMode}
        disabled={disabled}
        colorSpace={colorSpace}
        displayColorSpace={displayColorSpace}
        onDisplayColorSpaceChange={setDisplayColorSpace}
        value={color}
        onValueChange={setColor}
      />
      {!isHdrMode && (
        <>
          <Input
            disabled={disabled}
            startSlot="#"
            size="sm"
            value={colorStr}
            onChange={inputOnChange}
            onKeyDown={onKeyDown}
            css={{ fontFamily: 'var(--fonts-mono)' }}
            endSlot={
              <PandaColorSpaceBadge
                onClick={() => {
                  setDisplayColorSpace(displayColorSpace === 'sRGB' ? 'Linear' : 'sRGB')
                }}>
                {displayColorSpace}
              </PandaColorSpaceBadge>
            }
          />
          <InputNumber
            name="color alpha"
            disabled={disabled}
            size="sm"
            endSlot={<Text size="0_5">%</Text>}
            value={Math.round(color.a * 100)}
            onValueChange={handleAlphaChange}
            min={0}
            max={100}
          />
        </>
      )}
    </FormItem>
  )
}
