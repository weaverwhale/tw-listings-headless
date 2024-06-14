import { UserSettingsAvatar } from '../UserSettingsAvatar/UserSettingsAvatar';
import { Popover, NavLink, useMantineColorScheme, darken } from '@mantine/core';
import { vars } from '../../theme';
import { PopoverLink } from '../StyledPopover/StyledPopover';
import { Size } from '../../types';
import { userSettingsPopoverNavLink } from './UserSettingsPopover.css';

export type UserSettingsPopoverProps = {
  avatarSource: string;
  initials: string;
  popoverLinks: PopoverLink[];
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  targetSize?: Size | number;
};

export const UserSettingsPopover: React.FC<UserSettingsPopoverProps> = ({
  avatarSource,
  initials,
  popoverLinks,
  targetSize,
}) => {
  const darkMode = useMantineColorScheme().colorScheme === 'dark';

  return (
    <Popover
      width="dropdown"
      position="top-start"
      shadow="md"
      styles={() => ({ dropdown: { padding: 0 } })}
      withinPortal
    >
      <Popover.Target>
        <UserSettingsAvatar size={targetSize} avatarSource={avatarSource} initials={initials} />
      </Popover.Target>
      <Popover.Dropdown bg={darkMode ? darken('#1F2530', 0.2) : 'white'} style={{ border: 'none' }}>
        {popoverLinks.map(({ topBorder, children }, i) => {
          const borderRadiusStyles = (() => {
            if (i === 0)
              return {
                borderTopRightRadius: '4px',
                borderTopLeftRadius: '4px',
              };
            if (i === popoverLinks.length - 1)
              return {
                borderBottomRightRadius: '4px',
                borderBottomLeftRadius: '4px',
              };
            return {};
          })();

          return (
            <NavLink
              key={`user-popover-link-${i}`}
              w={208}
              fz="sm"
              classNames={{ root: userSettingsPopoverNavLink }}
              styles={() => ({
                root: {
                  ...(!!topBorder && {
                    borderTop: `1px solid ${darkMode ? '#262D3B' : vars.colors.gray[1]}`,
                  }),
                  ...borderRadiusStyles,
                },
              })}
              label={children}
            />
          );
        })}
      </Popover.Dropdown>
    </Popover>
  );
};
