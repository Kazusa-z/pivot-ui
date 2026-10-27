// Public entry. Exports are grouped by layer, bottom to top; see scripts/audit-layers.mjs.

// Shared value types and helpers (no React)
export type { PropertyValue, ChoiceValue, ChoiceOption, NumericConstraints } from './values'
export { clamp } from './values/math'
export type {
  AssetId,
  AssetStatus,
  AssetDescriptor,
  AssetFilter,
  AssetGroup,
  AssetDragData,
  ResourceViewMode,
} from './values/assets'
export {
  assertAssetDescriptor,
  copyAssetDescriptor,
  assertAssetCollection,
  isAssetSelectable,
  matchesAssetFilter,
  filterAssets,
  groupAssets,
  ASSET_REFERENCE_DRAG_TYPE,
} from './values/assets'
export { formatShortcut } from './values/shortcut'
export type { ShortcutInput, ShortcutLetterCase, ShortcutGesture, ShortcutToken } from './values/shortcut'
export { createChoiceCollection } from './values/choice-options'
export type { ChoiceCollection } from './values/choice-options'
export type { PropertyData } from './values/property-data'
export { clonePropertyData, arePropertyDataEqual } from './values/property-data'
export {
  normalizeNumericConstraints,
  normalizeNumericValue,
  parseNumericDraft,
  roundNumeric,
  stepNumericValue,
  snapNumericValue,
} from './values/numeric'
export type { ResolvedNumericConstraints, NumericDraft } from './values/numeric'
export {
  getPartitionTotal,
  validatePartition,
  partitionToBoundaries,
  boundariesToPartition,
  movePartitionBoundary,
} from './values/partition'
export type { PartitionConstraints } from './values/partition'
export type { Vector2, Vector3, Vector4, Rect } from './values/geometry'
export {
  assertNumericTuple,
  vector2ToTuple,
  vector3ToTuple,
  vector4ToTuple,
  rectToTuple,
  tupleToVector2,
  tupleToVector3,
  tupleToVector4,
  tupleToRect,
} from './values/geometry'
export { getProportionalAxisRange, applyProportionalChange } from './values/proportion'
export type { ProportionalRange, ProportionalChange } from './values/proportion'
export type { DragPayload, DragCancelReason, DragResult, DragDropSnapshot, DropPosition } from './values/drag-drop'
export { createCollection } from './values/collection'
export type { CollectionKey, Collection } from './values/collection'
export { createTreeCollection, canMoveTreeItems } from './values/tree'
export type { TreeCollection, TreeCollectionOptions, TreeNode, TreeDropPosition } from './values/tree'
export { getPaginationState, getPageCount, clampPage } from './values/pagination'
export type { PaginationItem, PaginationOptions, PaginationState } from './values/pagination'
export type { ColorSpace, ColorValue, ColorOptions, HsvColor } from './values/color'
export {
  assertColorValue,
  normalizeColor,
  srgbChannelToLinear,
  linearChannelToSrgb,
  convertColorSpace,
  getDisplayColor,
  areColorsEqual,
  parseHexColor,
  formatColorHex,
  rgbToHsv,
  hsvToColor,
  mixColors,
} from './values/color'
export type {
  ColorRampStop,
  AlphaStop,
  ColorRampInterpolation,
  ColorRampValue,
  ColorAlphaRampValue,
} from './values/color-ramp'
export {
  assertColorRampValue,
  assertAlphaStops,
  assertColorAlphaRampValue,
  cloneColorRampValue,
  cloneColorAlphaRampValue,
  sortRampStops,
  sampleColorRamp,
  sampleAlphaStops,
  sampleColorAlphaRamp,
  areColorRampsEqual,
  areColorAlphaRampsEqual,
} from './values/color-ramp'
export type { ColorDistributionValue, ColorDistributionMode, ColorDistributionCache } from './values/color-distribution'
export {
  colorDistributionModes,
  assertColorDistributionValue,
  copyColorDistributionValue,
  copyColorDistributionCache,
  areColorDistributionsEqual,
  rememberColorDistribution,
  switchColorDistributionMode,
} from './values/color-distribution'
export type { CurvePointId, CurveCoordinate, CurvePoint, CurveValue, CurveViewport, CurveTick } from './values/curve'
export {
  assertCurveValue,
  copyCurveValue,
  areCurvesEqual,
  sampleCurve,
  assertCurveViewport,
  fitCurveViewport,
  getCurveTicks,
  createCurvePath,
  getCurvePointBounds,
  updateCurvePoint,
  addCurvePoint,
  removeCurvePoints,
  setCurveInterpolation,
} from './values/curve'
export type {
  NumericDistributionValue,
  NumericDistributionMode,
  NumericDistributionCache,
} from './values/numeric-distribution'
export {
  numericDistributionModes,
  assertNumericDistributionValue,
  copyNumericDistributionValue,
  areNumericDistributionsEqual,
  copyNumericDistributionCache,
  rememberNumericDistribution,
  switchNumericDistributionMode,
} from './values/numeric-distribution'

