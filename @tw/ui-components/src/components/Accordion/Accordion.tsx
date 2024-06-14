import { MutableRefObject, forwardRef } from 'react';
import { TwBaseProps, FormattedColor } from '../../types';
import {
  AccordionControlProps,
  AccordionItemProps,
  AccordionPanelProps,
  Accordion as MantineAccordion,
  AccordionProps as MantineAccordionProps,
} from '@mantine/core';

type AccordionProps<T extends boolean = false> = TwBaseProps &
  MantineAccordionProps<T> & {
    color?: FormattedColor;
    c?: FormattedColor;
    ref?: MutableRefObject<HTMLDivElement> | ((ref: HTMLDivElement | null) => void);
  };

function BaseAccordion<T extends boolean>({ ref, ...props }: AccordionProps<T>) {
  return (
    <div ref={ref}>
      <MantineAccordion {...props} />
    </div>
  );
}

const AccordionControl = forwardRef<HTMLButtonElement, AccordionControlProps>((props, ref) => {
  return <MantineAccordion.Control {...props} ref={ref} />;
});

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>((props, ref) => {
  return <MantineAccordion.Item {...props} ref={ref} />;
});

const AccordionPanel = (props: AccordionPanelProps) => {
  return <MantineAccordion.Panel {...props} />;
};

type AccordionComponent = typeof BaseAccordion & {
  Control: typeof AccordionControl;
  Item: typeof AccordionItem;
  Panel: typeof AccordionPanel;
};

export const Accordion: AccordionComponent = Object.assign(BaseAccordion, {
  Control: AccordionControl,
  Item: AccordionItem,
  Panel: AccordionPanel,
});
