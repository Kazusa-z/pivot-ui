import { Toaster as HotToast, type ToasterProps } from 'react-hot-toast'
import { css, cx } from '../../styled-system/css'

const toastClassName = 'pivot-toaster-toast'

const containerClassName = css({
  '& .pivot-toaster-toast': {
    // Hot Toast's child spacing is unlayered, so these layered overrides need priority.
    '& > div:first-child:not([role=status])': { marginRight: '8px !important' },
    '& div[role=status]': { margin: '0 !important' },
  },
})

export function Toaster(props: ToasterProps) {
  const { toastOptions, containerStyle, containerClassName: customContainerClassName, ...rest } = props

  return (
    <HotToast
      containerStyle={{ inset: 38, ...containerStyle }}
      toastOptions={{
        ...toastOptions,
        className: cx(toastClassName, toastOptions?.className),
        style: {
          minHeight: '28px',
          padding: '6px 8px',
          borderRadius: '6px',
          border: '1px solid var(--colors-gray6)',
          backgroundColor: 'var(--colors-toasterBg)',
          color: 'var(--colors-grayA11)',
          fontSize: '12px',
          boxShadow: '0 5px 10px rgba(0,0,0,0.08)',
          ...toastOptions?.style,
        },
        success: {
          ...toastOptions?.success,
          iconTheme: {
            primary: 'var(--colors-green10)',
            secondary: 'var(--colors-white)',
            ...toastOptions?.iconTheme,
            ...toastOptions?.success?.iconTheme,
          },
        },
        error: {
          ...toastOptions?.error,
          iconTheme: {
            primary: 'var(--colors-red9)',
            secondary: 'var(--colors-white)',
            ...toastOptions?.iconTheme,
            ...toastOptions?.error?.iconTheme,
          },
        },
      }}
      containerClassName={cx(containerClassName, customContainerClassName)}
      {...rest}
    />
  )
}

export { toast } from 'react-hot-toast'
