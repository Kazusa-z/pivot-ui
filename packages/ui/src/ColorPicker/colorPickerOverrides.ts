const COLOR_PICKER_OVERRIDES = `
.galacecan-color-picker .react-colorful {
  width: 220px;
  height: 180px;
}

.galacecan-color-picker .react-colorful__saturation {
  border-bottom: 6px;
  border-radius: 6px;
}

.galacecan-color-picker .react-colorful__hue {
  width: 140px;
  height: 6px;
  margin: 12px 0;
  border-radius: 4px;
}

.galacecan-color-picker .react-colorful__hue .react-colorful__pointer {
  height: 12px;
  width: 12px;
  border-radius: 9999px;
  border-width: 2px;
}

.galacecan-color-picker .react-colorful__pointer {
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  border-width: 2px;
}

.galacecan-color-picker .react-colorful__alpha {
  width: 140px;
  height: 6px;
  border-radius: 4px;
}

.galacecan-color-picker .react-colorful__alpha .react-colorful__pointer {
  height: 12px;
  width: 12px;
  border-radius: 9999px;
  border-width: 2px;
}

.galacecan-color-picker[data-readonly='true'] .react-colorful__saturation,
.galacecan-color-picker[data-readonly='true'] .react-colorful__hue {
  pointer-events: none;
  opacity: 0.5;
}

`

export function injectColorPickerStyles() {
  if (typeof document === 'undefined' || document.querySelector('style[data-pivot-color-picker]')) return
  const style = document.createElement('style')
  style.dataset.pivotColorPicker = 'true'
  style.textContent = COLOR_PICKER_OVERRIDES
  document.head.appendChild(style)
}
