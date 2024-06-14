import { ThemeProvider } from '../../ThemeProvider';
import { Timeline } from './Timeline';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Timeline> = {
  component: Timeline,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {
    id: { control: 'text' },
    'data-testid': { control: 'text' },
    active: { control: 'number', description: 'Index of active element' },
    align: { control: { type: 'select' }, options: ['left', 'right'] },
    bulletSize: { control: 'number' },
    radius: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    color: { options: ['one.6', 'orange.5', 'yellow.4'] },
    reverseActive: { control: 'boolean' },
    lineWidth: { control: 'number' },
    bulletVariant: { control: { type: 'select' }, options: ['colored', 'transparent'] },
    loading: { control: { type: 'boolean' } },
    skeletonLines: { control: { type: 'number' }, },
  },
  parameters: {
    docs: {
      description: {
        component: `
### Timeline component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Timeline>;

export const Basic: Story = {
  args: {
    children: [
      <Timeline.Item title="1" />,
      <Timeline.Item title="2" />,
      <Timeline.Item title="3" />,
    ],
    id: '',
    'data-testid': '',
    active: 1,
    align: 'left',
    bulletSize: 20,
    radius: 'lg',
    color: 'one.6',
    reverseActive: false,
    skeletonLines: 5,
  },
};

export const Loading: Story = {
  args: {
    id: '',
    'data-testid': '',
    align: 'left',
    bulletSize: 20,
    radius: 'lg',
    color: 'one.6',
    reverseActive: false,
    loading: true,
    lineWidth: 1,
    skeletonLines: 3,
  },
};
