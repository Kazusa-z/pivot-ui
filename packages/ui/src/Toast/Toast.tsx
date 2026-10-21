import { Toaster as HotToast, type ToasterProps } from 'react-hot-toast'
import { css } from '../../styled-system/css'

const toastClassName = 'pivot-toaster-toast'

const containerClassName = css({
  '& .pivot-toaster-toast': {
    minHeight: '28px',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid var(--colors-gray6)',
    backgroundColor: 'var(--colors-toasterBg)',
    color: 'var(--colors-grayA11)',
    fontSize: '12px',
    boxShadow: '0 5px 10px rgba(0,0,0,0.08)',
    '& > div:first-child': { marginRight: '8px' },
    '& div[role=status]': { margin: 0 },
  },
})

export function Toaster(props: ToasterProps) {
  const { toastOptions, containerStyle, ...rest } = props

  return (
    <HotToast
      containerStyle={{ inset: 38, ...containerStyle }}
      toastOptions={{
        ...toastOptions,
        className: toastClassName,
        success: {
          iconTheme: { primary: 'var(--colors-green10)', secondary: 'var(--colors-white)' },
        },
        error: {
          iconTheme: { primary: 'var(--colors-red9)', secondary: 'var(--colors-white)' },
        },
      }}
      containerClassName={containerClassName}
      {...rest}
    />
  )
}

export { toast } from 'react-hot-toast'
