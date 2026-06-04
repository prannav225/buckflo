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

const modalStack: (() => void)[] = [];
let isPopStateListenerAdded = false;
let ignoreNextPopState = 0;

function handlePopState() {
  if (ignoreNextPopState > 0) {
    ignoreNextPopState--;
    return;
  }

  if (modalStack.length > 0) {
    const topClose = modalStack.pop();
    if (topClose) {
      topClose();
    }
    
    // If there are still modals in the stack, push a new dummy state so the next back gesture works
    if (modalStack.length > 0) {
      window.history.pushState({ modalOpen: true }, "");
    }
  }
}

export function registerModal(onClose: () => void) {
  if (!isPopStateListenerAdded) {
    window.addEventListener("popstate", handlePopState);
    isPopStateListenerAdded = true;
  }

  modalStack.push(onClose);

  // If this is the first modal in the stack, push a dummy state
  if (modalStack.length === 1) {
    window.history.pushState({ modalOpen: true }, "");
  }
}

export function unregisterModal(onClose: () => void) {
  const index = modalStack.indexOf(onClose);
  if (index !== -1) {
    modalStack.splice(index, 1);
    
    // If the stack is now empty and the history state still has modalOpen, pop it
    if (modalStack.length === 0) {
      if (window.history.state && window.history.state.modalOpen) {
        ignoreNextPopState++;
        window.history.back();
      }
    }
  }
}

