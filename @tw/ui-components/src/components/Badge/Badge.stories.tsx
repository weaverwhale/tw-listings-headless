import { ThemeProvider } from '../../ThemeProvider';
import { Badge } from './Badge';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Badge> = {
  component: Badge,
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
    variant: {
      control: { type: 'select' },
      options: ['light', 'filled', 'outline', 'dot', 'gradient'],
    },
    uppercase: { control: { type: 'boolean' } },
    color: { type: 'string' },
  },
  parameters: {
    docs: {
      description: {
        component: `
### Badge component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Basic: Story = {
  args: {
    children: 'Badge',
    uppercase: true,
  },
};
