import { TwBaseProps } from '../../types';
import {
  Tooltip as MantineTooltip,
  TooltipProps as MantineTooltipProps,
  TooltipFloating,
  TooltipGroup,
} from '@mantine/core';

export interface TooltipProps extends TwBaseProps, MantineTooltipProps {}

interface ITooltip extends React.FC<TooltipProps> {
  Group: typeof TooltipGroup;
  Floating: typeof TooltipFloating;
}

export const Tooltip: ITooltip = (props) => {
  const { withinPortal = true, ...rest } = props;

  return (
    <MantineTooltip
      {...rest}
      withinPortal={withinPortal}
      styles={() => {
        return {
          tooltip: {
            visibility: props.label ? 'visible' : 'hidden',
          },
        };
      }}
    />
  );
};

Tooltip.Floating = MantineTooltip.Floating;
Tooltip.Group = MantineTooltip.Group;
