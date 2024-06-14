import { Avatar, UnstyledButton } from '@mantine/core';
import { forwardRef } from 'react';
import { Size } from '../../types';
import * as classes from './UserSettings.css';
import { getMarketingProps } from '../../utils/commonPropGenerators';

type UserSettingsAvatarProps = {
  avatarSource: string;
  initials: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  size?: Size | number;
};

export const UserSettingsAvatar = forwardRef<HTMLButtonElement, UserSettingsAvatarProps>(
  ({ avatarSource, initials, onClick, size = 24 }, ref) => {
    return (
      <UnstyledButton onClick={onClick} ref={ref} {...getMarketingProps('user-settings-avatar')}>
        <Avatar
          variant="filled"
          size={size}
          radius="50%"
          color="one.5"
          fw={300}
          // TODO: Make smaller
          fz="sm"
          classNames={{ placeholder: classes.placeholder }}
          {...(avatarSource && { src: avatarSource })}
          {...(initials && { children: initials })}
        />
      </UnstyledButton>
    );
  }
);
