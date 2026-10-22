import { PropsWithChildren } from 'react'
import { FormItem } from './FormItem'
import { Button, CascadeSlider } from '@pivot-ui/editor'
import { BaseFormItemProps } from './FormItem/FormItem'

function wrapFormItem<T>() {
  return <C extends React.JSXElementConstructor<any>>(Component: C, defaultProps?: React.ComponentProps<C>) => {
    return function FormItemComponent(props: React.ComponentProps<C> & BaseFormItemProps<T>) {
      const { label, info, formStartSlot, formEndSlot, direction, ...rest } = props
      return (
        <FormItem
          label={label}
          info={info}
          formStartSlot={formStartSlot}
          formEndSlot={formEndSlot}
          direction={direction}>
          <Component {...defaultProps} {...(rest as typeof defaultProps)} />
        </FormItem>
      )
    }
  }
}

export type FormItemButtonProps = PropsWithChildren<Omit<BaseFormItemProps<string>, 'value' | 'onChange'>>
export const FormItemButton = wrapFormItem<string>()(Button, {
  variant: 'soft',
})

export type FormItemCascadeSliderProps = BaseFormItemProps<number[]>
export const FormItemCascadeSlider = wrapFormItem<number[]>()(CascadeSlider)

export { FormItemInput, type FormItemInputProps } from './FormItemInput'
export { FormItemSelect, type FormItemSelectProps } from './FormItemSelect'

export { FormItemColor, type FormItemColorProps } from './FormItemColor'
export { type Color } from '@pivot-ui/editor'
export { FormItemGroup, type FormItemGroupProps } from './FormItemGroup'
export { FormItemInputNumber, type FormItemInputNumberProps } from './FormItemInputNumber'
export { FormItemTextarea, type FormItemTextareaProps } from './FormItemTextarea'

export { FormItemToggle, type FormItemToggleProps } from './FormItemToggle'
export { FormItemToggleGroup, type FormItemToggleGroupProps } from './FormItemToggleGroup'

export * from './FormItemVector2'
export * from './FormItemVector3'
export * from './FormItemVector4'
export * from './FormItemRect'
export { FormItemSlider, type FormItemSliderProps } from './FormItemSlider'
export { FormItemSegmentControl, type FormItemSegmentControlProps } from './FormItemSegmentControl'
export { FormItemArray, type FormItemArrayProps } from './FormItemArray'
export { FormItemDisplay, type FormItemDisplayProps } from './FormItemDisplay'
export * from './FormItemAssetPicker'
export {
  FormItemGradient,
  type FormItemGradientProps,
  type TwoGradientValue,
  type GradientPropertyType,
  type GradientValue,
} from './FormItemGradient'
export { FormItemParticleCurve, type FormItemParticleCurveProps } from './FormItemParticle'
export { FormItemParticleCurve as FormItemParticle } from './FormItemParticle'

export { FormItem, type BaseFormItemProps, type FormItemSelectableProps, type FormItemRangeProps } from './FormItem'
