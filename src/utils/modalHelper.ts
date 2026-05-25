/**
 * Utility to manage active overlay count and add/remove the 'sheet-open' class
 * on the document body, locking background scrolling and applying scale/dim transitions.
 */
export function updateSheetOpenState() {
  const hasActiveOverlays =
    document.querySelectorAll('.sheet-overlay, [role="alertdialog"]').length >
    0;
  if (hasActiveOverlays) {
    document.body.classList.add("sheet-open");
  } else {
    document.body.classList.remove("sheet-open");
  }
}
