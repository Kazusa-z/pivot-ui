import React, { ForwardedRef, useCallback, useState } from 'react'
import { IconChevronDown, IconCurrentLocation, IconFileFilled, IconUnlink } from '@tabler/icons-react'

import { BasicAssetType, AssetPickerPopoverProps } from './AssetPickerPopover'
import { AssetPickerContent } from './AssetPickerContent'

import { FormItem, extractFormItemProps } from '../FormItem'
import { ActionButton, Button, Popover, PopoverCloseTrigger, useDrop } from '@pivot-ui/editor'
import { styled } from '../../../styled-system/jsx'
import { BaseFormItemProps } from '../FormItem/FormItem'

const PreviewFallbackIcon = styled(IconFileFilled, {
  base: { flexShrink: 0 },
})

const SelectedAssetPreview = styled('div', {
  base: {
    width: '64px',
    height: '64px',
    borderRadius: '4px',
    flexShrink: 0,
    backgroundColor: 'var(--colors-softBg)',
    border: '1px solid var(--colors-gray5)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--colors-gray11)',
    '& img': { width: '100%', height: '100%', objectFit: 'cover' },
  },
})

const TextureAssetControl = styled('div', {
  base: {
    width: '100%',
    minHeight: '68px',
    color: 'var(--colors-gray10)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    outline: 'none',
  },
  variants: {
    isDraggingOver: {
      true: {
        color: 'var(--colors-blue12)',
        outline: '2px solid var(--colors-blue10)',
        outlineOffset: '2px',
      },
    },
  },
})

const TextureAssetControls = styled('div', {
  base: { minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '4px' },
})

const TextureAssetNamePopover = styled('div', {
  base: { minWidth: 0, flex: 1 },
})

const TextureAssetName = styled('button', {
  base: {
    appearance: 'none',
    border: 0,
    minWidth: 0,
    width: '100%',
    height: '24px',
    padding: '0 8px',
    borderRadius: '4px',
    backgroundColor: 'var(--colors-softBg)',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4px',
    cursor: 'pointer',
    transition: 'background-color .2s ease, color .2s ease',
    '&:hover': { backgroundColor: 'var(--colors-softBgHover)', color: 'var(--colors-textStrong)' },
    '&:disabled': {
      backgroundColor: 'var(--colors-softBg)',
      color: 'var(--colors-textMuted)',
      cursor: 'not-allowed',
      '&:hover': { backgroundColor: 'var(--colors-softBg)', color: 'var(--colors-textMuted)' },
    },
  },
})

const TextureAssetActions = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '4px' },
})

const TextureAssetNameText = styled('span', {
  base: { minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
})

export interface FormItemAssetPickerProps<T extends BasicAssetType>
  extends AssetPickerPopoverProps<T>, BaseFormItemProps<string> {
  onDelete?: () => void
  onLocate?: (value: string) => void
  placeholder?: string
  onOpenChange?: (isOpen?: boolean) => void
  dropLayer: number
  onSelect?: (asset: T) => void
  customFilter?: (asset: T) => boolean
  groupBy?: (asset: T) => string
}

const Placeholder = styled('span', {
  base: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 2 },
})

const StyledTriggerButton = styled(Button, {
  base: { width: '100%' },
  variants: {
    isDraggingOver: {
      true: {
        color: 'var(--colors-blue12)',
        outline: '2px solid var(--colors-blue10)',
        backgroundColor: 'var(--colors-blueA4)',
      },
    },
  },
})

function stripImageExtension(name: string) {
  return name.replace(/\.(png|jpe?g|webp|hdr)$/i, '')
}

