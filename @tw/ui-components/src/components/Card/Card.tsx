import { CSSProperties } from 'react';
import { EventHandler, MantinePropsToRemove, TwBaseProps, TwStyleSystemProps } from '../../types';
import { Card as MantineCard } from '@mantine/core';
import { PropsFrom } from '../../utility-types';
import { polymorphicFactory } from '../../utils/polymorphicFactory';

export type CardProps = TwBaseProps &
  TwStyleSystemProps &
  Omit<PropsFrom<typeof MantineCard>, MantinePropsToRemove | 'component'> &
  EventHandler<React.HTMLAttributes<HTMLDivElement>> & {
    overflow?: CSSProperties['overflow'];
  };

export type CardSectionProps = TwBaseProps &
  TwStyleSystemProps &
  Omit<PropsFrom<typeof MantineCard.Section>, MantinePropsToRemove | 'component'> & {
    withTopBorder?: boolean;
    withBottomBorder?: boolean;
  };

const BaseCard = polymorphicFactory<CardProps>((props) => {
  const { overflow = 'visible', bg = 'named.5', ...other } = props;
  return <MantineCard style={{ overflow }} bg={bg} {...other} />;
});

const BaseCardSection = polymorphicFactory<CardSectionProps>(
  ({ withBottomBorder, withTopBorder, ...props }) => {
    const style: CSSProperties = {};
    if (props.withBorder) {
      if (withTopBorder === false) style.borderTopWidth = 0;
      if (withBottomBorder === false) style.borderBottomWidth = 0;
    }

    return <MantineCard.Section style={style} {...props} />;
  }
);

type CardComponent = typeof BaseCard & {
  Section: typeof BaseCardSection;
};

export const Card: CardComponent = Object.assign(BaseCard, {
  Section: BaseCardSection,
}) as CardComponent;
