import type { ConfirmationService, ConfirmationRequest } from '@pivot-ui/react'
import type { IAlertDialogProps } from './AlertDialog'

/**
 * @deprecated Inject a service hosted by ConfirmationProvider and prefer service.request.
 * Callbacks run once after settlement. No provider returns an unavailable result.
 * zIndex/actionable were presentation options of the removed standalone React root;
 * the injected host now owns presentation and always offers explicit confirm/cancel actions.
 */
export function showAlert(
  props: Omit<IAlertDialogProps, 'trigger'>,
  service: ConfirmationService
): ConfirmationRequest {
  const request = service.request({
    title: props.title,
    description: props.description,
    cancelLabel: props.cancelText,
    confirmLabel: props.confirmText,
    critical: true,
  })
  void request.result.then((result) => {
    if (result.status === 'confirmed') props.onConfirm?.()
    else props.onClose?.()
  })
  return request
}
