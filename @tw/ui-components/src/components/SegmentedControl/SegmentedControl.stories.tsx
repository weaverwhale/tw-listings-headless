import { Group } from '..';
import { ThemeProvider } from '../../ThemeProvider';
import { ThemeToggle } from '../../utils/ThemeToggle';
import { SegmentedControl } from './SegmentedControl';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Group justify="space-between">
          <Story />
          <ThemeToggle />
        </Group>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    id: { control: 'text' },
    'data-testid': { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: `
### SegmentedControl component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Basic: Story = {
  args: {
    children: 'SegmentedControl',
    data: ['one', 'two'],
  },
};