// Contracts between components and the host application
export type { ResourceQuery, ResourcePage, ResourceProvider, ResourceViewPreferences } from './contracts/resources'
export { getEditEndAction } from './contracts'
export type {
  PropertyTarget,
  PropertyDescriptor,
  PropertyDescriptorSchema,
  PropertyNumericAxis,
  PropertyValueAdapter,
  PropertyError,
  PropertyEditPreview,
  PropertySnapshot,
  EditCancelReason,
  EditEndReason,
  EditResult,
  EditChangeResult,
  EditSession,
  BeginEditResult,
  PropertyAccess,
  HostCapabilities,
  HostFileReference,
  HostFileRequest,
} from './contracts'
export type { ColorCapabilities } from './contracts/color'
export type { CurvePresetSummary, CurvePreset, CurvePresetSaveInput, CurvePresetService } from './contracts/curve'

// Interaction hooks
export { mergeRefs } from './interaction/react/mergeRefs'
export type {
  NumericEditSource,
  NumericCommitReason,
  NumericCancelReason,
  NumericEditCallbacks,
} from './interaction/numeric/types'
export {
  DragDropProvider,
  useDragDropState,
  useDragDropCancel,
  useDragSource,
  useDropTarget,
} from './interaction/drag-drop'
export type {
  DragDropProviderProps,
  DragDropEventContext,
  DragSourceOptions,
  DragSourceBinding,
  DropTargetOptions,
  DropTargetBinding,
} from './interaction/drag-drop'
export type {
  ColorEditSource,
  ColorCommitReason,
  ColorCancelReason,
  ColorEditCallbacks,
} from './interaction/color/types'
export type {
  CurveEditSource,
  CurveCommitReason,
  CurveCancelReason,
  CurveEditCallbacks,
} from './interaction/curve/types'

// Foundation: theme, typography, icons
export {
  createThemeStore,
  isThemePreference,
  THEME_STORAGE_KEY,
  themeClasses,
  createBrowserThemeStorage,
  createBrowserSystemTheme,
  createBrowserThemeAppearance,
  defaultThemeStore,
  ThemeContext,
  ThemeProvider,
  useThemeStore,
  useTheme,
} from './foundation/theme'
export type {
  ThemePreference,
  ResolvedTheme,
  ThemeSnapshot,
  ThemeStorageAdapter,
  SystemThemeAdapter,
  ThemeAppearanceAdapter,
  ThemeStoreOptions,
  ThemeStore,
  BrowserThemeStorageOptions,
  BrowserSystemThemeOptions,
  BrowserThemeAppearanceOptions,
  ThemeProviderProps,
  ThemeState,
} from './foundation/theme'
export type { SystemStyleObject as CSS, RecipeVariantProps as VariantProps } from '../styled-system/types'
export { Text, Bold, Title, Link } from './foundation/typography'
export type {
  TextProps,
  BoldProps,
  TitleProps,
  LinkProps,
  TextSize,
  TextTone,
  TextWeight,
} from './foundation/typography'
export {
  EyeDropperIcon,
  MouseDoubleDownIcon,
  MouseLeftDownIcon,
  MouseRightDownIcon,
  IconRightBottomCorner,
  ConstrainIcon,
  Arrow,
  IconCodeFile,
  IconAnimationControllerFile,
  IconAnimatorClipFile,
  IconFontFile,
  IconPrefabFile,
  IconSceneFile,
  IconShaderFile,
  IconSpineSkeletonFile,
  IconSpineFile,
  IconSpriteFile,
  IconSpriteAtlasFile,
  IconUnknownFile,
  IconVrReferenceImageFile,
  IconPendingFile,
} from './foundation/icons'
export type { IconProps, ConstrainIconProps, ArrowProps, ArrowDirection } from './foundation/icons'

