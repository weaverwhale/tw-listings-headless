import { $store } from '@tw/snipestate';
import { ModalStore } from './types';

export const DEFAULT_CONFIRM_MODAL_STORE_PROPS = {
  open: false,
  title: '',
  message: '',
  confirmed: false,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  modalProps: { zIndex: Number.MAX_SAFE_INTEGER },
};

//
// STORE
//
export const $modalStore = $store<ModalStore>(DEFAULT_CONFIRM_MODAL_STORE_PROPS);

//
// ACTIONS
//
export function confirmAction() {
  $modalStore.set((x) => ({ ...x, confirmed: true }));
}

export function cancelAction() {
  $modalStore.set((x) => ({ ...x, confirmed: false }));
}
