import { useRef } from 'react';
import {
  Popover,
  NavLink,
  PopoverProps,
  GetStylesApiOptions,
  darken,
  useMantineColorScheme,
} from '@mantine/core';
import { TwBaseProps } from '../../types';
import { generateRandomUniqueId } from '../../utils/generateRandomUniqueId';
import { cx } from '../../utils/cx';
import { styledNavLink, styledNavLinkBorder, styledNavLinkHover } from './StyledPopover.css';

export type PopoverLink = {
  children: React.ReactNode;
  /**
   * Determines if popover section should have a border denoting separation
   */
  topBorder?: boolean;
};

export type StyledPopoverProps = TwBaseProps &
  Omit<PopoverProps, keyof GetStylesApiOptions | 'children'> & {
    target: React.ReactNode;
    popoverLinks: PopoverLink[];
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  };

export const StyledPopover: React.FC<StyledPopoverProps> = ({
  target,
  popoverLinks,
  position = 'top-start',
  shadow = 'md',
  withinPortal = true,
  ...rest
}) => {
  const uniqueId = useRef('popover-' + generateRandomUniqueId());
  const darkMode = useMantineColorScheme().colorScheme === 'dark';

  return (
    <Popover
      position={position}
      shadow={shadow}
      styles={() => ({ dropdown: { padding: 0 } })}
      withinPortal={withinPortal}
      {...rest}
    >
      <Popover.Target>
        <div>{target}</div>
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
              key={`${uniqueId.current}-${i}`}
              classNames={{
                root: cx(styledNavLink, styledNavLinkHover, !!topBorder && styledNavLinkBorder),
                children: styledNavLinkHover,
              }}
              styles={{ root: borderRadiusStyles }}
              label={children}
            />
          );
        })}
      </Popover.Dropdown>
    </Popover>
  );
};