// Display: presentational atoms
export { Kbd, KbdGroup, KbdGroupRoot } from './display/Kbd'
export type { KbdProps, KbdGroupProps, KbdGroupRootProps } from './display/Kbd'
export { Badge, Tag } from './display/Badge'
export type { BadgeProps, TagProps } from './display/Badge'
export { Callout, Progress, Spin } from './display/feedback'
export type { CalloutProps, ProgressProps, SpinProps } from './display/feedback'
export { ReadonlyValue } from './display/ReadonlyValue'
export type { ReadonlyValueProps } from './display/ReadonlyValue'
export { ImagePreview } from './display/ImagePreview'
export type { ImagePreviewProps } from './display/ImagePreview'

// Overlays: floating layers, menus, notifications
export {
  createNotificationService,
  NotificationProvider,
  useNotifications,
  ToastView,
  Toaster,
  toast,
} from './overlays/notifications'
export type {
  NotificationService,
  NotificationMessage,
  NotificationOptions,
  NotificationPosition,
  NotificationPromiseMessages,
  NotificationProviderProps,
  ToastViewProps,
  ToasterProps,
} from './overlays/notifications'
export {
  OverlayLayer,
  Popover,
  PopoverRoot,
  PopoverTrigger,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent,
  PopoverClose,
  PopoverTitle,
  PopoverDescription,
  PopoverArrow,
  Tooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
  HoverCard,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  HoverCardArrow,
} from './overlays'
export type {
  OverlayLayerProps,
  PopoverProps,
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverAnchorProps,
  PopoverPortalProps,
  PopoverContentProps,
  PopoverCloseProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverArrowProps,
  TooltipProps,
  TooltipProviderProps,
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipPortalProps,
  TooltipContentProps,
  TooltipArrowProps,
  HoverCardProps,
  HoverCardRootProps,
  HoverCardTriggerProps,
  HoverCardPortalProps,
  HoverCardContentProps,
  HoverCardArrowProps,
} from './overlays'
export {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  MenubarRoot,
  MenubarMenu,
  MenubarTrigger,
  MenubarPortal,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarGroup,
  MenubarLabel,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from './overlays/menus'
export type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuGroupProps,
  DropdownMenuLabelProps,
  DropdownMenuSeparatorProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
  DropdownMenuRootProps,
  DropdownMenuTriggerProps,
  DropdownMenuPortalProps,
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuCheckboxItemProps,
  ContextMenuRadioGroupProps,
  ContextMenuRadioItemProps,
  ContextMenuGroupProps,
  ContextMenuLabelProps,
  ContextMenuSeparatorProps,
  ContextMenuSubProps,
  ContextMenuSubTriggerProps,
  ContextMenuSubContentProps,
  ContextMenuRootProps,
  ContextMenuTriggerProps,
  ContextMenuPortalProps,
  MenubarContentProps,
  MenubarItemProps,
  MenubarCheckboxItemProps,
  MenubarRadioGroupProps,
  MenubarRadioItemProps,
  MenubarGroupProps,
  MenubarLabelProps,
  MenubarSeparatorProps,
  MenubarSubProps,
  MenubarSubTriggerProps,
  MenubarSubContentProps,
  MenubarRootProps,
  MenubarMenuProps,
  MenubarTriggerProps,
  MenubarPortalProps,
  MenuSize,
} from './overlays/menus'