function _FormItemAssetPicker<T extends BasicAssetType>(props: FormItemAssetPickerProps<T>, ref) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const {
    label,
    disabled,
    value,
    onDelete,
    onLocate,
    onOpenChange,
    placeholder,
    dropLayer,
    onSelect,
    assets,
    asset,
    customFilter,
    groupBy,
  } = props

  const actionDisabled = !!(disabled || !value)
  const hasSelectedAsset = !!value
  const assetType = asset?.getMetaConfig?.().type
  const useLargePreview = hasSelectedAsset && ['Texture', 'Texture2D', 'TextureCube'].includes(assetType)
  const selectedThumbnail = useLargePreview ? asset?.thumbnailUrl : undefined
  const textureDisplayName = useLargePreview ? stripImageExtension(value) : value

  const dropRef = useDrop<HTMLElement, T>({
    accept: dropLayer,
    disable: disabled || !onSelect,
    onDrop(_, item, dropElement) {
      setIsDraggingOver(false)
      if (item) onSelect?.(item)
      dropElement.blur()
    },
    onEnter(_, __, dropElement) {
      setIsDraggingOver(true)
      dropElement.focus()
    },
    onLeave(_, __, dropElement) {
      setIsDraggingOver(false)
      dropElement.blur()
    },
  })

  const handleLocate = useCallback(
    function handleLocate() {
      if (!actionDisabled) onLocate?.(value)
    },
    [actionDisabled, value, onLocate]
  )

  if (useLargePreview) {
    return (
      <FormItem
        {...extractFormItemProps(props)}
        association="group"
        fieldCss={{ gridTemplateColumns: 'minmax(0, 1fr)', alignItems: 'center' }}>
        <TextureAssetControl ref={dropRef} isDraggingOver={isDraggingOver}>
          <SelectedAssetPreview>
            {selectedThumbnail ? <img src={selectedThumbnail} alt="" /> : <PreviewFallbackIcon size="24px" />}
          </SelectedAssetPreview>
          <TextureAssetControls>
            <TextureAssetNamePopover>
              <Popover
                compact
                disabled={disabled}
                sideOffset={6}
                trigger={
                  <TextureAssetName type="button" disabled={disabled}>
                    <TextureAssetNameText>{textureDisplayName}</TextureAssetNameText>
                    <IconChevronDown size="14px" />
                  </TextureAssetName>
                }
                onOpenChange={onOpenChange}>
                <AssetPickerContent
                  assets={assets}
                  selectedAssetId={asset?.id}
                  onSelect={onSelect}
                  customFilter={customFilter}
                  groupBy={groupBy}
                />
              </Popover>
            </TextureAssetNamePopover>
            <TextureAssetActions>
              <ActionButton
                aria-label="Locate asset"
                size="sm"
                disabled={actionDisabled || !onLocate}
                onClick={handleLocate}
                variant="soft">
                <IconCurrentLocation />
              </ActionButton>
              <ActionButton
                aria-label="Clear asset"
                size="sm"
                disabled={actionDisabled || !onDelete}
                onClick={onDelete}
                variant="soft">
                <IconUnlink />
              </ActionButton>
            </TextureAssetActions>
          </TextureAssetControls>
        </TextureAssetControl>
      </FormItem>
    )
  }

  const trigger = (
    <StyledTriggerButton
      ref={dropRef}
      size="sm"
      disabled={disabled}
      variant="soft"
      isDraggingOver={isDraggingOver}
      css={{
        justifyContent: 'initial',
      }}>
      <PreviewFallbackIcon size="14px" />
      <Placeholder>{value ? value : placeholder}</Placeholder>
    </StyledTriggerButton>
  )

  return (
    <FormItem
      {...extractFormItemProps(props)}
      association="group"
      fieldCss={{ gridTemplateColumns: 'minmax(0, 8fr) 24px 24px', alignItems: 'center' }}>
      <Popover compact disabled={disabled} sideOffset={6} trigger={trigger} onOpenChange={onOpenChange}>
        <AssetPickerContent
          assets={assets}
          selectedAssetId={asset?.id}
          onSelect={onSelect}
          customFilter={customFilter}
          groupBy={groupBy}
        />
      </Popover>
      <ActionButton
        aria-label="Locate asset"
        size="sm"
        disabled={actionDisabled || !onLocate}
        onClick={handleLocate}
        variant="soft">
        <IconCurrentLocation />
      </ActionButton>
      <ActionButton
        aria-label="Clear asset"
        size="sm"
        disabled={actionDisabled || !onDelete}
        onClick={onDelete}
        variant="soft">
        <IconUnlink />
      </ActionButton>
    </FormItem>
  )
}

export const FormItemAssetPicker = React.forwardRef(_FormItemAssetPicker) as <T extends BasicAssetType>(
  props: FormItemAssetPickerProps<T> & { ref?: ForwardedRef<HTMLInputElement> }
) => ReturnType<typeof _FormItemAssetPicker>

export { PickableAssetItem } from './PickableAssetItem'
export { type BasicAssetType, type AssetPickerPopoverProps } from './AssetPickerPopover'
