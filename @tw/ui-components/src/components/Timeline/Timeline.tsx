import { forwardRef } from 'react';
import { TwBaseProps, FormattedColor, Size } from '../../types';
import {
  Timeline as MantineTimeline,
  TimelineProps as MantineTimelineProps,
  TimelineItemProps as MantineTimelineItemProps,
} from '@mantine/core';
import { PropsFrom } from '../../utility-types';
import { Skeleton } from '../Skeleton/Skeleton';
import { Box } from '../Box/Box';

export type TimelineBulletVariant = 'colored' | 'transparent';

interface ITimeline extends React.FC<TimelineProps> {
  Item: React.ForwardRefExoticComponent<PropsFrom<typeof MantineTimeline.Item> & TimelineItemProps>;
}

export interface TimelineItemProps extends TwBaseProps, MantineTimelineItemProps {
  color?: FormattedColor;
}

export interface TimelineProps extends TwBaseProps, MantineTimelineProps {
  color?: FormattedColor;
  radius?: Size;
  bulletVariant?: TimelineBulletVariant;
  loading?: boolean;
  skeletonLines?: number;
}

const Timeline: ITimeline = (props) => {
  const { bulletVariant = 'colored', loading = false, skeletonLines = 5, ...rest } = props;
  const borderColor = bulletVariant === 'transparent' ? 'transparent' : props.color;
  const backgroundColor = bulletVariant === 'transparent' ? 'transparent' : props.color;

  return (
    <MantineTimeline
      {...rest}
      styles={() => {
        return {
          itemBullet: {
            borderColor,
            backgroundColor,
            '&[data-active]': {
              borderColor,
              backgroundColor,
            },
            '&[data-with-child]': {
              borderColor,
              backgroundColor,
            },
            '&.loading-item': {
              borderColor: 'transparent',
              backgroundColor: 'transparent',
            },
          },
        };
      }}
    >
      {props.children}
      {loading &&
        Array.from(Array(skeletonLines), (_, index) => {
          return (
            <MantineTimeline.Item
              className="loading-item"
              key={index}
              title={<Skeleton width="100%" height={20} />}
              bullet={<Skeleton circle width="100%" height="100%" />}
            >
              <Box mt="md">
                <Skeleton width="80%" height={25} />
              </Box>
            </MantineTimeline.Item>
          );
        })}
    </MantineTimeline>
  );
};

Timeline.Item = forwardRef((props: TimelineItemProps, ref) => {
  return <MantineTimeline.Item {...props} ref={ref} />;
});

export { Timeline };
