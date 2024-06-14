import { ThemeProvider } from '../../ThemeProvider';
import { Stack } from './Stack';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Stack> = {
  component: Stack,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
### Stack component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Stack>;

export const Basic: Story = {
  args: {
    children: 'Stack',
  },
};
