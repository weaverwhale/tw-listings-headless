import React, { PropsWithChildren, forwardRef } from 'react';
import { MantinePropsToRemove, Size, TwBaseProps } from '../../types';
import {
  Modal as MantineModal,
  ModalProps as MantineModalProps,
  ModalBodyProps,
  ModalCloseButtonProps,
  ModalContentProps,
  ModalHeaderProps,
  ModalOverlayProps,
  ModalTitleProps,
  ModalRootProps,
} from '@mantine/core';
import { vars } from '../../theme';

export interface ModalProps
  extends TwBaseProps,
    PropsWithChildren,
    Omit<MantineModalProps, MantinePropsToRemove> {
  size?: Size;
  closeButtonAlignment?: 'start' | 'center';
  headerBorder?: boolean;
}

interface IModal extends React.FC<ModalProps> {
  Root: React.FC<IModalRootProps>;
  Overlay: React.ForwardRefExoticComponent<
    IModalOverlayProps & React.RefAttributes<HTMLDivElement>
  >;
  Content: React.ForwardRefExoticComponent<
    IModalContentProps & React.RefAttributes<HTMLDivElement>
  >;
  Header: React.ForwardRefExoticComponent<IModalHeaderProps & React.RefAttributes<HTMLDivElement>>;
  Title: React.ForwardRefExoticComponent<
    IModalTitleProps & React.RefAttributes<HTMLHeadingElement>
  >;
  CloseButton: React.ForwardRefExoticComponent<
    IModalCloseButtonProps & React.RefAttributes<HTMLButtonElement>
  >;
  Body: React.ForwardRefExoticComponent<IModalBodyProps & React.RefAttributes<HTMLHeadingElement>>;
  Footer: React.ForwardRefExoticComponent<IModalFooterProps & React.RefAttributes<HTMLDivElement>>;
}

// TODO: See what to omit from here
interface IModalRootProps extends ModalRootProps {}
interface IModalOverlayProps extends ModalOverlayProps {}
interface IModalContentProps extends ModalContentProps {}
interface IModalHeaderProps extends ModalHeaderProps {}
interface IModalTitleProps extends ModalTitleProps {}
interface IModalCloseButtonProps extends ModalCloseButtonProps {}
interface IModalBodyProps extends ModalBodyProps {}
interface IModalFooterProps extends PropsWithChildren {
  border?: boolean;
}

export const Modal: IModal = (props) => {
  const { centered = true, closeButtonAlignment, headerBorder, ...other } = props;

  return (
    <MantineModal
      styles={{
        root: {
          background: vars.colors.named[0],
        },
        content: {
          background: vars.colors.named[0],
        },
        close: {
          alignSelf: closeButtonAlignment === 'start' ? 'flex-start' : 'center',
        },
        header: {
          background: vars.colors.named[0],
          borderBottom: headerBorder ? `1px solid ${vars.colors.gray[2]}` : 'none',
        },
      }}
      centered={centered}
      {...other}
    />
  );
};

// have to change default of this value, since Mantine makes default true here
Modal.Root = (props) => {
  return <MantineModal.Root {...props} />;
};

Modal.Overlay = forwardRef((props, ref) => {
  return <MantineModal.Overlay {...props} ref={ref} />;
});

Modal.Content = forwardRef((props, ref) => {
  return <MantineModal.Content {...props} ref={ref} />;
});

Modal.Header = forwardRef((props, ref) => {
  return <MantineModal.Header {...props} ref={ref} />;
});

Modal.Title = forwardRef((props, ref) => {
  return <MantineModal.Title {...props} ref={ref} />;
});

Modal.CloseButton = forwardRef((props, ref) => {
  return <MantineModal.CloseButton {...props} ref={ref} />;
});

Modal.Body = forwardRef((props, ref) => {
  return <MantineModal.Body {...props} ref={ref} />;
});

// put default footer styles here
Modal.Footer = forwardRef<HTMLDivElement, IModalFooterProps>((props, ref) => {
  const { border, ...other } = props;
  return (
    <div
      {...other}
      style={{
        position: 'sticky',
        bottom: 0,
        width: '100%',
        background: vars.colors.named[0],
        paddingBlock: vars.spacing.md,
        paddingInline: 0,
        marginBottom: `calc(${vars.spacing.md} * -1)`,
        borderTop: border ? `1px solid ${vars.colors.gray[2]}` : 'none',
      }}
      ref={ref}
    />
  );
});
