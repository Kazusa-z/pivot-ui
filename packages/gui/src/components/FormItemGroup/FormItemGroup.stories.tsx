import { useEffect, useId, useRef, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemGroup, type FormItemGroupProps } from './'
import {
  Checkbox,
  InputNumber,
  Vector2Input,
  RectInput,
  PropertyRow,
  PropertyLabel,
  PropertyControl,
} from '@pivot-ui/react'
import { StoryFrame } from '../../../stories/StoryFrame'

export default {
  title: 'FormItem/FormItemGroup',
  component: FormItemGroup,
  args: { label: 'Transform', defaultOpen: true, collapsible: true },
  argTypes: { children: { control: false } },
} as Meta<typeof FormItemGroup>

const initialValues = {
  position: { x: 0, y: 0 },
  bounds: { x: 0, y: 0, width: 640, height: 480 },
  scale: 1,
  visible: true,
}

function GroupExample({ nested = false, ...args }: FormItemGroupProps & { nested?: boolean }) {
  const visibleId = useId()
  const initialOpen = args.open ?? args.defaultOpen ?? true
  const [values, setValues] = useState(() => structuredClone(initialValues))
  const editStart = useRef(values)
  const [resetKey, setResetKey] = useState(0)
  const [open, setOpen] = useState(initialOpen)
  const [nestedOpen, setNestedOpen] = useState(true)
  useEffect(() => {
    if (args.open !== undefined) setOpen(args.open)
  }, [args.open])

  return (
    <StoryFrame
      value={{ open, ...(nested ? { nestedOpen } : {}), ...values }}
      onReset={() => {
        setValues(structuredClone(initialValues))
        setOpen(initialOpen)
        setNestedOpen(true)
        setResetKey((key) => key + 1)
      }}>
      <FormItemGroup
        {...args}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          args.onOpenChange?.(nextOpen)
        }}>
        <PropertyRow>
          <PropertyLabel id={`${visibleId}-position-label`}>Position</PropertyLabel>
          <PropertyControl association="group" labelledBy={`${visibleId}-position-label`}>
            <Vector2Input
              disabled={args.disabled}
              value={values.position}
              resetKey={resetKey}
              onEditStart={() => {
                editStart.current = values
              }}
              onEditCancel={(reason) => {
                if (['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason))
                  setValues((current) => ({ ...current, position: editStart.current.position }))
              }}
              onValueChange={(position) => setValues((current) => ({ ...current, position }))}
            />
          </PropertyControl>
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel id={`${visibleId}-bounds-label`}>Bounds</PropertyLabel>
          <PropertyControl association="group" labelledBy={`${visibleId}-bounds-label`}>
            <RectInput
              disabled={args.disabled}
              value={values.bounds}
              resetKey={resetKey}
              onEditStart={() => {
                editStart.current = values
              }}
              onEditCancel={(reason) => {
                if (['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason))
                  setValues((current) => ({ ...current, bounds: editStart.current.bounds }))
              }}
              onValueChange={(bounds) => setValues((current) => ({ ...current, bounds }))}
            />
          </PropertyControl>
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel htmlFor={`${visibleId}-scale`}>Scale</PropertyLabel>
          <PropertyControl association="control">
            <InputNumber
              id={`${visibleId}-scale`}
              disabled={args.disabled}
              value={values.scale}
              min={0}
              step={0.1}
              dragStep={0.1}
              resetKey={resetKey}
              onEditStart={() => {
                editStart.current = values
              }}
              onEditCancel={(reason) => {
                if (['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason))
                  setValues((current) => ({ ...current, scale: editStart.current.scale }))
              }}
              onValueChange={(scale) => setValues((current) => ({ ...current, scale }))}
            />
          </PropertyControl>
        </PropertyRow>
        {nested && (
          <FormItemGroup label="Visibility" nesting open={nestedOpen} onOpenChange={setNestedOpen}>
            <PropertyRow>
              <PropertyLabel htmlFor={visibleId}>Visible</PropertyLabel>
              <PropertyControl association="control">
                <Checkbox
                  id={visibleId}
                  disabled={args.disabled}
                  checked={values.visible}
                  onCheckedChange={(visible) => setValues((current) => ({ ...current, visible }))}
                />
              </PropertyControl>
            </PropertyRow>
          </FormItemGroup>
        )}
      </FormItemGroup>
    </StoryFrame>
  )
}

export const Overview: StoryFn<typeof FormItemGroup> = (args) => <GroupExample {...args} />
export const InitiallyCollapsed: StoryFn<typeof FormItemGroup> = (args) => <GroupExample {...args} />
InitiallyCollapsed.args = { defaultOpen: false }
export const NonCollapsible: StoryFn<typeof FormItemGroup> = (args) => <GroupExample {...args} />
NonCollapsible.args = { collapsible: false }
export const Nested: StoryFn<typeof FormItemGroup> = (args) => <GroupExample {...args} nested />
export const Transparent: StoryFn<typeof FormItemGroup> = (args) => <GroupExample {...args} />
Transparent.args = { transparent: true }
