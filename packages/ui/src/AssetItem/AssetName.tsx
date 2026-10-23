import { useId } from 'react'
import { AssetName as NewAssetName } from '@pivot-ui/react'
import { legacyAssetDescriptor } from './legacyAssetDescriptor'

export interface AssetNameProps {
  name: string
  selected?: boolean
  readOnly?: boolean
  onRename?: (name: string) => void | Promise<void>
}

/** B11 compatibility only; EditableText in the new package owns the complete rename lifecycle. */
export function AssetName({ name, selected, readOnly, onRename }: AssetNameProps) {
  const id = useId()
  return <NewAssetName asset={legacyAssetDescriptor(id, name)} readOnly={readOnly || !selected} onRename={onRename} />
}
export default AssetName
