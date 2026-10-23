import { useEffect, useId, useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { FormItemGroup, type FormItemGroupProps } from './'
import { FormItemVector2 } from '../FormItemVector2'
import { FormItemRect } from '../FormItemRect'
import { FormItemInputNumber } from '../FormItemInputNumber'
import { Checkbox, PropertyRow, PropertyLabel, PropertyControl } from '@pivot-ui/react'
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
      }}>
      <FormItemGroup
        {...args}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          args.onOpenChange?.(nextOpen)
        }}>
        <FormItemVector2
          label="Position"
          disabled={args.disabled}
          value={values.position}
          onChange={(position) => setValues((current) => ({ ...current, position }))}
        />
        <FormItemRect
          label="Bounds"
          disabled={args.disabled}
          value={values.bounds}
          onChange={(bounds) => setValues((current) => ({ ...current, bounds }))}
        />
        <FormItemInputNumber
          label="Scale"
          disabled={args.disabled}
          value={values.scale}
          min={0}
          step={0.1}
          dragStep={0.1}
          onChange={(scale) => setValues((current) => ({ ...current, scale }))}
        />
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
