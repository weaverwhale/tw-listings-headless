import { ThemeProvider } from '../../ThemeProvider';
import { Skeleton } from './Skeleton';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
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
  },
  parameters: {
    docs: {
      description: {
        component: `
### Skeleton component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Basic: Story = {
  args: {
    children: 'Skeleton',
  },
};
