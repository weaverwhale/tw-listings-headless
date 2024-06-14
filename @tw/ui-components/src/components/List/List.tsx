import { PropsWithChildren, forwardRef, useMemo } from 'react';
import { List as MantineList } from '@mantine/core';
import { TwBaseProps, MantinePropsToRemove, FormattedColor, TwStyleSystemProps } from '../../types';
import { PropsFrom } from '../../utility-types';
import { getMarketingProps } from '../../utils/commonPropGenerators';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { chosenColor, defaultText, text } from '../Text/Text.css';
import { extractCSSColor } from '../../utils';

export interface ListProps
  extends TwBaseProps,
    PropsWithChildren,
    Omit<PropsFrom<typeof MantineList>, MantinePropsToRemove> {}

export interface ListItemProps
  extends TwBaseProps,
    TwStyleSystemProps,
    PropsWithChildren,
    Omit<PropsFrom<typeof MantineList.Item>, MantinePropsToRemove> {
  c?: FormattedColor;
  color?: FormattedColor;
}

const BaseList: React.FC<ListProps> = (props) => {
  return (
    <MantineList
      {...props}
      data-tw-ui-component="List"
      {...getMarketingProps(props.id || 'tw-ui-list')}
    />
  );
};

const BaseListItem = forwardRef<HTMLLIElement, ListItemProps>((props, ref) => {
  const { color, c, ...rest } = props;

  const dynamicColor = useMemo(() => {
    const receivedColor = color || c;
    return receivedColor ? extractCSSColor(receivedColor) : undefined;
  }, [color, c]);

  return (
    <MantineList.Item
      {...rest}
      ref={ref}
      style={assignInlineVars({ [chosenColor]: dynamicColor })}
      className={color || c ? text : defaultText}
    />
  );
});

type ListComponent = typeof BaseList & {
  Item: typeof BaseListItem;
};

export const List: ListComponent = Object.assign(BaseList, {
  Item: BaseListItem,
}) as ListComponent;
