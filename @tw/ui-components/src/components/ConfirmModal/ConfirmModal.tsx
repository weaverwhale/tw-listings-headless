import { getMarketingProps } from '../../utils/commonPropGenerators';
import { Modal } from '../Modal/Modal';
import { Flex } from '../Flex/Flex';
import { Button } from '../Button/Button';
import { Text } from '../Text/Text';
import { $modalStore, cancelAction, confirmAction } from './store';

//
// GLOBAL COMPONENT
//
export const ConfirmModal = () => {
  const [{ open, message: Message, title, modalProps, confirmText, cancelText, reverseOrder }] =
    $modalStore.useStore();

  return (
    <Modal
      {...modalProps}
      opened={open}
      onClose={cancelAction}
      title={typeof title === 'string' ? <Text>{title}</Text> : title}
      data-tw-ui-component="ConfirmModal"
      {...getMarketingProps(`tw-confirmation-modal`)}
    >
      {typeof Message === 'string' ? <Text>{Message}</Text> : typeof Message === 'function' ? <Message /> : Message}
      <Flex
        gap="xs"
        justify={reverseOrder ? 'flex-start' : 'flex-end'}
        direction={reverseOrder ? 'row-reverse' : 'row'}
      >
        <Button onClick={confirmAction}>{confirmText}</Button>
        <Button variant="white" onClick={cancelAction}>
          {cancelText}
        </Button>
      </Flex>
    </Modal>
  );
};
