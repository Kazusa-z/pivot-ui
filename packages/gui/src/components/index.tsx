import { createElement } from 'react'
import { FormItem } from './FormItem'
import { CascadeSlider } from '@pivot-ui/editor'
import { mergeFormItemDescriptionIds, type BaseFormItemProps } from './FormItem/FormItem'

function wrapFormItem<T>(association: 'control' | 'group') {
  return <C extends React.JSXElementConstructor<any>>(Component: C, defaultProps?: React.ComponentProps<C>) => {
    return function FormItemComponent(props: React.ComponentProps<C> & BaseFormItemProps<T>) {
      const { label, info, formStartSlot, formEndSlot, direction, ...rest } = props
      return (
        <FormItem
          association={association}
          controlId={props.id}
          label={label}
          info={info}
          formStartSlot={formStartSlot}
          formEndSlot={formEndSlot}
          direction={direction}>
          {(controlProps) =>
            createElement(Component, {
              ...(association === 'control' ? controlProps : {}),
              ...defaultProps,
              ...rest,
              ...(association === 'control'
                ? {
                    id: props.id ?? controlProps.id,
                    'aria-describedby': mergeFormItemDescriptionIds(
                      controlProps['aria-describedby'],
                      props['aria-describedby']
                    ),
                  }
                : {}),
            })
          }
        </FormItem>
      )
    }
  }
}

export type FormItemCascadeSliderProps = BaseFormItemProps<number[]>
export const FormItemCascadeSlider = wrapFormItem<number[]>('group')(CascadeSlider)

export { FormItemColor, type FormItemColorProps } from './FormItemColor'
export { type Color } from '@pivot-ui/editor'
export { FormItemGroup, type FormItemGroupProps } from './FormItemGroup'
export { FormItemInputNumber, type FormItemInputNumberProps } from './FormItemInputNumber'

export * from './FormItemVector2'
export * from './FormItemVector3'
export * from './FormItemVector4'
export * from './FormItemRect'
export { FormItemSlider, type FormItemSliderProps } from './FormItemSlider'
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
