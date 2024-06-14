import { ModalProps } from '../Modal/Modal';

export type ModalStore = {
  open: boolean;
  title?: React.ReactNode;
  message?: React.FC | React.ReactNode;
  confirmed?: boolean;
  confirmText?: string;
  cancelText?: string;
  /** By default, confirm action is on the left. If true, this prop reverses their order. */
  reverseOrder?: boolean;
  modalProps?: Partial<Omit<ModalProps, 'onClose' | 'opened'>>;
};
