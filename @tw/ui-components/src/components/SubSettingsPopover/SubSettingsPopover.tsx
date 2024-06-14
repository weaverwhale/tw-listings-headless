import { useState } from 'react';
import { Popover, Flex } from '@mantine/core';
import { Icon } from '../Icon/Icon';
import { useSelectByWindowResize } from '../../hooks';
import { IconName } from '../../types';
import { Text, TextProps } from '../Text/Text';
import { hover } from './SubSettingsPopover.css';

export type SubSettingsPopoverOption = {
  label: string;
  value?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

export type SubSettingsPopoverProps = {
  targetLabel?: string;
  targetIcon?: IconName;
  options: SubSettingsPopoverOption[];
  value?: string;
  textProps?: TextProps;
};

export const SubSettingsPopover: React.FC<SubSettingsPopoverProps> = ({
  options,
  targetLabel,
  targetIcon,
  value,
  textProps,
}) => {
  const [showIcon, setShowIcon] = useState(false);
  const isSmall = useSelectByWindowResize(({ width }) => width <= 640);

  return (
    <Popover
      width="dropdown"
      position={isSmall ? 'bottom-start' : 'right-start'}
      positionDependencies={[isSmall]}
      shadow="md"
      styles={() => ({ dropdown: { padding: 0 } })}
      onChange={() => setShowIcon((x) => !x)}
    >
      <Popover.Target>
        <Flex justify="space-between" align="center" style={{ cursor: 'pointer' }}>
          <Flex gap="sm" align="center">
            {!!targetIcon && <Icon name={targetIcon} />}
            {!!targetLabel && <Text {...textProps}>{targetLabel}</Text>}
          </Flex>
          {showIcon && <Icon name="caret-right" size={12} />}
        </Flex>
      </Popover.Target>
      <Popover.Dropdown bg="named.5" style={{ border: 'none', transform: 'translate(4px, -10%)' }}>
        {options.map(({ label, onClick, value: optionValue }) => (
          <Flex
            style={{ cursor: 'pointer' }}
            justify="space-between"
            align="center"
            key={label}
            onClick={onClick}
            w={208}
            p={8}
            pl={16}
            className={hover}
          >
            <Text {...textProps}>{label}</Text>
            {value && optionValue && optionValue === value && <Icon name="check-thin" />}
          </Flex>
        ))}
      </Popover.Dropdown>
    </Popover>
  );
};