// Controls: single-purpose inputs and buttons
export { Button, IconButton, IconButtonGroup } from './controls/buttons'
export type { ButtonProps, IconButtonProps, IconButtonGroupProps } from './controls/buttons'
export { Input } from './controls/inputs/Input'
export type { InputProps } from './controls/inputs/Input'
export { Textarea } from './controls/inputs/Textarea'
export type { TextareaProps } from './controls/inputs/Textarea'
export { EditableText } from './controls/inputs/EditableText'
export type { EditableTextProps } from './controls/inputs/EditableText'
export { useTextEdit } from './controls/inputs/useTextEdit'
export type {
  UseTextEditOptions,
  TextEditPhase,
  TextEditCommitReason,
  TextEditCancelReason,
} from './controls/inputs/useTextEdit'
export { Select } from './controls/choices/Select'
export type { SelectProps } from './controls/choices/Select'
export { Combobox } from './controls/choices/Combobox'
export type { ComboboxProps, SingleComboboxProps, MultipleComboboxProps } from './controls/choices/Combobox'
export { Checkbox } from './controls/choices/Checkbox'
export type { CheckboxProps, CheckboxState } from './controls/choices/Checkbox'
export { SegmentControl, SegmentControlRoot, SegmentControlItem } from './controls/choices/SegmentControl'
export type {
  SegmentControlProps,
  SegmentControlRootProps,
  SegmentControlItemProps,
} from './controls/choices/SegmentControl'
export { ToggleGroup, ToggleGroupRoot, ToggleGroupItem } from './controls/choices/ToggleGroup'
export type {
  ToggleGroupProps,
  ToggleGroupSingleProps,
  ToggleGroupMultipleProps,
  ToggleGroupRootProps,
  ToggleGroupRootSingleProps,
  ToggleGroupRootMultipleProps,
  ToggleGroupItemProps,
} from './controls/choices/ToggleGroup'
export type { TextInputSize, TextInputState, TextInputVariant } from './controls/inputs/text.styles'
export type { ChoiceSize, ChoiceVariant } from './controls/choices/choice.styles'
export { NumberInput } from './controls/inputs/NumberInput'
export type { NumberInputProps } from './controls/inputs/NumberInput'
export { Slider } from './controls/sliders/Slider'
export type { SliderProps } from './controls/sliders/Slider'
export { PartitionSlider } from './controls/sliders/PartitionSlider'
export type { PartitionSliderProps } from './controls/sliders/PartitionSlider'

// Layout: sections, property rows, splits
export { PropertyRow, PropertyLabel, PropertyControl, PropertyDescription } from './layout/PropertyRow'
export type {
  PropertyRowProps,
  PropertyLabelProps,
  PropertyControlProps,
  PropertyDescriptionProps,
} from './layout/PropertyRow'
export { ResizableSplit } from './layout/ResizableSplit'
export type { ResizableSplitProps, ResizeCancelReason } from './layout/ResizableSplit'
export { Flex } from './layout/Flex'
export type { FlexProps } from './layout/Flex'
export { SectionDivider } from './layout/SectionDivider'
export type { SectionDividerProps } from './layout/SectionDivider'
export { Separator } from './layout/Separator'
export type { SeparatorProps } from './layout/Separator'
export { ScrollArea, ScrollAreaRoot, ScrollAreaViewport } from './layout/ScrollArea'
export type { ScrollAreaProps, ScrollAreaRootProps, ScrollAreaViewportProps } from './layout/ScrollArea'
export { Accordion, AccordionItem, Section } from './layout/disclosure'
export type {
  AccordionProps,
  AccordionItemProps,
  SectionProps,
  DisclosureSize,
  DisclosureVariant,
  DisclosureHeadingLevel,
} from './layout/disclosure'

// Dialogs: modal decisions and confirmation
export {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  AlertDialog,
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  createConfirmationService,
  ConfirmationProvider,
  useConfirmation,
} from './dialogs'
export type {
  DialogProps,
  DialogRootProps,
  DialogTriggerProps,
  DialogPortalProps,
  DialogOverlayProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
  AlertDialogProps,
  AlertDialogRootProps,
  AlertDialogTriggerProps,
  AlertDialogPortalProps,
  AlertDialogOverlayProps,
  AlertDialogContentProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogCancelProps,
  AlertDialogActionProps,
  ConfirmationOptions,
  ConfirmationStatus,
  ConfirmationResult,
  ConfirmationRequest,
  ConfirmationSnapshot,
  ConfirmationService,
  ConfirmationProviderProps,
} from './dialogs'

