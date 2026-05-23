import { useState, useCallback } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { ConfirmOptions, DialogState } from '../components/ConfirmDialog';

/**
 * Returns a `confirm(options)` function that shows a branded dialog and resolves
 * with `true` (confirmed) or `false` (cancelled), plus a `ConfirmDialog` element
 * that must be rendered somewhere in the component tree.
 *
 * Usage:
 *   const { confirm, dialog } = useConfirm();
 *   // In JSX: {dialog}
 *   // In handler: if (await confirm({ title: '…', message: '…' })) { … }
 */
export function useConfirm() {
  const [dialogState, setDialogState] = useState<DialogState | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({ ...options, resolve });
    });
  }, []);

  const handleClose = useCallback(() => {
    setDialogState(null);
  }, []);

  const dialog = (
    <ConfirmDialog state={dialogState} onClose={handleClose} />
  );

  return { confirm, dialog };
}
