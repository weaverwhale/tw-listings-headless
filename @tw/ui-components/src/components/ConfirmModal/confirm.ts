//
// EXPOSED FUNCTION TO OPEN CONFIRMATION AND WAIT FOR RESPONSE

import { $modalStore, DEFAULT_CONFIRM_MODAL_STORE_PROPS } from './store';
import { ModalStore } from './types';

//
export const confirm = async ({
  title,
  message,
  modalProps,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  reverseOrder,
}: Omit<ModalStore, 'open' | 'confirmed'>) => {
  $modalStore.set((x) => ({
    ...x,
    open: true,
    title,
    message,
    modalProps: { ...DEFAULT_CONFIRM_MODAL_STORE_PROPS.modalProps, ...modalProps },
    confirmText,
    cancelText,
    reverseOrder,
  }));

  return new Promise((resolve) => {
    const unsubscribe = $modalStore.subscribe(({ confirmed }) => {
      try {
        resolve(!!confirmed);
      } finally {
        unsubscribe();
        $modalStore.set((x) => ({ ...x, open: false }));
      }
    });
  });
};