// Collections: trees, tables, asset tiles, navigation
export { AssetItem, AssetName, AssetThumbnail } from './collections/asset'
export type { AssetItemProps, AssetNameProps, AssetThumbnailProps } from './collections/asset'
export { Breadcrumbs, BreadcrumbItem } from './collections/navigation/Breadcrumbs'
export type { BreadcrumbEntry, BreadcrumbsProps, BreadcrumbItemProps } from './collections/navigation/Breadcrumbs'
export { Pagination } from './collections/navigation/Pagination'
export type { PaginationProps, PaginationLabels } from './collections/navigation/Pagination'
export {
  Table,
  TableHead,
  TableBody,
  TableFoot,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableCaption,
} from './collections/Table'
export type {
  TableProps,
  TableSectionProps,
  TableRowProps,
  TableHeaderCellProps,
  TableCellProps,
  TableCaptionProps,
} from './collections/Table'
export { DataTable } from './collections/DataTable'
export type { DataTableProps, DataTableColumn, DataTableAction, DataTableSelection } from './collections/DataTable'
export { CollectionEditor } from './collections/CollectionEditor'
export type { CollectionEditorProps, CollectionItemContext, CollectionReorder } from './collections/CollectionEditor'
export {
  TreeRoot,
  TreeItem,
  TreeItemContent,
  TreeGroup,
  TreeItemIcon,
  TreeDragPreview,
  TreeInsertionIndicator,
} from './collections/tree'
export type {
  TreeRootProps,
  TreeItemProps,
  TreeItemState,
  TreeSelectionMode,
  TreeItemContentProps,
  TreeGroupProps,
  TreeItemIconProps,
  TreeDragPreviewProps,
  TreeInsertionIndicatorProps,
  TreeDragData,
  TreeDropRequest,
  TreeDragDropOptions,
} from './collections/tree'

// Editors: numeric, color, curve and resource editing
export { ResourceBrowser } from './editors/resources/ResourceBrowser'
export type { ResourceBrowserProps, ResourceFilterOption } from './editors/resources/ResourceBrowser'
export { AssetField } from './editors/resources/AssetField'
export type { AssetFieldProps } from './editors/resources/AssetField'
export { SliderField, NumberTupleInput, Vector2Input, Vector3Input, Vector4Input, RectInput } from './editors/numeric'
export type {
  SliderFieldProps,
  NumberTupleInputProps,
  NumericAxisConfig,
  NumericObjectInputProps,
  Vector2InputProps,
  Vector3InputProps,
  Vector4InputProps,
  RectInputProps,
} from './editors/numeric'
export { getColorCss } from './editors/color/color-preview'
export { getColorRampCss, getColorAlphaRampCss } from './editors/color/color-ramp-preview'
export { ColorEditor } from './editors/color/ColorEditor'
export type { ColorEditorProps, ColorControlProps } from './editors/color/ColorEditor'
export { ColorPicker } from './editors/color/ColorPicker'
export type { ColorPickerProps } from './editors/color/ColorPicker'
export { ColorField } from './editors/color/ColorField'
export type { ColorFieldProps } from './editors/color/ColorField'
export { HDRColorField } from './editors/color/HDRColorField'
export type { HDRColorFieldProps } from './editors/color/HDRColorField'
export { ColorRampEditor } from './editors/color/ColorRampEditor'
export type { ColorRampEditorProps } from './editors/color/ColorRampEditor'
export { ColorAlphaRampEditor } from './editors/color/ColorAlphaRampEditor'
export type { ColorAlphaRampEditorProps } from './editors/color/ColorAlphaRampEditor'
export { ColorRampPicker } from './editors/color/ColorRampPicker'
export type { ColorRampPickerProps } from './editors/color/ColorRampPicker'
export { ColorDistributionEditor } from './editors/color/ColorDistributionEditor'
export type {
  ColorDistributionEditorProps,
  ColorDistributionEditSource,
  ColorDistributionCommitReason,
} from './editors/color/ColorDistributionEditor'
export { CurveEditor, type CurveEditorProps } from './editors/curve/CurveEditor'
export { CurvePicker, type CurvePickerProps } from './editors/curve/CurvePicker'
export { CurvePresets, defaultCurvePresets, type CurvePresetsProps } from './editors/curve/CurvePresets'
export {
  NumericDistributionEditor,
  type NumericDistributionEditorProps,
  type NumericDistributionEditSource,
  type NumericDistributionCommitReason,
} from './editors/numeric/NumericDistributionEditor'

// Property binding
export { PropertyField } from './property/PropertyField'
export type {
  PropertyFieldProps,
  PropertyFieldWidget,
  PropertyFieldControlProps,
  PropertyFieldRenderProps,
} from './property/PropertyField'
export { usePropertyBinding } from './property/usePropertyBinding'
export type { PropertyBindingOptions, PropertyBinding } from './property/usePropertyBinding'
